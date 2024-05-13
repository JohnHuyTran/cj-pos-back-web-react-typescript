import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../adapters/posback-adapter";
import { stringNullOrEmpty } from "../../utils/utils";
import { environment } from "../../environment-base";
import {
  StockAdjustHasTempStockSearchRequest,
  StockAdjustmentSearchRequest,
  StockAdjustmentSearchResponse,
} from "../../models/stock-adjustment-model";

type State = {
  toSearchResponse: StockAdjustmentSearchResponse;
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

export const getStockAdjustHasTempStockSearch = createAsyncThunk(
  "getStockAdjustHasTempStockSearch",
  async (payload: StockAdjustHasTempStockSearchRequest) => {
    try {
      const apiRootPath =
        environment.checkStock.stockAdjustment.tempStockSearch.url;
      let path = `${apiRootPath}?limit=${payload.perPage}&page=${payload.page}`;
      if (!stringNullOrEmpty(payload.docNo)) {
        path = path + `&docNo=${payload.docNo}`;
      }
      if (!stringNullOrEmpty(payload.branch) && "ALL" !== payload.branch) {
        path = path + `&branchCode=${payload.branch}`;
      }
      if (!stringNullOrEmpty(payload.creationDateFrom)) {
        path = path + `&creationDateFrom=${payload.creationDateFrom}`;
      }
      if (!stringNullOrEmpty(payload.creationDateTo)) {
        path = path + `&creationDateTo=${payload.creationDateTo}`;
      }
      let response: StockAdjustmentSearchResponse = {
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

const stockAdjustHasTempStockSearchSlice = createSlice({
  name: "stockAdjustHasTempStockSearchSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(getStockAdjustHasTempStockSearch.pending, () => {
      initialState;
    }),
      builer.addCase(
        getStockAdjustHasTempStockSearch.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.toSearchResponse = action.payload;
        },
      ),
      builer.addCase(getStockAdjustHasTempStockSearch.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = stockAdjustHasTempStockSearchSlice.actions;
export default stockAdjustHasTempStockSearchSlice.reducer;
