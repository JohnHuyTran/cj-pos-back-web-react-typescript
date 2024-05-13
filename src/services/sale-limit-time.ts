import { get, post } from "../adapters/posback-adapter";
import { environment } from "../environment-base";
import { getPathUrl } from "./base-service";
import { env } from "../adapters/environmentConfigs";
import {
  Payload,
  PayloadCancel,
  PayloadStart,
} from "../models/sale-limit-time";

export async function importST(payload: any) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.sell.saleLimitTime.upload.url}`,
      payload,
    );
    return response;
  } catch (error) {
    return error;
  }
}

export async function saveDraftST(payload: Payload) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.sell.saleLimitTime.save.url}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function updateDraftST(payload: Payload, id: string) {
  try {
    const response = await post(getPathUpdateDraftST(id), payload);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getStartSaleLimitTime(id: string) {
  try {
    const response = await post(getPathGetStart(id));
    return response;
  } catch (error) {
    throw error;
  }
}
export async function getStartMultipeSaleLimitTime(payload: PayloadStart) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.sell.saleLimitTime.startMultipe.url}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function cancelST(payload: PayloadCancel) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.sell.saleLimitTime.cancel.url}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function getAllBranch(params: string) {
  try {
    const response = await get(
      `${environment.master.branch.searchBranch.url}?${params}`,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathUpdateDraftST = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.saleLimitTime.update.url}`,
    { id: id },
  );
};

export const getPathGetStart = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.saleLimitTime.start.url}`,
    { id: id },
  );
};

export const getPathGetStartMultipe = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.sell.saleLimitTime.start.url}`,
    { id: id },
  );
};
