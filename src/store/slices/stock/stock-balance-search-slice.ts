import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post, put } from "../../../adapters/posback-adapter";
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

export const featchStockBalanceSearchAsync = createAsyncThunk(
  "stockBalanceList",
  async (payload: OutstandingRequest) => {
    const apiRootPath =
      environment.stock.outStanding.stockBalance.searchByStore.url;

    const response = await post(apiRootPath, payload, ContentType.JSON)
      .then((result: any) => result)
      .catch((error) => {
        throw error;
      });
    return response;
  },
);

const stockBalanceSearchSlice = createSlice({
  name: "stockBalanceSearch",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
    savePayloadSearch: (state, action: PayloadAction<any>) => {
      state.savePayloadSearch = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchStockBalanceSearchAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchStockBalanceSearchAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.stockList = action.payload;
        },
      ),
      builer.addCase(featchStockBalanceSearchAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter, savePayloadSearch } =
  stockBalanceSearchSlice.actions;
export default stockBalanceSearchSlice.reducer;
