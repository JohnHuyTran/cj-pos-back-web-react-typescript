import { deleteData, get, post } from "../adapters/posback-adapter";
import { environment } from "../environment-base";
import { env } from "../adapters/environmentConfigs";
import { getPathUrl } from "./base-service";
import { ContentType } from "../utils/enum/common-enum";

export async function saveDraftStockAdjust(payload: any) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.checkStock.stockAdjustment.saveDraft.url}`,
      payload,
      ContentType.JSON,
      "",
      30000,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getCalculateSkuStats(id: string) {
  try {
    const response = await get(getPathCalculateSkuStats(id));
    return response;
  } catch (error) {
    throw error;
  }
}

export async function confirmStockAdjust(payload: any) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.checkStock.stockAdjustment.confirm.url}/${payload.id}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function cancelStockAdjust(id: string) {
  try {
    const response = await deleteData(getPathCancelStockAdjust(id));
    return response;
  } catch (error) {
    throw error;
  }
}

export const getPathCancelStockAdjust = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.checkStock.stockAdjustment.cancel.url}`,
    { id: id },
  );
};

export const getPathCalculateSkuStats = (id: string) => {
  return getPathUrl(
    `${env.backEnd.url}${environment.checkStock.stockAdjustment.statsSku.url}`,
    { id: id },
  );
};
