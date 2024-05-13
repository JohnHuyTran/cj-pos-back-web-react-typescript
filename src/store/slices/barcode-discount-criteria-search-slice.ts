import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BarcodeDiscountSearchRequest } from "../../models/barcode-discount-model";

type State = {
  searchCriteria: BarcodeDiscountSearchRequest;
};

const initialState: State = {
  searchCriteria: {
    perPage: "10",
    page: "1",
    query: "",
    branch: "",
    status: "",
    startDate: "",
    endDate: "",
  },
};

const barcodeDiscountCriteriaSearchSlice = createSlice({
  name: "searchCriteriaBD",
  initialState,
  reducers: {
    saveSearchCriteriaBD: (state, action: PayloadAction<any>) => {
      state.searchCriteria = action.payload;
    },
    clearSearchCriteriaBD: () => {
      initialState;
    },
  },
});

export const { saveSearchCriteriaBD, clearSearchCriteriaBD } =
  barcodeDiscountCriteriaSearchSlice.actions;
export default barcodeDiscountCriteriaSearchSlice.reducer;
