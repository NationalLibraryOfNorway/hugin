import {expect, test} from 'vitest';
import {
  newNewspapersContainsDuplicateEditions,
  newspapersContainsEdition,
  validateBetweenZeroAndFive
} from '@/utils/validationUtils';
import {MockNewspaper1, MockNewspaper2} from '../mockdata';
import {newspaper} from '@prisma/client';

const newspapersList: newspaper[] = [MockNewspaper1, MockNewspaper2];

test('validateBetweenZeroAndFive should return undefined for values 0 to 5', () => {
  expect(validateBetweenZeroAndFive(0)).toBeUndefined();
  expect(validateBetweenZeroAndFive(1)).toBeUndefined();
  expect(validateBetweenZeroAndFive(2)).toBeUndefined();
  expect(validateBetweenZeroAndFive(3)).toBeUndefined();
  expect(validateBetweenZeroAndFive(4)).toBeUndefined();
  expect(validateBetweenZeroAndFive(5)).toBeUndefined();
});

test('validateBetweenZeroAndFive should return error for values less than 0 or more than 5', () => {
  expect(validateBetweenZeroAndFive(-1)).toBe('Tallet kan ikke være negativt');
  expect(validateBetweenZeroAndFive(-100)).toBe('Tallet kan ikke være negativt');
  expect(validateBetweenZeroAndFive(6)).toBe('Tallet kan ikke være større enn 5');
  expect(validateBetweenZeroAndFive(100)).toBe('Tallet kan ikke være større enn 5');
});

test('newspapersContainsEdition should return true if edition is in newspapers', () => {
  expect(newspapersContainsEdition('1', newspapersList)).toBe(true);
  expect(newspapersContainsEdition('2', newspapersList)).toBe(true);
});

test('newspapersContainsEdition should return false if edition is not in newspapers', () => {
  expect(newspapersContainsEdition('3', newspapersList)).toBe(false);
  expect(newspapersContainsEdition('11', newspapersList)).toBe(false);
});

test('newNewspapersContainsDuplicateEditions should return true if newNewspapers contains editions that are in newspapers', () => {
  expect(newNewspapersContainsDuplicateEditions([{...MockNewspaper1, date: new Date(2024, 5, 1)}], newspapersList)).toBe(true);
});

test('newNewspapersContainsDuplicateEditions should return false if newNewspapers does not contain editions that are in newspapers', () => {
  expect(newNewspapersContainsDuplicateEditions([{...MockNewspaper1, edition: '123'}], newspapersList)).toBe(false);
});

test('newNewspapersContainsDuplicateEditions should return false if newNewspapers ' +
     'only contains editions that are in newspapers and has the same date', () => {
  expect(newNewspapersContainsDuplicateEditions(newspapersList, newspapersList)).toBe(false);
});
