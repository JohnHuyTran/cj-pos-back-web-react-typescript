import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ItemBySupplierCodeResponse } from "../../../models/modal-add-item-model";
import { get } from "../../../adapters/posback-adapter";
import { getProductBySupplierCode } from "../../../services/product-master";

type State = {
  itemList: ItemBySupplierCodeResponse;
  error: string;
};

const initialState: State = {
  itemList: {
    timestamp: "",
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchItemBySupplierListAsync = createAsyncThunk(
  "ItemListBySupplier",
  async (SupplierCode: string) => {
    try {
      const path = `${getProductBySupplierCode(
        SupplierCode,
      )}?onlyAllowToBuy=true`;
      let response = await get(path).then();
      if (response === 204) {
        let responseCode: any = {
          ref: "",
          code: response,
          message: "",
          data: [],
        };
        return responseCode;
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const searchItemBySupSlice = createSlice({
  name: "ItemListBySupplier",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchItemBySupplierListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchItemBySupplierListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.itemList = action.payload;
        },
      ),
      builer.addCase(featchItemBySupplierListAsync.rejected, () => {
        initialState;
      });
  },
});

// export const { clearDataFilter } = dcCheckOrderSlice.actions;
export default searchItemBySupSlice.reducer;
