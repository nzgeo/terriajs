import { observable, runInAction } from "mobx";
import defaultValue from "terriajs-cesium/Source/Core/defaultValue";
// import defined from "terriajs-cesium/Source/Core/defined";
import Rectangle from "terriajs-cesium/Source/Core/Rectangle";
// import Resource from "terriajs-cesium/Source/Core/Resource";
// import loadJsonp from "../../Core/loadJsonp";
import loadWithXhr from "../../Core/loadWithXhr";
import SearchProvider from "./SearchProvider";
// import SearchResult from "./SearchResult";
import Terria from "../Terria";
import SearchProviderResults from "./SearchProviderResults";

 interface CGSSearchProviderOptions {
    terria: Terria;
    url?: string;
    auth?: string;
    searchTerm?: string;
    maxResults?: number;
    flightDurationSeconds?: number;
}

export default class CGSSearchProvider extends SearchProvider{
    readonly terria: Terria;
    @observable url: string;
    @observable auth: any;
    @observable searchTerm: string | undefined;
    @observable maxResults: number;
    @observable flightDurationSeconds: number;

    constructor(options: CGSSearchProviderOptions) {
        super();

        this.terria = options.terria;
        this.name = "Locations"
        this.url = defaultValue(options.url, "/search/");
        this.auth = options.auth;
        this.searchTerm = options.searchTerm;
        this.maxResults = 5
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

        const promise: Promise<any> = loadWithXhr ({
            url: "/search/api/v1/locations/search?query=" + this.searchTerm + "&limit=" + this.maxResults,
            method: "GET",
            headers: { "Authorization": this.auth },
            responseType: "json"
        });

        return promise
            .then( result => {
                if (searchResults.isCanceled) {
                    // A new search has superseded this one, so ignore the result.
                    return;
                }
                if (result.resourceSets.length === 0) {
                    searchResults.message = ("WARNING: result resourceSet length === 0");
                    return;
                }
        
                let resourceSet = result.resourceSets[0];
                if (resourceSet.resources.length === 0) {
                    searchResults.message = ("WARNING: result resourceSet resources length === 0");
                    return;
                }

                const list: any[] = [];
                

                for (let i = 0; i < resourceSet.resources.length; i++) {
                    var name = resourceSet.resources[i];
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        var response = JSON.parse(xhttp.responseText)
                        let result : {};
                        result = {
                            name: name,
                            location: {
                            longitude: response.geojson.bbox[2] - Math.abs(response.geojson.bbox[2] - response.geojson.bbox[0]) / 2,
                            latitude: response.geojson.bbox[3] - Math.abs(response.geojson.bbox[3] - response.geojson.bbox[1]) / 2
                        }};
                        list.push(result);
                        }
                    };
                    xhttp.open("GET", "/search/api/v1/locations/geometry?query=" + name, false);
                    xhttp.setRequestHeader("Authorization", this.auth);
                    xhttp.send();
                }

                runInAction(() => {
                    searchResults.results.push(...list);
                });
          
                if (searchResults.results.length === 0) {
                    searchResults.message = "WARNING: searchResults === 0";
                }
            })
            .catch(() => {
                if (searchResults.isCanceled) {
                    // A new search has superseded this one, so ignore the result.
                    return;
                }
                searchResults.message = ("WARNING: searchErrorOccurred");
            });
    }
}

function createZoomToFunction(model: CGSSearchProvider, resource: any) {
    const [south, west, north, east] = resource.bbox;
    const rectangle = Rectangle.fromDegrees(west, south, east, north);

    return function() {
        const terria = model.terria;
        terria.currentViewer.zoomTo(rectangle, model.flightDurationSeconds);
    };
}
