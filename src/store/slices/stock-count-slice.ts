import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";

type ItemsState = {
  createDraft: any;
  dataDetail: any;
  errorList: any;
  checkStock: any;
  checkEdit: boolean;
};
const initialState: ItemsState = {
  createDraft: {
    products: [],
  },
  dataDetail: {
    id: "",
    documentNumber: "",
    status: "",
    createdDate: moment(new Date()).toISOString(),
    createdBy: "",
    branch: "",
    storeType: "",
    countingTime: "",
    APDocumentNumber: "",
    relatedSaDocuments: {},
    stockCounter: 0,
    recounting: false,
    recountingBy: 0,
    APId: "",
  },
  errorList: [],
  checkStock: [],
  checkEdit: false,
};

const stockCountSlice = createSlice({
  name: "stockCountSlice",
  initialState,
  reducers: {
    save: (state, action: PayloadAction<any>) => {
      state.createDraft = action.payload;
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
  },
});
export const {
  save,
  updateDataDetail,
  updateErrorList,
  updateCheckStock,
  updateCheckEdit,
} = stockCountSlice.actions;
export default stockCountSlice.reducer;
