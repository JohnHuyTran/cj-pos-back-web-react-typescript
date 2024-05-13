import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { environment } from "../../../environment-base";
import { featchMasterExpenseListAsyncMockup } from "../../../mockdata/branch-accounting";
import { ExpenseMasterResponseType } from "../../../models/branch-accounting-model";

type State = {
  masterExpenseList: ExpenseMasterResponseType;
  error: string;
};

const initialState: State = {
  masterExpenseList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchMasterExpenseListAsync = createAsyncThunk(
  "MasterExpenseList",
  async () => {
    try {
      const path = environment.master.expense.retrive.url;
      return await get(path).then();
      // return featchMasterExpenseListAsyncMockup();
    } catch (error) {
      throw error;
    }
  },
);

const masterExpenseListSlice = createSlice({
  name: "MasterExpenseList",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchMasterExpenseListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchMasterExpenseListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.masterExpenseList = action.payload;
        },
      ),
      builer.addCase(featchMasterExpenseListAsync.rejected, () => {
        initialState;
      });
  },
});

export default masterExpenseListSlice.reducer;
