import {newspaper} from '@prisma/client';
import {createCatalogDateString} from '@/utils/dateUtils';
import {getUserName} from '@/utils/cookieUtils';

export interface CatalogNewspaperDto {
  titleCatalogueId: string;
  date: string;
  username: string;
  digital: boolean;
  urn?: string;
  name?: string;
  containerId?: string;
  notes?: string;
  // eslint-disable-next-line id-denylist
  number?: string;
}

export function createCatalogNewspaperDtoFromIssue(
  issue: newspaper,
  titleId: string
): CatalogNewspaperDto {
  return {
    titleCatalogueId: titleId,
    date: createCatalogDateString(issue.date),
    username: getUserName() ?? '',
    digital: false,
    containerId: issue.box_id,
    notes: issue.notes ?? '',
    // eslint-disable-next-line id-denylist
    number: issue.edition ?? ''
  };
}
