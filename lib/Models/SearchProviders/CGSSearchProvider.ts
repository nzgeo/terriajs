import { makeObservable, override, runInAction } from "mobx";
import Rectangle from "terriajs-cesium/Source/Core/Rectangle";
import Terria from "../Terria";
import SearchProviderResults from "./SearchProviderResults";
import SearchResult from "./SearchResult";

// The v8 Mixins and Trait architecture
import LocationSearchProviderMixin from "../../ModelMixins/SearchProviders/LocationSearchProviderMixin";
import CreateModel from "../Definition/CreateModel";
import LocationSearchProviderTraits from "../../Traits/SearchProviders/LocationSearchProviderTraits";
import mixTraits from "../../Traits/mixTraits";
import primitiveTrait from "../../Traits/Decorators/primitiveTrait";

// 1. Define the Traits (The v8 way to define properties)
export class CGSSearchProviderTraits extends mixTraits(LocationSearchProviderTraits) {
    @primitiveTrait({ type: "string", name: "URL", description: "CGS API URL" })
    url?: string;

    @primitiveTrait({ type: "string", name: "Key", description: "CGS API Key" })
    key?: string;
}

// 2. Create the Model using the Mixin
export default class CGSSearchProvider extends LocationSearchProviderMixin(
    CreateModel(CGSSearchProviderTraits)
) {
    static readonly type = "cgs-search";

    get type() {
        return CGSSearchProvider.type;
    }

    constructor(id: string | undefined, terria: Terria) {
        super(id, terria);
        makeObservable(this);

        if (!this.key) {
            console.warn("The geocoder will always return no results because the CGS Search API Key has not been configured.");
        }
    }

    // Required by LocationSearchProviderMixin in v8
    @override
    protected logEvent(searchText: string) {
        this.terria.analytics?.logEvent("search", "cgs", searchText);
    }

    @override
    protected async doSearch(searchText: string, searchResults: SearchProviderResults): Promise<void> {
        searchResults.results.length = 0;
        searchResults.message = undefined;

        if (searchText === undefined || /^\s*$/.test(searchText)) {
            return;
        }

        try {
            const baseUrl = this.url ?? "/search/";
            const keyParam = this.key ? `&key=${encodeURIComponent(this.key)}` : "";
            
            const response = await fetch(`${baseUrl}api/v1/places?place=${encodeURIComponent(searchText)}&limit=5${keyParam}`);
            if (!response.ok) throw new Error("Network response failed");
            
            const data = await response.json();

            if (searchResults.isCanceled) return;

            if (data.length === 0) {
                runInAction(() => {
                    searchResults.message = { content: "Sorry, no locations match your search query." };
                });
                return;
            }

            const geometryPromises = data.map(async (place: string) => {
                const geoResponse = await fetch(`${baseUrl}api/v1/place/geometry?place=${encodeURIComponent(place)}${keyParam}`);
                if (!geoResponse.ok) return [];
                
                const geoStructs = await geoResponse.json();

                return geoStructs.map((geoStruct: any) => {
                    return new SearchResult({
                        name: place,
                        isImportant: true,
                        clickAction: createZoomToFunction(this.terria, geoStruct, this.flightDurationSeconds || 1.5),
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
                searchResults.message = { content: "An error occurred while searching. Please contact your administrator or try again later." };
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