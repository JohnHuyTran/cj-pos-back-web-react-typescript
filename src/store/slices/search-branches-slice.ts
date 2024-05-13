import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { BranchResponse } from "../../models/search-branch-model";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";

type State = {
  branchList: BranchResponse;
  error: string;
};

const initialState: State = {
  branchList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchBranchListAsync = createAsyncThunk(
  "BranchList",
  async () => {
    try {
      const path = environment.master.branch.allBranch.url;

      let response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const searchBranchSlice = createSlice({
  name: "searchBranch",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchBranchListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchBranchListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.branchList = action.payload;
        },
      ),
      builer.addCase(featchBranchListAsync.rejected, () => {
        initialState;
      });
  },
});

// export const { clearDataFilter } = dcCheckOrderSlice.actions;
export default searchBranchSlice.reducer;
