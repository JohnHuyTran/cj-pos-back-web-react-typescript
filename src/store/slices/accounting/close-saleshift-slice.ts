import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { environment } from "../../../environment-base";
import { featchCloseSaleShiftRsMockup } from "../../../mockdata/branch-accounting";
import {
  CloseSaleShiftRequest,
  CloseSaleShiftResponse,
  ExternalIncomeItemInfo,
} from "../../../models/branch-accounting-model";

type State = {
  closeSaleShift: CloseSaleShiftResponse;
  error: "";
  payloadSearch: CloseSaleShiftRequest;
};

const initialState: State = {
  closeSaleShift: {
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
  payloadSearch: {
    shiftDate: "",
    branchCode: "",
    status: "",
    page: 0,
    limit: 0,
  },
};

export const featchCloseSaleShiptListAsync = createAsyncThunk(
  "closeSaleShipList",
  async (payload: CloseSaleShiftRequest) => {
    try {
      const apiRootPath =
        environment.branchAccounting.closeSaleShift.search.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}&shiftDate=${payload.shiftDate}`;
      if (payload.status !== "ALL") {
        path += `&status=${payload.status}`;
      }
      if (payload.branchCode != "") {
        path += `&branchCode=${payload.branchCode}`;
      }
      if (payload.bypassStatus != "ALL") {
        path += `&bypassStatus=${payload.bypassStatus}`;
      }

      return await get(path).then();
      // return featchCloseSaleShiftRsMockup();
    } catch (error) {
      throw error;
    }
  },
);

const closeSaleShiftSlice = createSlice({
  name: "CloseSaleShipList",
  initialState,
  reducers: {
    clearCloseSaleShiftList: (state, action: PayloadAction<any>) => {
      initialState;
    },
    savePayloadSearch: (state, action: PayloadAction<any>) => {
      state.payloadSearch = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchCloseSaleShiptListAsync.pending, (state, action) => {
      initialState;
    }),
      builer.addCase(
        featchCloseSaleShiptListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.closeSaleShift = action.payload;
        },
      ),
      builer.addCase(
        featchCloseSaleShiptListAsync.rejected,
        (state, action) => {
          initialState;
        },
      );
  },
});
export const { clearCloseSaleShiftList, savePayloadSearch } =
  closeSaleShiftSlice.actions;
export default closeSaleShiftSlice.reducer;
