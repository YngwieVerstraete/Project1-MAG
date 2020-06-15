import io
import os
import sys
import time
import socket
import spidev
import threading
import Adafruit_DHT
import LCD1602

from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from repositories.DataRepository import DataRepository
from subprocess import check_output
from RPi import GPIO

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)



#pumps
pump_channels = [12, 16, 20, 21]

# Define sensors
lm35_channel = 0
moisture_channels = [1, 2, 3, 4]
waterswitch = 18
GPIO.setup(waterswitch, GPIO.IN)

# Open SPI bus
spi = spidev.SpiDev()   #create spi object
spi.open(0,0)           #open spi port 0, device (CS) 0
spi.max_speed_hz = 10 ** 5



def init_lcd():
    gw = os.popen("ip -4 route show default").read().split()
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect((gw[2], 0))
    ipaddr = s.getsockname()[0]
    gateway = gw[2]
    host = socket.gethostname()
    print ("IP:", ipaddr, " GW:", gateway, " Host:", host)

    LCD1602.init(0x27, 1)   # init(slave address, background light)
    LCD1602.write(0, 0, 'Ip address:')
    LCD1602.write(0, 1, ipaddr)
    time.sleep(2)



# Function to read SPI data from MCP3008 chip
# Channel must be an integer 0-7
def readChannel(channel):
    # 3 bytes versturen
    # 1 , S D2 D1 D0 xxxx, 0
    adc = spi.xfer([1,(8+channel)<<4,0])
    data = ((adc[1]&3) << 8) | adc[2]  #in byte 1 en 2 zit resultaat
    return data

def convertVolts(data,places):
    volts = (data * 3.3) / float(1023)
    volts = round(volts, places)
    return volts

def convertTemp(data,places):
    temp = ((data * 330)/float(1023))
    temp = round(temp, places)
    return temp

def ConvertToPercent(data):
    value = Decimal(data/10.24)
    percent = Decimal(value.quantize(Decimal('.01'), rounding=ROUND_HALF_UP))
    print(percent)
    return percent



def give_water(run_water_channels, actuators):
    for index in run_water_channels:
        if index is 0 and actuators[0]['status'] is 1:
            GPIO.setup(12, GPIO.OUT)
        if index is 1 and actuators[1]['status'] is 1:
            GPIO.setup(16, GPIO.OUT)
        if index is 2 and actuators[2]['status'] is 1:
            GPIO.setup(20, GPIO.OUT)
        if index is 3 and actuators[3]['status'] is 1:
            GPIO.setup(21, GPIO.OUT)

    time.sleep(2)



def readMcp():
    print ("--------------------------------------------")
    date = datetime.now().replace(microsecond=0)
    # Read the humidity/temperature data DHT11
    dht11_hum, dht11_temp = Adafruit_DHT.read_retry(11, 17)
    print('Temp: {0:0.1f} C  Humidity: {1:0.1f} %'.format(dht11_temp, dht11_hum))

    # Read the temperature sensor data LM35
    temp_level = readChannel(lm35_channel)
    temp_volts = convertVolts(temp_level, 2)
    temp_lm35 = convertTemp(temp_level, 2)
    print("Temp : {} ({}V) {} deg C".format(temp_level, temp_volts, temp_lm35))

    run_water_channels = []
    # Read the moisture sensor data
    for i in moisture_channels:
        moisture_level = readChannel(i)
        moisture_percent = ConvertToPercent(moisture_level)
        print("Moisture{}: {} ({}%)".format(i, moisture_percent, moisture_percent))
        DataRepository.insert_moisture_reading(date, i, moisture_percent, i, i)

        if (moisture_percent <= 30):
            run_water_channels.append(i-1)
        
    DataRepository.insert_short_reading(date, 5, temp_lm35) #LM35 Temp
    DataRepository.insert_short_reading(date, 6, dht11_temp) #DHT11 Temp
    DataRepository.insert_short_reading(date, 7, dht11_hum) #DHT11 Hum
    DataRepository.insert_short_reading(date, 8, GPIO.input(waterswitch)) #DHT11 Hum

    actuators = DataRepository.read_actuators()

    if len(run_water_channels) != 0:
        give_water(run_water_channels, actuators)

    GPIO.cleanup(12)
    GPIO.cleanup(16)
    GPIO.cleanup(20)
    GPIO.cleanup(21)


def hourlyReadings():
    try:
        while True:
            date = datetime.now()
            print(date.strftime("%d/%m/%Y %H:%M:%S"))

            dateNext = (datetime.now() + timedelta(hours=1)).replace(minute=00, second=00)
            print(dateNext.strftime("%d/%m/%Y %H:%M:%S"))

            difference = dateNext - date
            print(difference.total_seconds())

            delay = difference.total_seconds()
            t_end = time.time() + delay

            check_status = GPIO.input(waterswitch)
            while time.time() < t_end:
                new_status = GPIO.input(waterswitch)
                if check_status != new_status:
                    DataRepository.insert_short_reading(date, 8, GPIO.input(waterswitch))

            readMcp()
            print("Hourly scan - got and sent data")
    except KeyboardInterrupt as e:
        print(e)
        GPIO.cleanup()
        #print("close")

init_lcd()
hourlyReadings()