import {CalendarDate} from '@nextui-org/react';
import {parseDate} from '@internationalized/date';

export function createCatalogDateString(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export function dateToCalendarDate(date: Date | null): CalendarDate {
  const usedDate = date ? date : new Date();
  return parseDate(new Date(usedDate).toISOString().split('T')[0]);
}

export function catalogDateStringToNorwegianDateString(dateString: string): string {
  return dateString.split('-').reverse().join('.');
}
