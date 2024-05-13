export interface StockCountSearchRequest {
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

export interface StockCountSearchResponse {
  ref: string;
  code: number;
  message: string;
  data: StockCount[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface StockCount {
  id: string;
  APId: string;
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
  products: StockCountProductDetail[];
  relatedSaDocuments: {
    documentNumber: string;
    id: string;
  };
}

export interface StockCountProductDetail {
  barcode: string;
  productName: string;
  sku: string;
  quantity: number | null;
  unitName: string;
  canNotCount?: boolean;
}

export interface StockCountDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: any;
}

export interface StockCountDetail {
  id: string;
  index: number;
  barcode: string;
  barcodeName: string;
  skuCode: string;
  unit: string;
  unitCode: string;
  barFactor: number;
  quantity: number | null;
  checked?: boolean;
  skuName: string;
}
