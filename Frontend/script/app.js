"use strict";
const ip =  window.location.hostname;
const api ="http://" +  ip + ":5000"
const endpoint = "/greenhouse/api/v1/"
const apiConnection = api + endpoint

const lanIP = `${window.location.hostname}:5000`;
const socketio = io(`http://${lanIP}`);


//#region ***  DOM references ***
let html_routeHolder, html_reservoir, html_plant1, html_plant2, html_plant3, html_plant4, html_pump;
//#endregion

//#region ***  Callback-Visualisation - show___ ***
const showHome = function(jsonObject){
  console.log(jsonObject);
  html_routeHolder.innerHTML = "";
  html_routeHolder.innerHTML += `<div class="row">
  <div class="first-column u-hidden">
      <h1 class="c-title">
          Greenhouse
      </h1>
  </div>
  <div class="second-column">
      <div class="c-background__section u-hidden">
          <img class="c-background" src="/images/pexels-photo-1470171.jpeg" alt="background greenhouse">
      </div>
      <nav class="c-nav__bar">
              <ul class="c-nav__info">
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category" data-sensorid="${jsonObject.records[4].sensorId}">
                          <h2 data-sensorid="${jsonObject.records[4].sensorId}">TEMPERATURE</h2>
                          <br/>
                          <h3 data-sensorid="${jsonObject.records[4].sensorId}">${jsonObject.records[4].value}°C</h3>
                          <br/>
                          <h4 data-sensorid="${jsonObject.records[4].sensorId}">Temperature near bottom plants</h4>
                      </button>
                  </li>
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category" data-sensorid="${jsonObject.records[5].sensorId}">
                          <h2 data-sensorid="${jsonObject.records[5].sensorId}">TEMPERATURE</h2>
                          <br/>
                          <h3 data-sensorid="${jsonObject.records[5].sensorId}">${jsonObject.records[5].value}°C</h3>
                          <br/>
                          <h4 data-sensorid="${jsonObject.records[5].sensorId}">Temperature outside</h4>
                      </button>
                  </li>
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category" data-sensorid="${jsonObject.records[6].sensorId}">
                          <h2 data-sensorid="${jsonObject.records[6].sensorId}">HUMIDITY</h2>
                          <br/>
                          <h3 data-sensorid="${jsonObject.records[6].sensorId}">${jsonObject.records[6].value}%</h3>
                          <br/>
                          <h4 data-sensorid="${jsonObject.records[6].sensorId}">Humidity in the air</h4>
                      </button>
                  </li>
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category js-reservoir" data-sensorid="${jsonObject.records[7].sensorId}">
                      </button>
                  </li>
              </ul>
              <ul class="c-nav__plants">
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category" data-sensorid="${jsonObject.records[0].sensorId}">
                          <h2 data-sensorid="${jsonObject.records[0].sensorId}">PLANT 1</h2>
                          <br/>
                          <h3 data-sensorid="${jsonObject.records[0].sensorId}">${jsonObject.records[0].value}%</h3>
                          <h4 data-sensorid="${jsonObject.records[0].sensorId}">Humidity</h4>
                          <br/>
                          <h4 class="js-plant1" data-sensorid="${jsonObject.records[0].sensorId}">Pump on</h4>
                      </button>
                  </li>
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category" data-sensorid="${jsonObject.records[1].sensorId}">
                          <h2 data-sensorid="${jsonObject.records[1].sensorId}">PLANT 2</h2>
                          <br/>
                          <h3 data-sensorid="${jsonObject.records[1].sensorId}">${jsonObject.records[1].value}%</h3>
                          <h4 data-sensorid="${jsonObject.records[1].sensorId}">Humidity</h4>
                          <br/>
                          <h4 class="js-plant2" data-sensorid="${jsonObject.records[1].sensorId}">Pump on</h4>
                      </button>
                  </li>
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category" data-sensorid="${jsonObject.records[2].sensorId}">
                          <h2 data-sensorid="${jsonObject.records[2].sensorId}">PLANT 3</h2>
                          <br/>
                          <h3 data-sensorid="${jsonObject.records[2].sensorId}">${jsonObject.records[2].value}%</h3>
                          <h4 data-sensorid="${jsonObject.records[2].sensorId}">Humidity</h4>
                          <br/>
                          <h4 class="js-plant3" data-sensorid="${jsonObject.records[2].sensorId}">Pump on</h4>
                      </button>
                  </li>
                  <li class="c-nav__item">
                      <button class="c-nav__button js-category" data-sensorid="${jsonObject.records[3].sensorId}">
                          <h2 data-sensorid="${jsonObject.records[3].sensorId}">PLANT 4</h2>
                          <br/>
                          <h3 data-sensorid="${jsonObject.records[3].sensorId}">${jsonObject.records[3].value}%</h3>
                          <h4 data-sensorid="${jsonObject.records[3].sensorId}">Humidity</h4>
                          <br/>
                          <h4 class="js-plant4" data-sensorid="${jsonObject.records[3].sensorId}">Pump on</h4>
                      </button>
                  </li>
              </ul>
          </nav>
      </div>
  </div>`;

  html_reservoir = document.querySelector(".js-reservoir");
  showReservoir(jsonObject);

  html_plant1 = document.querySelector(".js-plant1");
  html_plant2 = document.querySelector(".js-plant2");
  html_plant3 = document.querySelector(".js-plant3");
  html_plant4 = document.querySelector(".js-plant4");

  getActuators();
  listenToHomeUI();
}

