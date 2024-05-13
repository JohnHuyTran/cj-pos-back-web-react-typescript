import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { environment } from "../../../environment-base";
import { ReasonRejectResponseType } from "../../../models/dc-check-order-model";

type State = {
  reasonsList: ReasonRejectResponseType;
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

export const fetchVerifyOrderReasonsRejectListAsync = createAsyncThunk(
  "verifyOrderReasonsRejectList",
  async () => {
    try {
      const path = environment.master.reason.verifyOrder.disapprove.url;
      let response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const verifyReasonsRejectListSlice = createSlice({
  name: "verifyOrderReasonsRejectList",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(fetchVerifyOrderReasonsRejectListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        fetchVerifyOrderReasonsRejectListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.reasonsList = action.payload;
        },
      ),
      builer.addCase(fetchVerifyOrderReasonsRejectListAsync.rejected, () => {
        initialState;
      });
  },
});

export default verifyReasonsRejectListSlice.reducer;
