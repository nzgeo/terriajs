import { makeObservable, observable, runInAction } from "mobx";
import Rectangle from "terriajs-cesium/Source/Core/Rectangle";
import SearchProvider from "../Models/SearchProviders/SearchProvider";
import SearchResult from "../Models/SearchProviders/SearchResult";
import SearchProviderResults from "../Models/SearchProviders/SearchProviderResults";
import Terria from "../Models/Terria";

interface CGSSearchProviderOptions {
    terria: Terria;
    key?: string;
    url?: string;
    maxResults?: number;
    flightDurationSeconds?: number;
}

export default class CGSSearchProvider extends SearchProvider {
    readonly name = "CGS Search";
    @observable isOpen = true;

    @observable terria: Terria;
    @observable key: string | undefined;
    @observable url: string;
    @observable maxResults: number;
    @observable flightDurationSeconds: number;

    constructor(options: CGSSearchProviderOptions) {
        super();
        
        // In MobX 6 (used by newer TerriaJS), makeObservable is required in the constructor
        makeObservable(this);

        this.terria = options.terria;
        this.key = options.key;
        this.url = options.url ?? "/search/";
        this.maxResults = options.maxResults ?? 200;
        this.flightDurationSeconds = options.flightDurationSeconds ?? 1.5;

        if (!this.key) {
            console.warn("The geocoder will always return no results because the CGS Search API Key has not been configured.");
        }
    }

    protected async doSearch(searchText: string, searchResults: SearchProviderResults): Promise<void> {
        searchResults.results.length = 0;
        searchResults.message = undefined;

        if (searchText === undefined || /^\s*$/.test(searchText)) {
            return;
        }

        try {
            const response = await fetch(`${this.url}api/v1/places?place=${encodeURIComponent(searchText)}&limit=5`);
            if (!response.ok) throw new Error("Network response failed");
            
            const data = await response.json();

            if (searchResults.isCanceled) return;

            if (data.length === 0) {
                runInAction(() => {
                    searchResults.message = "Sorry, no locations match your search query.";
                });
                return;
            }

            // Fetch geometries concurrently instead of synchronously blocking the thread
            const geometryPromises = data.map(async (place: string) => {
                const geoResponse = await fetch(`${this.url}api/v1/place/geometry?place=${encodeURIComponent(place)}`);
                if (!geoResponse.ok) return [];
                
                const geoStructs = await geoResponse.json();

                return geoStructs.map((geoStruct: any) => {
                    return new SearchResult({
                        name: place,
                        isImportant: true,
                        clickAction: createZoomToFunction(this.terria, geoStruct, this.flightDurationSeconds),
                        location: {
                            longitude: geoStruct.bbox[2] - Math.abs(geoStruct.bbox[2] - geoStruct.bbox[0]) / 2,
                            latitude: geoStruct.bbox[3] - Math.abs(geoStruct.bbox[3] - geoStruct.bbox[1]) / 2
                        }
                    });
                });
            });

            const nestedResults = await Promise.all(geometryPromises);
            const flatResults = nestedResults.flat();

            if (searchResults.isCanceled) return;

            runInAction(() => {
                searchResults.results.push(...flatResults);
            });

        } catch (error) {
            if (searchResults.isCanceled) return;
            
            runInAction(() => {
                searchResults.message = "An error occurred while searching. Please contact your administrator or try again later.";
            });
        }
    }
}

function createZoomToFunction(terria: Terria, geometryGeoJson: any, flightDurationSeconds: number) {
    const [west, south, east, north] = geometryGeoJson.bbox;
    const rectangle = Rectangle.fromDegrees(west, south, east, north);
    
    return function () {
        terria.currentViewer.zoomTo(rectangle, flightDurationSeconds);
    };
}
