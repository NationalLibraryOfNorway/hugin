import {box, newspaper, title} from '@prisma/client';
import {CatalogTitle} from '@/models/CatalogTitle';
import {UserToken} from '@/models/UserToken';

/* eslint-disable @typescript-eslint/naming-convention */

export const MockTitle: title = {
  id: 987,
  contact_email: 'hugin@hugin.no',
  contact_name: 'Hugin Huginson',
  contact_phone: '12345678',
  vendor: 'Hugin AS',
  release_pattern: [1, 0, 1, 0, 1, 0, 0],
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

export const MockBox1: box = {
  id: 'box1',
  date_from: new Date(2024, 0, 1),
  active: true,
  title_id: MockTitle.id,
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
  edition: '1',
  date: new Date(2024, 1, 1),
  received: true,
  username: 'testuser',
  notes: 'notater på avis',
  box_id: MockBox1.id,
  catalog_id: '123456'
};

export const MockNewspaper2: newspaper = {
  edition: '2',
  date: new Date(2024, 1, 2),
  received: true,
  username: 'testuser',
  notes: 'notater på avis',
  box_id: MockBox1.id,
  catalog_id: '123456'
};

// todo usertoken with right role

export const MockUserToken: UserToken = {
  groups: ['T_relation_avis'],
  name: 'Testern',
  accessToken: '',
  expires: new Date(2050, 3, 6),
  refreshToken: '',
  refreshExpires: new Date(2050, 3, 6),
};
