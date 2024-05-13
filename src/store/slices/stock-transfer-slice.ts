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

export const featchSearchStockTransferAsync = createAsyncThunk(
  "stockTransferList",
  async (payload: StockTransferRequest) => {
    try {
      const apiRootPath = environment.stock.searchStockTransfer.url;
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
      if (payload.transferReason) {
        path = path + `&transferReason=${payload.transferReason}`;
      }

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

const stockTransferSlice = createSlice({
  name: "stockTransfer",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchSearchStockTransferAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSearchStockTransferAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderList = action.payload;
        },
      ),
      builer.addCase(featchSearchStockTransferAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = stockTransferSlice.actions;
export default stockTransferSlice.reducer;
