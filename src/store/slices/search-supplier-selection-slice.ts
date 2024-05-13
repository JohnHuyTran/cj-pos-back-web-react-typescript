import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { SupplierSearchResponse } from "../../models/supplier-search-model";
import { Supplier } from "../../mockdata/supplier";

type State = {
  supplierResp: SupplierSearchResponse;
  error: string;
};

const initialState: State = {
  supplierResp: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const searchSupplierAsync = createAsyncThunk(
  "supplierSearch",
  async (keyword: string) => {
    try {
      const apiRootPath = `${environment.purchase.supplierOrder.searchSupplier.url}?query=${keyword}`;
      let response: SupplierSearchResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
      };

      response = await get(apiRootPath).then();
      // response = Supplier;
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const searchSupplierSlice = createSlice({
  name: "supplierSearch",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(searchSupplierAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        searchSupplierAsync.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          if (payload && payload.data && payload.data.length > 0) {
            const rows = payload.data.slice(0, 20);

            const data = {
              timestamp: payload.timestamp,
              ref: payload.ref,
              code: payload.code,
              message: payload.message,
              data: rows,
            };

            state.supplierResp = data;
          } else {
            state.supplierResp = payload;
          }
        },
      ),
      builer.addCase(searchSupplierAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = searchSupplierSlice.actions;
export default searchSupplierSlice.reducer;
