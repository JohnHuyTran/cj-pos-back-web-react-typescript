export interface Payload {
  id?: string;
  documentNumber?: string;
  requestID?: string;
  products: Object[];
  barcode: string;
}
export interface TransferOutDetail {
  id: string;
  index: number;
  barcode: string;
  barcodeName: string;
  skuCode: string;
  unit: string;
  unitCode: string;
  barFactor: number;
  numberOfRequested: number;
  numberOfApproved: number;
  remark: string;
  checked?: boolean;
}

export interface TransferOutDestroyDiscountDetail {
  id: string;
  index: number;
  barcode: string;
  barcodeName: string;
  skuCode: string;
  unit: string;
  unitCode: string;
  barFactor: number;
  numberOfDiscounted: number;
  numberOfRequested: number;
  numberOfApproved: number;
  remark: string;
}

interface Product {
  barcode: string;
  NumberOfDiscounted: number;
}
export interface CheckStockPayload {
  branchCode: string;
  products: Product[];
}

export interface TransferOutDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: any;
}
