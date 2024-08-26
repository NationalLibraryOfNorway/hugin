import {newspaper} from '@prisma/client';
import {createCatalogDateString} from '@/utils/dateUtils';

export interface CatalogMissingNewspaperDto {
  titleCatalogueId: string;
  date: string;
  username: string;
  notes?: string;
  // eslint-disable-next-line id-denylist
  number?: string;
}

export function createCatalogMissingNewspaperDtoFromIssue(
  issue: newspaper
): CatalogMissingNewspaperDto {
  return {
    titleCatalogueId: issue.title_id.toString(),
    date: createCatalogDateString(issue.date),
    username: 'hugin stage', // TODO replace with actual username when auth is present
    notes: issue.notes ?? '',
    // eslint-disable-next-line id-denylist
    number: issue.edition ?? ''
  };
}
