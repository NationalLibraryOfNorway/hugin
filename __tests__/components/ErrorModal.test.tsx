import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import ErrorModal from '@/components/ErrorModal';
import {userEvent} from '@testing-library/user-event';


beforeEach(() => {
  render(<ErrorModal text='Feilmelding'/>);
});

test('ErrorModal should render with text and button', () => {
  expect(screen.getByText('Feilmelding', {exact: false})).toBeTruthy();
  expect(screen.getByText('Kontakt tekst-teamet', {exact: false})).toBeTruthy();
  expect(screen.getByText('dersom problemet vedvarer', {exact: false})).toBeTruthy();
  expect(screen.getByRole('button', {name: 'Lukk'})).toBeTruthy();
});

test('ErrorModal should close when button is pressed', async () => {
  screen.getByRole('button', {name: 'Lukk'}).click();
  await vi.waitFor(() => expect(screen.queryByText('Feilmelding', {exact: false})).toBeNull());
});

test('ErrorModal should close when escape is pressed', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  await userEvent.keyboard('{Escape}');
  await vi.waitFor(() => expect(screen.queryByText('Feilmelding', {exact: false})).toBeNull());
});

test('ErrorModal should close when outside is clicked', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
  await userEvent.click(document.body);
  await vi.waitFor(() => expect(screen.queryByText('Feilmelding', {exact: false})).toBeNull());
});
