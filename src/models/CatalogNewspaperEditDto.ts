import {newspaper} from '@prisma/client';
import {getUserName} from '@/utils/cookieUtils';


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
    username: getUserName() ?? '',
    notes: issue.notes ?? '',
    // eslint-disable-next-line id-denylist
    number: issue.edition ?? ''
  };
}
