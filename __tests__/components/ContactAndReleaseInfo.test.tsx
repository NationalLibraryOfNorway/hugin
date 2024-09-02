import {beforeEach, expect, test, vi} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import ContactAndReleaseInfo from '@/components/ContactAndReleaseInfo';
import {MockTitle} from '../mockdata';


beforeEach(() => {
  render(<ContactAndReleaseInfo titleFromDb={MockTitle} onSubmit={() => Promise.resolve(new Response())} />);
});

test('Contact and release does not open in edit mode', () => {
  expect(screen.getByText('Kontaktinformasjon', {exact: false})).toBeTruthy();
  expect(screen.getByText('Avleverer:', {exact: false})).toBeTruthy();
  expect(screen.getByText('Kontaktperson:', {exact: false})).toBeTruthy();
  expect(screen.getByText('E-post:', {exact: false})).toBeTruthy();
  expect(screen.getByText('Telefon:', {exact: false})).toBeTruthy();

  expect(screen.queryByRole('textbox', {name: 'Avleverer'})).toBeNull();
  expect(screen.queryByRole('textbox', {name: 'Navn'})).toBeNull();
  expect(screen.queryByRole('textbox', {name: 'E-post'})).toBeNull();
  expect(screen.queryByRole('textbox', {name: 'Telefon'})).toBeNull();
});

test('Contact and release can be edited after button press', async () => {
  screen.getByRole('button', {name: 'Rediger'}).click();
  await vi.waitFor(() => screen.getByRole('textbox', {name: 'Avleverer'}));

  expect(screen.getByRole('textbox', {name: 'Avleverer'})).toBeTruthy();
  expect(screen.getByRole('textbox', {name: 'Navn'})).toBeTruthy();
  expect(screen.getByRole('textbox', {name: 'E-post'})).toBeTruthy();
  expect(screen.getByRole('textbox', {name: 'Telefon'})).toBeTruthy();
});

test('Contact and release shows success on successful button press', async () => {
  screen.getByRole('button', {name: 'Rediger'}).click();
  await vi.waitFor(() => screen.getByRole('textbox', {name: 'Avleverer'}));

  screen.getByRole('button', {name: 'Lagre'}).click();
  await vi.waitFor(() => screen.getByText('Kontakt- og utgivelsesinformasjon lagret!'));
});

test('Contact and release should have release pattern', async () => {
  expect(screen.getByText('Mandag:')).toBeTruthy();
  expect(screen.getByText('Tirsdag:')).toBeTruthy();
  expect(screen.getByText('Onsdag:')).toBeTruthy();
  expect(screen.getByText('Torsdag:')).toBeTruthy();
  expect(screen.getByText('Fredag:')).toBeTruthy();
  expect(screen.getByText('Lørdag:')).toBeTruthy();
  expect(screen.getByText('Søndag:')).toBeTruthy();

  screen.getByRole('button', {name: 'Rediger'}).click();
  await vi.waitFor(() => screen.getByRole('heading', {name: 'Utgivelsesmønster:'}));
  expect(screen.getAllByRole('gridcell', {name: '1'})).toBeTruthy();
  expect(screen.getAllByRole('gridcell', {name: '0'})).toBeTruthy();
  expect(screen.getByRole('rowheader', {name: 'Mandag'})).toBeTruthy();
  expect(screen.getByRole('rowheader', {name: 'Tirsdag'})).toBeTruthy();
  expect(screen.getByRole('rowheader', {name: 'Onsdag'})).toBeTruthy();
  expect(screen.getByRole('rowheader', {name: 'Torsdag'})).toBeTruthy();
  expect(screen.getByRole('rowheader', {name: 'Fredag'})).toBeTruthy();
  expect(screen.getByRole('rowheader', {name: 'Lørdag'})).toBeTruthy();
  expect(screen.getByRole('rowheader', {name: 'Søndag'})).toBeTruthy();
});

test('Contact and release should show error message on unsuccessful submit', async () => {
  cleanup();
  render(<ContactAndReleaseInfo titleFromDb={MockTitle} onSubmit={() => Promise.reject(new Response())} />);

  screen.getByRole('button', {name: 'Rediger'}).click();
  await vi.waitFor(() => screen.getByRole('textbox', {name: 'Avleverer'}));

  screen.getByRole('button', {name: 'Lagre'}).click();
  await vi.waitFor(() => screen.getByText('Noe gikk galt ved lagring', {exact: false}));
});
