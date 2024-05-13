import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ShipmentDetailResponse } from "../../models/order-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  orderDetail: ShipmentDetailResponse;
  error: string;
};

const initialState: State = {
  orderDetail: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
};

export const featchOrderDetailToteAsync = createAsyncThunk(
  "orderDetail",
  async (SD: string) => {
    try {
      const apiRootPath = environment.orders.shipment.detail.url;
      let path = `${apiRootPath}/${SD}`;
      let response: ShipmentDetailResponse = {
        ref: "",
        code: 0,
        message: "",
        data: null,
      };

      response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const checkOrderToteSlice = createSlice({
  name: "checkOrderDetail",
  initialState,
  reducers: {
    clearDataFilter: () => {
      initialState;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchOrderDetailToteAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchOrderDetailToteAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderDetail = action.payload;
        },
      ),
      builer.addCase(featchOrderDetailToteAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = checkOrderToteSlice.actions;
export default checkOrderToteSlice.reducer;
