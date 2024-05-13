import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { get } from "adapters/posback-adapter";
import { environment } from "environment-base";
import { featchViewOpenEndRsMockup } from "mockdata/branch-accounting";
import { ViewOpenEndResponse } from "models/branch-accounting-model";
import { getPathExpenseDetail } from "services/accounting";

type State = {
  viewOpenEnd: ViewOpenEndResponse;
  error: string;
};

const initialState: State = {
  viewOpenEnd: {
    timestamp: "",
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
};

export const featchOpenEndDeatilAsync = createAsyncThunk(
  "OpenEndDeatil",
  async (docNo: string) => {
    try {
      const apiRootPath = getPathExpenseDetail(
        docNo,
        environment.branchAccounting.openEnd.view.url,
      );
      // return featchViewOpenEndRsMockup();
      return await get(apiRootPath).then();
    } catch (error) {
      throw error;
    }
  },
);

const viewOpenEndSlice = createSlice({
  name: "OpenEndDeatil",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchOpenEndDeatilAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchOpenEndDeatilAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.viewOpenEnd = action.payload;
        },
      ),
      builer.addCase(featchOpenEndDeatilAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = viewOpenEndSlice.actions;
export default viewOpenEndSlice.reducer;
