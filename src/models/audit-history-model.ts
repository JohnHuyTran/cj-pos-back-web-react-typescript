export interface AuditHistorySearchRequest {
  perPage: string;
  page: string;
  docNo: string;
  skuCodes: string;
  branch: string;
  type: string;
  creationDateFrom: string;
  creationDateTo: string;
  clearSearch?: boolean;
}

export interface AuditHistorySearchResponse {
  ref: string;
  code: number;
  message: string;
  data: AuditHistory[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface AuditHistory {
  id: string;
  branchCode: string;
  type: string;
  sequence: string;
  skuName: string;
  sku: string;
  numberOfAdjusted: number;
  creator: string;
  difference: number;
  store: string;
  unitName: string;
  confirmDate: any;
  remark: string;
  document: document;
}

export interface document {
  CreatedDate: any;
  documentNumber: string;
  id: string;
  type: string;
}

export interface AuditHistoryDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: any;
}
