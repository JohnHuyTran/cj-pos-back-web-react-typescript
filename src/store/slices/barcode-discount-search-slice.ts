import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import {
  BarcodeDiscountSearchRequest,
  BarcodeDiscountSearchResponse,
} from "../../models/barcode-discount-model";
import { stringNullOrEmpty } from "../../utils/utils";

type State = {
  bdSearchResponse: BarcodeDiscountSearchResponse;
  error: string;
};

const initialState: State = {
  bdSearchResponse: {
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

export const barcodeDiscountSearch = createAsyncThunk(
  "barcodeDiscountSearch",
  async (payload: BarcodeDiscountSearchRequest) => {
    try {
      const apiRootPath = environment.sell.barcodeDiscount.search.url;
      let path = `${apiRootPath}?perPage=${payload.perPage}&page=${payload.page}`;
      if (!stringNullOrEmpty(payload.query)) {
        path = path + `&query=${payload.query}`;
      }
      if (!stringNullOrEmpty(payload.branch) && "ALL" !== payload.branch) {
        path = path + `&branch=${payload.branch}`;
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
      let response: BarcodeDiscountSearchResponse = {
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

const barcodeDiscountSearchSlice = createSlice({
  name: "supplierCheckOrder",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(barcodeDiscountSearch.pending, () => {
      initialState;
    }),
      builer.addCase(
        barcodeDiscountSearch.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.bdSearchResponse = action.payload;
        },
      ),
      builer.addCase(barcodeDiscountSearch.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = barcodeDiscountSearchSlice.actions;
export default barcodeDiscountSearchSlice.reducer;
