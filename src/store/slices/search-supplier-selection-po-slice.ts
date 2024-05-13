import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { SupplierPOResponse } from "../../models/supplier-po-model";
import { SupplierPO } from "../../mockdata/supplier-po";

type State = {
  supplierPOResp: SupplierPOResponse;
  error: string;
};

const initialState: State = {
  supplierPOResp: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const searchSupplierPOAsync = createAsyncThunk(
  "supplierPO",
  async (code: string) => {
    try {
      const apiRootPath = `${environment.purchase.supplierOrder.searchSupplierPO.url}/${code}`;
      let response: SupplierPOResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
      };

      response = await get(apiRootPath).then();
      // response = SupplierPO;
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const searchSupplierPOSlice = createSlice({
  name: "supplierPO",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(searchSupplierPOAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        searchSupplierPOAsync.fulfilled,
        (state, { payload }: PayloadAction<any>) => {
          state.supplierPOResp = payload;
        },
      ),
      builer.addCase(searchSupplierPOAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = searchSupplierPOSlice.actions;
export default searchSupplierPOSlice.reducer;
