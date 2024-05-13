import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ShipmentDetailResponse } from "../../models/order-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  orderDetail: ShipmentDetailResponse;
  error: string;
  isReloadScreen: boolean;
};

const initialState: State = {
  orderDetail: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
  isReloadScreen: false,
};

export const featchOrderDetailAsync = createAsyncThunk(
  "orderDetail",
  async (SD?: string) => {
    try {
      const apiRootPath = environment.orders.shipment.detail.url;
      let path = `${apiRootPath}/${SD}`;
      let response: ShipmentDetailResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
      };

      if (SD) {
        return (response = await get(path).then());
      } else {
        return response;
      }
    } catch (error) {
      throw error;
    }
  },
);

const checkOrderSlice = createSlice({
  name: "checkOrderDetail",
  initialState,
  reducers: {
    clearDataFilter: () => {
      initialState;
    },
    setReloadScreen: (state, action: PayloadAction<boolean>) => {
      state.isReloadScreen = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchOrderDetailAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchOrderDetailAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderDetail = action.payload;
        },
      ),
      builer.addCase(featchOrderDetailAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter, setReloadScreen } = checkOrderSlice.actions;
export default checkOrderSlice.reducer;
