export interface TransferOutSearchRequest {
  perPage: string;
  page: string;
  query: string;
  branch: string;
  status: string;
  startDate: string;
  endDate: string;
  clearSearch?: boolean;
  type?: string | undefined;
}

export interface RequisitionSummaryRequest {
  fromDate: string;
  toDate: string;
  branchCode: string;
  // clearSearch?: boolean;
}

export interface RequisitionSummaryResponse {
  data: any;
}

export interface TransferOutSearchResponse {
  ref: string;
  code: number;
  message: string;
  data: TransferOut[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface TransferOut {
  id: string;
  branch: string;
  branchName: string;
  regionId: string;
  requester: string;
  requestor: string;
  approver: string;
  requesterId: string;
  documentNumber: string;
  status: string;
  transferOutReason: string;
  store: string;
  createdDate: string;
  approvedDate: string;
  attachFiles: attachFile[];
  products: TransferOutProductDetail[];
  type?: string | number | undefined;
  requesterNote: string;
}

export interface TransferOutProductDetail {
  barcode: string;
  productName: string;
  sku: string;
  numberOfRequested: number;
  numberOfApproved: number;
  remark: string;
  unitName: string;
}

export interface TransferOutDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: any;
}

export interface attachFile {
  name: string;
  key: string;
  mimeType: string;
}