const showReservoir = function(jsonObject) {
  if (jsonObject.records[7].value == 0) {
    html_reservoir.innerHTML = "";
    html_reservoir.innerHTML = `
      <h2 data-sensorid="${jsonObject.records[7].sensorId}">RESERVOIR</h2>
      <br/>
      <h3 data-sensorid="${jsonObject.records[7].sensorId}" style="color: red;">Low</h3>
      <br/>
      <h4 data-sensorid="${jsonObject.records[7].sensorId}">Click to check waterstatus</h4>`;
  } else {
    html_reservoir.innerHTML = "";
    html_reservoir.innerHTML = `
      <h2 data-sensorid="${jsonObject.records[7].sensorId}">RESERVOIR</h2>
      <br/>
      <h3 data-sensorid="${jsonObject.records[7].sensorId}">Good</h3>
      <br/>
      <h4 data-sensorid="${jsonObject.records[7].sensorId}">Status waterlevel in reservoir</h4>`;
  }
}

const showPumpStatus = function(jsonObject) {
  html_plant1.innerHTML = "";
  if (jsonObject.actuators[0].status == 0) {
    html_plant1.innerHTML += `Pump off`;
  } else {
    html_plant1.innerHTML += `Pump on`;
  }

  html_plant2.innerHTML = "";
  if (jsonObject.actuators[1].status == 0) {
    html_plant2.innerHTML += `Pump off`;
  } else {
    html_plant2.innerHTML += `Pump on`;
  }

  html_plant3.innerHTML = "";
  if (jsonObject.actuators[2].status == 0) {
    html_plant3.innerHTML += `Pump off`;
  } else {
    html_plant3.innerHTML += `Pump on`;
  }

  html_plant4.innerHTML = "";
  if (jsonObject.actuators[3].status == 0) {
    html_plant4.innerHTML += `Pump off`;
  } else {
    html_plant4.innerHTML += `Pump on`;
  }
}

const showInsideTemp = function(jsonObject) {
  jsonObject.readings.reverse();
  html_routeHolder.innerHTML = "";
  html_routeHolder.innerHTML += `
  <ul class="c-nav__return-bar">
    <li>
      <a class="js-home" href=""><i class="material-icons md-24 md-dark js-home">arrow_back</i></a>
    </li>
    <li>
      <h1>Temperature</h1>
    </li>
  </ul>
  <div class="wrap">
    <button class="inner-button" style="cursor: default;">
        <h2>TEMPERATURE</h2>
        <br/>
        <h3>${jsonObject.readings[jsonObject.readings.length-1].value}°C</h3>
        <br/>
        <h4>Temperature near bottom plants</h4>
    </button>
  </div>
  <section class="c-graph__section">
    <canvas class="chart" id="chart" role="img"></canvas>
  </section>`;

  showChartTemp(jsonObject);
  listenToPageUI();
}

