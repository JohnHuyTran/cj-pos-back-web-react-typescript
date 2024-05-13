export interface PurchaseInvoiceSearchCriteriaRequest {
  limit: string;
  page: string;
  paramQuery: string;
  piStatus: string;
  piType: string;
  dateFrom: string;
  dateTo: string;
  clearSearch?: boolean;
}

export interface PurchaseInvoiceSearchCriteriaResponse {
  ref: string;
  code: number;
  message: string;
  data: PurchaseInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface PurchaseInfo {
  id: string;
  docNo: string;
  docDate: string;
  branchCode: string;
  vatType: number;
  supplierCode: string;
  supplierName: string;
  supplierAddress: string;
  supplierTaxNo: string;
  creditTerm: number;
  dueDate: string;
  shipmentDate: string;
  createdDate: string;
  piStatus: number;
  piType: number;
  piNo: string;
  comment: string;
  pnNo?: string;
  pnState?: number;
}

export interface PurchaseDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: PurchaseDetailInfo[];
}

export interface PurchaseDetailInfo {
  id: string;
  docNo: string;
  docDate: string;
  branchCode: string;
  vatType: number;
  supplierCode: string;
  supplierName: string;
  supplierAddress: string;
  supplierTaxNo: string;
  creditTerm: number;
  dueDate: string;
  shipmentDate: string;
  createdDate: string;
  piStatus: number;
  piType: number;
  piNo: string;
  billNo?: string;
  comment: string;
  pnNo?: string;
  pnState?: number;
  pnComment?: string;
  files?: FileType[];
  pnFiles?: FileType[];
  // totalAmount: number;
  // discount: number;
  // charge: number;
  // discountCharge: number;
  // afterDiscountCharge: number;
  // netExcludeVat: number;
  // netIncludeVatSpecial: number;
  // netIncludeVat: number;
  // vat: number;
  // vatAble: number;
  // ratRate: number;
  // roundAmount: number;
  entries: PurchaseDetailEntries | [];
}

export interface PurchaseDetailEntries {
  seqItem: number;
  produtStatus: number;
  isControlStock: number;
  isAllowDiscount: number;
  skuCode: string;
  barcode: string;
  productName: string;
  unitCode: string;
  unitName: string;
  qty: number;
  qtyAll: number;
  controlPrice: number;
  salePrice: number;
  setPrice: number;
  sumPrice: number;
  actualQty: number;
  actualQtyAll: number;
  isDraftStatus?: boolean;
  returnQty?: number;
  returnAllQty?: number;
  pnDisplay?: number;
}

export interface FileType {
  branchCode: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  status?: string;
}
export interface SavePurchaseRequest {
  billNo: string;
  comment: string;
  items: PurchaseItems[];
}

export interface SavePurchasePIRequest {
  billNo: string;
  SupplierCode: string;
  comment: string;
  piNo: string;
  docNo: string;
  flagPO: number;
  items: PurchaseItems[];
}

export interface PurchaseItems {
  barcode: string;
  actualQty: number;
}

export interface CalculatePurchasePIRequest {
  piNo: string;
  docNo: string;
  SupplierCode: string;
  items: PurchaseItems[];
}
