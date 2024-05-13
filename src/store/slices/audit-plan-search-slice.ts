import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { stringNullOrEmpty } from "../../utils/utils";
import { AuditPlanSearchRequest } from "../../models/audit-plan";

type State = {
  apSearchResponse: any;
  error: string;
};

const initialState: State = {
  apSearchResponse: {
    ref: "",
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

export const auditPlanGetSearch = createAsyncThunk(
  "auditPlanGetSearch",
  async (payload: AuditPlanSearchRequest) => {
    try {
      const apiRootPath = environment.checkStock.auditPlan.save.url;
      let path = `${apiRootPath}?perPage=${payload.perPage}&page=${payload.page}`;
      if (!stringNullOrEmpty(payload.docNo)) {
        path = path + `&docNo=${payload.docNo}`;
      }
      if (!stringNullOrEmpty(payload.branch) && "ALL" !== payload.branch) {
        path = path + `&branch=${payload.branch}`;
      }
      if (!stringNullOrEmpty(payload.status) && "ALL" !== payload.status) {
        path = path + `&status=${payload.status}`;
      }
      if (!stringNullOrEmpty(payload.creationDateFrom)) {
        path = path + `&creationDateFrom=${payload.creationDateFrom}`;
      }
      if (!stringNullOrEmpty(payload.creationDateTo)) {
        path = path + `&creationDateTo=${payload.creationDateTo}`;
      }
      let response = {
        ref: "",
        code: 0,
        message: "",
        data: [],
        total: 0,
        page: 0,
        perPage: 0,
        totalPage: 0,
      };
      if (!payload.clearSearch) {
        response = await get(path).then();
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const auditPlanSearchSlice = createSlice({
  name: "auditPlanSearch",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builer) => {
    builer.addCase(auditPlanGetSearch.pending, () => {
      initialState;
    }),
      builer.addCase(
        auditPlanGetSearch.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.apSearchResponse = action.payload;
        },
      ),
      builer.addCase(auditPlanGetSearch.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = auditPlanSearchSlice.actions;
export default auditPlanSearchSlice.reducer;
