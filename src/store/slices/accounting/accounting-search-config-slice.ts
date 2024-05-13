import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ExpenseSearchCofigRequest,
  ExpenseSearchCofigResponse,
} from "../../../models/branch-accounting-model";
import { environment } from "../../../environment-base";
import { get } from "../../../adapters/posback-adapter";

type State = {
  branchAccountingConfigList: ExpenseSearchCofigResponse;
  error: string;
};

const initialState: State = {
  branchAccountingConfigList: {
    ref: "",
    timestamp: "",
    prev: 0,
    next: 0,
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

export const featchBranchAccountingConfigListAsync = createAsyncThunk(
  "ExpenseSearchRequest",
  async (payload: ExpenseSearchCofigRequest) => {
    try {
      const apiRootPath = environment.branchAccounting.expense.searchConfig.url;
      let path = `${apiRootPath}?limit=${payload.limit}&page=${payload.page}`;

      if (payload.type !== "ALL") {
        path = `${path}&type=${payload.type}`;
      }
      if (payload.isActive !== "ALL") {
        path = `${path}&isActive=${payload.isActive}`;
      }
      let response: ExpenseSearchCofigResponse = {
        ref: "",
        timestamp: "",
        prev: 0,
        next: 0,
        code: 0,
        message: "",
        data: [],
        total: 0,
        page: 0,
        perPage: 0,
        totalPage: 0,
      };
      response = await get(path).then();
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const searchBranchAccountingConfigSlice = createSlice({
  name: "searchBranchAccountingConfig",
  initialState,
  reducers: {
    clearDataSearchBranchAccountingConfig: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(featchBranchAccountingConfigListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchBranchAccountingConfigListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.branchAccountingConfigList = action.payload;
        },
      ),
      builer.addCase(featchBranchAccountingConfigListAsync.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataSearchBranchAccountingConfig } =
  searchBranchAccountingConfigSlice.actions;
export default searchBranchAccountingConfigSlice.reducer;
