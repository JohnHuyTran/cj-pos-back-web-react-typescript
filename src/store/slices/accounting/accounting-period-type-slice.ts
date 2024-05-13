import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { getPathExpensePeriodType } from "../../../services/accounting";
import { ExpensePeriodTypeResponse } from "../../../models/branch-accounting-model";
import { environment } from "../../../environment-base";

type State = {
  expensePeriodList: ExpensePeriodTypeResponse;
  error: string;
};

const initialState: State = {
  expensePeriodList: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
};

export const featchExpensePeriodTypeAsync = createAsyncThunk(
  "expensePeriod",
  async (type: string) => {
    try {
      const apiRootPath = getPathExpensePeriodType(
        type,
        environment.branchAccounting.expense.periodType.url,
      );
      let response: ExpensePeriodTypeResponse = {
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

const expensePeriodTypeSlice = createSlice({
  name: "expensePeriodtype",
  initialState,
  reducers: {
    clearDataExpensePeriod: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchExpensePeriodTypeAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchExpensePeriodTypeAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.expensePeriodList = action.payload;
        },
      ),
      builer.addCase(featchExpensePeriodTypeAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataExpensePeriod } = expensePeriodTypeSlice.actions;
export default expensePeriodTypeSlice.reducer;
