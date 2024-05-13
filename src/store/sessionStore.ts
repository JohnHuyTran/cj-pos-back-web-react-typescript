import { KeyCloakTokenInfo } from "../models/keycolak-token-info";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const SESSION_ID = "session_id";
const USER_INFO = "user_info";
const SESSION_STATE = "session_state";
const SESSION_STORE = "session_store";

export const getAccessToken = () => {
  return sessionStorage.getItem(ACCESS_TOKEN);
};

export const getSessionState = () => {
  return sessionStorage.getItem(SESSION_STATE);
};

export const getSessionStore = () => {
  return sessionStorage.getItem(SESSION_STORE);
};

export const setAccessToken = (value: string) => {
  return sessionStorage.setItem(ACCESS_TOKEN, value);
};

export const removeAccessToken = () => {
  return sessionStorage.removeItem(ACCESS_TOKEN);
};

export const getRefreshToken = () => {
  return sessionStorage.getItem(REFRESH_TOKEN);
};

export const setRefreshToken = (value: string) => {
  return sessionStorage.setItem(REFRESH_TOKEN, value);
};

export const removeRefreshToken = () => {
  return sessionStorage.removeItem(REFRESH_TOKEN);
};

export const getSessionId = () => {
  return sessionStorage.getItem(SESSION_ID);
};

export const setSessionId = (value: string) => {
  return sessionStorage.setItem(SESSION_ID, value);
};

export const removeSessionId = () => {
  return sessionStorage.removeItem(SESSION_ID);
};

export const getUserInfo = () => {
  const item = sessionStorage.getItem(USER_INFO);
  if (!item) {
    return {};
  }
  return JSON.parse(item);
};

export const setUserInfo = (value: KeyCloakTokenInfo) => {
  return sessionStorage.setItem(USER_INFO, JSON.stringify(value));
};

export const removeUserInfo = () => {
  return sessionStorage.removeItem(USER_INFO);
};

export const getInit = () => {
  return sessionStorage.getItem("INTIAL") === "Y";
};

export const setInit = (value: string) => {
  return sessionStorage.setItem("INTIAL", value);
};

export const removeInit = () => {
  return sessionStorage.removeItem("INTIAL");
};
