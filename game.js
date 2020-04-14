var FIXED_COST_DAY = 1000;
var FUEL_COST = 10;

var TRIP_DISTANCE = 100;

var MIN_FUEL_CONSUMPTION = 10;
var K_PARAM = 0.01;

var TOP_SPEED = 100;
var STALL_SPEED = 30;
var NUM_SEATS = 5;
var TURNAROUND_TIME = 1;

var PRICE_ELASTICITY = -0.3;
var DEMAND_AT_ZERO = 150;

var gameData = {
	'travelTimeAircraft' : 0,
	'fuelConsHr' : 0,
	'totalFuelConsAircraft' : 0,
	'totalTurnaroundTime' : 0,
	'totalTravelTime' : 0,
	'totalOpertaionsTime' : 0,
	'aircraftOperatingCost' : 0,
	'totalOperatingCost' : 0,
	'fixedCost' : 0,
	'totalCost' : 0,
	'availableSeats' : 0,
	'potentialRevenue' : 0,
	'potentialProfit' : 0
}

var userInput = {
	'ticketPrice': 0,
	'averageSpeed': 0,
	'numTrips': 0
}

var viewMap = {
	'travelTimeAircraft'    : '#r-travel-time-aircraft',
	'fuelConsHr'            : '#r-fuel-consumption-hour',
	'totalFuelConsAircraft' : '#r-fuel-consumption-aircraft',
	'totalTurnaroundTime'   : '#r-turnaround-time',
	'totalTravelTime'       : '#r-travel-time',
	'totalOpertaionsTime'   : '#r-operations-time',
	'aircraftOperatingCost' : '#r-aircraft-operating-cost',
	'totalOperatingCost'    : '#r-total-operating-cost',
	'fixedCost'             : '#r-fixed-cost',
	'totalCost'             : '#r-total-cost',
	'availableSeats'        : '#r-available-seats',
	'potentialRevenue'      : '#r-potential-revenue',
	'potentialProfit'       : '#r-potential-profit'
}

function update() {
	userInput = updateUserInput(userInput);
	gameData = calculate(userInput, gameData);
	errors = checkForErrors(userInput, gameData);
	updateView(errors, gameData);
}

function calculate(u, d) {
	d.travelTimeAircraft = TRIP_DISTANCE / u.averageSpeed;

	d.fuelConsHr = Math.pow(u.averageSpeed, 2) * K_PARAM + MIN_FUEL_CONSUMPTION;

	d.totalFuelConsAircraft = d.travelTimeAircraft * d.fuelConsHr;

	d.totalTurnaroundTime = 2 * u.numTrips * TURNAROUND_TIME;

	d.totalTravelTime = d.travelTimeAircraft * 2 * u.numTrips;

	d.totalOpertaionsTime = d.totalTravelTime + d.totalTurnaroundTime;

	d.aircraftOperatingCost = d.totalFuelConsAircraft * FUEL_COST;

	d.totalOperatingCost = 2 * u.numTrips * d.aircraftOperatingCost;

	d.fixedCost = FIXED_COST_DAY;

	d.totalCost = d.totalOperatingCost + d.fixedCost;

	d.availableSeats = 2 * u.numTrips * NUM_SEATS;

	d.potentialRevenue = u.ticketPrice * d.availableSeats;

	d.potentialProfit = d.potentialRevenue - d.totalCost;

	return d;
}

// Updates the page with the values in the data object.
function updateView(errors, data) {
	console.log(errors);
	const keys = Object.keys(data);
	var viewKey;
	for(const key of keys) {
		viewKey = viewMap[key];
		updateCell(viewKey, data[key]);
	}

	var errContainer = $('#errors-container');
	errContainer.empty();
	var errList = $('<ul></ul>').appendTo(errContainer);
	console.log(errList);

	if(errors.length > 0) {
		for(var n in errors){
			$('<li></li>').appendTo(errList).text(errors[n]);
		}
		errContainer.show();
	} else {
		errContainer.hide();
	}
}

