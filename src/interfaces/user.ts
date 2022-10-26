export interface RawUserData {
  id: number;
  token: string;
  refreshToken: string;
  username: string;
  public_uid: string;
  email: string;
  pfpUrl: string;
  createdAt: Date;
}

export interface UserData {
  id: number;
  username: string;
  public_uid: string;
  pfpUrl: string;
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  username: string;
  public_uid: string;
  pfpUrl: string;
  createdAt: Date
}