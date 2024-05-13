import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { TransferOutDetailResponse } from "../../models/transfer-out";

type State = {
  transferOutDetail: TransferOutDetailResponse;
  error: string;
};

const initialState: State = {
  transferOutDetail: {
    ref: "",
    code: 0,
    message: "",
    data: {},
  },
  error: "",
};

export const getTransferOutDetail = createAsyncThunk(
  "getTransferOutDetail",
  async (docNO: string) => {
    try {
      const apiRootPath = `${environment.withDraw.transferOut.detail.url}/${docNO}`;
      let response: TransferOutDetailResponse = {
        ref: "",
        code: 0,
        message: "",
        data: {},
      };
      response = await get(apiRootPath).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const transferOutDetailSlice = createSlice({
  name: "transferOutDetailSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getTransferOutDetail.pending, () => {
      initialState;
    }),
      builder.addCase(
        getTransferOutDetail.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.transferOutDetail = action.payload;
        },
      ),
      builder.addCase(getTransferOutDetail.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = transferOutDetailSlice.actions;
export default transferOutDetailSlice.reducer;
