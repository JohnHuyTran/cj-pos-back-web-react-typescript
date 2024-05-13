import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "./environmentConfigs";
import store, { useAppDispatch } from "../store/store";
import { ApiError, ApiUploadError } from "../models/api-error-model";
import { ContentType, ERROR_CODE } from "../utils/enum/common-enum";
import { refreshToken } from "./keycloak-adapter";
import { logout } from "../store/slices/authSlice";
import { getSessionId, getAccessToken } from "../store/sessionStore";

const defaultForJSON = ContentType.JSON;
let contentType: string;
// const instance = (contentType: string) => {
const instance = axios.create({
  baseURL: env.printer.url,
  timeout: env.printer.timeout,
  headers: {
    "Content-Type": defaultForJSON,
  },
});

instance.interceptors.request.use(function (config: AxiosRequestConfig) {
  const token = getAccessToken();
  const sessionState = getSessionId();
  config.headers.common["x-trace"] = sessionState;
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  config.headers.common["Content-Type"] = contentType
    ? contentType
    : defaultForJSON;
  return config;
});

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      await refreshToken().then(
        function (value) {
          // console.log('value:', value);
        },
        async function (error) {
          // console.log('err:', error);
          await logout();
          window.location.reload();
          // const history = useHistory();
          // return history.push({
          //   pathname: '/login',
          // });
        },
      );

      const token = getAccessToken();
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      return instance(originalRequest);
    }
    return Promise.reject(error);
  },
);

export function post(
  path: string,
  payload?: any,
  contentType = defaultForJSON,
  actionType?: string,
) {
  contentType = contentType;
  return instance
    .post(path, payload)
    .then((response: AxiosResponse) => {
      if (response.status == 200) {
        return response.data;
      }
    })
    .catch((error: any) => {
      if (actionType === "Upload") {
        const err = new ApiUploadError(
          error.response?.status,
          error.response?.data.code,
          error.response?.data.message,
          error.response?.data.data,
        );
        throw err;
      }

      const err = new ApiError(
        error.response?.status,
        error.response?.data.code,
        error.response?.data.message,
      );
      throw err;
    });
}
