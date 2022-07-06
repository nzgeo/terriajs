import { observable, runInAction } from "mobx";
import defaultValue from "terriajs-cesium/Source/Core/defaultValue";
import defined from "terriajs-cesium/Source/Core/defined";
import Rectangle from "terriajs-cesium/Source/Core/Rectangle";
import Resource from "terriajs-cesium/Source/Core/Resource";
import loadJsonp from "../../Core/loadJsonp";
import SearchProvider from "./SearchProvider";
import SearchResult from "./SearchResult";
import Terria from "../Terria";
import SearchProviderResults from "./SearchProviderResults";
import loadWithXhr from "../../Core/loadWithXhr"
import zoomRectangleFromPoint from "../../Map/Vector/zoomRectangleFromPoint"

let APIKEY =  "Api-Key j5SJa2YsiwOjzRPmVCywV"

 interface CGSSearchProviderOptions {
    terria: Terria;
    url?: string;
    auth?: string;
    searchTerm?: string;
    maxResults?: number;
    flightDurationSeconds?: number;
}

export default class CGSSearchProvider extends SearchProvider{
    @observable terria: Terria;
    @observable url: string;
    @observable auth: string | undefined;
    @observable maxResults: number;
    @observable flightDurationSeconds: number;

    constructor(options: CGSSearchProviderOptions) {
        super();

        this.terria = options.terria;
        this.name = "Locations"
        this.url = defaultValue(options.url, "/search/");
        this.auth = APIKEY
        this.maxResults = 10
        this.flightDurationSeconds = defaultValue(options.flightDurationSeconds, 1.5);

        if (!this.auth) {
            console.warn("The " + this.name + " geocoder will always return no results because the CGS Search API Key has not been configured.");
        }
    }

    protected doSearch(searchText: string, searchResults: SearchProviderResults): Promise<any> {
        searchResults.results.length = 0;
        searchResults.message = undefined;

        if (searchText == undefined || /^\s*$/.test(searchText)) {
            return Promise.resolve();
        }

        const promise: Promise<any> = loadWithXhr({
            url: "/search/api/v1/locations/search?query=" + searchText + "&limit=" + this.maxResults,
            method: "GET",
            headers: { "Authorization": this.auth },
            responseType: "json"
        });

        return promise
            .then(data => {
                if (searchResults.isCanceled) {
                    // A new search has superseded this one, so ignore the result.
                    return;
                }
        
                if (data.results.length === 0) {
                    searchResults.message = "viewModels.searchNoLocations";
                    return;
                }
                
                let locationResults: any[] = [];

                for(let i = 0; i <data.results.length; i++) {
                    let resource = data.results[i]
                    let name = resource.name;
                    // let xhttp = new XMLHttpRequest();
                    let results = locationResults;
                    let result = {
                        name: name,
                        isImportant: true,
                        clickAction: createZoomToFunction(this.terria, name, this.flightDurationSeconds)}
                    results.push(
                        new SearchResult(result));
                    // xhttp.onreadystatechange = function() {
                    //     if (this.readyState == 4 && this.status == 200) {
                    //         // let response = JSON.parse(xhttp.responseText)
                    //         let result = {
                    //             name: name,
                    //             isImportant: true,
                    //             clickAction: createZoomToFunction(terria, name, flight)
                    //             location: {
                    //                 longitude: response.geojson.bbox[2] - Math.abs(response.geojson.bbox[2] - response.geojson.bbox[0]) / 2,
                    //                 latitude: response.geojson.bbox[3] - Math.abs(response.geojson.bbox[3] - response.geojson.bbox[1]) / 2
                    //             }
                    //         };
                    //         results.push(
                    //             new SearchResult(result)
                    //         );
                    //     }
                    // };
                    // xhttp.open("GET", "/search/api/v1/locations/geometry?query=" + name, false);
                    // xhttp.setRequestHeader("Authorization", APIKEY);
                    // xhttp.send();
                }
                runInAction(() => {
                    searchResults.results.push(...locationResults)
                });
                })
                .catch(() => {
                  if (searchResults.isCanceled) {
                    // A new search has superseded this one, so ignore the result.
                    return;
                  }
          
                  searchResults.message = "viewModels.searchErrorOccurred";
                });
            };
        }
    
    function createZoomToFunction(terria: Terria, name: string, duration: number) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", "/search/api/v1/locations/geometry?query=" + name, false);
        xhttp.setRequestHeader("Authorization", APIKEY);
        xhttp.send();
        let response = JSON.parse(xhttp.responseText)
        console.log(response)

        let location = {
            longitude: response.geojson.bbox[2] - Math.abs(response.geojson.bbox[2] - response.geojson.bbox[0]) / 2,
            latitude: response.geojson.bbox[3] - Math.abs(response.geojson.bbox[3] - response.geojson.bbox[1]) / 2
        }

        var rectangle = zoomRectangleFromPoint(
          location.latitude,
          location.longitude,
          0.01
        );
      
        return function() {
          terria.currentViewer.zoomTo(rectangle, duration);
        };
      }




