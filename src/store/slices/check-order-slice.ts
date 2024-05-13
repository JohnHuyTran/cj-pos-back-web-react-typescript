import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ShipmentRequest, ShipmentResponse } from "../../models/order-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  orderList: ShipmentResponse;
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
    totalPage: 0,
  },
  error: "",
};

export const featchOrderListAsync = createAsyncThunk(
  "orderList",
  async (payload: ShipmentRequest) => {
    try {
      const apiRootPath = environment.orders.shipment.fetchOrder.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;
      if (payload.paramQuery) {
        path = path + `&paramQuery=${payload.paramQuery}`;
      }
      if (payload.sdNo) {
        path = path + `&sdNo=${payload.sdNo}`;
      }
      if (payload.sdStatus !== "ALL") {
        path = path + `&sdStatus=${payload.sdStatus}`;
      }
      if (payload.sdType == 0 || payload.sdType == 1 || payload.sdType == 2) {
        path = path + `&sdType=${payload.sdType}`;
      }
      if (payload.dateFrom) {
        path = path + `&dateFrom=${payload.dateFrom}`;
      }
      if (payload.dateTo) {
        path = path + `&dateTo=${payload.dateTo}`;
      }
      if (payload.shipBranchFrom) {
        path = path + `&shipBranchFrom=${payload.shipBranchFrom}`;
      }
      if (payload.shipBranchTo) {
        path = path + `&shipBranchTo=${payload.shipBranchTo}`;
      }
      // console.log("path : ", path);
      let response: ShipmentResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        page: 0,
        perPage: 0,
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

const checkOrderSlice = createSlice({
  name: "checkOrder",
  initialState,
  reducers: {
    clearDataFilter: () => {
      initialState;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchOrderListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchOrderListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderList = action.payload;
        },
      ),
      builer.addCase(featchOrderListAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = checkOrderSlice.actions;
export default checkOrderSlice.reducer;
