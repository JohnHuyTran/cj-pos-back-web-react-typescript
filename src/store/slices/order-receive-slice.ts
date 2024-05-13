import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { OrderReceiveResponse } from "../../models/order-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  orderReceiveList: OrderReceiveResponse;
  error: string;
};

const initialState: State = {
  orderReceiveList: {
    ref: "",
    code: 0,
    message: "",
    data: {},
  },
  error: "",
};

export const searchOrderReceiveAsync = createAsyncThunk(
  "searchOrderReceive",
  async (docNo?: string) => {
    try {
      let path = environment.orders.shipment.search.url;
      if (docNo) {
        path = path + `/${docNo}`;
      }
      // console.log('path : ', path);

      let response: OrderReceiveResponse = {
        ref: "",
        code: 0,
        message: "",
        data: {},
      };

      if (docNo) {
        return (response = await get(path).then());
      } else {
        return response;
      }
    } catch (error) {
      throw error;
    }
  },
);

const orderReceiveSlice = createSlice({
  name: "orderReceive",
  initialState,
  reducers: {
    clearDataFilter: () => {
      initialState;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(searchOrderReceiveAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        searchOrderReceiveAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderReceiveList = action.payload;
        },
      ),
      builer.addCase(searchOrderReceiveAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = orderReceiveSlice.actions;
export default orderReceiveSlice.reducer;
