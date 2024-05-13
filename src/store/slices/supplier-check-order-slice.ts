import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import {
  PurchaseInvoiceSearchCriteriaRequest,
  PurchaseInvoiceSearchCriteriaResponse,
} from "../../models/supplier-check-order-model";

type State = {
  orderList: PurchaseInvoiceSearchCriteriaResponse;
  error: string;
};

const initialState: State = {
  orderList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 0,
    perPage: 0,
    prev: 0,
    next: 0,
    totalPage: 0,
  },
  error: "",
};

export const featchOrderListSupAsync = createAsyncThunk(
  "orderListSup",
  async (payload: PurchaseInvoiceSearchCriteriaRequest) => {
    try {
      const apiRootPath = environment.purchase.supplierOrder.search.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;
      if (payload.paramQuery) {
        path = path + `&paramQuery=${payload.paramQuery}`;
      }
      if (
        payload.piStatus == "0" ||
        payload.piStatus == "1" ||
        payload.piStatus == "9"
      ) {
        path = path + `&piStatus=${payload.piStatus}`;
      }
      if (payload.piType == "0" || payload.piType == "1") {
        path = path + `&piType=${payload.piType}`;
      }
      if (payload.dateFrom) {
        path = path + `&dateFrom=${payload.dateFrom}`;
      }
      if (payload.dateTo) {
        path = path + `&dateTo=${payload.dateTo}`;
      }

      let response: PurchaseInvoiceSearchCriteriaResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        page: 0,
        perPage: 0,
        prev: 0,
        next: 0,
        totalPage: 0,
      };

      if (!payload.clearSearch) {
        response = await get(path).then();
      }
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
    builer.addCase(featchOrderListSupAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchOrderListSupAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderList = action.payload;
        },
      ),
      builer.addCase(featchOrderListSupAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = supplierCheckOrderSlice.actions;
export default supplierCheckOrderSlice.reducer;
