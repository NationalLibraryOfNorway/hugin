export interface CatalogTitle {
  catalogueId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  publisher?: string;
  publisherPlace?: string;
  language?: string;
}

export interface SimpleTitle {
  id: string;
  name: string;
}

export const toSimpleTitle = (title: CatalogTitle): SimpleTitle => {
  return {
    id: title.catalogueId,
    name: title.name,
  };
};
