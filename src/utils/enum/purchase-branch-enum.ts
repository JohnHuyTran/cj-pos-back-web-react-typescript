export const purchaseBranchStatus = [
  { key: "DRAFT", value: "DRAFT", stepperGrp: 1 },
  {
    key: "WAITING_BRANCH_EXAMINE",
    value: "WAITING_BRANCH_EXAMINE",
    stepperGrp: 2,
  },
  {
    key: "WAITING_DC_CHECK_DIFF",
    value: "WAITING_DC_CHECK_DIFF",
    stepperGrp: 2,
  },
  { key: "DC_NO_STOCK", value: "DC_NO_STOCK", stepperGrp: 3 },
  { key: "RECEIVE_COMPLETE", value: "RECEIVE_COMPLETE", stepperGrp: 3 },
  { key: "INCOMPLETE_RECEIVED", value: "INCOMPLETE_RECEIVED", stepperGrp: 3 },
];
export const getPurchaseBranchStatusInfo = (key: string) =>
  purchaseBranchStatus.find((item) => item.key === key);

export const getPurchaseBranchList = () => {
  return purchaseBranchStatus;
};
