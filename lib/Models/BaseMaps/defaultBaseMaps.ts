import Terria from "../Terria";
import { BaseMapJson } from "./BaseMapsModel";

export function defaultBaseMaps(terria: Terria): BaseMapJson[] {
  const baseMaps: BaseMapJson[] = [];
  baseMaps.push({
    item: {
      id: "osm_bright",
      name: "OSM Bright",
      type: "wmts",
      layer: "osm_bright",
      url:
        // "http://localhost/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
        "/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
      opacity: 1.0
    },
    image: "build/TerriaJS/images/basemap-osm-bright.png",
    contrastColor: "#000000"
  });
  baseMaps.push({
    item: {
      id: "osm_basic",
      name: "OSM Basic",
      type: "wmts",
      layer: "osm_basic",
      url:
        // "http://localhost/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
        "/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
      opacity: 1.0
    },
    image: "build/TerriaJS/images/basemap-osm-basic.png",
    contrastColor: "#000000"
  });
  baseMaps.push({
    item: {
      id: "osm_positron",
      name: "OSM Position",
      type: "wmts",
      layer: "osm_positron",
      url:
        // "http://localhost/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
        "/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
      opacity: 1.0
    },
    image: "build/TerriaJS/images/basemap-osm-positron.png",
    contrastColor: "#000000"
  });
  baseMaps.push({
    item: {
      id: "osm_street",
      name: "OSM Street",
      type: "wmts",
      layer: "osm_street",
      url:
        // "http://localhost/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
        "/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
      opacity: 1.0
    },
    image: "build/TerriaJS/images/basemap-osm-street.png",
    contrastColor: "#000000"
  });
  baseMaps.push({
    item: {
      id: "osm_terrain",
      name: "OSM Terrain",
      type: "wmts",
      layer: "osm_terrain",
      url:
        // "http://localhost/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
        "/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
      opacity: 1.0
    },
    image: "build/TerriaJS/images/basemap-osm-terrain.png",
    contrastColor: "#000000"
  });
  baseMaps.push({
    item: {
      id: "imagery_label",
      name: "Imagery",
      type: "wmts",
      layer: "imagery_label",
      url:
        // "http://localhost/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
        "/mapproxy/service?REQUEST=GetCapabilities&SERVICE=WMTS",
      opacity: 1.0
    },
    image: "build/TerriaJS/images/basemap-imagery.png",
    contrastColor: "#000000"
  });

  return baseMaps;
}
