import {beforeEach, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import IssueList from '@/components/IssueList';
import {MockBox1, MockNewspaper1, MockTitle} from '../mockdata';
import * as localData from '@/services/local.data';
import {getNewspapersForBoxOnTitle, postNewIssuesForTitle} from '@/services/local.data';

// FieldArray and tables are hard to test, and might require a different approach that usual.
// Not using time to test all cases at this point, but might be smart to try that at some point.

beforeEach(() => {
  vi.mocked(getNewspapersForBoxOnTitle).mockImplementation(() => Promise.resolve([MockNewspaper1]));
  vi.mocked(postNewIssuesForTitle).mockImplementation(() => Promise.resolve(new Response('', {status: 200})));
  render(<IssueList title={MockTitle} box={MockBox1}/>);
});

test('IssueList should render with new edition and save button', async () => {
  await vi.waitFor(() => expect(screen.getByText('Legg til ny utgave')).toBeTruthy());
  expect(screen.getByText('Lagre')).toBeTruthy();
});

test('IssueList should show save message when saved', async () => {
  const saveSpy = vi.spyOn(localData, 'postNewIssuesForTitle');
  expect(saveSpy).not.toHaveBeenCalled();

  await vi.waitFor(() => expect(screen.getByText('Lagre')).toBeTruthy());

  screen.getByText('Lagre').click();
  await vi.waitFor(() => expect(screen.getByText('Lagret!')).toBeTruthy());
});

test('IssueList should show error message when save fails', async () => {
  vi.mocked(postNewIssuesForTitle).mockImplementation(() => Promise.resolve(new Response('', {status: 500})));

  await vi.waitFor(() => expect(screen.getByText('Lagre')).toBeTruthy());
  screen.getByText('Lagre').click();

  await vi.waitFor(() => expect(screen.getByText('Kunne ikke lagre avisutgaver.', {exact: false})).toBeTruthy());
});
