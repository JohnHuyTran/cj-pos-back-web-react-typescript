import { post, put, getFile } from "../adapters/posback-adapter";
import { environment } from "../environment-base";
import { ContentType } from "../utils/enum/common-enum";
import {
  Approve1StockTransferRequest,
  Approve2BySCMStockRequest,
  Approve2MultipleStockRequest,
  Approve2StockTransferRequest,
  BranchTransferRequest,
  ImportStockRequest,
  SaveStockTransferRequest,
  StockBalanceType,
  SubmitStockTransferRequest,
} from "../models/stock-transfer-model";
import { getPathUrl } from "./base-service";
import { env } from "../adapters/environmentConfigs";
import { fi } from "date-fns/locale";
import { DOCUMENT_TYPE } from "../utils/enum/stock-transfer-enum";
import { getStrockTransferMockup } from "../mockdata/stock-transfer";

export const getPathStockRequestDetail = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.detail.url}`, {
    rtNo: rtNo,
  });
};

export async function saveStockRequest(payload: SaveStockTransferRequest) {
  try {
    const response = await put(
      environment.stock.stockRequest.save.url,
      payload,
      ContentType.JSON,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathSubmitStockRequest = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.submit.url}`, {
    rtNo: rtNo,
  });
};

export async function submitStockRequest(
  rtNo: string,
  payload: SubmitStockTransferRequest,
) {
  const response = await put(
    getPathSubmitStockRequest(rtNo),
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export const getPathApprove1StockRequest = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.approve1.url}`, {
    rtNo: rtNo,
  });
};

export async function approve1StockRequest(
  rtNo: string,
  payload: Approve1StockTransferRequest,
) {
  const response = await put(
    getPathApprove1StockRequest(rtNo),
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export const getPathApprove2StockRequest = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.approve2.url}`, {
    rtNo: rtNo,
  });
};

export async function approve2StockRequest(
  rtNo: string,
  payload: Approve2StockTransferRequest,
) {
  const response = await put(
    getPathApprove2StockRequest(rtNo),
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export const getPathReject1StockRequest = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.reject1.url}`, {
    rtNo: rtNo,
  });
};

export async function reject1StockRequest(
  rtNo: string,
  payload: Approve1StockTransferRequest,
) {
  const response = await put(
    getPathReject1StockRequest(rtNo),
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export const getPathReject2StockRequest = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.reject2.url}`, {
    rtNo: rtNo,
  });
};

export async function reject2StockRequest(
  rtNo: string,
  payload: Approve2StockTransferRequest,
) {
  const response = await put(
    getPathReject2StockRequest(rtNo),
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export const getPathBranchTransferDetail = (btNo: string) => {
  return getPathUrl(`${environment.stock.branchTransfer.detail.url}`, {
    btNo: btNo,
  });
};

export async function saveBranchTransfer(payload: BranchTransferRequest) {
  try {
    const response = await put(
      environment.stock.branchTransfer.save.url,
      payload,
      ContentType.JSON,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function sendBranchTransferToDC(payload: BranchTransferRequest) {
  try {
    const response = await post(
      environment.stock.branchTransfer.sendDC.url,
      payload,
      ContentType.JSON,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}
export async function sendBranchTransferToPickup(
  payload: BranchTransferRequest,
) {
  try {
    const response = await put(
      environment.stock.branchTransfer.sendToPickup.url,
      payload,
      ContentType.JSON,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}
export async function submitStockTransfer(
  payload: BranchTransferRequest,
  files: File[],
) {
  try {
    const bodyFormData = new FormData();
    bodyFormData.append("requestBody", JSON.stringify(payload));
    files.map((file: File) => {
      return bodyFormData.append("file[]", file);
    });

    const response = await post(
      environment.stock.branchTransfer.submitTransfer.url,
      bodyFormData,
      ContentType.MULTIPART,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathReportBT = (docType: string, btNo: string) => {
  if (docType === DOCUMENT_TYPE.BT) {
    return getPathUrl(
      `${env.backEnd.url}${environment.stock.branchTransfer.reportBT.url}`,
      { btNo: btNo },
    );
  } else if (docType === DOCUMENT_TYPE.BO) {
    return getPathUrl(
      `${env.backEnd.url}${environment.stock.branchTransfer.reportBO.url}`,
      { btNo: btNo },
    );
  } else if (docType === DOCUMENT_TYPE.RECALL) {
    return getPathUrl(
      `${env.backEnd.url}${environment.stock.branchTransfer.reportReCall.url}`,
      { btNo: btNo },
    );
  } else if (docType === DOCUMENT_TYPE.BOX) {
    return getPathUrl(
      `${env.backEnd.url}${environment.stock.branchTransfer.reportPaperBox.url}`,
      {
        btNo: btNo,
      },
    );
  }
};

export async function checkStockBalance(payload: StockBalanceType) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.stock.stockBalance.stockBalanceBySKU.url}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathRemoveStockRequest = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.remove.url}`, {
    rtNo: rtNo,
  });
};

export async function removeStockRequest(rtNo: string) {
  const response = await post(getPathRemoveStockRequest(rtNo), ContentType.JSON)
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export async function fetchDownloadTemplateRT() {
  try {
    const response = await getFile(
      environment.stock.stockRequest.downloadTemplate.url,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function importStockRequest(
  payload: ImportStockRequest,
  files: File,
) {
  try {
    const bodyFormData = new FormData();
    bodyFormData.append("file", files);
    bodyFormData.append("startDate", payload.startDate);
    bodyFormData.append("endDate", payload.endDate);
    bodyFormData.append("transferReason", payload.transferReason);

    const response = await post(
      environment.stock.stockRequest.importStockRequest.url,
      bodyFormData,
      ContentType.MULTIPART,
      "Upload",
    ).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error :", error);
    throw error;
  }
}

export async function approve2MultipleStockRequest(
  payload: Approve2MultipleStockRequest,
) {
  const response = await put(
    environment.stock.stockRequest.approve2MultipleBySCM.url,
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export const getPathApprove2BySCMStockRequest = (rtNo: string) => {
  return getPathUrl(`${environment.stock.stockRequest.approve2BySCM.url}`, {
    rtNo: rtNo,
  });
};

export async function approve2BySCMStockRequest(
  rtNo: string,
  payload: Approve2BySCMStockRequest,
) {
  const response = await put(
    getPathApprove2BySCMStockRequest(rtNo),
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}

export async function inquiryTote(
  rtNo: string,
  payload: Approve2BySCMStockRequest,
) {
  const response = await put(
    getPathApprove2BySCMStockRequest(rtNo),
    payload,
    ContentType.JSON,
  )
    .then((result: any) => result)
    .catch((error) => {
      throw error;
    });
  return response;
}
