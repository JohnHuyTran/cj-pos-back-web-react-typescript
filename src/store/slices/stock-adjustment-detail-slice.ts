import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { StockAdjustmentDetailResponse } from "../../models/stock-adjustment-model";

type State = {
  stockAdjustDetail: StockAdjustmentDetailResponse;
  error: string;
};

const initialState: State = {
  stockAdjustDetail: {
    ref: "",
    code: 0,
    message: "",
    data: {},
  },
  error: "",
};

export const getStockAdjustmentDetail = createAsyncThunk(
  "getStockAdjustmentDetail",
  async (id: string) => {
    try {
      const apiRootPath = `${environment.checkStock.stockAdjustment.detail.url}/${id}`;
      let response: StockAdjustmentDetailResponse = {
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

const stockAdjustmentDetailSlice = createSlice({
  name: "stockAdjustmentDetailSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getStockAdjustmentDetail.pending, () => {
      initialState;
    }),
      builder.addCase(
        getStockAdjustmentDetail.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.stockAdjustDetail = action.payload;
        },
      ),
      builder.addCase(getStockAdjustmentDetail.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = stockAdjustmentDetailSlice.actions;
export default stockAdjustmentDetailSlice.reducer;
