import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SDResponse } from "../../models/order-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  orderList: SDResponse;
  error: string;
};

const initialState: State = {
  orderList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchOrderSDListAsync = createAsyncThunk(
  "orderSDList",
  async (sdRef: string) => {
    try {
      const apiRootPath = environment.orders.shipment.fetchOrderSD.url;
      let path = `${apiRootPath}/${sdRef}`;
      let response: SDResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
      };
      response = await get(path).then();

      // const response: SDResponse = await get(path)
      //   .then((result) => result)
      //   .catch((e) => {
      //     return e;
      //   });
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const checkOrderSDSlice = createSlice({
  name: "orderSDList",
  initialState,
  reducers: {
    clearDataFilter: () => {
      initialState;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchOrderSDListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchOrderSDListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderList = action.payload;
        },
      ),
      builer.addCase(featchOrderSDListAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = checkOrderSDSlice.actions;
export default checkOrderSDSlice.reducer;
