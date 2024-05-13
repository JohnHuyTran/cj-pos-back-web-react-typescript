import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuditHistorySearchRequest } from "../../models/audit-history-model";

type State = {
  searchCriteria: AuditHistorySearchRequest;
};

const initialState: State = {
  searchCriteria: {
    perPage: "10",
    page: "1",
    docNo: "",
    skuCodes: "",
    branch: "",
    type: "",
    creationDateFrom: "",
    creationDateTo: "",
  },
};

const auditHistoryCriteriaSearchSlice = createSlice({
  name: "auditHistoryCriteriaSearchSlice",
  initialState,
  reducers: {
    saveSearchCriteriaAH: (state, action: PayloadAction<any>) => {
      state.searchCriteria = action.payload;
    },
  },
});

export const { saveSearchCriteriaAH } = auditHistoryCriteriaSearchSlice.actions;
export default auditHistoryCriteriaSearchSlice.reducer;
