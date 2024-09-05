import {beforeEach, expect, test, vi} from 'vitest';
import * as localData from '@/services/local.data';
import {getBoxById, postNewBoxForTitle} from '@/services/local.data';
import {fireEvent, render, screen} from '@testing-library/react';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';
import {MockBox1} from '../mockdata';

beforeEach(() => {
  vi.mocked(getBoxById).mockImplementation(() => Promise.resolve(MockBox1));
  vi.mocked(postNewBoxForTitle).mockImplementation(() => Promise.resolve(MockBox1));
  render(<BoxRegistrationModal text={'boxText'} titleId='123' titleName='title' closeModal={() => {}} updateBoxInfo={() => {}}/>);
});

test('Box registration has field for box id', () => {
  expect(screen.getByRole('textbox', {name: 'Eske id'})).toBeTruthy();
});

test('Box registration has calendar for start date', () => {
  expect(screen.getAllByText('1')).toBeTruthy();
  expect(screen.getAllByText('2')).toBeTruthy();
  expect(screen.getByText('9')).toBeTruthy();
  expect(screen.getByText('16')).toBeTruthy();
  expect(screen.getByText('21')).toBeTruthy();
  expect(screen.getByText('22')).toBeTruthy();
  expect(screen.getAllByText('28')).toBeTruthy();
});

test('Box registration saves on button press', async () => {
  const saveSpy = vi.spyOn(localData, 'postNewBoxForTitle');
  expect(saveSpy).not.toHaveBeenCalled();

  fireEvent.change(screen.getByRole('textbox', {name: 'Eske id'}), {target: {value: '123'}});
  screen.getByRole('button', {name: 'Lagre ny eske'}).click();

  await vi.waitFor(() => expect(saveSpy).toHaveBeenCalled());
});
