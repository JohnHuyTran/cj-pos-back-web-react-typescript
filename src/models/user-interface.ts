export type Response = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  "not-before-policy": number;
  session_state: string;
  scope: string;
};

export type loginForm = {
  userId: string;
  password: string;
};

export class KeyCloakError {
  constructor(code: number, message: string) {
    console.log(code);
    console.log(message);
  }
}
