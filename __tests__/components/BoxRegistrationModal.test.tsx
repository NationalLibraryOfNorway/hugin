import {beforeEach, expect, test, vi} from 'vitest';
import * as localData from '@/services/local.data';
import {updateBoxForTitle} from '@/services/local.data';
import {fireEvent, render, screen} from '@testing-library/react';
import {NextResponse} from 'next/server';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';

beforeEach(() => {
  vi.mocked(updateBoxForTitle).mockImplementation(() => Promise.resolve(new NextResponse(null, {status: 204})));
  render(<BoxRegistrationModal text={'boxText'} titleId='123' closeModal={() => {}} updateBoxInfo={() => {}}/>);
});

test('Box registration has field for box id', () => {
  expect(screen.getByRole('textbox', {name: 'Eske id'})).toBeTruthy();
});

test('Box registration has calendar for start date', () => {
  expect(screen.getAllByText('1.')).toBeTruthy();
  expect(screen.getAllByText('2.')).toBeTruthy();
  expect(screen.getByText('9.')).toBeTruthy();
  expect(screen.getByText('16.')).toBeTruthy();
  expect(screen.getByText('21.')).toBeTruthy();
  expect(screen.getByText('22.')).toBeTruthy();
  expect(screen.getAllByText('28.')).toBeTruthy();
});

test('Box registration saves on button press', async () => {
  const saveSpy = vi.spyOn(localData, 'updateBoxForTitle');
  expect(saveSpy).not.toHaveBeenCalled();

  fireEvent.change(screen.getByRole('textbox', {name: 'Eske id'}), {target: {value: '123'}});
  screen.getByRole('button', {name: 'Lagre ny eske'}).click();

  await vi.waitFor(() => expect(saveSpy).toHaveBeenCalled());
});
