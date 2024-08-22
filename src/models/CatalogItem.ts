export interface CatalogItem {
  catalogueId: string;
  name: string;
  date: string;
  materialType: string;
  titleCatalogueId: string;
  titleName: string;
  digital: boolean;
  urn: string;
  location: string;
  parentCatalogueId: string; // Vanligvis manifestasjons-ID
}
