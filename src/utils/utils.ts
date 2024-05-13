import jwtDecode from "jwt-decode";
import { env } from "../adapters/environmentConfigs";
import { KeyCloakTokenInfo } from "../models/keycolak-token-info";
import { BranchInfo } from "../models/search-branch-model";
import { TransferReasonsInfo } from "../models/transfer-reasons-model";
import { Params } from "../models/search-branch-province-model";
import { getStockTransferStatusInfo } from "./enum/stock-transfer-enum";

export const getDecodedAccessToken = (accessToken: string) => {
  return jwtDecode<KeyCloakTokenInfo>(accessToken);
};

export function getSdType(codeType: number): string {
  if (codeType === 0) {
    return "ลังกระดาษ /Tote";
  } else if (codeType === 1) {
    return "สินค้าภายใน Tote";
  }
  return "undefined";
}

export function getSdStatus(codeStatus: number): string {
  if (codeStatus === 0) {
    return "บันทึก";
  } else if (codeStatus === 1) {
    return "อนุมัติ";
  }
  return "undefined";
}

export function getDCStatus(codeStatus: number): string {
  if (codeStatus === 0) {
    return "รอการตรวจสอบ";
  } else if (codeStatus === 1) {
    return "ตรวจสอบแล้ว";
  }
  return "-";
}

export const onChange = (setValues: any, values: Object, event: any) => {
  const value = event.target.value;
  setValues({ ...values, [event.target.name]: value });
};

export const onChangeDate = (
  setValues: any,
  values: Object,
  fieldName: string,
  value: any,
) => {
  setValues({ ...values, [fieldName]: value });
};

export const genColumnValue = (
  labelField: string,
  valueField: string,
  value: string,
  lstData: [],
) => {
  if (lstData == null || lstData.length === 0) {
    return "";
  }
  let data: any = lstData.find((item) => item[valueField] === value);
  if (objectNullOrEmpty(data)) {
    return "";
  }
  return data[labelField];
};

export const stringNullOrEmpty = (value: any) => {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "Invalid date"
  );
};

export const stringNumberNullOrEmpty = (value: any) => {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "Invalid date" ||
    value === 0
  );
};

export const objectNullOrEmpty = (object: any) => {
  if (object === undefined || object === null) {
    return true;
  } else {
    for (let key in object) {
      if (object.hasOwnProperty(key)) return false;
    }
    return true;
  }
};

export function handleNumberBeforeUse(value: any): number {
  let currentValue = value;
  if (stringNullOrEmpty(value) || stringNullOrEmpty(value.trim())) {
    currentValue = 0;
  } else {
    if (isNaN(parseInt(currentValue.replace(/,/g, "")))) {
      return 0;
    } else {
      if (parseInt(currentValue.replace(/,/g, "")) < 0) {
        currentValue = 0;
      } else if (parseInt(currentValue.replace(/,/g, "")) > 1000000000) {
        currentValue = 0;
      } else {
        if (!(currentValue instanceof Number)) {
          currentValue = parseInt(currentValue.replace(/,/g, ""));
        }
      }
    }
  }
  return currentValue;
}

export const numberWithCommas = (num: any) => {
  let currentValue;
  if (stringNullOrEmpty(num)) currentValue = 0;
  else currentValue = num;
  try {
    return currentValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } catch (e) {
    return "0";
  }
};

export function isOwnBranch(branch: any): boolean {
  return env.branch.code === branch;
}

export const formatNumber = (
  value: any,
  decimalPoint: number = 0,
  type: string = "string",
) => {
  if (type === "string") {
    return (
      "" + (+value).toFixed(decimalPoint).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );
  } else if (type === "number") {
    return +("" + value).replaceAll(",", "");
  }
};

// export function isBranchDC(userInfo: KeyCloakTokenInfo): boolean {
//   const group = env.branch.default.dc.group;
//   const location = env.branch.default.dc.location;
//   if (!userInfo) {
//     return false;
//   }
//   return (
//     userInfo.azp === location &&
//     userInfo.groups.some((item: string) => {
//       return item === group;
//     })
//   );
// }

export const getReasonLabel = (reasons: TransferReasonsInfo[], key: string) => {
  return reasons.find((reason: TransferReasonsInfo) => reason.code === key)
    ?.name;
};

export const getBranchName = (branchs: BranchInfo[], key: string) => {
  return branchs.find((branch: BranchInfo) => branch.code === key)?.name;
};

export const paramsConvert = (params: Params) => {
  return Object.keys(params)
    .map(
      (key: string) => `${key}=${encodeURIComponent(params[key].toString())}`,
    )
    .join("&");
};
export const formatFileStockTransfer = (
  docNo: string,
  status: string,
  suffix: string,
) => {
  if (suffix) {
    return `${docNo}-${suffix}.pdf`;
  } else {
    return `${docNo}-${getStockTransferStatusInfo(status)?.value}.pdf`;
  }
};

export const formatFileInvoice = (invoiceNo: string, counter: number) => {
  return `${invoiceNo}-${counter}.pdf`;
};

export const addTwoDecimalPlaces = (value: any) => {
  if (stringNullOrEmpty(value)) return "0.00";
  else return value.toFixed(2);
};

export const getEncodeBarcode = ({
  price = "",
  barcode = "",
  priceDigitMax = 4, //the wholeNumber of price
  prefix = "A4",
}: {
  price: string | number;
  barcode: string;
  priceDigitMax?: number;
  prefix?: string;
}): string => {
  const [wholeNumberPrice, decimalNumberPrice] = Number(price)
    .toFixed(2)
    .split(".");
  let priceDigit = wholeNumberPrice + decimalNumberPrice;
  for (let i = priceDigitMax - wholeNumberPrice.length; i > 0; i--) {
    priceDigit = "0" + priceDigit;
  }

  let nSum = 0;
  const length = priceDigit.length + 1;

  for (let i = 0; i < priceDigit.length; i++) {
    nSum += Number(priceDigit[i]) * (length - i);
  }

  return (
    prefix + priceDigit + ((length - 2 - (nSum % (length - 2))) % 8) + barcode
  );
};

export const isToteNo = (value: string) => {
  const regex = /^(T|B).*/;
  return regex.test(value);
};

export const isFilterFieldInExpense = (value: string) => {
  return (
    value === "date" ||
    value === "total" ||
    value === "id" ||
    value === "description"
  );
};

export const isFilterOutFieldInAdd = (value: string) => {
  return (
    value === "date" ||
    value === "total" ||
    value === "id" ||
    value === "description" ||
    value === "SUMOTHER" ||
    value === "otherDetail" ||
    value === "dateTime" ||
    value === "isOverApprovalLimit1" ||
    value === "isOverApprovalLimit2"
  );
};

export const isFilterOutFieldForPayload = (value: string) => {
  return (
    value === "date" ||
    value === "total" ||
    value === "id" ||
    value === "description" ||
    value === "otherDetail" ||
    value === "dateTime" ||
    value === "isOverApprovalLimit1" ||
    value === "isOverApprovalLimit2"
  );
};
