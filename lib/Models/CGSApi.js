"use strict";

var loadWithXhr = require("../Core/loadWithXhr");

var API_KEY = "Api-Key j5SJa2YsiwOjzRPmVCywV";
var MAX_RESULTS = 5;
console.log("pos1")

var CGSApi = function() {};

CGSApi.prototype.geoCode = function(searchTerm, rectangle, maxResults) {
  console.log("pos2")
  return loadWithXhr({
    url: "/search/api/v1/locations/search?query=" + searchTerm + "&limit=" + MAX_RESULTS,
    method: "GET",
    headers: { "Authorization": API_KEY },
    responseType: "json"
  }).then(
    function(data) {
      // Get the location of each result in list
      console.log("pos3")
      var results = [];
      var i;
      console.log("pos4")
      for (i = 0; i < data.results.length; i++) {
        var name = data.results[i].name;
        console.log("pos5")
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            console.log("pos6")
            if (this.readyState == 4 && this.status == 200) {
              // Typical action to be performed when the document is ready:
              var response = JSON.parse(xhttp.responseText)
              console.log("pos7")
              var result = {
                name: name,
                location: {
                  longitude: response.geojson.bbox[2] - Math.abs(response.geojson.bbox[2] - response.geojson.bbox[0]) / 2,
                  latitude: response.geojson.bbox[3] - Math.abs(response.geojson.bbox[3] - response.geojson.bbox[1]) / 2
              }};
              console.log("pos8")
              results.push(result);
            }
        };
        console.log("pos9")
        xhttp.open("GET", "/search/api/v1/locations/geometry?query=" + name, false);
        xhttp.setRequestHeader("Authorization", API_KEY);
        xhttp.send();
        console.log("pos10")
      } 

      return results;
    }.bind(this)
  );
};
console.log("pos11")

module.exports = CGSApi;