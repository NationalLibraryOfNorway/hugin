import {newspaper} from '@prisma/client';
import {createCatalogDateString} from '@/utils/dateUtils';
import {getUserName} from '@/utils/cookieUtils';

export interface CatalogMissingNewspaperDto {
  titleCatalogueId: string;
  date: string;
  username: string;
  notes?: string;
  // eslint-disable-next-line id-denylist
  number?: string;
}

export function createCatalogMissingNewspaperDtoFromIssue(
  issue: newspaper,
  titleId: string
): CatalogMissingNewspaperDto {
  return {
    titleCatalogueId: titleId,
    date: createCatalogDateString(issue.date),
    username: getUserName() ?? '',
    notes: issue.notes ?? '',
    // eslint-disable-next-line id-denylist
    number: issue.edition ?? ''
  };
}
