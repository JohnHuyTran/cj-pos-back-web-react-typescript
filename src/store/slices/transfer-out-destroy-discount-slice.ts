import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";

type ItemsState = {
  createDraft: any;
  validate: boolean;
  dataDetail: any;
  approveReject: any;
  errorList: any;
  checkStock: any;
  checkEdit: boolean;
};
const initialState: ItemsState = {
  createDraft: {
    branchId: "61dffd619bfc3701dce4eda4",
    regionId: "61de9ddab10bfe85dfab22e9",
    requesterId: "61de9ddab10bfe85dfab22e9",
    products: [],
    beforeAttachFiles: [],
    afterAttachFiles: [],
    type: 0,
  },
  validate: false,
  dataDetail: {
    id: "",
    documentNumber: "",
    status: "",
    approvedDate: null,
    createdDate: moment(new Date()).toISOString(),
  },
  approveReject: {
    branchId: "61dffd619bfc3701dce4eda4",
    regionId: "61de9ddab10bfe85dfab22e9",
    requesterId: "61de9ddab10bfe85dfab22e9",
    id: "",
    products: [],
    approvalNote: "",
    reason: "",
  },
  errorList: [],
  checkStock: [],
  checkEdit: false,
};

const transferOutDestroyDiscountSlice = createSlice({
  name: "transferOutDestroyDiscountSlice",
  initialState,
  reducers: {
    save: (state, action: PayloadAction<any>) => {
      state.createDraft = action.payload;
    },
    updateValidate: (state, action: any) => {
      state.validate = action.payload;
    },
    updateDataDetail: (state, action: any) => {
      state.dataDetail = action.payload;
    },
    updateErrorList: (state, action: any) => {
      state.errorList = action.payload;
    },
    updateCheckStock: (state, action: any) => {
      state.checkStock = action.payload;
    },
    updateCheckEdit: (state, action: any) => {
      state.checkEdit = action.payload;
    },
    updateApproveReject: (state, action: any) => {
      state.approveReject = action.payload;
    },
  },
});
export const {
  save,
  updateDataDetail,
  updateErrorList,
  updateCheckStock,
  updateCheckEdit,
  updateApproveReject,
} = transferOutDestroyDiscountSlice.actions;
export default transferOutDestroyDiscountSlice.reducer;
