import { observable, runInAction } from "mobx";
import defaultValue from "terriajs-cesium/Source/Core/defaultValue";
import Rectangle from "terriajs-cesium/Source/Core/Rectangle";
import SearchProvider from "./SearchProvider";
import SearchResult from "./SearchResult";
import Terria from "../Terria";
import SearchProviderResults from "./SearchProviderResults";
import loadWithXhr from "../../Core/loadWithXhr"

interface CGSSearchProviderOptions {
    terria: Terria;
    key?: string;
    url?: string;
    searchTerm?: string;
    maxResults?: number;
    flightDurationSeconds?: number;
}

export default class CGSSearchProvider extends SearchProvider {
    @observable terria: Terria;
    @observable key: string | undefined;
    @observable url: string;
    @observable maxResults: number;
    @observable flightDurationSeconds: number;

    constructor(options: CGSSearchProviderOptions) {
        super();

        this.terria = options.terria;
        this.key = options.key;
        this.url = defaultValue(options.url, "/search/");
        this.maxResults = 100;
        this.flightDurationSeconds = defaultValue(options.flightDurationSeconds, 1.5);

        if (!this.key) {
            console.warn("The geocoder will always return no results because the CGS Search API Key has not been configured.");
        }
    }

    protected doSearch(searchText: string, searchResults: SearchProviderResults): Promise<any> {
        searchResults.results.length = 0;
        searchResults.message = undefined;

        if (searchText == undefined || /^\s*$/.test(searchText)) {
            return Promise.resolve();
        }

        const promise: Promise<any> = loadWithXhr({
            url: "/search/api/v1/places?place=" + searchText + "&limit=" + 5,
            method: "GET",
            responseType: "json"
        });

        return promise
            .then(data => {
                console.log("Testing 1")
                if (searchResults.isCanceled) {
                    // A new search has superseded this one, so ignore the result.
                    return;
                }

                if (data.length === 0) {
                    searchResults.message = "Sorry, no locations match your search query.";
                    return;
                }

                let locationResults: any[] = [];

                for (let place of data) {
                    console.log("Testing 3")
                    let results = locationResults;
                    let xhttp = new XMLHttpRequest();
                    xhttp.open("GET", "/search/api/v1/place/geometry?place=" + place, false);
                    xhttp.send();
                    let response = JSON.parse(xhttp.responseText);

                    let result = {
                        name: place,
                        isImportant: true,
                        // clickAction: createZoomToFunction(this, response.geojson),
                        location: {
                            longitude: response.bbox[2] - Math.abs(response.bbox[2] - response.bbox[0]) / 2,
                            latitude: response.bbox[3] - Math.abs(response.bbox[3] - response.bbox[1]) / 2
                        }
                    };
                    results.push(new SearchResult(result));
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

                searchResults.message = "An error occurred while searching.  Please contact your administrator or try again later.";
            });
    };
}

// function createZoomToFunction(model: CGSSearchProvider, geometryGeoJson: any) {
//     const [west, south, east, north] = geometryGeoJson.bbox;
//     const rectangle = Rectangle.fromDegrees(west, south, east, north);
//     return function () {
//         const terria = model.terria;
//         terria.currentViewer.zoomTo(rectangle, model.flightDurationSeconds);
//     };
// }
