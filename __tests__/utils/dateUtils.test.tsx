import {expect, test} from 'vitest';
import {createCatalogDateString} from '@/utils/dateUtils';


test('createCatalogDateString should return date in format 2024-01-01', () => {
  expect(createCatalogDateString(new Date(2024, 0, 1, 12))).toBe('2024-01-01');
});
