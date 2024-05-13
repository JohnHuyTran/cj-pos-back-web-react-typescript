export interface CheckOrderRequest {
  orderNo: string;
  orderStatus: string;
  orderType: string;
}

export interface CheckOrderResponse {
  ref: number;
  total: number;
  orders?: Order[];
}

export interface Order {
  orderNo: string;
  orderStatus: string;
  orderType: string;
  orderShipment: string;
  orderTotal: number;
  orderTote: number;
  orderCreateDate: string;
  products?: Product[];
}

export interface Product {
  productId: string;
  productBarCode: string;
  productDescription: string;
  productUnit: string;
  productQuantityRef: number;
  productQuantityActual: number;
  productDifference: number;
}

export interface ShipmentRequest {
  limit: string;
  page: string;
  sortBy?: string;
  sortDirection?: string;
  paramQuery?: string;
  sdNo?: string;
  dateFrom?: string;
  dateTo?: string;
  sdStatus?: string;
  sdType?: number;
  shipBranchFrom?: string;
  shipBranchTo?: string;
  clearSearch?: boolean;
}

export interface ShipmentResponse {
  ref: string;
  code: number;
  message: string;
  data: ShipmentInfo[];
  total: number;
  page: number;
  perPage: number;
  totalPage: number;
}

export interface ShipmentInfo {
  shipmentNo: string;
  shipmentDate: string;
  status: string;
  sapDocType: string;
  sdNo: string;
  docRefNo: string;
  docType: string;
  sdStatus: string;
  sdType: number;
  toteCnt: number;
  boxCnt: number;
  hasDoc: boolean;
  comment: string;
  entries: Entry[] | null;
  shipBranchFrom: shipBranchInfo;
  shipBranchTo: shipBranchInfo;
}

export interface Entry {
  deliveryOrderNo: string;
  seqItem: number;
  itemNo: string;
  shipmentSAPRef: string;
  skuCode: string;
  skuType: string;
  productName: string;
  barcode: string;
  unitCode: string;
  unitName: string;
  unitFactor: number;
  qty: number;
  qtyAll: number;
  qtyAllBefore: number;
  qtyRef?: number;
  actualQty: number;
  qtyDiff: number;
  price: number;
  isControlStock: number;
  toteCode: string;
  expireDate: string;
  isTote: boolean;
  comment: string;
}

export interface shipBranchInfo {
  code: string;
  name: string;
}
export interface ShipmentDetailResponse {
  ref: string;
  code: number;
  message: string;
  data: ShipmentDetailInfo | null | [];
}
export interface ShipmentDetailInfo {
  id: string;
  shipmentNo: string;
  sdNo: string;
  sdType: number;
  dcComment: string;
  verifyDCStatus: number;
  receivedDate: string;
  sdImageFilename: string;
  sdImageFile: string;
  sdStatus: number;
  Comment: string;
  docRefRemark: string;
  items: itemsDetail[] | [];
  hhQty: number;
}
export interface itemsDetail {
  skuCode: string;
  skuType: string;
  barcode: string;
  productName: string;
  unitCode: string;
  unitName: string;
  unitFactor: number;
  qty: number;
  qtyRef?: number;
  actualQty: number;
  qtyDiff: number;
  comment: string;
  isTote: boolean;
  toteCode: string;
  deliveryOrderNo: string;
}

export interface CheckOrderDetailProps {
  sdNo: string;
  docRefNo: string;
  docType: string;
  defaultOpen: boolean;
  onClickClose: any;
}

export interface SaveDraftSDRequest {
  shipmentNo: string;
  items: Entry[];
}

export interface itemsReq {
  barcode: string;
  deliveryOrderNo: string;
  actualQty: number;
  comment: string;
  isTote: boolean;
}

export interface OrderSubmitResponse {
  ref: string;
  code: number;
  message: string;
  sdNo: string;
}

export interface OrderApproveRequest {
  items: ItemsApprove;
}
export interface ItemsApprove {
  deliveryOrderNo: string;
  barcode: string;
  actualQty: number;
  comment: string;
  isTote: boolean;
}

// export interface OrderApproveCloseJobRequest {
//   imageFileName?: string;
//   imageFile?: string;
// }

export interface FeatchDataPDFRequest {
  Symbol: string;
}

export interface GenerateBORequest {
  comment: string;
}

export interface SDResponse {
  ref: string;
  code: number;
  message: string;
  data: SDInfo[] | null;
}

export interface SDInfo {
  // shipmentNo: string;
  docRefNo: string;
  docType: string;
  shipmentDate: string;
  status: string;
  sapDocType: string;
  sdNo: string;
  sdStatus: number;
  sdType: number;
  toteCnt: number;
  boxCnt: number;
  hasDoc: boolean;
  itemRefNo: number;
  entries: Entry[];
}

export interface CheckOrderSDDetailProps {
  sdNo: string;
  sdRefNo: string;
  shipmentNo: string;
  defaultOpen: boolean;
  onClickClose: any;
}

export interface OrderReceiveResponse {
  ref: string;
  code: number;
  message: string;
  data: OrderReceiveInfo | any;
}

export interface OrderReceiveInfo {
  shipmentNo: string;
  shipmentDate: string;
  status: string;
  sapDocType: string;
  sdNo: string;
  sdStatus: number;
  sdType: number;
  toteCnt: number;
  boxCnt: number;
  comment: string;
  ItemRefNo: number;
  entries: OrderReceiveEntry[];
  shipBranchFrom: shipBranchInfo;
  shipBranchTo: shipBranchInfo;
}
export interface OrderReceiveEntry {
  deliveryOrderNo: string;
  productName: string;
  ItemRefNo: number;
  barcode: string;
  skuCode: string;
  skuType: string;
  outOfStockStatus: number;
  toteCode: string;
  expireDate: string;
  unitCode: string;
  unitName: string;
  unitFactor: number;
  qty: number;
  qtyAll: number;
  qtyAllBefore: number;
  actualQty: number;
  qtyDiff: number;
  comment: string;
  isTote: boolean;
}

export interface ToteResponse {
  ref: string;
  code: number;
  message: string;
  data: ToteInfo | null;
}

export interface ToteInfo {
  boxCnt: number;
  comment: string;
  docRefNo: string;
  docType: string;
  entries: EntryTote[];
  id: string;
  sapDocType: string;
  sdNo: string;
  sdStatus: string;
  sdType: string;
  shipBranchFrom: shipBranchInfo;
  shipBranchTo: shipBranchInfo;
  shipmentDate: string;
  shipmentNo: string;
  status: string;
  toteCnt: number;
  toteCode: number;
}

export interface EntryTote {
  actualQty: number;
  barcode: string;
  comment: string;
  deliveryOrderNo: string;
  expireDate: string;
  isControlStock: number;
  isTote: boolean;
  itemNo: string;
  price: number;
  productName: string;
  qty: number;
  qtyAll: number;
  qtyAllBefore: number;
  qtyDiff: number;
  seqItem: number;
  shipmentSAPRef: string;
  skuCode: string;
  skuType: string;
  toteCode: string;
  unitCode: string;
  unitFactor: number;
  unitName: string;
}

export interface ToteRequest {
  docRefNo: string;
  toteCode: string;
}

export interface ItemSubmitToteRequst {
  shipmentNo: string;
  toteCode: string;
  items: ItemRequest[];
}

export interface ItemRequest {
  barcode: string;
  actualQty: number;
  comment?: string;
}
