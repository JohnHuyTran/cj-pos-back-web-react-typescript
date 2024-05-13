export interface StockAdjustmentSearchRequest {
  perPage: string;
  page: string;
  docNo: string;
  branch: string;
  status: string;
  creationDateFrom: string;
  creationDateTo: string;
  clearSearch?: boolean;
  type?: string | undefined;
}

export interface StockAdjustHasTempStockSearchRequest {
  perPage: string;
  page: string;
  docNo: string;
  branch: string;
  creationDateFrom: string;
  creationDateTo: string;
  clearSearch?: boolean;
  type?: string | undefined;
}

export interface StockAdjustmentSearchResponse {
  ref: string;
  code: number;
  message: string;
  data: StockAdjustment[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface StockAdjustment {
  id: string;
  branchCode: string;
  branchName: string;
  requester: string;
  documentNumber: string;
  status: string;
  storeType: number;
  createdDate: string;
  countingTime: number;
  documentNumberAP: string;
  createdBy: string;
  APId: string;
  APDocumentNumber: string;
  products: StockAdjustmentProductDetail[];
}

export interface StockAdjustmentProductDetail {
  barcode: string;
  productName: string;
  sku: string;
  numberOfRequested: number;
  numberOfApproved: number;
  remark: string;
  unitName: string;
}

export interface StockAdjustmentDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: any;
}

export interface SACalculateRequest {
  perPage: number;
  page: number;
  id: string;
  filterDifference: any;
}

export interface SABarcodeCalculateResponse {
  ref: string;
  code: number;
  message: string;
  data: BarcodeCalculate[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface BarcodeCalculate {
  barcode: string;
  productName: string;
  sku: string;
  saleCounting: number;
  stockMovement: number;
  storeFrontCount: number;
  storeBackCount: number;
  availableStock: number;
  difference: number;
  tempStock: number;
  unitName: string;
  unitPrice: number;
  stockMovementBack: number;
  stockMovementFront: number;
  backStock: number;
  frontStock: number;
}

export interface SASkuCalculateResponse {
  ref: string;
  code: number;
  message: string;
  data: SkuCalculate[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface SkuCalculate {
  barcode: string;
  skuName: string;
  sku: string;
  saleCounting: number;
  stockMovement: number;
  storeFrontCount: number;
  storeBackCount: number;
  availableStock: number;
  difference: number;
  tempStock: number;
  unitName: string;
  unitPrice: number;
  remark: string;
  stockMovementBack: number;
  stockMovementFront: number;
  backStock: number;
  frontStock: number;
}
