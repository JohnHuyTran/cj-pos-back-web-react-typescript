export interface SupplierSearchResponse {
  ref: string;
  code: number;
  message: string;
  data: SupplierSearchRows[];
}

export interface SupplierSearchRows {
  code: string;
  name: string;
  taxNo: string;
  address: string;
  vatType: string;
  creditTerm: number;
  isFrontPay: boolean;
  isPayBilling: boolean;
  isRefPO: boolean;
  vatRate: number;
}
