import {UserToken} from '@/models/UserToken';

const authorizedRoles = ['T_relation_avis']; // TODO: Fiks rolle når den er opprettet

export function isAuthorized(token?: UserToken) {
  if (token) {
    if (new Date(token.refreshExpires).getTime() > Date.now()) {
      return authorizedRoles.some(role => token.groups.includes(role));
    }
  }
  return false;
}