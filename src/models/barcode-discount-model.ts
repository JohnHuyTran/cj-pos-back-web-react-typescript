export interface BarcodeDiscountSearchRequest {
  perPage: string;
  page: string;
  query: string;
  branch: string;
  status: string;
  startDate: string;
  endDate: string;
  clearSearch?: boolean;
}

export interface BarcodeDiscountSearchResponse {
  ref: string;
  code: number;
  message: string;
  data: BarcodeDiscount[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface BarcodeDiscount {
  id: string;
  branchId: string;
  regionId: string;
  requester: string;
  requesterId: string;
  documentNumber: string;
  status: string;
  totalAmount: number;
  unit: string;
  sumOfPrice: number;
  sumOfCashDiscount: number;
  sumOfPriceAfterDiscount: number;
  branchCode: string;
  branchName: string;
  createdDate: string;
  approvedDate: string;
  requesterNote: string;
  percentDiscount: boolean;
  products: BarcodeDiscountProductDetail[];
}

export interface BarcodeDiscountProductDetail {
  productObjectId: string;
  requestedDiscount: number;
  numberOfDiscounted: number;
  expiredDate: string;
  price: number;
}

export interface BarcodeDiscountDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: any;
}
