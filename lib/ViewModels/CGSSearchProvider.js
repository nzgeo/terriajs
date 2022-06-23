import ItemSearchProvider from "../Models/ItemSearchProviders/ItemSearchProvider";
import { registerItemSearchProvider } from "../Models/ItemSearchProviders/ItemSearchProviders";

class CGSSearchProvider extends ItemSearchProvider{

}

registerItemSearchProvider(
    "cgs-item-search-provider", 
    CGSSearchProvider
);