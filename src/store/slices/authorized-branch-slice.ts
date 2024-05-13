import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthorizedBranchResponse } from "../../models/search-branch-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  branchList: AuthorizedBranchResponse;
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

export const featchAuthorizedBranchListAsync = createAsyncThunk(
  "authorizedBranch",
  async () => {
    try {
      const path = environment.authority.authorizedBranch.url;

      let response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const authorizedhBranchSlice = createSlice({
  name: "authorizedBranch",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchAuthorizedBranchListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchAuthorizedBranchListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.branchList = action.payload;
        },
      ),
      builer.addCase(featchAuthorizedBranchListAsync.rejected, () => {
        initialState;
      });
  },
});

// export const { clearDataFilter } = dcCheckOrderSlice.actions;
export default authorizedhBranchSlice.reducer;
