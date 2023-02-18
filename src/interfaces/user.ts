export interface UserResponseData {
  id: number;
  username: string;
  public_uid: string;
  email: string;
  pfpUrl: string | null;
  createdAt: Date;
  accent_color: string | null;
}

export interface AuthResponseData extends UserResponseData{
  refreshToken: string;
  token: string;
}

export interface UserStoreState {
  user: LoggedInUser;
  tokens: Tokens;
}

export interface User {
  id: number;
  username: string;
  public_uid: string;
  pfpUrl: string | null;
  createdAt: Date
  accent_color: string |null;
}

export interface LoggedInUser extends User{
  email: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string
}