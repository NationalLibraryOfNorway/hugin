import {expect, test} from 'vitest';
import {validateBetweenZeroAndFive} from '@/utils/validationUtils';

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
