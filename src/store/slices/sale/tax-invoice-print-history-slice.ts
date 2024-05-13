import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { TaxInvoicePrintHistoryResponse } from "../../../models/tax-invoice-model";
import { getPathInvoicePrintHistory } from "../../../services/sale";

type State = {
  detail: TaxInvoicePrintHistoryResponse;
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

export const featchTaxInvoicePrintHistoryAsync = createAsyncThunk(
  "TaxInvoicePrintHistory",
  async (billNo: string) => {
    try {
      const apiRootPath = getPathInvoicePrintHistory(billNo);

      let response: TaxInvoicePrintHistoryResponse = {
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

const taxInvoicePrintHistorySlice = createSlice({
  name: "taxInvoicePrintHistory",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchTaxInvoicePrintHistoryAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchTaxInvoicePrintHistoryAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.detail = action.payload;
        },
      ),
      builer.addCase(featchTaxInvoicePrintHistoryAsync.rejected, () => {
        initialState;
      });
  },
});

export default taxInvoicePrintHistorySlice.reducer;
