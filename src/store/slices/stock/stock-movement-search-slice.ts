import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post, put } from "../../../adapters/posback-adapter";
import { environment } from "../../../environment-base";
import {
  OutstandingRequest,
  OutstandingResponse,
  StockMovementResponse,
} from "../../../models/stock-model";
import { ContentType } from "../../../utils/enum/common-enum";

type State = {
  stockList: StockMovementResponse;
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

export const featchStockMovementeSearchAsync = createAsyncThunk(
  "stockMovementList",
  async (payload: OutstandingRequest) => {
    const apiRootPath = environment.stock.outStanding.stockMovement.search.url;
    const response = await post(apiRootPath, payload, ContentType.JSON)
      .then((result: any) => result)
      .catch((error) => {
        throw error;
      });
    return response;
  },
);

const stockMovementSearchSlice = createSlice({
  name: "stockMovementList",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
    savePayloadSearch: (state, action: PayloadAction<any>) => {
      state.savePayloadSearch = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchStockMovementeSearchAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchStockMovementeSearchAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.stockList = action.payload;
        },
      ),
      builer.addCase(featchStockMovementeSearchAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter, savePayloadSearch } =
  stockMovementSearchSlice.actions;
export default stockMovementSearchSlice.reducer;
