import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { PurchaseDetailResponse } from "../../models/supplier-check-order-model";

type State = {
  purchaseDetail: PurchaseDetailResponse;
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

export const featchSupplierOrderDetailAsync = createAsyncThunk(
  "supplierOrderDetail",
  async (pi: string) => {
    try {
      const apiRootPath = `${environment.purchase.supplierOrder.detail.url}/${pi}`;
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
  name: "supplierCheckOrder",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchSupplierOrderDetailAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSupplierOrderDetailAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.purchaseDetail = action.payload;
        },
      ),
      builer.addCase(featchSupplierOrderDetailAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = supplierCheckOrderSlice.actions;
export default supplierCheckOrderSlice.reducer;
