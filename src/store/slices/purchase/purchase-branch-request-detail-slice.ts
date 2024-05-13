import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { getPathPurchaseBRDetail } from "../../../services/purchase";
import { PurchaseBRDetailResponse } from "../../../models/purchase-branch-request-model";

type State = {
  purchaseBRDetail: PurchaseBRDetailResponse;
  error: string;
};

const initialState: State = {
  purchaseBRDetail: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
};

export const featchPurchaseBRDetailAsync = createAsyncThunk(
  "purchaseBRDetail",
  async (docNo: string) => {
    try {
      const apiRootPath = getPathPurchaseBRDetail(docNo);
      let response: PurchaseBRDetailResponse = {
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

const purchaseBRDetailSlice = createSlice({
  name: "purchaseBRDetail",
  initialState,
  reducers: {
    clearDataPurchaseBRDetail: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchPurchaseBRDetailAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchPurchaseBRDetailAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.purchaseBRDetail = action.payload;
        },
      ),
      builer.addCase(featchPurchaseBRDetailAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataPurchaseBRDetail } = purchaseBRDetailSlice.actions;
export default purchaseBRDetailSlice.reducer;
