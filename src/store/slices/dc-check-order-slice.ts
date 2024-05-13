import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  CheckOrderRequest,
  CheckOrderResponse,
} from "../../models/dc-check-order-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  orderList: CheckOrderResponse;
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

export const featchOrderListDcAsync = createAsyncThunk(
  "orderListDc",
  async (payload: CheckOrderRequest) => {
    try {
      const apiRootPath = environment.orders.dcCheckOrder.fetchOrder.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;
      if (payload.docNo) {
        path = path + `&docNo=${payload.docNo}`;
      }
      if (payload.shipBranchFrom) {
        path = path + `&shipBranchFrom=${payload.shipBranchFrom}`;
      }
      if (payload.shipBranchTo) {
        path = path + `&shipBranchTo=${payload.shipBranchTo}`;
      }
      if (payload.verifyDCStatus == "0" || payload.verifyDCStatus == "1") {
        path = path + `&verifyDCStatus=${payload.verifyDCStatus}`;
      }
      if (payload.dateFrom) {
        path = path + `&dateFrom=${payload.dateFrom}`;
      }
      if (payload.dateTo) {
        path = path + `&dateTo=${payload.dateTo}`;
      }
      if (payload.sdType == "0" || payload.sdType == "1") {
        path = path + `&sdType=${payload.sdType}`;
      }

      let response: CheckOrderResponse = {
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

const dcCheckOrderSlice = createSlice({
  name: "dcCheckOrder",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchOrderListDcAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchOrderListDcAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderList = action.payload;
        },
      ),
      builer.addCase(featchOrderListDcAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = dcCheckOrderSlice.actions;
export default dcCheckOrderSlice.reducer;
