import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ExpenseSearch,
  ExpenseSearchCofigRequest,
} from "../../../models/branch-accounting-model";

type State = {
  searchExpenseConfig: ExpenseSearchCofigRequest;
};

const initialState: State = {
  searchExpenseConfig: {
    limit: "10",
    page: "1",
    type: "",
    isActive: "",
  },
};

const saveExpenseConfigSearchRequest = createSlice({
  name: "saveExpenseConfigSearchRequest",
  initialState,
  reducers: {
    saveExpenseConfigSearch: (state, action: PayloadAction<any>) => {
      state.searchExpenseConfig = action.payload;
    },
    clearExpenseConfigSearch: () => {
      initialState;
    },
  },
});

export const { saveExpenseConfigSearch, clearExpenseConfigSearch } =
  saveExpenseConfigSearchRequest.actions;
export default saveExpenseConfigSearchRequest.reducer;
