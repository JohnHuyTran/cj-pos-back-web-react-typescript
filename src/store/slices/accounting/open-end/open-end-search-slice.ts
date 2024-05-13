import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../../../environment-base";
import { get } from "../../../../adapters/posback-adapter";
import {
  OpenEndSearchResponse,
  OpenEndSearchRequest,
} from "models/branch-accounting-model";

type State = {
  openEndSearchList: OpenEndSearchResponse;
  error: string;
  payloadOpenEndSearch: OpenEndSearchRequest;
};

const initialState: State = {
  openEndSearchList: {
    timestamp: "",
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
  payloadOpenEndSearch: {
    limit: "10",
    page: "1",
    status: "",
    branchCode: "",
    dateFrom: "",
    dateTo: "",
  },
};

export const featchSearchOpenEndAsync = createAsyncThunk(
  "searchOpenEndList",
  async (payload: OpenEndSearchRequest) => {
    try {
      const apiRootPath = environment.branchAccounting.openEnd.search.url;
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

      let response: OpenEndSearchResponse = {
        timestamp: "",
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

      response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const searchOpenEndSlice = createSlice({
  name: "searchOpenEnd",
  initialState,
  reducers: {
    clearOpenEndSearchList: (state, action: PayloadAction<any>) => {
      initialState;
    },
    savePayloadSearch: (state, action: PayloadAction<any>) => {
      state.payloadOpenEndSearch = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchSearchOpenEndAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSearchOpenEndAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.openEndSearchList = action.payload;
        },
      ),
      builer.addCase(featchSearchOpenEndAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearOpenEndSearchList, savePayloadSearch } =
  searchOpenEndSlice.actions;
export default searchOpenEndSlice.reducer;
