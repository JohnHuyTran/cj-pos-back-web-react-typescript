export interface InquiryToteRequest {
  branchCode: string;
  toteItem: ToteItem[];
}

export interface InquiryToteResponse {
  ref: string;
  code: string;
  message: string;
  timestamp: string;
  data: ToteItem[];
}

export interface ToteItem {
  toteCode?: string;
  toteStatus?: string;
  branchCode?: string;
  remark?: string;
  code?: string;
  message?: string;
}
