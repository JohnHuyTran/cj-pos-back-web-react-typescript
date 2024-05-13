import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import {
  TaxInvoiceDetailResponse,
  TaxInvoiceRequest,
} from "../../models/tax-invoice-model";
import { getPathInvoiceDetail } from "../../services/sale";
import { getInvoiceDetail } from "../../mockdata/sale";

type State = {
  detail: TaxInvoiceDetailResponse;
  error: string;
};

const initialState: State = {
  detail: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
};

export const featchTaxInvoiceDetailAsync = createAsyncThunk(
  "TaxInvoiceDetail",
  async (payload: TaxInvoiceRequest) => {
    try {
      const billNo = String(payload.docNo);
      const apiRootPath = getPathInvoiceDetail(billNo);

      let response: TaxInvoiceDetailResponse = {
        ref: "",
        code: 0,
        message: "",
        data: null,
      };

      await get(apiRootPath)
        .then((value) => {
          response = value;
        })
        .catch((error: any) => {
          console.log("response error :", JSON.stringify(error));
        });

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const taxInvoiceDetailSlice = createSlice({
  name: "taxInvoiceDetail",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchTaxInvoiceDetailAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchTaxInvoiceDetailAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.detail = action.payload;
        },
      ),
      builer.addCase(featchTaxInvoiceDetailAsync.rejected, () => {
        initialState;
      });
  },
});

export default taxInvoiceDetailSlice.reducer;
