import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { PurchaseDetailResponse } from "../../models/supplier-check-order-model";

type State = {
  purchasePIDetail: PurchaseDetailResponse;
  error: string;
};

const initialState: State = {
  purchasePIDetail: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchSupplierOrderPIDetailAsync = createAsyncThunk(
  "supplierOrderPIDetail",
  async (piDetail: any) => {
    try {
      const apiRootPath = `${environment.purchase.supplierOrder.detailPI.url}/${piDetail[0].supplierCode}/${piDetail[0].docNo}`;
      let response: PurchaseDetailResponse = {
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

const supplierCheckOrderSlice = createSlice({
  name: "supplierOrderPIDetail",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchSupplierOrderPIDetailAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSupplierOrderPIDetailAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.purchasePIDetail = action.payload;
        },
      ),
      builer.addCase(featchSupplierOrderPIDetailAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = supplierCheckOrderSlice.actions;
export default supplierCheckOrderSlice.reducer;
