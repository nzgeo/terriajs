import Terria from "../Terria";
import { BaseMapJson } from "./BaseMapsModel";

export function defaultBaseMaps(terria: Terria): BaseMapJson[] {
  const baseMaps: BaseMapJson[] = [];
  baseMaps.push({
    item: {
      id: "gnz-imagery",
      name: "GNZ Imagery",
      type: "url-template-imagery",
      url: "https://storage.googleapis.com/terria-datasets-public/basemaps/natural-earth-tiles/{z}/{x}/{reverseY}.png",
      attribution:
        "<a href='https://www.naturalearthdata.com/downloads/10m-raster-data/10m-natural-earth-2/'>Natural Earth II</a> - From Natural Earth. <a href='https://www.naturalearthdata.com/about/terms-of-use/'>Public Domain</a>.",
      maximumLevel: 17,
      opacity: 1.0
    },
    image: "build/TerriaJS/images/natural-earth.png",
    contrastColor: "#000000"
  });
  return baseMaps;
}
