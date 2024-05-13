export enum DateFormat {
  DATE_FORMAT = "DD/MM/YYYY",
  MONTH_FORMAT = "MM/YYYY",
  DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss",
  DATE_TIME_NONO_SEC = "YYYY-MM-DDTHH:mm:ss.SSS",
  DATE_TIME_DISPLAY_FORMAT = "DD/MM/YYYY HH:mm",
  DATE_ISO8601 = "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]",
}

export enum ContentType {
      JSON = "application/json",
  MULTIPART = "multipart/form-data",
}

export enum Action {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  VIEW = "VIEW",
}

export enum BDStatus {
  DRAFT = "1",
  WAIT_FOR_APPROVAL = "2",
  APPROVED = "3",
  BARCODE_PRINTED = "4",
  REJECT = "5",
  ALREADY_EXPIRED = "10",
}

export enum STStatus {
  DRAFT = "1",
  START = "2",
  END = "3",
  CANCEL = "4",
}
export enum ERROR_CODE {
  TIME_OUT = "timeout",
  NOT_AUTHORIZE = "authentication.notauthorize",
}

export enum TOStatus {
  DRAFT = "DRAFT",
  WAIT_FOR_APPROVAL = "WAIT_FOR_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED",
}

export enum TO_TYPE {
  TO_ACTIVITY = 1,
  TO_WITHOUT_DISCOUNT = 2,
  TO_WITH_DISCOUNT = 3,
  TO_RAW_MATERIAL = 4,
  TO_DEFECT = 5,
}

export enum STORE_TYPE {
  FRONT = 1,
  BACK = 2,
}

export enum STOCK_COUNTER_TYPE {
  BRANCH = 1,
  AUDIT = 2,
}

export enum StockActionStatus {
  DRAFT = "DRAFT",
  CONFIRM = "CONFIRM",
  COUNTING = "COUNTING",
  END = "END",
  CANCEL = "CANCEL",
}

export enum AuditHistoryType {
  CANTCOUNT = "CANTCOUNT",
  RECHECK = "RECHECK",
}
