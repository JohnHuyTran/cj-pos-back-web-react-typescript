import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CashStatementSearchRequest } from "../../../../models/branch-accounting-model";

type State = {
  searchCashStatement: CashStatementSearchRequest;
};

const initialState: State = {
  searchCashStatement: {
    limit: "10",
    page: "1",
    status: "",
    branchCode: "",
    dateFrom: "",
    dateTo: "",
  },
};

const saveCashStatementSearchRequest = createSlice({
  name: "saveCashStatementSearchRequest",
  initialState,
  reducers: {
    saveCashStatementSearch: (state, action: PayloadAction<any>) => {
      state.searchCashStatement = action.payload;
    },
    clearCashStatementSearch: () => {
      initialState;
    },
  },
});

export const { saveCashStatementSearch, clearCashStatementSearch } =
  saveCashStatementSearchRequest.actions;
export default saveCashStatementSearchRequest.reducer;
