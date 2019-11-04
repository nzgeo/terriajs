"use strict";

var loadWithXhr = require("../Core/loadWithXhr");

var API_KEY = "Api-Key j5SJa2YsiwOjzRPmVCywV";

var CGSApi = function() {};

CGSApi.prototype.geoCode = function(searchTerm, rectangle, maxResults) {

  return loadWithXhr({
    url: "/search/api/v1/locations/search?query=" + searchTerm,
    method: "GET",
    headers: { "Authorization": API_KEY },
    responseType: "json"
  }).then(
    function(data) {
      return data.results;
    }.bind(this)
  );
};

module.exports = CGSApi;
