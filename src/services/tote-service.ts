import { environment } from "../environment-base";
import { post } from "../adapters/posback-adapter";
import { ApiError } from "../models/api-error-model";
import { InquiryToteRequest } from "../models/tote-model";
import { inquiryToteMockData } from "../mockdata/stock";

export async function inquiryTote(payload: InquiryToteRequest) {
  const response = await post(environment.tote.inquiryTote.url, payload)
    .then((result: any) => result)
    .catch((error: ApiError) => {
      throw error;
    });
  return response;
  // return inquiryToteMockData();
}
