import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import ContactInformationForm from '@/components/ContactInformationForm';
import {MockContactEmail1, MockContactPhone1, MockTitle} from '../mockdata';
import {Form, Formik} from 'formik';
import {TitleContactInfo} from '@/models/TitleContactInfo';

beforeEach(() => {
  const titleContact: TitleContactInfo = {
    title: MockTitle,
    contactInfo: [MockContactEmail1, MockContactPhone1]
  };
  render(
    <Formik
      enableReinitialize
      initialValues={titleContact}
      onSubmit={() => {}}
    >
      {({
        values,
        handleChange,
        handleBlur,
      }) => (
        <Form>
          <ContactInformationForm
            values={values}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleAdd={vi.fn()}
            handleRemove={vi.fn()}
          />
        </Form>
      )}
    </Formik>
  );
});

test('ContactInformation should render vendor', () => {
  expect(screen.getByText('Avleverer')).toBeTruthy();
  expect(screen.getByDisplayValue(MockTitle.vendor!)).toBeTruthy();
});

test('ContactInformation should render contact name', () => {
  expect(screen.getByText('Navn')).toBeTruthy();
  expect(screen.getByDisplayValue(MockTitle.contact_name!)).toBeTruthy();
});

test('ContactInformation should render phone numbers', () => {
  expect(screen.getByText('Telefon')).toBeTruthy();
  expect(screen.getByDisplayValue(MockContactPhone1.contact_value)).toBeTruthy();
});

test('ContactInformation should render emails', () => {
  expect(screen.getByText('E-post')).toBeTruthy();
  expect(screen.getByDisplayValue(MockContactEmail1.contact_value)).toBeTruthy();
});

test('ContactInformation should render add buttons', () => {
  expect(screen.getByRole('button', {name: '+ Legg til telefon'})).toBeTruthy();
  expect(screen.getByRole('button', {name: '+ Legg til e-post'})).toBeTruthy();
});