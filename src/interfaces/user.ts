export interface AuthResponseData {
  id: number;
  username: string;
  email: string;
  public_uid: string;
  pfpUrl: string;
  createdAt: Date;
  refreshToken: string;
  token: string;
}

export interface UserResponseData {
  id: number;
  username: string;
  public_uid: string;
  email: string;
  pfpUrl: string;
  createdAt: Date;
}

export interface UserStoreState {
  user: LoggedInUser;
  tokens: Tokens;
}

export interface User {
  id: number;
  username: string;
  public_uid: string;
  pfpUrl: string;
  createdAt: Date
}

export interface LoggedInUser {
  id: number;
  username: string;
  public_uid: string;
  pfp_url: string;
  createdAt: Date
  email: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string
}