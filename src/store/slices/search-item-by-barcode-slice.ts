import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ItemByBarcodeResponse } from "../../models/modal-add-item-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { Barcode2, Barcode1 } from "../../mockdata/supplier-items";

type State = {
  itemList: ItemByBarcodeResponse;
  error: string;
};

const initialState: State = {
  itemList: {
    timestamp: "",
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchItemByBarcodeAsync = createAsyncThunk(
  "ItemByBarcode",
  async (barcode: string) => {
    try {
      const path = environment.products.addItem.itemByBarcode.url + barcode;
      let response = await get(path).then();
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const searchItemByBarcodeSlice = createSlice({
  name: "itemByBarcode",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchItemByBarcodeAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchItemByBarcodeAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.itemList = action.payload;
        },
      ),
      builer.addCase(featchItemByBarcodeAsync.rejected, () => {
        initialState;
      });
  },
});

// export const { clearDataFilter } = dcCheckOrderSlice.actions;
export default searchItemByBarcodeSlice.reducer;
