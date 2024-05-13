import i18next from "i18next";

export class ApiError {
  code: number;
  httpStatus: number;
  message: string;
  error_details: any;
  data: any;

  constructor(
    httpStatus: number,
    code: any,
    message: string,
    error_details?: any,
    data?: any,
  ) {
    this.code = code;
    this.httpStatus = httpStatus;
    this.message = this.getErrorMessage();
    this.error_details = error_details;
    this.data = data;
  }

  getErrorMessage = () => {
    const t = i18next.t;
    const err = this.code ? this.code : String(this.httpStatus);
    return t(`error:${err}`, t("error:default"));
  };

  mappingErrorParam = (
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
}

export class ApiUploadError {
  code: number;
  httpStatus: number;
  message: string;
  data: {
    base64EncodeFile: string;
    errorCount: number;
  } | null;

  constructor(httpStatus: number, code: any, message: string, data: any) {
    this.code = code;
    this.httpStatus = httpStatus;
    this.message = message ? message : "This transaction is error";
    this.data = data ? data : null;
  }
}

export interface ErrorDetailResponse {
  header: Header;
  error_details: ErrorDetail[];
}

export interface ErrorDetail {
  skuCode?: string;
  productName?: string;
  barcode?: string;
  barcodeName?: string;
  qty?: number;
  docNo?: string;
  toteCode?: string;
  description?: string;
}

export interface Header {
  field1: boolean; // barcode
  field2: boolean; // toteCode
  field3: boolean; // description
  field4: boolean; // qty
}
