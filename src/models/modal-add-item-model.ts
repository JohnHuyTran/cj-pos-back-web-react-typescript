export interface ItemBySupplierCodeResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: ItemInfo[];
}

export interface ItemInfo {
  barcode: string;
  skuCode?: string;
  unitCode?: string;
  unitName?: string;
  barcodeName: string;
  unitPrice?: number;
  actualQty?: number;
}

export interface ItemByBarcodeResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: ItemByBarcodeInfo[] | [];
}

export interface ItemByBarcodeInfo {
  barcode: string;
  skuCode?: string;
  unitCode?: string;
  unitName: string;
  unitFactor?: number;
  barcodeName: string;
  pricePerUnit?: number;
  qty: number;
  isCalVat?: boolean;
  isControlStock?: boolean;
  isAllowDiscount?: boolean;
}
