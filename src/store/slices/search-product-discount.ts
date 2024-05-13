import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { ItemsResponse } from "../../models/modal-add-all-items-model";

type State = {
  itemList: ItemsResponse;
  error: string;
};

const initialState: State = {
  itemList: {
    timestamp: "",
    ref: "",
    code: 0,
    message: "",
    error_details: "",
    data: [],
  },
  error: "",
};

export const searchProductDiscount = createAsyncThunk(
  "searchProductDiscount",
  async () => {
    try {
      const path = environment.withDraw.transferOut.getExpiredProduct.url;
      let response = await get(path).then();

      if (response === 200) {
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

const searchProductDiscountSlice = createSlice({
  name: "searchProductDiscountSlice",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(searchProductDiscount.pending, () => {
      initialState;
    }),
      builer.addCase(
        searchProductDiscount.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.itemList = action.payload;
        },
      ),
      builer.addCase(searchProductDiscount.rejected, () => {
        initialState;
      });
  },
});

export default searchProductDiscountSlice.reducer;
