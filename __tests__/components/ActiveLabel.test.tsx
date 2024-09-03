import {expect, test} from 'vitest';
import {render, screen} from '@testing-library/react';
import ActiveLabel from '@/components/ActiveLabel';

test('ActiveLabel renders with text', () => {
  render(<ActiveLabel/>);
  expect(screen.getByText('Aktiv')).toBeTruthy();
});