const showOutsideTemp = function(jsonObject) {
  jsonObject.readings.reverse();
  html_routeHolder.innerHTML = "";
  html_routeHolder.innerHTML += `
  <ul class="c-nav__return-bar">
    <li>
      <a class="js-home" href=""><i class="material-icons md-24 md-dark js-home">arrow_back</i></a>
    </li>
    <li>
      <h1>Temperature</h1>
    </li>
  </ul>
  <div class="wrap">
    <button class="inner-button" style="cursor: default;">
        <h2>TEMPERATURE</h2>
        <br/>
        <h3>${jsonObject.readings[jsonObject.readings.length-1].value}°C</h3>
        <br/>
        <h4>Temperature outside</h4>
    </button>
  </div>
  <section class="c-graph__section">
    <canvas class="chart" id="chart" role="img"></canvas>
  </section>`;

  showChartTemp(jsonObject);
  listenToPageUI();
}

const showHumidity = function(jsonObject) {
  jsonObject.readings.reverse();
  html_routeHolder.innerHTML = "";
  html_routeHolder.innerHTML += `
  <ul class="c-nav__return-bar">
    <li>
      <a class="js-home" href=""><i class="material-icons md-24 md-dark js-home">arrow_back</i></a>
    </li>
    <li>
      <h1>Humidity</h1>
    </li>
  </ul>
  <div class="wrap">
    <button class="inner-button" style="cursor: default;">
        <h2>HUMIDITY</h2>
        <br/>
        <h3>${jsonObject.readings[jsonObject.readings.length-1].value}%</h3>
        <br/>
        <h4>Humidity in the air</h4>
    </button>
  </div>
  <section class="c-graph__section">
    <canvas class="chart" id="chart" role="img"></canvas>
  </section>`;

  showChartHum(jsonObject);
  listenToPageUI();
}

const showPlant = function(jsonObject) {
  jsonObject.readings.reverse();
  console.log(jsonObject)

  var today = new Date();
  var datetime = today.getFullYear()+'-'+today.getMonth()+'-'+today.getDate()+' '+(today.getHours()+1) + ":00:00";

  html_routeHolder.innerHTML = "";
  html_routeHolder.innerHTML += `
  <ul class="c-nav__return-bar">
    <li>
      <a class="js-home" href=""><i class="material-icons md-24 md-dark js-home">arrow_back</i></a>
    </li>
    <li>
      <h1>PLANT ${jsonObject.readings[0].sensorId}</h1>
    </li>
  </ul>
  <div class="wrap">
    <button class="inner-button" style="cursor: default; pointer-events: none;">
        <h2>HUMIDITY</h2>
        <br/>
        <h3>${jsonObject.readings[jsonObject.readings.length-1].value}%</h3>
        <br/>
        <h4>Current ground humdity</h4>
    </button>
    <button class="inner-button-big" style="cursor: default; pointer-events: none;">
        <h2>NEXT GROUND HUMIDITY CHECKUP</h2>
        <br/>
        <h3>${datetime}</h3>
        <br/>
        <h4>Timestamp for next checkup</h4>
    </button>
    <button class="inner-button js-pump" data-actuator="${jsonObject.readings[0].sensorId}" data-pumpstatus="${jsonObject.readings[jsonObject.readings.length-1].actuatorStatus}">
    </button>
  </div>
  <section class="c-graph__section">
    <canvas class="chart" id="chart" role="img"></canvas>
  </section>`;
  
  html_pump = document.querySelector(".js-pump");
  html_pump.innerHTML = "";
  if (jsonObject.readings[jsonObject.readings.length-1].actuatorStatus == 0){
    html_pump.innerHTML = `
      <h2 data-actuator="${jsonObject.readings[0].sensorId}" data-pumpstatus="${jsonObject.readings[jsonObject.readings.length-1].actuatorStatus}">PUMP</h2>
      <br/>
      <h3 data-actuator="${jsonObject.readings[0].sensorId}" data-pumpstatus="${jsonObject.readings[jsonObject.readings.length-1].actuatorStatus}">Off</h3>
      <br/>
      <h4 data-actuator="${jsonObject.readings[0].sensorId}" data-pumpstatus="${jsonObject.readings[jsonObject.readings.length-1].actuatorStatus}">Status pump: click to toggle</h4>
    `;
  } else {
    html_pump.innerHTML = `
      <h2 data-actuator="${jsonObject.readings[0].sensorId}" data-pumpstatus="${jsonObject.readings[jsonObject.readings.length-1].actuatorStatus}">PUMP</h2>
      <br/>
      <h3 data-actuator="${jsonObject.readings[0].sensorId}" data-pumpstatus="${jsonObject.readings[jsonObject.readings.length-1].actuatorStatus}">On</h3>
      <br/>
      <h4 data-actuator="${jsonObject.readings[0].sensorId}" data-pumpstatus="${jsonObject.readings[jsonObject.readings.length-1].actuatorStatus}">Status pump: click to toggle</h4>
    `;
  }

  showChartHum(jsonObject);
  listenToPageUI();
  listenToPumpUI();
}

