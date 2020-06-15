from repositories.DataRepository import DataRepository
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS

import time
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'Hier mag je om het even wat schrijven, zolang het maar geheim blijft en een string is'

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

endpoint = "/greenhouse/api/v1/"


# API ENDPOINTS
@app.route('/')
def hallo():
    return "Server is running, er zijn momenteel geen API endpoints beschikbaar."


# SOCKET IO
@socketio.on('connect')
def initial_connection():
    print('A new client connect')


@app.route(endpoint + 'alldata', methods=['GET'])
def get_allreadings():
    if request.method == 'GET':
        output = DataRepository.read_all_readings()
        return jsonify(producten=output), 200

@app.route(endpoint + "reading_set_date", methods = ['GET'])
def read_readings_set_date():
    if(request.method == "GET"):
        output = DataRepository.read_readings_by_date()
        return jsonify(readings=output), 200

@app.route(endpoint + 'sensor/<sensorid>/reservoir', methods=['GET'])
def get_readings_by_sensor_for_reservoir(sensorid):
    if request.method == 'GET':
        output = DataRepository.read_reservoir(sensorid)
        return jsonify(reservoir=output), 200

@app.route(endpoint + 'sensor/<sensorid>/readings', methods=['GET'])
def get_readings_by_sensor(sensorid):
    if request.method == 'GET':
        output = DataRepository.read_readings_by_sensor(sensorid)
        new_output = []
        for x in output:
            d = {
                "id": x['id'],
                "datainput": x['datainput'].strftime("%Y-%m-%d %H:%M:%S"),
                "sensorId": x["sensorId"],
                "value": x["value"]
            }
            new_output.append(d)
        return jsonify(readings=new_output), 200

@app.route(endpoint + 'sensor/<sensorid>/plant', methods=['GET'])
def get_readings_by_sensor_for_plant(sensorid):
    if request.method == 'GET':
        output = DataRepository.read_readings_by_sensor_for_plant(sensorid)
        new_output = []
        for x in output:
            d = {
                "actuatorId": x['actuatorId'],
                "actuatorStatus": x['actuatorStatus'],
                "datainput": x['datainput'].strftime("%Y-%m-%d %H:%M:%S"),
                "readingId": x['readingId'],
                "sensorId": x["sensorId"],
                "value": x["value"]
            }
            new_output.append(d)
        return jsonify(readings=new_output), 200

@app.route(endpoint + 'sensors/lastrecord', methods=['GET'])
def get_last_records():
    if request.method == 'GET':
        output = DataRepository.read_latest_record_from_each_sensor()
        return jsonify(records=output), 200

@app.route(endpoint + 'actuators', methods=['GET'])
def get_actuators():
    if request.method == 'GET':
        output = DataRepository.read_actuators()
        return jsonify(actuators=output), 200

if __name__ == '__main__':
    socketio.run(app, debug=False, host='0.0.0.0')