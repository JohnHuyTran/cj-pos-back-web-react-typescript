import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import {
  PurchaseBranchSearchRequest,
  PurchaseBranchSearchrResponse,
} from "../../models/purchase-branch-request-model";

type State = {
  orderList: PurchaseBranchSearchrResponse;
  error: string;
};

const initialState: State = {
  orderList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 0,
    perPage: 0,
    prev: 0,
    next: 0,
    totalPage: 0,
  },
  error: "",
};

export const featchSearchPurchaseBranchRequestAsync = createAsyncThunk(
  "orderListBranch",
  async (payload: PurchaseBranchSearchRequest) => {
    try {
      const apiRootPath = environment.purchase.purchaseBranchRequest.search.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;
      if (payload.docNo) {
        path = path + `&docNo=${payload.docNo}`;
      }
      if (payload.branchCode) {
        path = path + `&branchCode=${payload.branchCode}`;
      }
      if (payload.dateFrom) {
        path = path + `&dateFrom=${payload.dateFrom}`;
      }
      if (payload.dateTo) {
        path = path + `&dateTo=${payload.dateTo}`;
      }
      if (payload.status !== "ALL") {
        path = path + `&status=${payload.status}`;
      }

      // console.log('path: ', path);
      // console.log('payload.clearSearch: ', payload.clearSearch);

      let response: PurchaseBranchSearchrResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        page: 0,
        perPage: 0,
        prev: 0,
        next: 0,
        totalPage: 0,
      };

      if (!payload.clearSearch) {
        response = await get(path).then();
      }

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const purchaseBranchRequestSlice = createSlice({
  name: "purchaseBranchRequest",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchSearchPurchaseBranchRequestAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSearchPurchaseBranchRequestAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.orderList = action.payload;
        },
      ),
      builer.addCase(featchSearchPurchaseBranchRequestAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = purchaseBranchRequestSlice.actions;
export default purchaseBranchRequestSlice.reducer;
