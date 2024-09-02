import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import Page from '@/app/[id]/create/page';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {MockCatalogTitle1} from '../../../mockdata';
import * as localData from '@/services/local.data';
import {getLocalTitle, postLocalTitle} from '@/services/local.data';
import {NotFoundError} from '@/models/Errors';


beforeEach(() => {
  vi.mocked(fetchNewspaperTitleFromCatalog).mockImplementation(() => Promise.resolve(MockCatalogTitle1));
  vi.mocked(getLocalTitle).mockImplementation(() => Promise.reject(new NotFoundError('Title not found')));
  vi.mocked(postLocalTitle).mockImplementation(() => Promise.resolve(new Response()));
  render(<Page params={{id: ''}}/>);
});

test('Create title page has title', async () => {
  await screen.findByText(MockCatalogTitle1.name);
  expect(screen.getByText(MockCatalogTitle1.name)).toBeTruthy();
});

test('Create title page has form', async () => {
  await screen.findByText('Kontaktinformasjon');
  expect(screen.getByText('Navn')).toBeTruthy();
  expect(screen.getByText('Avleverer')).toBeTruthy();
  expect(screen.getByText('E-post')).toBeTruthy();
  expect(screen.getByText('Telefon')).toBeTruthy();

  expect(screen.getByText('Utgivelsesmønster')).toBeTruthy();
  expect(screen.getByText('Hyllesignatur')).toBeTruthy();
  expect(screen.getByText('Merknad/kommentar')).toBeTruthy();
  expect(screen.getByText('Lagre')).toBeTruthy();
});

test('Create title page saves on button press', async () => {
  const postSpy = vi.spyOn(localData, 'postLocalTitle');
  expect(postSpy).not.toHaveBeenCalled();

  (await screen.findByRole('button', {name: 'Lagre'})).click();
  await vi.waitFor(() => expect(postSpy).toHaveBeenCalled());
});

test('Create title page displays error message when database is unavailable for post', async () => {
  vi.mocked(postLocalTitle).mockImplementation(() => Promise.reject(new Error('')));

  (await screen.findByText('Lagre')).click();
  await vi.waitFor(() => expect(screen.getByText('Noe gikk galt ved lagring.', {exact: false})).toBeTruthy());
});

test('Create title page has button to return', async () => {
  await screen.findByRole('button', {name: 'Tilbake til titteloversikt'});
  expect(screen.getByRole('button', {name: 'Tilbake til titteloversikt'})).toBeTruthy();
});
