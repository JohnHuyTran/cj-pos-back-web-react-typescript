import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseInvoiceSearchCriteriaRequest } from "../../models/supplier-check-order-model";

type State = {
  searchCriteria: PurchaseInvoiceSearchCriteriaRequest;
};

const initialState: State = {
  searchCriteria: {
    limit: "0",
    page: "1",
    paramQuery: "",
    piStatus: "",
    piType: "",
    dateFrom: "",
    dateTo: "",
  },
};

const saveSearchOrderSup = createSlice({
  name: "searchCriteriaSup",
  initialState,
  reducers: {
    saveSearchCriteriaSup: (state, action: PayloadAction<any>) => {
      state.searchCriteria = action.payload;
    },
    clearSearchCriteriaSup: () => {
      initialState;
    },
  },
});

export const { saveSearchCriteriaSup, clearSearchCriteriaSup } =
  saveSearchOrderSup.actions;
export default saveSearchOrderSup.reducer;
