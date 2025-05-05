import {afterEach, expect, test, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import ErrorModal from '@/components/ErrorModal';
import {ReactNode} from 'react';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual
  };
});

vi.mock('next/link', () => ({
  default: (props: {
    href: string;
    children: ReactNode;
  }) => <a href={props.href}>{props.children}</a>,
}));


afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

test('ErrorModal should render with text and button', () => {
  render(<ErrorModal text='Feilmelding' />);

  const modalContent = screen.getByRole('dialog');

  expect(within(modalContent).getByText(content => {
    return content.includes('Feilmelding');
  })).toBeTruthy();

  expect(within(modalContent).getByText(content => {
    return content.includes('Kontakt tekst-teamet');
  })).toBeTruthy();

  expect(within(modalContent).getByText(content => {
    return content.includes('dersom problemet vedvarer');
  })).toBeTruthy();

  expect(screen.getByText('Lukk')).toBeTruthy();
});

test('ErrorModal should close when button is pressed', () => {
  const exitMock = vi.fn();
  render(<ErrorModal text='Feilmelding' onExit={exitMock} />);

  fireEvent.click(screen.getByText('Lukk'));
  expect(exitMock).toHaveBeenCalled();
});

test('ErrorModal should close when escape is pressed', () => {
  const exitMock = vi.fn();
  render(<ErrorModal text='Feilmelding' onExit={exitMock} />);

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(exitMock).toHaveBeenCalled();
});

test('ErrorModal should close when outside is clicked', () => {
  const exitMock = vi.fn();
  render(<ErrorModal text='Feilmelding' onExit={exitMock} />);

  const overlayElements = document.querySelectorAll('.fixed.inset-0');
  if (overlayElements.length > 0) {
    fireEvent.click(overlayElements[0]);
    expect(exitMock).toHaveBeenCalled();
  } else {
    throw new Error('No overlay element found');
  }
});