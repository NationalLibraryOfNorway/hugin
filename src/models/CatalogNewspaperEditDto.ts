import {newspaper} from '@prisma/client';


export interface CatalogNewspaperEditDto {
  manifestationId: string;
  username: string;
  notes: string;
  // eslint-disable-next-line id-denylist
  number: string;
}

export function createCatalogNewspaperEditDtoFromIssue(
  issue: newspaper
): CatalogNewspaperEditDto {
  return {
    manifestationId: issue.catalog_id,
    username: 'Hugin stage', // TODO replace with actual username when auth is present
    notes: issue.notes ?? '',
    // eslint-disable-next-line id-denylist
    number: issue.edition ?? ''
  };
}
