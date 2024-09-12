interface User {
  groups?: string[];
  name?: string;
  accessToken?: string;
  expires?: Date;
  refreshToken?: string;
  refreshExpires?: Date;
}

export default User;