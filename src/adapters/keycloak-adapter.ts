import { env } from "./environmentConfigs";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { loginForm, Response } from "../models/user-interface";
import {
  setAccessToken,
  setRefreshToken,
  setSessionId,
  getAccessToken,
  getRefreshToken,
  setUserInfo,
  removeRefreshToken,
  removeAccessToken,
  removeSessionId,
  removeUserInfo,
} from "../store/sessionStore";
import {
  getDecodedAccessToken,
  objectNullOrEmpty,
  stringNullOrEmpty,
} from "../utils/utils";
import {
  getUserGroup,
  isChannelBranch,
  isGroupAuditParam,
  isGroupBranch,
  isGroupBranchParam,
} from "../utils/role-permission";
import {
  getErrorMessage,
  getErrorMessageHttp,
  POSException,
} from "../utils/exception/pos-exception";
import { ERROR_CODE } from "../utils/enum/common-enum";

const instance = axios.create({
  baseURL: env.keycloak.url,
  timeout: env.keycloak.timeout,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});
let action = "";

export function authentication(payload: loginForm): Promise<Response> {
  action = "authentication";
  const params = new URLSearchParams();
  params.append("username", payload.userId);
  params.append("password", payload.password);
  params.append("grant_type", env.keycloak.grantType);
  params.append("client_id", env.keycloak.clientId);
  params.append("branchCode", env.branch.code);
  return instance
    .post(env.keycloak.url.authentication, params)
    .then((response: AxiosResponse) => {
      if (response.status == 200) {
        setAccessToken(response.data.access_token);
        setRefreshToken(response.data.refresh_token);
        setSessionId(response.data.session_state);
        let userInfo = getDecodedAccessToken(
          response.data.access_token ? response.data.access_token : "",
        );
        const _group = getUserGroup(userInfo.groups);
        if (stringNullOrEmpty(_group)) {
          const err = new POSException(
            401,
            ERROR_CODE.NOT_AUTHORIZE,
            "ผู้ใช้งานไม่สิทธิ์",
          );
          throw err;
        }

        if (
          isChannelBranch() &&
          !isGroupBranchParam(_group) &&
          !isGroupAuditParam(_group)
        ) {
          const err = new POSException(
            401,
            "invalid_channel_hq",
            "กรุณาใช้งาน channel Head Quarter",
            {
              userLogin: payload.userId,
            },
          );
          throw err;
        } else if (!isChannelBranch() && isGroupBranchParam(_group)) {
          const err = new POSException(
            401,
            "invalid_channel_branch",
            "กรุณาใช้งาน channel branch",
            {
              userLogin: payload.userId,
            },
          );
          throw err;
        }

        userInfo = { ...userInfo, group: _group ? _group : "" };
        setUserInfo(userInfo);
        return response.data;
      }

      throw new Error(response.status.toString());
    })
    .catch((error: any) => {
      if (error.code) {
        throw new Error(getErrorMessage(error));
      }
      if (error.response.status) {
        throw new Error(getErrorMessageHttp(error.response));
      }
    });
}

export function refreshToken(): Promise<Response> {
  try {
    action = "refreshToken";
    const refreshToken = getRefreshToken();
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken ? refreshToken : "");
    params.append("client_id", env.keycloak.clientId);

    return instance
      .post(env.keycloak.url.refreshToken, params)
      .then((response: any) => {
        if (response.status === 200) {
          setRefreshToken(response.data.refresh_token);
          setAccessToken(response.data.access_token);
          let userInfo = getDecodedAccessToken(
            response.data.access_token ? response.data.access_token : "",
          );
          const _group = getUserGroup(userInfo.groups);
          userInfo = { ...userInfo, group: _group ? _group : "" };
          setUserInfo(userInfo);
          return response.data;
        }
        throw new Error(response.status.toString());
      })
      .catch((error: any) => {
        throw new Error("refresh token failed");
      });
  } catch (error) {
    throw new Error("refresh token failed");
  }
}

export function logout(): Promise<Response> {
  action = "logout";
  const refreshToken = getRefreshToken();
  const params = new URLSearchParams();
  params.append("client_id", env.keycloak.clientId);
  params.append("refresh_token", refreshToken ? refreshToken : "");
  removeAccessToken();
  removeRefreshToken();
  removeSessionId();
  removeUserInfo();
  return instance
    .post(env.keycloak.url.logout, params)
    .then((response: AxiosResponse) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error: any) => {
      removeAccessToken();
      removeRefreshToken();
      removeSessionId();
      removeUserInfo();
      // throw new Error('error');
      // throw new KeyCloakError(error.response.status,error.response.data.error_description);
    });
}

instance.interceptors.request.use(function (config: AxiosRequestConfig) {
  if (action !== "logout") {
    config.headers.common["X-Requested-With"] = env.branch.code;

  }

  return config;
});
