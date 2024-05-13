import { get, post, put, putData } from "../adapters/posback-adapter";
import { environment } from "../environment-base";
import {
  SaveDraftSDRequest,
  GenerateBORequest,
  ItemsApprove,
  ItemSubmitToteRequst,
} from "../models/order-model";
import { getPathUrl } from "./base-service";
import { env } from "../adapters/environmentConfigs";
import { ApiError } from "../models/api-error-model";
import {
  OrderReceiveApproveRequest,
  VerifySDListRequestType,
} from "../models/dc-check-order-model";
import { ContentType } from "../utils/enum/common-enum";

export async function saveOrderShipments(
  payload: SaveDraftSDRequest,
  sdNo: string,
) {
  try {
    const response = await put(getPathSaveDraft(sdNo), payload).then(
      (result: any) => result,
    );
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function approveOrderShipments(sdNo: string, payload: any) {
  const response = await put(getPathApprove(sdNo), payload)
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export async function closeOrderShipments(sdNo: string, fileList: File[]) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify({}));

  fileList.map((file: File) => {
    return bodyFormData.append("file[]", file);
  });

  try {
    const response = await put(
      getPathClose(sdNo),
      bodyFormData,
      ContentType.MULTIPART,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchShipmentDeliverlyPDF(sdNo: string) {
  try {
    const path = getPathUrl(
      environment.orders.shipment.printFormShipmentDeliverly.url,
      { sdNo: sdNo },
    );
    const response = await get(path).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function generateBO(sdNo: string, payload: GenerateBORequest) {
  const response = await put(getPathGenerateBO(sdNo), payload)
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export async function verifyDCOrderShipmentsBT(sdNo: string, payload: any) {
  const response = await put(getPathVerifyBT(sdNo), payload)
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export async function verifyDCOrderShipmentsLD(
  sdNo: string,
  payload: any,
  files: File[],
) {
  const bodyFormData = new FormData();
  bodyFormData.append("requestBody", JSON.stringify(payload));
  files.map((file: File) => {
    return bodyFormData.append("file[]", file);
  });
  const response = await put(
    getPathVerifyLD(sdNo),
    bodyFormData,
    ContentType.MULTIPART,
  )
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
}

export async function verifyDCOrderShipmentList(
  payload: VerifySDListRequestType,
) {
  try {
    const response = await put(
      environment.orders.dcCheckOrder.verifyList.url,
      payload,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function approveOrderReceive(payload: OrderReceiveApproveRequest) {
  try {
    const apiRootPath = `${environment.orders.shipment.approveOrderReceive.url}`;
    const response = await put(apiRootPath, payload).then(
      (result: any) => result,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function approveOrderShipmentsOC(sdNo: string) {
  try {
    const path = getPathUrl(environment.orders.shipment.approveOC.url, {
      sdNo: sdNo,
    });
    const response = await putData(path).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function rejectOrderShipmentsOC(payload: any) {
  try {
    const path = getPathUrl(environment.orders.shipment.rejectOC.url, {
      sdNo: payload.sdNo,
    });
    const response = await post(path, payload).then((result: any) => result);
    return response;
  } catch (error) {
    console.log("error = ", error);
    throw error;
  }
}

export async function submitTote(payload: ItemSubmitToteRequst) {
  try {
    const response = await post(
      environment.orders.tote.submitTote.url,
      payload,
    ).then((result: any) => result);
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathReportSD = (sdNo: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.orders.shipment.printFormShipmentDeliverly.url}`,
    { sdNo: sdNo },
  );
};

export const getPathSaveDraft = (sdNo: string) => {
  return getPathUrl(`${environment.orders.shipment.saveDraft.url}`, {
    sdNo: sdNo,
  });
};

// export async function approve(sdNo: string, payload: ItemsApprove) {
//   const response = await put(getPathApprove(sdNo), payload)
//     .then((result: any) => result)
//     .catch((error: ApiError) => {
//       throw error;
//     });
//   return response;
// }

export const getPathApprove = (sdNo: string) => {
  return getPathUrl(`${environment.orders.shipment.approve.url}`, {
    sdNo: sdNo,
  });
};

export const getPathClose = (sdNo: string) => {
  return getPathUrl(`${environment.orders.shipment.closejob.url}`, {
    sdNo: sdNo,
  });
};

export const getPathGenerateBO = (sdNo: string) => {
  return getPathUrl(`${environment.orders.shipment.approve.url}`, {
    sdNo: sdNo,
  });
};

export const getPathVerifyBT = (value: string) => {
  return getPathUrl(`${environment.orders.dcCheckOrder.verifyBT.url}`, {
    sdNo: value,
  });
};

export const getPathVerifyLD = (value: string) => {
  return getPathUrl(`${environment.orders.dcCheckOrder.verifyLD.url}`, {
    sdNo: value,
  });
};
