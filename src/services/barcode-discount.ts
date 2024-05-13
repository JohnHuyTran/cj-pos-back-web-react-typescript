import { deleteData, get, post, put } from "../adapters/posback-adapter";
import { post as postPrinter } from "../adapters/posback-printer-adapter";
import { environment } from "../environment-base";
import { getPathUrl } from "./base-service";
import { env } from "../adapters/environmentConfigs";
import { Payload, CheckStockPayload } from "../models/barcode-discount";

export async function saveDraftBarcodeDiscount(payload: Payload) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.sell.barcodeDiscount.save.url}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function updateBarcodeDiscount(payload: Payload, id: string) {
  try {
    const response = await post(getPathUpdateDraft(id), payload);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function sendForApprovalBarcodeDiscount(id: string) {
  try {
    const response = await post(getPathSendForApproval(id));
    return response;
  } catch (error) {
    throw error;
  }
}

export async function approveBarcodeDiscount(id: string, payload: any) {
  try {
    const response = await post(getPathApprove(id), payload);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function rejectBarcodeDiscount(id: string, reason: string) {
  try {
    const response = await get(getPathReject(id, reason));
    return response;
  } catch (error) {
    throw error;
  }
}

export async function printBarcodeDiscount(payload: any) {
  try {
    const response = await postPrinter(
      `${environment.sell.barcodeDiscount.print.url}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function saveLogPrintBarcodeDiscountHistory(payload: any) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.sell.barcodeDiscount.print.saveLogPrintBarcodeDiscountHistoryURL}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function cancelBarcodeDiscount(id: string) {
  try {
    const response = await deleteData(getPathCancelDraft(id));
    return response;
  } catch (error) {
    throw error;
  }
}

export async function uploadAttachFile(payload: any) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.sell.barcodeDiscount.upload.url}`,
      payload,
    );
    return response;
  } catch (error) {
    return error;
  }
}

export const getPathUpdateDraft = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.barcodeDiscount.update.url}`,
    { id: id },
  );
};

export const getPathSendForApproval = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.barcodeDiscount.sendForApproval.url}`,
    { id: id },
  );
};

export const getPathApprove = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.barcodeDiscount.approve.url}`,
    { id: id },
  );
};

export const getPathReject = (id: string, reason: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.barcodeDiscount.reject.url}`,
    { id: id, reason: reason },
  );
};

export const getPathCancelDraft = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.barcodeDiscount.cancel.url}`,
    { id: id },
  );
};
