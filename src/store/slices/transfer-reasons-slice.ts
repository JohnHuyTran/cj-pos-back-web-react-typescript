import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { TransferReasonsResponse } from "../../models/transfer-reasons-model";

type State = {
  reasonsList: TransferReasonsResponse;
  error: string;
};

const initialState: State = {
  reasonsList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchTransferReasonsListAsync = createAsyncThunk(
  "TransferReasonsList",
  async () => {
    try {
      const path = environment.stock.transferReasonsList.url;
      let response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const transferReasonsSlice = createSlice({
  name: "searchBranch",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchTransferReasonsListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchTransferReasonsListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.reasonsList = action.payload;
        },
      ),
      builer.addCase(featchTransferReasonsListAsync.rejected, () => {
        initialState;
      });
  },
});

export default transferReasonsSlice.reducer;
