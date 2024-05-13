import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { StockCountDetailResponse } from "../../models/stock-count-model";

type State = {
  stockCountDetail: StockCountDetailResponse;
  error: string;
};

const initialState: State = {
  stockCountDetail: {
    ref: "",
    code: 0,
    message: "",
    data: {},
  },
  error: "",
};

export const getStockCountDetail = createAsyncThunk(
  "getStockCountDetail",
  async (id: string) => {
    try {
      const apiRootPath = `${environment.checkStock.stockCount.detail.url}/${id}`;
      let response: StockCountDetailResponse = {
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

const stockCountDetailSlice = createSlice({
  name: "stockCountDetailSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getStockCountDetail.pending, () => {
      initialState;
    }),
      builder.addCase(
        getStockCountDetail.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.stockCountDetail = action.payload;
        },
      ),
      builder.addCase(getStockCountDetail.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = stockCountDetailSlice.actions;
export default stockCountDetailSlice.reducer;
