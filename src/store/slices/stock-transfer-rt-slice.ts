import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import {
  StockTransferRequest,
  StockTransferResponse,
} from "../../models/stock-transfer-model";

type State = {
  orderList: StockTransferResponse;
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

export const featchSearchStockTransferRtAsync = createAsyncThunk(
  "stockRequestList",
  async (payload: StockTransferRequest) => {
    try {
      const apiRootPath = environment.stock.searchStockTransfer.searchRT.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;
      if (payload.docNo) {
        path = path + `&docNo=${payload.docNo}`;
      }
      if (payload.branchFrom) {
        path = path + `&branchFrom=${payload.branchFrom}`;
      }
      if (payload.branchTo) {
        path = path + `&branchTo=${payload.branchTo}`;
      }
      if (payload.dateFrom) {
        path = path + `&dateFrom=${payload.dateFrom}`;
      }
      if (payload.dateTo) {
        path = path + `&dateTo=${payload.dateTo}`;
      }
      if (payload.statuses !== "ALL") {
        path = path + `&statuses=${payload.statuses}`;
      }
      if (payload.transferReason !== "All") {
        path = path + `&transferReason=${payload.transferReason}`;
      }

      // console.log('path: ', path);
      // console.log('payload.clearSearch: ', payload.clearSearch);

      let response: StockTransferResponse = {
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
      // console.log('response: ', response);

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const stockTransferRtSlice = createSlice({
  name: "stockTransferRt",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchSearchStockTransferRtAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSearchStockTransferRtAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderList = action.payload;
        },
      ),
      builer.addCase(featchSearchStockTransferRtAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = stockTransferRtSlice.actions;
export default stockTransferRtSlice.reducer;
