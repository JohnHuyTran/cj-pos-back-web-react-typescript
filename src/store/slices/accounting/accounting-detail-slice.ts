import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { getPathExpenseDetail } from "../../../services/accounting";
import { ExpenseDetailResponseType } from "../../../models/branch-accounting-model";
import { environment } from "../../../environment-base";

type State = {
  stockRequestDetail: ExpenseDetailResponseType;
  error: string;
};

const initialState: State = {
  stockRequestDetail: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
};

export const featchExpenseDetailAsync = createAsyncThunk(
  "expenseDetail",
  async (docNo: string) => {
    try {
      const apiRootPath = getPathExpenseDetail(
        docNo,
        environment.branchAccounting.expense.detail.url,
      );
      let response: ExpenseDetailResponseType = {
        ref: "",
        code: 0,
        message: "",
        data: null,
      };

      response = await get(apiRootPath).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const expenseDetailSlice = createSlice({
  name: "expenseDetail",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchExpenseDetailAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchExpenseDetailAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.stockRequestDetail = action.payload;
        },
      ),
      builer.addCase(featchExpenseDetailAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = expenseDetailSlice.actions;
export default expenseDetailSlice.reducer;
