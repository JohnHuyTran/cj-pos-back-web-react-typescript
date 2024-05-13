import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";

type ItemsState = {
  dataDetail: any;
  errorList: any;
  checkStock: any;
  checkEdit: boolean;
};
const initialState: ItemsState = {
  dataDetail: {
    id: "",
    documentNumber: "",
    status: "",
    createdDate: moment(new Date()).toISOString(),
    createdBy: "",
    branchCode: "",
    branchName: "",
    APId: "",
    APDocumentNumber: "",
    relatedSCs: [],
    recheckSkus: [],
    relatedSlDocuments: {
      documentNumber: "",
      id: "",
    },
    notCountableSkus: [],
    skuDifferenceEqual: 0,
    skuDifferenceNegative: 0,
    skuDifferencePositive: 0,
    stockCounter: "",
  },
  errorList: [],
  checkStock: [],
  checkEdit: false,
};

const stockAdjustmentSlice = createSlice({
  name: "stockAdjustmentSlice",
  initialState,
  reducers: {
    updateDataDetail: (state, action: PayloadAction<any>) => {
      state.dataDetail = action.payload;
    },
    updateErrorList: (state, action: PayloadAction<any>) => {
      state.errorList = action.payload;
    },
    updateCheckStock: (state, action: PayloadAction<any>) => {
      state.checkStock = action.payload;
    },
    updateCheckEdit: (state, action: PayloadAction<any>) => {
      state.checkEdit = action.payload;
    },
  },
});
export const {
  updateDataDetail,
  updateErrorList,
  updateCheckStock,
  updateCheckEdit,
} = stockAdjustmentSlice.actions;
export default stockAdjustmentSlice.reducer;
