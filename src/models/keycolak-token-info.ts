export interface KeyCloakTokenInfo {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string[];
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  "allowed-origins": string[];
  scope: string;
  email_verified: boolean;
  name: string;
  groups: string[];
  preferred_username: string;
  acl: ACL;

  given_name: string;
  family_name: string;
  email: string;
  group: string | "";
  branch: string | "";
}

// @ts-ignore
export interface ACL {
  [key: string]: string[];
}
