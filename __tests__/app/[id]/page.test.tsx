import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import Page from '@/app/[id]/page';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {MockCatalogTitle1, MockNewspaper1, MockTitle} from '../../mockdata';
import {getIssuesForTitle, getLocalTitle} from '@/services/local.data';
import {NotFoundError} from '@/models/Errors';

beforeEach(() => {
  vi.mocked(fetchNewspaperTitleFromCatalog).mockImplementation(() => Promise.resolve(MockCatalogTitle1));
  vi.mocked(getLocalTitle).mockImplementation(() => Promise.resolve(MockTitle));
  vi.mocked(getIssuesForTitle).mockImplementation(() => Promise.resolve([MockNewspaper1]));
  render(<Page params={{id: ''}}/>);
});

test('Title page has title', async () => {
  await screen.findByText(MockCatalogTitle1.name);
});

test('Title page displays loading text', () => {
  expect(screen.getByText('Henter kontakt- og utgivelsesinformasjon...')).toBeTruthy();
});

test('Title page displays shelf', async () => {
  await screen.findByText('Hyllesignatur:');
  expect(screen.findByText(MockTitle.shelf!)).toBeTruthy();
});

test('Title page displays contact info', async () => {
  await screen.findByText('Kontaktinformasjon:');
  expect(screen.findByText(MockTitle.contact_name!)).toBeTruthy();
  expect(screen.findByText(MockTitle.contact_email!)).toBeTruthy();
  expect(screen.findByText(MockTitle.contact_phone!)).toBeTruthy();
  expect(screen.findByText(MockTitle.vendor!)).toBeTruthy();
});

test('Title page displays release pattern', async () => {
  await screen.findByText('Utgivelsesmønster:');
  expect(screen.findByText('Mandag:')).toBeTruthy();
  expect(screen.findByText('Tirsdag:')).toBeTruthy();
  expect(screen.findByText('Onsdag:')).toBeTruthy();
  expect(screen.findByText('Torsdag:')).toBeTruthy();
  expect(screen.findByText('Fredag:')).toBeTruthy();
  expect(screen.findByText('Lørdag:')).toBeTruthy();
  expect(screen.findByText('Søndag:')).toBeTruthy();
});

test('Title page displays notes', async () => {
  await screen.findByText('Merknad/kommentar på tittel:');
  expect(screen.getByText(MockTitle.notes!)).toBeTruthy();
});

test('Title page displays issues', async () => {
  await screen.findByText('Dag');
  expect(screen.findByText('Dato')).toBeTruthy();
  expect(screen.findByText('Nummer')).toBeTruthy();
  expect(screen.findByText('Mottatt')).toBeTruthy();
  expect(screen.findByText('Kommentar')).toBeTruthy();
  expect(screen.findByText('Legg til ny utgave')).toBeTruthy();
});

test('Title page displays option to add info if newspaper not present in local db', async () => {
  vi.mocked(getLocalTitle).mockImplementation(() => Promise.reject(new NotFoundError('Title not found')));
  render(<Page params={{id: 'asd'}}/>);

  await screen.findByText('Legg til informasjon');
  expect(screen.findByText('Fant ikke kontakt- og utgivelsesinformasjon for denne tittelen. Ønsker du å legge til?')).toBeTruthy();
});
