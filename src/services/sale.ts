import { environment } from "../environment-base";
import { getPathUrl } from "./base-service";
import { get, put } from "../adapters/posback-adapter";
import { ContentType } from "../utils/enum/common-enum";
import {
  SaveInvoiceRequest,
  TaxInvoiceRequest,
} from "../models/tax-invoice-model";
import { getInvoiceRequest } from "../mockdata/sale";

export const getPathInvoiceDetail = (billNo: string) => {
  return getPathUrl(`${environment.sale.taxInvoice.detail.url}`, {
    billNo: billNo,
  });
};

export const getPathInvoicePrintHistory = (billNo: string) => {
  return getPathUrl(`${environment.sale.taxInvoice.printHistory.url}`, {
    billNo: billNo,
  });
};

export async function saveInvoice(payload: SaveInvoiceRequest) {
  const response = await put(
    environment.sale.taxInvoice.saveInvoice.url,
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export const getPathSearchMemberInformation = (memberNo: string) => {
  return getPathUrl(`${environment.sale.member.searchMemberInformation.url}`, {
    memberNo: memberNo,
  });
};

export async function searchMemberInformation(memberNo: string) {
  const response = await get(
    getPathSearchMemberInformation(memberNo),
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export async function requestTaxInvoice(payload: TaxInvoiceRequest) {
  const value = payload.docNo ? payload.docNo : "";
  const response = await get(getPathRequestTaxInvoice(value), ContentType.JSON)
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  // const response = getInvoiceRequest().then((result: any) => result);
  return response;
}

export const getPathRequestTaxInvoice = (billNo: string) => {
  return getPathUrl(`${environment.sale.taxInvoice.requestTaxInvoice.url}`, {
    billNo: billNo,
  });
};

export const getPathPrintInvoice = (billNo: string) => {
  return getPathUrl(`${environment.sale.taxInvoice.printInvoice.url}`, {
    billNo: billNo,
  });
};

export async function savePrintInvoice(
  payload: SaveInvoiceRequest,
  fileList: File[],
  edit: boolean,
) {
  const bodyFormData = new FormData();

  if (edit) bodyFormData.append("requestBody", JSON.stringify(payload));

  fileList.map((data: File) => {
    return bodyFormData.append("file[]", data);
  });

  const response = await put(
    getPathPrintInvoice(payload.billNo),
    bodyFormData,
    ContentType.MULTIPART,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}
