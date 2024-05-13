export interface PurchaseBRRequest {
  docNo?: string;
  remark: string;
  items: PurchaseBRItemRequest[] | [];
}

export interface PurchaseBRItemRequest {
  barcode: string;
  orderMaxQty: number;
  orderQty: number;
}

export interface PurchaseBRDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: PurchaseBRInfo | null;
}

export interface PurchaseBRInfo {
  docNo: string;
  poNo?: string;
  doNo?: string;
  branchCode: string;
  status: string;
  remark: string;
  createdBy: string;
  createByFullName: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  items: PurchaseBRItem[] | [];
}
export interface PurchaseBRItem {
  skuCode: string;
  barcode: string;
  barcodeName: string;
  unitCode: string;
  unitName: string;
  barFactor: number;
  orderMaxQty: number;
  orderQty: number;
  referenceQty?: number;
  actualQty?: number;
  remark?: string;
}
export interface PurchaseBranchSearchRequest {
  limit: string;
  page: string;
  docNo?: string;
  branchCode?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  clearSearch?: boolean;
}
export interface PurchaseBranchSearchrResponse {
  ref: string;
  code: number;
  message: string;
  data: PurChaseBranchInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface PurChaseBranchInfo {
  docNo: string;
  branchCode: string;
  branchName: string;
  status: string;
  createdBy: string;
  createByFullName: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
}
