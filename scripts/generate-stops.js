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

		stops.forEach(function (stop, i) {

			var northing = stop.Location_Northing
			var easting = stop.Location_Easting

			var point = new OSPoint(northing, easting);

			stop.coords = {
				osgb36: point.toOSGB36(),
				etrs89: point.toETRS89(),
				wgs84: point.toWGS84()
			}

		})

		fs.writeFile("../webapp/data/bus-stops.json", JSON.stringify(stops))

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
