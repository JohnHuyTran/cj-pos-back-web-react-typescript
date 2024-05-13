import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get, post } from "../../adapters/posback-adapter";
import { ItemsResponse } from "../../models/modal-add-all-items-model";
import { ContentType } from "../../utils/enum/common-enum";
import {
  FindProductProps,
  FindProductRequest,
} from "../../models/product-model";

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

export const featchAllItemsListAsync = createAsyncThunk(
  "SearchAllItemsList",
  async (payload: FindProductProps) => {
    try {
      const path = `${environment.products.addItem.allitemsList.url}/${payload.search}?limit=10`;
      // const body = { ...payload.payload, skuTypes: [2], isSellable: true };
      const body = { ...payload.payload };
      let response = await post(path, body, ContentType.JSON).then();

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
  name: "allItemList",
  initialState,
  reducers: {
    updateItemList: (state, action: PayloadAction<any>) => {
      state.itemList = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchAllItemsListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchAllItemsListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.itemList = action.payload;
        },
      ),
      builer.addCase(featchAllItemsListAsync.rejected, () => {
        initialState;
      });
  },
});
export const { updateItemList } = searchItemBySupSlice.actions;
export default searchItemBySupSlice.reducer;
