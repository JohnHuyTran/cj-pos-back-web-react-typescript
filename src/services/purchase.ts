import {
  put,
  get,
  post,
  deleteData,
  deleteDataBody,
} from "../adapters/posback-adapter";
import { environment } from "../environment-base";
import { env } from "../adapters/environmentConfigs";
import { getPathUrl } from "./base-service";
import { ApiError } from "../models/api-error-model";
import {
  CalculatePurchasePIRequest,
  SavePurchasePIRequest,
  SavePurchaseRequest,
} from "../models/supplier-check-order-model";
import { PurchaseCreditNoteType } from "../models/purchase-credit-note";
import { ContentType } from "../utils/enum/common-enum";
import { PurchaseBRRequest } from "../models/purchase-branch-request-model";

// export async function saveSupplierOrder(payload: SavePurchaseRequest, piNo: string) {
//   try {
//     const response = await put(getPathSaveDraft(piNo), payload).then((result: any) => result);
//     return response;
//   } catch (error) {
//     console.log('error = ', error);
//     throw error;
//   }
// }

export async function saveSupplierOrder(
  payload: SavePurchaseRequest,
  piNo: string,
  fileList: File[],
) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify(payload));

  fileList.map((data: File) => {
    return bodyFormData.append("file[]", data);
  });

  try {
    const response = await put(
      getPathSaveDraft(piNo),
      bodyFormData,
      ContentType.MULTIPART,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function approveSupplierOrder(
  payload: SavePurchaseRequest,
  piNo: string,
  fileList: File[],
) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify(payload));

  fileList.map((data: File) => {
    return bodyFormData.append("file[]", data);
  });

  const response = await put(
    getPathApprove(piNo),
    bodyFormData,
    ContentType.MULTIPART,
  )
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export const getPathSaveDraft = (piNo: string) => {
  return getPathUrl(`${environment.purchase.supplierOrder.saveDraft.url}`, {
    piNo: piNo,
  });
};

export const getPathApprove = (piNo: string) => {
  return getPathUrl(`${environment.purchase.supplierOrder.approve.url}`, {
    piNo: piNo,
  });
};

export async function saveSupplierPI(
  payload: SavePurchasePIRequest,
  fileList: File[],
) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify(payload));

  fileList.map((data: File) => {
    return bodyFormData.append("file[]", data);
  });

  try {
    const response = await put(
      environment.purchase.supplierOrder.saveDraftPI.url,
      bodyFormData,
      ContentType.MULTIPART,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function approveSupplierPI(
  payload: SavePurchasePIRequest,
  fileList: File[],
) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify(payload));

  fileList.map((data: File) => {
    return bodyFormData.append("file[]", data);
  });

  const response = await put(
    environment.purchase.supplierOrder.approvePI.url,
    bodyFormData,
    ContentType.MULTIPART,
  )
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export const getPathPurchaseNoteSaveDraft = (piNo: string) => {
  return getPathUrl(`${environment.purchase.purchaseNote.save.url}`, {
    piNo: piNo,
  });
};

export const getPathPurchaseDetail = (piNo: string) => {
  return getPathUrl(`${environment.purchase.purchaseNote.detail.url}`, {
    piNo: piNo,
  });
};

// export const getPathPurchaseNoteInit = (pnNo: string) => {
//   return getPathUrl(`${environment.purchase.purchaseNote.initPn.url}`, {
//     pnNo: pnNo,
//   });
// };

export const getPathPurchaseNoteApprove = (pnNo: string) => {
  return getPathUrl(`${environment.purchase.purchaseNote.approve.url}`, {
    pnNo: pnNo,
  });
};
export async function draftPurchaseCreditNote(
  payload: PurchaseCreditNoteType,
  piNo: string,
  files: File[],
) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify(payload));
  files.map((file: File) => {
    return bodyFormData.append("file[]", file);
  });

  const response = await put(getPathPurchaseNoteSaveDraft(piNo), bodyFormData)
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}
export async function approvePurchaseCreditNote(
  payload: PurchaseCreditNoteType,
  files: File[],
) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify(payload));
  files.map((file: File) => {
    return bodyFormData.append("file[]", file);
  });
  const response = await put(
    getPathPurchaseNoteApprove(payload.pnNo ? payload.pnNo : ""),
    bodyFormData,
    ContentType.MULTIPART,
  )
    // const response = await put(environment.purchase.supplierOrder.approve.url, bodyFormData, ContentType.MULTIPART)
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export async function calculateSupplierPI(payload: CalculatePurchasePIRequest) {
  try {
    const response = await post(
      environment.purchase.supplierOrder.calculatePI.url,
      payload,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function delFileUrlHuawei(
  filekey: string,
  docType: string,
  docNo: string,
) {
  const pathUrl =
    environment.purchase.supplierOrder.delFileHuawei.url +
    `/${docType}/${docNo}`;
  const response = await post(pathUrl, { key: filekey })
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export const getPathReportPI = (piNo: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.purchase.supplierOrder.exportFile.url}`,
    {
      piNo: piNo,
    },
  );
};

export const getPathReportPN = (pnNo: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.purchase.purchaseNote.exportFile.url}`,
    {
      pnNo: pnNo,
    },
  );
};

export async function fetchDataFilePN(pnNo: string) {
  try {
    const path = getPathReportPN(pnNo);
    const response = await get(path).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function savePurchaseBR(payload: PurchaseBRRequest) {
  try {
    const response = await put(
      environment.purchase.purchaseBranchRequest.save.url,
      payload,
      ContentType.JSON,
      env.backEnd.timeoutpurchasebranch,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathPurchaseBRDetail = (docNo: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.purchase.purchaseBranchRequest.detail.url}`,
    {
      docNo: docNo,
    },
  );
};

export const getPathPurchaseBRDelete = (docNo: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.purchase.purchaseBranchRequest.delete.url}`,
    {
      docNo: docNo,
    },
  );
};

export async function deletePurchaseBR(docNo: string) {
  try {
    const response = await post(
      getPathPurchaseBRDelete(docNo),
      ContentType.JSON,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function sendPurchaseBR(docNo: string, caseNo: string) {
  try {
    const path = `${getPathSendPurchaseBR(docNo)}/?mock=${caseNo}`; //Mock Case Await Sap
    // const path = getPathSendPurchaseBR(docNo)
    const response = await post(
      path,
      undefined,
      undefined,
      undefined,
      env.backEnd.timeoutpurchasebranch,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathSendPurchaseBR = (docNo: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.purchase.purchaseBranchRequest.send.url}`,
    {
      docNo: docNo,
    },
  );
};

export async function deleteSupplierPI(piNo: string) {
  try {
    const path = `${getPathDeleteSupplierPI(piNo)}`;
    const response = await post(path).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
  }
}
export async function deletePN(piNo: string) {
  try {
    const response = await post(getPathDeletePN(piNo), ContentType.JSON).then(
      (result: any) => result,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathDeleteSupplierPI = (piNo: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.purchase.supplierOrder.deletePI.url}`,
    {
      piNo: piNo,
    },
  );
};
export const getPathDeletePN = (pnNo: string) => {
  return getPathUrl(`${environment.purchase.purchaseNote.deletePN.url}`, {
    pnNo: pnNo,
  });
};
