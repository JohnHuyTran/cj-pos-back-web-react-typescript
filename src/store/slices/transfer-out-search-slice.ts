import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { stringNullOrEmpty } from "../../utils/utils";
import {
  TransferOutSearchRequest,
  TransferOutSearchResponse,
} from "../../models/transfer-out-model";

type State = {
  toSearchResponse: TransferOutSearchResponse;
  error: string;
};

const initialState: State = {
  toSearchResponse: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 0,
    perPage: 0,
    totalPage: 0,
  },
  error: "",
};

export const transferOutGetSearch = createAsyncThunk(
  "transferOutGetSearch",
  async (payload: TransferOutSearchRequest) => {
    try {
      const apiRootPath = environment.withDraw.transferOut.search.url;
      let path = `${apiRootPath}?perPage=${payload.perPage}&page=${payload.page}`;
      if (!stringNullOrEmpty(payload.query)) {
        path = path + `&query=${payload.query}`;
      }
      if (!stringNullOrEmpty(payload.branch) && "ALL" !== payload.branch) {
        path = path + `&branches=${payload.branch}`;
      }
      if (!stringNullOrEmpty(payload.status) && "ALL" !== payload.status) {
        path = path + `&status=${payload.status}`;
      }
      if (!stringNullOrEmpty(payload.startDate)) {
        path = path + `&startDate=${payload.startDate}`;
      }
      if (!stringNullOrEmpty(payload.endDate)) {
        path = path + `&endDate=${payload.endDate}`;
      }
      if (!stringNullOrEmpty(payload.type)) {
        path = path + `&type=${payload.type}`;
      }
      let response: TransferOutSearchResponse = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        page: 0,
        perPage: 0,
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

const TransferOutSearchSlice = createSlice({
  name: "TransferOutSearchSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(transferOutGetSearch.pending, () => {
      initialState;
    }),
      builer.addCase(
        transferOutGetSearch.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.toSearchResponse = action.payload;
        },
      ),
      builer.addCase(transferOutGetSearch.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = TransferOutSearchSlice.actions;
export default TransferOutSearchSlice.reducer;
