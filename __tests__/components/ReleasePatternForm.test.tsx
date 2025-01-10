import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MockTitle} from '../mockdata';
import {Form, Formik} from 'formik';
import ReleasePatternForm from '@/components/ReleasePatternForm';

beforeEach(() => {
  render(
    <Formik
      enableReinitialize
      initialValues={MockTitle.release_pattern}
      onSubmit={() => {}}
    >
      {({
        values,
        handleChange,
        handleBlur,
      }) => (
        <Form>
          <ReleasePatternForm
            releasePattern={values}
            handleChange={handleChange}
            handleBlur={handleBlur}
          />
        </Form>
      )}
    </Formik>
  );
});

test('ReleasePatternForm should render all day labels', () => {
  expect(screen.getByText('Mandag')).toBeTruthy();
  expect(screen.getByText('Tirsdag')).toBeTruthy();
  expect(screen.getByText('Onsdag')).toBeTruthy();
  expect(screen.getByText('Torsdag')).toBeTruthy();
  expect(screen.getByText('Fredag')).toBeTruthy();
  expect(screen.getByText('Lørdag')).toBeTruthy();
  expect(screen.getByText('Søndag')).toBeTruthy();
});

test('ReleasePatternForm should render all input fields with correct values', () => {
  const inputsWith1: number = MockTitle.release_pattern.filter(val => val === 1).length;
  const inputsWith0: number = MockTitle.release_pattern.filter(val => val === 0).length;

  expect(screen.getAllByRole('gridcell', {name: '1'}).length).toEqual(inputsWith1);
  expect(screen.getAllByRole('gridcell', {name: '0'}).length).toEqual(inputsWith0);
});