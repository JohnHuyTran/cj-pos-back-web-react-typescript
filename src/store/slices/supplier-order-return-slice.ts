import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { PurchaseNoteDetailResponse } from "../../models/purchase-credit-note";
import { getPathPurchaseDetail } from "../../services/purchase";

type State = {
  purchaseDetail: PurchaseNoteDetailResponse;
  error: string;
};

const initialState: State = {
  purchaseDetail: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchPurchaseNoteAsync = createAsyncThunk(
  "purchaseNote",
  async (pi: string) => {
    try {
      const apiRootPath = getPathPurchaseDetail(pi); //remark
      let response: PurchaseNoteDetailResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
      };

      response = await get(apiRootPath).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const purchaseNoteSlice = createSlice({
  name: "purchaseNote",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchPurchaseNoteAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchPurchaseNoteAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.purchaseDetail = action.payload;
        },
      ),
      builer.addCase(featchPurchaseNoteAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = purchaseNoteSlice.actions;
export default purchaseNoteSlice.reducer;