const showUpdatedStatus = function(){
  html_pump = document.querySelector(".js-pump");
  if (html_pump.dataset.pumpstatus == 0){
    html_pump.dataset.pumpstatus = 1;
    html_pump.innerHTML = "";
    html_pump.innerHTML = `
      <h2 data-actuator="${html_pump.dataset.actuator}" data-pumpstatus="${1}">PUMP</h2>
      <br/>
      <h3 data-actuator="${html_pump.dataset.actuator}" data-pumpstatus="${1}">On</h3>
      <br/>
      <h4 data-actuator="${html_pump.dataset.actuator}" data-pumpstatus="${1}">Status pump: click to toggle</h4>
    `;
  } else if(html_pump.dataset.pumpstatus == 1){
    html_pump.dataset.pumpstatus = 0;
    html_pump.innerHTML = "";
    html_pump.innerHTML = `
      <h2 data-actuator="${html_pump.dataset.actuator}" data-pumpstatus="${0}">PUMP</h2>
      <br/>
      <h3 data-actuator="${html_pump.dataset.actuator}" data-pumpstatus="${0}">Off</h3>
      <br/>
      <h4 data-actuator="${html_pump.dataset.actuator}" data-pumpstatus="${0}">Status pump: click to toggle</h4>
    `;
  }
}

const showChartTemp = function(jsonData){
  const colors = ['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)']
  const borders = ['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)']
  let dates = []
  let values = []
  jsonData.readings.forEach(element => {
    dates.push(element.datainput)
  });
  jsonData.readings.forEach(element => {
    values.push(element.value)
  });

  let id = jsonData.readings[1].sensorId;
  const ctx = document.getElementById('chart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'values',
        backgroundColor: 'lightblue',
        borderColor: 'royalblue',
        data: values
      }]
    },
    // Configuration options
	  options: {
      layout: {
        padding: 10,
      },
	  	legend: {
	  		position: 'bottom',
	  	},
	  	title: {
	  		display: true,
	  		text: 'Ground humidity'
      },
	  	scales: {
	  		yAxes: [{
  				scaleLabel: {
	  				display: true,
	  				labelString: 'Temperature (°C)'
	  			}, ticks: {
            beginAtZero: true
          }
	  		}],
	  		xAxes: [{
	  			scaleLabel: {
		  			display: true,
	  				labelString: 'Datetime'
  				}
  			}]
  		}
  	}
  });
}

