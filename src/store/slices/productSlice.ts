import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppDispatch } from "../../store/store";
import { ItemProduct, ItemProductRequest } from "../../models/product-model";
import { get, deleteData, post } from "../../adapters/posback-adapter";
import { environment } from "../../environment-base";

type productListState = {
  item: ItemProduct[];
  totalPage: number;
  loading: boolean;
  error: string;
};

const initialState: productListState = {
  item: [],
  totalPage: 0,
  loading: false,
  error: "",
};

export const fetchGetProductList = createAsyncThunk(
  "getProductlist",
  async () => {
    try {
      const response: ItemProductRequest = await get(
        environment.product.url,
      ).then((result) => result);
      return response;
    } catch (error) {
      console.log("error = ", error);
      throw error;
    }
  },
);

export const fetchCreateProduct = createAsyncThunk(
  "createProductlist",
  async (data: ItemProductRequest) => {
    try {
      const response: ItemProduct = await post(
        environment.product.url,
        data,
      ).then((result) => result);
      return response;
    } catch (error) {
      console.log("error = ", error);
      throw error;
    }
  },
);

export const fetchDeleteItemById = createAsyncThunk(
  "deleteItem",
  async (id: number) => {
    try {
      const response: number = await deleteData(
        environment.product.url + "/" + id,
      ).then((result) => result.code);
      // if (response === 20100) {
      //   console.log("code 20100");
      //   return response;
      // } else if (response === 40002) {
      //   console.log("code 40002");
      //   return response;
      // }
      return response;
    } catch (error) {
      console.log("error===", error);
      throw error;
    }
  },
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    deleteItemAction: (state, action: PayloadAction<any>) => {
      state.item.filter((item) => item.id !== action.payload);
      console.log("reducers delete item");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGetProductList.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(
      fetchGetProductList.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.item = action.payload.data;
        state.totalPage = action.payload.totalPage;
        state.loading = false;
        state.error = "";
      },
    );
    builder.addCase(fetchGetProductList.rejected, (state, action) => {
      state.item = [];
      state.loading = false;
      state.error = action.error.message || "";
    });
  },
});

export const { deleteItemAction } = productSlice.actions;

export default productSlice.reducer;
