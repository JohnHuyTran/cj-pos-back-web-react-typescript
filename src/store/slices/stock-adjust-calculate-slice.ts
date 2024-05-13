import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../adapters/posback-adapter";
import { StockCountSearchResponse } from "../../models/stock-count-model";
import {
  SABarcodeCalculateResponse,
  SACalculateRequest,
  SASkuCalculateResponse,
} from "../../models/stock-adjustment-model";
import { stringNullOrEmpty } from "../../utils/utils";
import { environment } from "../../environment-base";
import { ContentType } from "../../utils/enum/common-enum";

type State = {
  barcodeCalculateCriteria: SACalculateRequest;
  skuCalculateCriteria: SACalculateRequest;
  barcodeCalculateResponse: SABarcodeCalculateResponse;
  skuCalculateResponse: SASkuCalculateResponse;
  refresh: boolean;
  reload: boolean;
};

const initialState: State = {
  barcodeCalculateCriteria: {
    perPage: 10,
    page: 1,
    id: "",
    filterDifference: "",
  },
  skuCalculateCriteria: {
    perPage: 10,
    page: 1,
    id: "",
    filterDifference: "",
  },
  barcodeCalculateResponse: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 1,
    perPage: 10,
    totalPage: 0,
  },
  skuCalculateResponse: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 1,
    perPage: 10,
    totalPage: 0,
  },
  refresh: false,
  reload: false,
};

export const getSkuCalculate = createAsyncThunk(
  "getSkuCalculate",
  async (payload: SACalculateRequest) => {
    try {
      const apiRootPath = `${environment.checkStock.stockAdjustment.calculate.skuTab.url}/${payload.id}`;
      let path = `${apiRootPath}?limit=${payload.perPage}&page=${payload.page}`;
      if (!stringNullOrEmpty(payload.filterDifference)) {
        path = path + `&filterDifference=${payload.filterDifference}`;
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
      response = await get(path, ContentType.JSON, 30000).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

export const getBarcodeCalculate = createAsyncThunk(
  "getBarcodeCalculate",
  async (payload: SACalculateRequest) => {
    try {
      const apiRootPath = `${environment.checkStock.stockAdjustment.calculate.barcodeTab.url}/${payload.id}`;
      let path = `${apiRootPath}?limit=${payload.perPage}&page=${payload.page}`;
      if (!stringNullOrEmpty(payload.filterDifference)) {
        path = path + `&filterDifference=${payload.filterDifference}`;
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
      response = await get(path, ContentType.JSON, 30000).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const stockAdjustCalculateSlice = createSlice({
  name: "stockAdjustCalculateSlice",
  initialState,
  reducers: {
    saveBarcodeCalculateCriteria: (state, action: PayloadAction<any>) => {
      state.barcodeCalculateCriteria = action.payload;
    },
    saveSkuCalculateCriteria: (state, action: PayloadAction<any>) => {
      state.skuCalculateCriteria = action.payload;
    },
    updateRefresh: (state, action: any) => {
      state.refresh = action.payload;
    },
    updateReload: (state, action: any) => {
      state.reload = action.payload;
    },
    clearCalculate: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(getBarcodeCalculate.pending, () => {
      initialState;
    }),
      builer.addCase(
        getBarcodeCalculate.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.barcodeCalculateResponse = action.payload;
        },
      ),
      builer.addCase(getBarcodeCalculate.rejected, () => {
        initialState;
      }),
      builer.addCase(getSkuCalculate.pending, () => {
        initialState;
      }),
      builer.addCase(
        getSkuCalculate.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.skuCalculateResponse = action.payload;
        },
      ),
      builer.addCase(getSkuCalculate.rejected, () => {
        initialState;
      });
  },
});

export const {
  saveBarcodeCalculateCriteria,
  saveSkuCalculateCriteria,
  updateRefresh,
  updateReload,
  clearCalculate,
} = stockAdjustCalculateSlice.actions;
export default stockAdjustCalculateSlice.reducer;
