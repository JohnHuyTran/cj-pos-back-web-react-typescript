import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CheckOrderRequest } from "../../models/dc-check-order-model";

type State = {
  searchCriteriaDc: CheckOrderRequest;
};

const initialState: State = {
  searchCriteriaDc: {
    limit: "10",
    page: "1",
    docNo: "",
    branchCode: "",
    verifyDCStatus: "",
    dateFrom: "",
    dateTo: "",
    sdType: "",
    sortBy: "",
  },
};

const saveSearchOrderDc = createSlice({
  name: "searchCriteriaDc",
  initialState,
  reducers: {
    saveSearchCriteriaDc: (state, action: PayloadAction<any>) => {
      state.searchCriteriaDc = action.payload;
    },
    clearSearchCriteriaDc: () => {
      initialState;
    },
  },
});

export const { saveSearchCriteriaDc, clearSearchCriteriaDc } =
  saveSearchOrderDc.actions;
export default saveSearchOrderDc.reducer;
