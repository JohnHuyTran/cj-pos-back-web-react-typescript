import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  SuperviseBranchRequest,
  SuperviseBranchResponse,
} from "../../../models/search-branch-model";
import { environment } from "../../../environment-base";
import { get } from "../../../adapters/posback-adapter";

type State = {
  branchList: SuperviseBranchResponse;
  error: string;
};

const initialState: State = {
  branchList: {
    ref: "",
    code: 0,
    message: "",
    data: null,
    timestamp: "",
  },
  error: "",
};

export const featchSuperviseBranchListAsync = createAsyncThunk(
  "superviseBranch",
  async (payload: SuperviseBranchRequest) => {
    try {
      const path = `${environment.authority.superviseBranch.url}/${payload.role}?branchCode=${payload.branchCode}&isDC=${payload.isDC}`;
      let response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const superviseBranchSlice = createSlice({
  name: "superviseBranch",
  initialState,
  reducers: {
    clearSuperviseBranchFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchSuperviseBranchListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchSuperviseBranchListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.branchList = action.payload;
        },
      ),
      builer.addCase(featchSuperviseBranchListAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearSuperviseBranchFilter } = superviseBranchSlice.actions;
export default superviseBranchSlice.reducer;
