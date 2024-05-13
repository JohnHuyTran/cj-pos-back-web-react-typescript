import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { post } from "../../../adapters/posback-adapter";
import { environment } from "../../../environment-base";
import {
  OutstandingRequest,
  OutstandingResponse,
} from "../../../models/stock-model";
import { ContentType } from "../../../utils/enum/common-enum";

type State = {
  stockList: OutstandingResponse;
  savePayloadSearch: OutstandingRequest;
  error: string;
};

const initialState: State = {
  stockList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 0,
    perPage: 0,
    prev: 0,
    next: 0,
    totalPage: 0,
  },
  error: "",
  savePayloadSearch: {},
};

export const featchStockBalanceNegativeSearchAsync = createAsyncThunk(
  "stockBalanceNegativeList",
  async (payload: OutstandingRequest) => {
    const apiRootPath =
      environment.stock.outStanding.stockBalance.searchByNegative.url;

    const response = await post(apiRootPath, payload, ContentType.JSON)
      .then((result: any) => result)
      .catch((error) => {
        throw error;
      });
    return response;
  },
);

const stockBalanceNegativeSearchSlice = createSlice({
  name: "stockBalanceNegativeSearch",
  initialState,
  reducers: {
    clearDataNegativeFilter: (state) => initialState,
    savePayloadSearchNegative: (state, action: PayloadAction<any>) => {
      state.savePayloadSearch = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchStockBalanceNegativeSearchAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchStockBalanceNegativeSearchAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.stockList = action.payload;
        },
      ),
      builer.addCase(featchStockBalanceNegativeSearchAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataNegativeFilter, savePayloadSearchNegative } =
  stockBalanceNegativeSearchSlice.actions;
export default stockBalanceNegativeSearchSlice.reducer;
