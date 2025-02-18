import {box, contact_info, newspaper, title} from '@prisma/client';
import {CatalogTitle} from '@/models/CatalogTitle';
import {UserToken} from '@/models/UserToken';

/* eslint-disable @typescript-eslint/naming-convention */

export const MockTitle: title = {
  id: 987,
  contact_name: 'Hugin Huginson',
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

export const MockContactEmail1: contact_info = {
  id: 'c15d58c6-bc44-49d9-9cbb-e4df84748fde',
  title_id: MockTitle.id,
  contact_type: 'email',
  contact_value: 'hugin@hugin.no',
};

export const MockContactPhone1: contact_info = {
  id: 'd712ce79-f51a-49ed-b7e6-0df2552d325c',
  title_id: MockTitle.id,
  contact_type: 'phone',
  contact_value: '12345678',
};

export const MockUserToken: UserToken = {
  groups: ['T_relation_avis'],
  name: 'Testern',
  accessToken: '',
  expires: new Date(2050, 3, 6),
  refreshToken: '',
  refreshExpires: new Date(2050, 3, 6),
};
