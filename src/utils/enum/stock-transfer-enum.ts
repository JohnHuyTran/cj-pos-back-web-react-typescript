export const stockTransferStatus = [
  { key: "DRAFT", value: "DRAFT", stepperGrp: 1, type: "RT" },
  {
    key: "WAIT_FOR_APPROVAL_1",
    value: "WAIT_FOR_APPROVAL_1",
    stepperGrp: 2,
    type: "RT",
  },
  {
    key: "WAIT_FOR_APPROVAL_2",
    value: "WAIT_FOR_APPROVAL_2",
    stepperGrp: 2,
    type: "RT",
  },
  { key: "APPROVED", value: "APPROVED", stepperGrp: 3, type: "RT" },
  {
    key: "AWAITING_FOR_REQUESTER",
    value: "AWAITING_FOR_REQUESTER",
    stepperGrp: 2,
    type: "RT",
  },

  { key: "CREATED", value: "CREATED", stepperGrp: 1, type: "BT" },
  {
    key: "READY_TO_TRANSFER",
    value: "READY_TO_TRANSFER",
    stepperGrp: 2,
    type: "BT",
  },
  {
    key: "WAIT_FOR_PICKUP",
    value: "WAIT_FOR_PICKUP",
    stepperGrp: 2,
    type: "BT",
  },
  { key: "TRANSFERING", value: "TRANSFERING", stepperGrp: 2, type: "BT" },
  { key: "COMPLETED", value: "COMPLETED", stepperGrp: 3, type: "BT" },
  { key: "CANCELED", value: "CANCELED", stepperGrp: 3, type: "RT" },
];
export const getStockTransferStatusInfo = (key: string) =>
  stockTransferStatus.find((item) => item.key === key);
export const getStockTransferStatusList = (type: string) => {
  return stockTransferStatus.filter(
    (item) => item.type === type || item.type === "ALL",
  );
};

export enum DOCUMENT_TYPE {
  BT = "BT",
  BO = "BO",
  RECALL = "Recall",
  BOX = "Box",
}
