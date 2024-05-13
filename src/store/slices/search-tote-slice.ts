import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ToteRequest, ToteResponse } from "../../models/order-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  tote: ToteResponse;
  error: string;
};

const initialState: State = {
  tote: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
};

export const searchToteAsync = createAsyncThunk(
  "toteData",
  async (payload?: ToteRequest) => {
    try {
      let toteCode = payload ? payload.toteCode : "";
      let docRefNo = payload ? payload.docRefNo : "";

      let path = environment.orders.tote.searchTote.url;
      if (docRefNo && toteCode) {
        path = path + docRefNo + "/" + toteCode;
      }

      // console.log('path : ', path);
      let response: ToteResponse = {
        ref: "",
        code: 0,
        message: "",
        data: null,
      };
      if (payload) {
        return (response = await get(path).then());
      } else {
        return response;
      }
    } catch (error) {
      throw error;
    }
  },
);

const searchToteSlice = createSlice({
  name: "searchTote",
  initialState,
  reducers: {
    clearDataFilter: () => {
      initialState;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(searchToteAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        searchToteAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.tote = action.payload;
        },
      ),
      builer.addCase(searchToteAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = searchToteSlice.actions;
export default searchToteSlice.reducer;
