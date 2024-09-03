import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import NotesComponent from '@/components/NotesComponent';
import {userEvent} from '@testing-library/user-event';

beforeEach(() => {
  render(<NotesComponent notes='notater' onSubmit={() => Promise.resolve(new Response('', {status: 200}))}/>);
});

test('NotesComponent should render with field and disabled button', async () => {
  await vi.waitFor(() => expect(screen.getByText('Merknad/kommentar')).toBeTruthy());
  expect(screen.getByText('Lagre kommentar')).toBeTruthy();
  expect(screen.getByRole('textbox')).toBeTruthy();
});

test('NotesComponent save button should be disabled when value not changed', () => {
  const button = screen.getByText('Lagre kommentar');
  expect((button as HTMLButtonElement).disabled).toBeTruthy();
});

test('NotesComponent save button should be enabled when value changed', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  await userEvent.type(screen.getByRole('textbox'), 'a');
  const button = screen.getByText('Lagre kommentar');
  expect((button as HTMLButtonElement).disabled).toBeFalsy();
});
