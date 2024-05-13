import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../adapters/posback-adapter";
import { stringNullOrEmpty } from "../../utils/utils";
import { environment } from "../../environment-base";
import {
  StockCountSearchRequest,
  StockCountSearchResponse,
} from "../../models/stock-count-model";

type State = {
  toSearchResponse: StockCountSearchResponse;
  error: string;
};

const initialState: State = {
  toSearchResponse: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 0,
    perPage: 0,
    totalPage: 0,
  },
  error: "",
};

export const getStockCountSearch = createAsyncThunk(
  "getStockCountSearch",
  async (payload: StockCountSearchRequest) => {
    try {
      const apiRootPath = environment.checkStock.stockCount.search.url;
      let path = `${apiRootPath}?limit=${payload.perPage}&page=${payload.page}`;
      if (!stringNullOrEmpty(payload.query)) {
        path = path + `&documentNumber=${payload.query}`;
      }
      if (!stringNullOrEmpty(payload.branch) && "ALL" !== payload.branch) {
        path = path + `&branchCode=${payload.branch}`;
      }
      if (!stringNullOrEmpty(payload.status) && "ALL" !== payload.status) {
        path = path + `&status=${payload.status}`;
      }
      if (!stringNullOrEmpty(payload.startDate)) {
        path = path + `&startDate=${payload.startDate}`;
      }
      if (!stringNullOrEmpty(payload.endDate)) {
        path = path + `&endDate=${payload.endDate}`;
      }
      let response: StockCountSearchResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        page: 0,
        perPage: 0,
        totalPage: 0,
      };
      if (!payload.clearSearch) {
        response = await get(path).then();
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const StockCountSearchSlice = createSlice({
  name: "StockCountSearchSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(getStockCountSearch.pending, () => {
      initialState;
    }),
      builer.addCase(
        getStockCountSearch.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.toSearchResponse = action.payload;
        },
      ),
      builer.addCase(getStockCountSearch.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = StockCountSearchSlice.actions;
export default StockCountSearchSlice.reducer;
