/*
	Download stops CSV file from TfL
	Parse into JSON
	Update with lat and long coords
*/

var request = require("request")
var fs = require("fs")
var OSPoint = require("ospoint")

var appId = APP_ID
var appKey = APP_KEY
var stopsCsvUrl = "http://data.tfl.gov.uk/tfl/syndication/feeds/bus-stops.csv?app_id=" + appId + "&app_key=" + appKey

request.get(stopsCsvUrl, function (err, response, body) {

	csvToJson(body, function (err, stops) {

		/*
			'Stop_Code_LBSL': 'W7',
		    Bus_Stop_Code: '56604',
		    Naptan_Atco: '490007928S1',
		    Stop_Name: 'HAWTHORN CRESCENT',
		    Location_Easting: '535348',
		    Location_Northing: '161854',
		    Heading: '133',
		    Stop_Area: 'H136',
		    Virtual_Bus_Stop: '0'
		*/

		stops.forEach(function (stop, i) {

			var northing = stop.Location_Northing
			var easting = stop.Location_Easting

			var point = new OSPoint(northing, easting);

			stop.coords = {
				osgb36: point.toOSGB36(),
				etrs89: point.toETRS89(),
				wgs84: point.toWGS84()
			}

			// if (i === 500) {
			// 	console.log(stop)
			// 	console.log("OSG", stop.coords.osgb36.latitude + "," + stop.coords.osgb36.longitude);
			// 	console.log("ETRS", stop.coords.etrs89.latitude + "," + stop.coords.etrs89.longitude);
			// 	console.log("WGS", stop.coords.wgs84.latitude + "," + stop.coords.wgs84.longitude);
			// }

		})

		fs.writeFile("bus-stops.json", JSON.stringify(stops))

	})

})

function csvToJson(csvData, callback) {

	var json = []
	var csv = csvData.toString().split(/\r\n|\n|\r/)
	var tokens = csv[0].split(",")

	for (var i = 1; i < csv.length; i++) {

		var content = csv[i].split(",")
		var item = {};

		for (var j = 0; j < tokens.length; j++) {

			try {
				item[tokens[j]] = content[j]
			} catch (err) {
				item[tokens[j]] = ""
			}

		}

		json.push(item)

	}

	callback(null, json)

}
