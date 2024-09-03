import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import SearchBar from '@/components/SearchBar';
import {searchNewspaperTitlesInCatalog} from '@/services/catalog.data';
import {MockCatalogTitle1, MockCatalogTitle2} from '../mockdata';
import {userEvent} from '@testing-library/user-event';

beforeEach(() => {
  vi.mocked(searchNewspaperTitlesInCatalog).mockImplementation(() => Promise.resolve([MockCatalogTitle1, MockCatalogTitle2]));
  render(<SearchBar inHeader={false} />);
});

test('SearchBar should render', async () => {
  await vi.waitFor(() => expect(screen.getByRole('combobox')).toBeTruthy());
});

test('SearchBar should have help test', async () => {
  await vi.waitFor(() => expect(screen.getByText('Søk etter avistittel')).toBeTruthy());
});

test('SearchBar should have two items', async () => {
  await vi.waitFor(() => expect(screen.getByRole('combobox')).toBeTruthy());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  await userEvent.type(screen.getByRole('combobox'), 'Hugin');

  await vi.waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2));
});

test('SearchBar should display active label', async () => {
  await vi.waitFor(() => expect(screen.getByRole('combobox')).toBeTruthy());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  await userEvent.type(screen.getByRole('combobox'), 'Hugin');

  expect(screen.getByText('Aktiv')).toBeTruthy(); // Would fail if there was more than one active label
});
