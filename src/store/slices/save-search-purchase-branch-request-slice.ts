import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseBranchSearchRequest } from "../../models/purchase-branch-request-model";

type State = {
  searchPurchaseBranchRequest: PurchaseBranchSearchRequest;
};

const initialState: State = {
  searchPurchaseBranchRequest: {
    limit: "10",
    page: "1",
    docNo: "",
    branchCode: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  },
};

const saveSearchPurchaseBranchRequest = createSlice({
  name: "searchPurchaseBranchRequest",
  initialState,
  reducers: {
    saveSearchPurchaseBranch: (state, action: PayloadAction<any>) => {
      state.searchPurchaseBranchRequest = action.payload;
    },
    clearSearchPurchaseBranchRequest: () => {
      initialState;
    },
  },
});

export const { saveSearchPurchaseBranch, clearSearchPurchaseBranchRequest } =
  saveSearchPurchaseBranchRequest.actions;
export default saveSearchPurchaseBranchRequest.reducer;
