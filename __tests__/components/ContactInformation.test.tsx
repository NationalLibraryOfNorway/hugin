import {beforeEach, expect, test} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MockContactEmail1, MockContactPhone1, MockTitle} from '../mockdata';
import ContactInformation from '@/components/ContactInformation';

beforeEach(() => {
  render(
    <ContactInformation
      vendor={MockTitle.vendor}
      contactName={MockTitle.contact_name}
      contactInformation={[MockContactEmail1, MockContactPhone1]}
    />);
});

test('ContactInformation should render vendor', () => {
  expect(screen.getByText('Avleverer:')).toBeTruthy();
  expect(screen.getByText(MockTitle.vendor!)).toBeTruthy();
});

test('ContactInformation should render contact name', () => {
  expect(screen.getByText('Kontaktperson:')).toBeTruthy();
  expect(screen.getByText(MockTitle.contact_name!)).toBeTruthy();
});

test('ContactInformation should render phone numbers', () => {
  expect(screen.getByText('Telefonnummer')).toBeTruthy();
  expect(screen.getByText(MockContactPhone1.contact_value)).toBeTruthy();
});

test('ContactInformation should render emails', () => {
  expect(screen.getByText('E-postadresse')).toBeTruthy();
  expect(screen.getByText(MockContactEmail1.contact_value)).toBeTruthy();
});
