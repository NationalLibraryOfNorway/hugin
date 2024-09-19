import {beforeEach, expect, test} from 'vitest';
import {render, screen} from '@testing-library/react';
import Header from '@/components/Header';

beforeEach(() => {
  render(<Header/>);
});

test('Header should have logo and Hugin-text', () => {
  expect(screen.getByText('Hugin')).toBeTruthy();
  expect(screen.getByAltText('Hugin logo')).toBeTruthy();
  expect(screen.getByRole('img')).toBeTruthy();
});

test('Header should not as default not show search bar', () => {
  expect(screen.queryByRole('searchbox')).toBeFalsy();
});
