import i18n from "../../locales/i18n";

export class POSException {
  code: any;
  httpStatus: number;
  message: string;
  params: { [key: string]: string };

  constructor(
    httpStatus: number,
    code: any,
    message: string,
    params?: { [key: string]: string },
  ) {
    this.code = code;
    this.httpStatus = httpStatus;
    this.message = message;
    this.params = params ? params : {};
  }
}

// export function getErrorMessage(httpCode: number, errorCode: any, message: string, params?: { [key: string]: string }) {
//   const err = errorCode ? errorCode : String(httpCode);
//   const err_msg = i18n.t(`error:${err}`);
//   if (params) {
//     const err_mapping = mappingErrorParam(err_msg, params);
//     return err_mapping ? err_mapping : err_msg;
//   }
//   return err_msg ? err_msg : i18n.t('error:default');
// }

export function getErrorMessage(error: any) {
  const err = error.code ? error.code : String(error.httpStatus);
  const err_msg = i18n.t(`error:${err}`);
  if (error.params) {
    const err_mapping = mappingErrorParam(err_msg, error.params);
    return err_mapping ? err_mapping : err_msg;
  }
  return err_msg ? err_msg : i18n.t("error:default");
}

export const mappingErrorParam = (
  errorMsg: string,
  errorParams: { [key: string]: string },
) => {
  for (const errorParamsKey in errorParams) {
    if (errorParams[errorParamsKey]) {
      errorMsg = errorMsg.replace(
        new RegExp(`{${errorParamsKey}}`, "g"),
        errorParams[errorParamsKey],
      );
    }
  }
  return errorMsg;
};

export function getErrorMessageHttp(error: any) {
  const err = error.data.error ? error.data.error : String(error.status);
  const err_msg = i18n.t(`error:${err}`);
  return err_msg && err_msg != err ? err_msg : i18n.t("error:default");
}

export const isErrorCode = (code: any) => {
  return !(code === 20000 || code === 200 || code === 20100);
};
