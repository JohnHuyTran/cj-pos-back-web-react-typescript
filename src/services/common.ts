import { get, post } from "../adapters/posback-adapter";
import { environment } from "../environment-base";
import { CheckStockPayload } from "../models/barcode-discount";
import { env } from "../adapters/environmentConfigs";

export async function getAllProductByType(productTypeCode: string) {
  try {
    return await get(
      `${environment.products.type.productByType.url}?product-type=${productTypeCode}`,
    );
  } catch (error) {
    throw error;
  }
}

export async function getPercentages() {
  try {
    return await get(`${environment.master.percentages.url}`);
  } catch (error) {
    throw error;
  }
}

export async function checkStockBalance(payload: CheckStockPayload) {
  try {
    const response = await post(
      `${env.backEnd.url}${environment.stock.stockBalanceCheck.url}`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
}
