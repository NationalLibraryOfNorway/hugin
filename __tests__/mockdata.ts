import {newspaper, title} from '@prisma/client';
import {CatalogTitle} from '@/models/CatalogTitle';

/* eslint-disable @typescript-eslint/naming-convention */

export const MockTitle: title = {
  id: 987,
  last_box: 'box1',
  contact_email: 'hugin@hugin.no',
  contact_name: 'Hugin Huginson',
  contact_phone: '12345678',
  vendor: 'Hugin AS',
  release_pattern: [1, 0, 1, 0, 1, 0, 0],
  last_box_from: new Date(2024, 1, 1),
  shelf: '1-1',
  notes: 'notater',
};

export const MockCatalogTitle1: CatalogTitle = {
  catalogueId: '987',
  name: 'Huginavisen',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  publisher: 'Hugin AS',
  publisherPlace: 'Brakka',
  language: 'nob'
};

export const MockCatalogTitle2: CatalogTitle = {
  catalogueId: '123',
  name: 'Huginbladet',
  startDate: '2024-08-01',
  publisher: 'Hugin AS',
  publisherPlace: 'Brakka',
  language: 'nob'
};

export const MockNewspaper1: newspaper = {
  title_id: MockTitle.id,
  edition: '1',
  date: new Date(2024, 1, 1),
  received: true,
  username: 'testuser',
  box: MockTitle.last_box!,
  notes: 'notater på avis',
  catalog_id: '123456'
};

export const MockNewspaper2: newspaper = {
  title_id: MockTitle.id,
  edition: '2',
  date: new Date(2024, 1, 2),
  received: true,
  username: 'testuser',
  box: MockTitle.last_box!,
  notes: 'notater på avis',
  catalog_id: '123456'
};
