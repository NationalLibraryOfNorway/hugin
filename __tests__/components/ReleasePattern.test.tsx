import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MockTitle} from '../mockdata';
import ReleasePattern from '@/components/ReleasePattern';

beforeEach(() => {
  render(<ReleasePattern releasePattern={MockTitle.release_pattern}/>);
});

test('ReleasePattern should render', async () => {
  await vi.waitFor(() => expect(screen.getByRole('table')).toBeTruthy());

  expect(screen.getByText('Utgivelsesmønster:')).toBeTruthy();
  expect(screen.getByText('Mandag:')).toBeTruthy();
  expect(screen.getByText('Tirsdag:')).toBeTruthy();
  expect(screen.getByText('Onsdag:')).toBeTruthy();
  expect(screen.getByText('Torsdag:')).toBeTruthy();
  expect(screen.getByText('Fredag:')).toBeTruthy();
  expect(screen.getByText('Lørdag:')).toBeTruthy();
  expect(screen.getByText('Søndag:')).toBeTruthy();
});