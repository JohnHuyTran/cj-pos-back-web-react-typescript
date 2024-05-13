import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  BranchResponse,
  PayloadST,
} from "../../models/sale-limit-time-search-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  payloadST: PayloadST;
  responseST: BranchResponse;
};
const initialState: State = {
  payloadST: {
    perPage: "10",
    page: "1",
    query: "",
    branch: "",
    status: "",
    startDate: "",
    endDate: "",
  },
  responseST: {
    ref: "",
    code: 0,
    message: "",
    data: [],
    total: 0,
    page: 0,
    perPage: 0,
    totalPage: 0,
  },
};
export const fetchSaleLimitTimeListAsync = createAsyncThunk(
  "saleLimitTimeList",
  async (params: string) => {
    try {
      const path = `${environment.sell.saleLimitTime.save.url}?${params}`;

      let response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);
const saleLimitTimeSlice = createSlice({
  name: "saleLimitTimeSlice",
  initialState,
  reducers: {
    updatePayloadST: (state, action: PayloadAction<any>) => {
      state.payloadST = action.payload;
    },
    clearResponse: (state) => {
      state.responseST = initialState.responseST;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(fetchSaleLimitTimeListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        fetchSaleLimitTimeListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (action.payload.code == 20000) {
            state.responseST = action.payload;
          } else {
            state.responseST = initialState.responseST;
          }
        },
      ),
      builer.addCase(fetchSaleLimitTimeListAsync.rejected, () => {
        initialState;
      });
  },
});
export const { updatePayloadST, clearResponse } = saleLimitTimeSlice.actions;
export default saleLimitTimeSlice.reducer;
