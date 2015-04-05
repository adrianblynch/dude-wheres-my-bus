$(function () {

	var stopCodeInput = $("input[name='stopCode']")
	var busesInput = $("input[name='buses']")
	var alertMinutesInput = $("input[name='alertMinutes']")
	var startBtn = $("button[name='start']")
	var expectedBusesTextarea = $("textarea[name='expectedBuses']")
	var GET_TIMES_INTERVAL = 10000

	function debug() {
		var ta = $("textarea[name='debugging']")
		var msg = ""
		for (var i = 0; i < arguments.length; i++) {
			msg += arguments[i]
		}
		ta.val(ta.val() + msg + "\n")
	}

	startBtn.click(function showExpectedBuses(e) {
		e.preventDefault()

		var stopCode = stopCodeInput.val()
		var buses = busesInput.val()
		var alertMinutes = alertMinutesInput.val()

		clearInterval(showExpectedBuses.interval)

		start(stopCode, buses, alertMinutes)

		showExpectedBuses.interval = setInterval(function () {
			start(stopCode, buses, alertMinutes)
		}, GET_TIMES_INTERVAL)
	})

	function start(stop, buses, alertMinutes) {

		var tflApiUrl = "http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1?StopAlso=false&StopID=" + stop + "&LineName=" + buses + "&ReturnList=LineName,EstimatedTime,MessageType,MessageText,ExpireTime"
		var xhr = $.ajax(tflApiUrl, {method: "get", dataType: "text"})

		xhr.done(function (response) {
			var expectedBuses = getExpectedBuses(filterByBus(deserialiseResponse(response), buses))
			showExpectedBuses(expectedBuses)
			alertExpectedBuses(expectedBuses, alertMinutes)
		})
		xhr.fail(function (a, b, c) {
			console.log("Failed calling TfL's API")
		})

	}

	function alertExpectedBuses(expectedBuses, alertMinutes) {
		alertMinutes = Array.isArray(alertMinutes) ? alertMinutes : alertMinutes.split(",")
		expectedBuses.forEach(function (expectedBus) {
			var index = alertMinutes.indexOf(expectedBus.expected.toString())
			if (index !== -1) {
				alertBus(expectedBus.bus, alertMinutes[index])
			}
		})
	}

	function alertBus(bus, minutes) {
		console.log("The", bus, "is due in ", minutes, "minutes");
	}

	function showExpectedBuses(expectedBuses) {
		expectedBuses.forEach(function (expectedBus) {
			debug("The ", expectedBus.bus, " is expected in ", expectedBus.expected, " minute(s)")
		})
	}

	function getExpectedBuses(data) {
		var now = new Date()
		return data.map(function (row) {
			return {
				bus: row[1],
				expected: getTimeDifference(now, row[3], "m")
			}
		})
	}

	function getTimeDifference(from, to, unit) {
		var ms = to - from
		var differences = {
			ms: ms,
			s: Math.abs(ms) / 1000,
			m: Math.floor(ms / 1000 / 60) % 60
		}
		return differences[unit]
	}

	function filterByBus(data, buses) {
		buses = Array.isArray(buses) ? buses : buses.split(",")
		return data.filter(function (row) {
			return buses.indexOf(row[1]) !== -1
		})
	}

	function deserialiseResponse(response, bus) {
		return response.split("\n").map(function (row) {
			return JSON.parse(row)
		})
	}

})

/*

	Stops
	Stop_Code_LBSL	Bus_Stop_Code	Naptan_Atco	Stop_Name		Location_Easting	Location_Northing	Heading	Stop_Area	Virtual_Bus_Stop
	BP712			76390			490007407S	GREAT ELMS ROAD	541163				168302				232		FT12		0

	Fields
	StopPointName,StopID,StopCode1,StopCode2,StopPointState,StopPointType,StopPointIndicator,Towards,Bearing,Latitude,Longitude,VisitNumber,TripID,VehicleID,RegistrationNumber,LineID,LineName,DirectionID,DestinationText,DestinationName,EstimatedTime,MessageUUID,MessageText,MessageType,MessagePriority,StartTime,ExpireTime,BaseVersion

*/
