import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../../../environment-base";
import { get } from "../../../../adapters/posback-adapter";
import {
  CashStatementSearchRequest,
  CashStatementSearchResponse,
} from "models/branch-accounting-model";

type State = {
  cashStatementList: CashStatementSearchResponse;
  error: string;
};

const initialState: State = {
  cashStatementList: {
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

export const featchSearchCashStatementAsync = createAsyncThunk(
  "searchCashStatementList",
  async (payload: CashStatementSearchRequest) => {
    try {
      const apiRootPath = environment.branchAccounting.cashStatement.search.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;

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

      let response: CashStatementSearchResponse = {
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

const searchCashStatementSlice = createSlice({
  name: "searchCashStatement",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchSearchCashStatementAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSearchCashStatementAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.cashStatementList = action.payload;
        },
      ),
      builer.addCase(featchSearchCashStatementAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = searchCashStatementSlice.actions;
export default searchCashStatementSlice.reducer;
