import {beforeEach, expect, test} from 'vitest';
import {render, screen} from '@testing-library/react';
import Home from '@/app/page';


beforeEach(() => {
  render(<Home/>);
});

test('Startpage has hugin logo', () => {
  expect(screen.getByAltText('Hugin logo')).toBeTruthy();
});

test('Startpage has search bar', () => {
  expect(screen.getByRole('combobox', { name: 'Søk etter avistittel', })).toBeTruthy();
});
