import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import EditTextInput from '@/components/EditTextInput';
import { userEvent } from '@testing-library/user-event';

beforeEach(() => {
  render(<EditTextInput name='navn' value='verdi' onSubmit={() => Promise.resolve(new Response('', {status: 200}))} onSuccess={() => {}}/>);
});

test('EditTextInput does not open in edit mode', () => {
  expect(screen.getByText('navn:')).toBeTruthy();
  expect(screen.getByText('verdi')).toBeTruthy();

  expect(screen.queryByRole('textbox')).toBeNull();
});

test('EditTextInput can be edited after button press', async () => {
  screen.getByRole('button').click();
  await vi.waitFor(() => expect(screen.getByRole('textbox')).toBeTruthy());
});

test('EditTextInput shows success and exit edit mode on successful button press', async () => {
  screen.getByRole('button').click();
  await vi.waitFor(() => expect(screen.getByRole('textbox')).toBeTruthy());

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  await userEvent.type(screen.getByRole('textbox'), ' ny');

  screen.getByTestId('save-button').click();
  await vi.waitFor(() => expect(screen.getByText('Lagret!')).toBeTruthy());
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByText('verdi ny')).toBeTruthy();
});

test('EditTextInput should abort new changes when abort button is pressed', async () => {
  screen.getByRole('button').click();
  await vi.waitFor(() => expect(screen.getByRole('textbox')).toBeTruthy());

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  await userEvent.keyboard('trøkk');

  screen.getByTestId('abort-button').click();
  await vi.waitFor(() => expect(screen.queryByRole('textbox')).toBeNull());
});
