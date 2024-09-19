interface SerializedUserToken {
  groups: string[];
  name: string;
  accessToken: string;
  expires: string;
  refreshToken: string;
  refreshExpires: string;
}

interface UserToken {
  groups: string[];
  name: string;
  accessToken: string;
  expires: Date;
  refreshToken: string;
  refreshExpires: Date;
}

const userTokenBuilder = (userToken: SerializedUserToken): UserToken => {
  return {
    groups: userToken.groups,
    name: userToken.name,
    accessToken: userToken.accessToken,
    expires: new Date(userToken.expires),
    refreshToken: userToken.refreshToken,
    refreshExpires: new Date(userToken.refreshExpires)
  };
};

interface User {
  name: string;
  expires: Date;
}

export type { User, UserToken, SerializedUserToken };
export { userTokenBuilder };