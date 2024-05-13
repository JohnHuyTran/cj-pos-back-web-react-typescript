import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExpenseSearch } from "../../../models/branch-accounting-model";

type State = {
  searchExpense: ExpenseSearch;
};

const initialState: State = {
  searchExpense: {
    limit: "10",
    page: "1",
    type: "",
    status: "",
    branchCode: "",
    month: 0,
    year: 0,
    period: 0,
  },
};

const saveExpenseSearchRequest = createSlice({
  name: "saveExpenseSearchRequest",
  initialState,
  reducers: {
    saveExpenseSearch: (state, action: PayloadAction<any>) => {
      state.searchExpense = action.payload;
    },
    clearExpenseSearch: () => {
      initialState;
    },
  },
});

export const { saveExpenseSearch, clearExpenseSearch } =
  saveExpenseSearchRequest.actions;
export default saveExpenseSearchRequest.reducer;