const showChartHum = function(jsonData){
  const colors = ['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)']
  const borders = ['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)']
  let dates = []
  let values = []
  jsonData.readings.forEach(element => {
    dates.push(element.datainput)
  });
  jsonData.readings.forEach(element => {
    values.push(element.value)
  });

  let id = jsonData.readings[1].sensorId;
  const ctx = document.getElementById('chart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'values',
        backgroundColor: 'lightblue',
        borderColor: 'royalblue',
        data: values
      }]
    },
    // Configuration options
	  options: {
      layout: {
        padding: 10,
      },
	  	legend: {
	  		position: 'bottom',
	  	},
	  	title: {
	  		display: true,
	  		text: 'Ground humidity'
  		},
	  	scales: {
	  		yAxes: [{
  				scaleLabel: {
	  				display: true,
	  				labelString: 'Humidity (%)'
	  			}, ticks: {
            beginAtZero: true,
            suggestedMax: 100
          }
	  		}],
	  		xAxes: [{
	  			scaleLabel: {
		  			display: true,
	  				labelString: 'Datetime'
  				}
  			}]
  		}
  	}
  });
}

const showCheckedReservoir = function(jsonObject){
  html_reservoir = document.querySelector(".js-reservoir")
  let sensorId = html_reservoir.dataset.sensorid;

  if (jsonObject.reservoir[0].value == 0) {
    html_reservoir.innerHTML = "";
    html_reservoir.innerHTML = `
      <h2 data-sensorid="${sensorId}">RESERVOIR</h2>
      <br/>
      <h3 data-sensorid="${sensorId}" style="color: red;">Low</h3>
      <br/>
      <h4 data-sensorid="${sensorId}">Click to check waterstatus</h4>`;
  } else {
    html_reservoir.innerHTML = "";
    html_reservoir.innerHTML = `
      <h2 data-sensorid="${sensorId}">RESERVOIR</h2>
      <br/>
      <h3 data-sensorid="${sensorId}">Good</h3>
      <br/>
      <h4 data-sensorid="${sensorId}">Status waterlevel in reservoir</h4>`;
  }
}
//#endregion

//#region ***  Callback-No Visualisation - callback___  ***
//#endregion


//#region ***  Data Access - get___ ***
const getLastRecordsForeachSensor = function() {
  handleData(apiConnection + `sensors/lastrecord`, showHome);
}

const getActuators = function() {
  handleData(apiConnection + `actuators`, showPumpStatus);
}

const getReadingsById = function(id) {
  if (id <= 4) {
    handleData(apiConnection + `sensor/${id}/plant`, showPlant);
  } else if (id == 5) {
    handleData(apiConnection + `sensor/${id}/readings`, showInsideTemp);
  } else if (id == 6) {
    handleData(apiConnection + `sensor/${id}/readings`, showOutsideTemp);
  } else if (id == 7) {
    handleData(apiConnection + `sensor/${id}/readings`, showHumidity);
  } else if (id == 8) {
    handleData(apiConnection + `sensor/${id}/reservoir`, showCheckedReservoir);
  }
}

const getReadings = function(){
  handleData(apiConnection + `reading_set_date`, showChart);
};

const callbackRemoveProduct = function(data) {
  console.log("Removed product");
};
//#endregion


//#region ***  Event Listeners - listenTo___ ***
const listenToHomeUI = function () {
  let btns = document.querySelectorAll(".js-category");
  //console.log(btns);
  for (let btn of btns) {
    btn.addEventListener("click", (e) => {
      let id = e.target.dataset.sensorid;
      //html_routeHolder.innerHTML = this.innerHTML;
      getReadingsById(id);
    });
  }
};

const listenToPageUI = function () {
  let btns = document.querySelectorAll(".js-home");
  //console.log(btns);
  for (let btn of btns) {
    btn.addEventListener("click", (e) => {
      getLastRecordsForeachSensor();
    });
  }
};

const listenToPumpUI = function () {
  let pump_btn = document.querySelectorAll(".js-pump");
  for (let btn of pump_btn) {
    btn.addEventListener("click", (e) => {
      showUpdatedStatus();
    });
  }
};
//#endregion


//#region ***  INIT / DOMContentLoaded  ***
const init = function() {
    html_routeHolder = document.querySelector(".js-replace");
    getLastRecordsForeachSensor();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
