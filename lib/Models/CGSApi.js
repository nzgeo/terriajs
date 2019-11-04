"use strict";

var loadWithXhr = require("../Core/loadWithXhr");

var CGS_SEARCH_URL = "/search/api/v1/locations";
var API_KEY = "Api-Key j5SJa2YsiwOjzRPmVCywV";

var CGSApi = function(corsProxy, overrideUrl) {
  this.url = CGS_SEARCH_URL;
};

CGSApi.prototype.geoCode = function(searchTerm, rectangle, maxResults) {

  return loadWithXhr({
    url: CGS_SEARCH_URL + "/search?query=" + searchTerm,
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": API_KEY },
    responseType: "json"
  }).then(
    function(data) {
      return data;
    }.bind(this)
  );
};

module.exports = CGSApi;
