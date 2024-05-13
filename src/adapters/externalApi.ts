import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "./environmentConfigs";
import { ContentType } from "../utils/enum/common-enum";
import { refreshToken } from "./keycloak-adapter";
import { logout } from "../store/slices/authSlice";
import { getSessionId, getAccessToken } from "../store/sessionStore";
import { ApiError } from "../models/api-error-model";

const defaultForJSON = ContentType.JSON;
let contentType: string;
const instance = axios.create({
  timeout: env.backEnd.timeout,
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
      originalRequest._retry
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



export function getReport(url: string, contentType = defaultForJSON) {
  contentType = contentType;
  return instance
    .get(url)
    .then((result: any) => {
      if (result.status == 200) {
        return result.data;
      } else if (result.status == 204) {
        return result.status;
      }
    })
    .catch((error: any) => {
      const err = new ApiError(
        error.response?.status,
        error.response?.data.code,
        error.response?.data.message,
      );
      throw err;
    });
}
