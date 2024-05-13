import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { BarcodeDiscountDetailResponse } from "../../models/barcode-discount-model";

type State = {
  barcodeDiscountDetail: BarcodeDiscountDetailResponse;
  error: string;
};

const initialState: State = {
  barcodeDiscountDetail: {
    ref: "",
    code: 0,
    message: "",
    data: {},
  },
  error: "",
};

export const getBarcodeDiscountDetail = createAsyncThunk(
  "getBarcodeDiscountDetail",
  async (id: string) => {
    try {
      const apiRootPath = `${environment.sell.barcodeDiscount.detail.url}/${id}`;
      let response: BarcodeDiscountDetailResponse = {
        ref: "",
        code: 0,
        message: "",
        data: {},
      };
      response = await get(apiRootPath).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const barcodeDiscountDetailSlice = createSlice({
  name: "barcodeDiscountDetailSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getBarcodeDiscountDetail.pending, () => {
      initialState;
    }),
      builder.addCase(
        getBarcodeDiscountDetail.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.barcodeDiscountDetail = action.payload;
        },
      ),
      builder.addCase(getBarcodeDiscountDetail.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = barcodeDiscountDetailSlice.actions;
export default barcodeDiscountDetailSlice.reducer;