function updateUserInput(input) {
	input.ticketPrice = getInput('#ticket-price-input');
	input.averageSpeed = getInput('#aircraft-speed-input');
	input.numTrips = getInput('#number-of-trips-input');
	return input;
}

// Get the numeric value of an input element on the page.
function getInput(id) {
	var strValue = $(id).val();
	if( strValue == "") {
		strValue = $(id).attr('placeholder')
	}
	return parseInt(strValue);
}

function checkForErrors(u, d) {
	var errors = [];
	if(u.averageSpeed < STALL_SPEED){
		errors.push('Speed is too low!');
	}

	if(u.averageSpeed > TOP_SPEED) {
		errors.push('Speed is too high!');
	}

	if(!Number.isInteger(u.numTrips)) {
		errors.push('Number of flights must be a whole number!');
	}

	if(d.totalOpertaionsTime > 24) {
		errors.push("Can't do this many round trips in a day!");
	}

	return errors;
}

// Format the value and update the element that matches id on the page.
var formatter = new Intl.NumberFormat('en-US');
function updateCell(id, value) {
	$(id).text(formatter.format(value));
}

// Watch for updated values.
$('#ticket-price-input').change(function() {
	console.log("Ticket price changed.");
	update();
});

$('#aircraft-speed-input').change(function() {
	console.log("Aircraft speeed changed.");
	update();
});

$('#number-of-trips-input').change(function() {
	console.log("Number of trips changed.");
	update();
});

//On Page Load.
$(document).ready(function() {
	drawFuelChart();
	drawDemandChart();
	update();
});

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
}

function drawFuelChart() {
	var fuelLabels = [];
	var fuelData = [];
	for(var i = 0; i <= 100; i++) {
		fuelLabels.push(i);
		fuelData.push({
			x : i,
			y: Math.pow(i, 2) * K_PARAM + MIN_FUEL_CONSUMPTION
		});
	}

	var ctx = document.getElementById('fuel-consumption-chart').getContext('2d');
	var datasets = [{
		label: 'Fuel',
		backgroundColor: chartColors.red,
		borderColor: chartColors.red,
		data: fuelData,
		fill: false,
	}];



	data = {
		labels: fuelLabels,
		datasets: datasets
	};

	var options = {
		responsive: true,
		title: {
			display: true,
			text: 'Fuel Consumption (kg per hour)'
		},
		elements: {
			point:{
				radius: 0
			}
		},
		tooltips: {
			mode: 'index',
			intersect: false,
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Speed (km/h)'
				},
				ticks: {
					min: 0,
					max: 100,
					stepSize: 25
				}
			}],
			yAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Fuel Consumption (kg/h)'
				},
				ticks: {
					min: 0,
					max: 120,
					maxTicksLimit: 7
				}
			}]
		}
	};

	var myChart = new Chart(ctx, {
		type: 'line',
		data: data,
		options: options
	});
}

function drawDemandChart() {
	var demandLabels = [];
	var demandData = [];
	var v;
	for(var i = 0; i <= 100; i++) {
		v = i * 5;
		demandLabels.push(v);
		demandData.push({
			x : v,
			y: Math.max(Math.round(v * PRICE_ELASTICITY + DEMAND_AT_ZERO, 0), 0)
		});
	}

	var ctx = document.getElementById('demand-chart').getContext('2d');
	var datasets = [{
		label: 'Demand',
		backgroundColor: chartColors.blue,
		borderColor: chartColors.blue,
		data: demandData,
		fill: false,
	}];



	data = {
		labels: demandLabels,
		datasets: datasets
	};

	var options = {
		responsive: true,
		title: {
			display: true,
			text: 'Demand vs Ticket Price'
		},
		elements: {
			point:{
				radius: 0
			}
		},
		tooltips: {
			mode: 'index',
			intersect: false,
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Ticket Price'
				},
				ticks: {
					min: 0,
					max: 500,
					stepSize: 50
				}
			}],
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'Demand'
				},
				ticks: {
					min: 0,
					max: 150,
					maxTicksLimit: 5
				}
			}]
		}
	};

	var myChart = new Chart(ctx, {
		type: 'line',
		data: data,
		options: options
	});
}
