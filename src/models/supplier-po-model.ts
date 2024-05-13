export interface SupplierPOResponse {
  ref: string;
  code: number;
  message: string;
  data: SupplierPORows[];
}

export interface SupplierPORows {
  id: string;
  docNo: string;
  docDate: string;
  branchCode: string;
  status: number;
  vatType: number;
  supplierCode: string;
  supplierName: string;
  supplierAddress: string;
  supplierTaxNo: string;
  creditTerm: number;
  dueDate: string;
  shipmentDate: string;
  wareHouseCode: string;
  items: SupplierPOItem[];
  grandTotalAmountText: string;
  docType: number;
  createdBy: string;
  lastModifiedBy: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface SupplierPOItem {
  seqItem: number;
  productStatus: number;
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
}
