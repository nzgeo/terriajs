import Terria from "../Terria";
import { BaseMapJson } from "./BaseMapsModel";

export function defaultBaseMaps(terria: Terria): BaseMapJson[] {
  const baseMaps: BaseMapJson[] = [];
  baseMaps.push({
    item: {
      id: "basemap-osm-bright",
      name: "OSM Bright",
      type: "wmts",
      layer: "osm_bright",
      url:
        "/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
      maximumLevel: 22,
      opacity: 1.0
    },
    image: "build/TerriaJS/images/basemap-osm-bright.png",
    contrastColor: "#000000"
  });

  return baseMaps;
}
