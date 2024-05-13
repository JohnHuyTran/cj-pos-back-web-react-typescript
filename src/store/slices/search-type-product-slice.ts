import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get, post } from "../../adapters/posback-adapter";
import {
  ItemsResponse,
  PayloadSearchProduct,
  ProductTypeResponse,
} from "../../models/modal-add-all-items-model";
import {
  FindProductProps,
  FindProductRequest,
} from "../../models/product-model";
import { ContentType } from "../../utils/enum/common-enum";

type State = {
  itemList: ItemsResponse;
  productTypeList: ProductTypeResponse;
  productByTypeList: ItemsResponse;
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
  productTypeList: {
    timestamp: "",
    ref: "",
    code: 0,
    message: "",
    error_details: "",
    data: [],
  },
  productByTypeList: {
    timestamp: "",
    ref: "",
    code: 0,
    message: "",
    error_details: "",
    data: [],
  },
  error: "",
};

export const searchAllProductAsync = createAsyncThunk(
  "searchAllProductAsync",
  async (payloadSearchProduct: PayloadSearchProduct) => {
    try {
      const path = `${environment.products.addItem.allitemsList.url}/${payloadSearchProduct.search}?limit=10`;
      let response = await post(path, {
        productTypeCodes: payloadSearchProduct.productTypeCodes,
        skuTypes: payloadSearchProduct.skuTypes,
        isSellable: true,
      }).then();

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

export const newSearchAllProductAsync = createAsyncThunk(
  "searchAllProductAsync",
  async (payload: FindProductProps) => {
    try {
      const path = `${environment.products.addItem.allitemsList.url}/${payload.search}?limit=10`;
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

export const searchAllProductTypeAsync = createAsyncThunk(
  "searchAllProductTypeAsync",
  async (search: string) => {
    try {
      const path = `${environment.products.type.search.url}/${search}?limit=10`;
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

export const getAllProductByType = createAsyncThunk(
  "getAllProductByType",
  async (productTypeCode: string) => {
    try {
      const path = `${environment.products.type.productByType.url}?product-type=${productTypeCode}`;
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

const searchTypeAndProduct = createSlice({
  name: "searchTypeAndProduct",
  initialState,
  reducers: {
    clearSearchAllProductAsync: (state, action: PayloadAction<any>) => {
      state.itemList = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(searchAllProductAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        searchAllProductAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.itemList = action.payload;
        },
      ),
      builer.addCase(searchAllProductAsync.rejected, () => {
        initialState;
      }),
      builer.addCase(searchAllProductTypeAsync.pending, () => {
        initialState;
      }),
      builer.addCase(
        searchAllProductTypeAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.productTypeList = action.payload;
        },
      ),
      builer.addCase(searchAllProductTypeAsync.rejected, () => {
        initialState;
      }),
      builer.addCase(getAllProductByType.pending, () => {
        initialState;
      }),
      builer.addCase(
        getAllProductByType.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.productByTypeList = action.payload;
        },
      ),
      builer.addCase(getAllProductByType.rejected, () => {
        initialState;
      });
  },
});

export const { clearSearchAllProductAsync } = searchTypeAndProduct.actions;
export default searchTypeAndProduct.reducer;
