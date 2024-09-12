interface UserToken {
  groups?: string[];
  name?: string;
  accessToken?: string;
  expires?: Date;
  refreshToken?: string;
  refreshExpires?: Date;
}

interface User {
  name: string;
  expires: Date;
}

export type { User, UserToken };