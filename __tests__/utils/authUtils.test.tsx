import {expect, test} from 'vitest';
import {isAuthorized} from '@/utils/authUtils';
import {MockUserToken} from '../mockdata';
import {UserToken} from '@/models/UserToken';


test('isAuthorized should return true if user has right role', () => {
  expect(isAuthorized(MockUserToken)).toBe(true);
});


test('isAuthorized should return false if user is missing the required roles', () => {
  expect(isAuthorized({...MockUserToken, groups: []} as UserToken)).toBe(false);
});