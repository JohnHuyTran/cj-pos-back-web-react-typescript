import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
  inDetail: boolean;
};

const initialState: ItemsState = {
  state: [],
  inDetail: false,
};

export const barcodeDiscountPrintSlice = createSlice({
  name: "barcodeDiscountPrintSlice",
  initialState,
  reducers: {
    updateBarcodeDiscountPrintState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
    updatePrintInDetail: (state, action: PayloadAction<any>) => {
      state.inDetail = action.payload;
    },
  },
});

export const { updateBarcodeDiscountPrintState, updatePrintInDetail } =
  barcodeDiscountPrintSlice.actions;

export default barcodeDiscountPrintSlice.reducer;
