import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import {
  TaxInvoiceRequest,
  TaxInvoiceResponse,
} from "../../models/tax-invoice-model";
import { stat } from "fs";
import { getInvoiceList } from "../../mockdata/sale";

type State = {
  taxInvoiceList: TaxInvoiceResponse;
  payloadSearchList: TaxInvoiceRequest;
  error: string;
};

const initialState: State = {
  taxInvoiceList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    perPage: 0,
    page: 0,
  },
  error: "",
  payloadSearchList: {},
};

const payloadSearchList: TaxInvoiceRequest = {
  limit: "",
  page: "",
  docNo: "",
};

export const featchTaxInvoiceListAsync = createAsyncThunk(
  "TaxInvoiceList",
  async (payload: TaxInvoiceRequest) => {
    try {
      const apiRootPath = environment.sale.taxInvoice.search.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;
      if (payload.docNo) {
        path = path + `&docNo=${payload.docNo}`;
      }
      if (payload.citizenId) {
        path = path + `&citizenId=${payload.citizenId}`;
      }

      let response = await get(path).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const taxInvoiceListSlice = createSlice({
  name: "taxInvoiceList",
  initialState,
  reducers: {
    savePayloadSearchList: (state, action: PayloadAction<any>) => {
      state.payloadSearchList = action.payload;
    },
    saveTaxInvoiceList: (state, action: PayloadAction<any>) => {
      let resposeData = [];
      resposeData.push(action.payload.data);
      state.taxInvoiceList = {
        data: resposeData,
        ref: "",
        code: 0,
        message: "",
        total: 1,
        perPage: 10,
        page: 1,
      };
    },
    saveTaxInvoiceListIsFailed: (state, action: PayloadAction<any>) => {
      state.taxInvoiceList = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        perPage: 0,
        page: 0,
      };
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchTaxInvoiceListAsync.pending, (state, action) => {
      state.taxInvoiceList = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        perPage: 0,
        page: 0,
      };
    }),
      builer.addCase(
        featchTaxInvoiceListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.taxInvoiceList = action.payload;
        },
      ),
      builer.addCase(featchTaxInvoiceListAsync.rejected, (state, action) => {
        state.taxInvoiceList = {
          ref: "",
          code: 0,
          message: "",
          data: [],
          total: 0,
          perPage: 0,
          page: 0,
        };
      });
  },
});

export const {
  savePayloadSearchList,
  saveTaxInvoiceList,
  saveTaxInvoiceListIsFailed,
} = taxInvoiceListSlice.actions;
export default taxInvoiceListSlice.reducer;
