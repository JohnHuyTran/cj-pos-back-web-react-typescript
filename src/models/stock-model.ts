export interface OutstandingRequest {
  locationCode?: string;
  skuCodes?: string[];
  branchCode?: string;
  dateFrom?: string;
  limit?: number;
  page?: number;
  dateTo?: string;
  positionName?: string;
}

export interface OutstandingResponse {
  ref: string;
  code: number;
  message: string;
  data: StockInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface StockInfo {
  barcode?: string;
  barcodeName?: string;
  skuCode: string;
  skuName: string;
  locationCode: string;
  locationName: string;
  availableQty: number;
  unitCode: string;
  unitName: string;
  barFactor?: number;
  positions?: positionInfo[];
  qty?: number;
  baseUnitQty?: number;
}

export interface positionInfo {
  code: string;
  name: string;
  minBeauty: number;
  maxBeauty: number;
}

export interface StockMovementResponse {
  ref: string;
  code: number;
  message: string;
  data: StockMomentInfoType[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface StockMomentInfoType {
  id: string;
  movementDate: string;
  movementTypeCode: string;
  movementTypeName: string;
  branchCode: string;
  locationCode: string;
  skuCode: string;
  barcodes: Barcode[];
  unitCode: string;
  unitName: string;
  priorQty: number;
  movementQty: number;
  balanceQty: number;
  docNo: string;
  docRefNo: string;
}

export interface Barcode {
  barcode: string;
  qty: number;
  unitCode: string;
  unitName: string;
  barFactor: number;
  baseUnitQty: number;
}

export interface StockMovementMasterResponse {
  ref: string;
  code: number;
  message: string;
  data: StockMovementMasterInfo[];
}

export interface StockMovementMasterInfo {
  code: string;
  nameTH: string;
  docType: string;
  docRefType: string;
}
