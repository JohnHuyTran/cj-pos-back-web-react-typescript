import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransferOutSearchRequest } from "../../models/transfer-out-model";

type State = {
  searchCriteria: TransferOutSearchRequest;
};

const initialState: State = {
  searchCriteria: {
    perPage: "10",
    page: "1",
    query: "",
    branch: "",
    status: "",
    startDate: "",
    endDate: "",
  },
};

const transferOutCriteriaSearchSlice = createSlice({
  name: "transferOutCriteriaSearchSlice",
  initialState,
  reducers: {
    saveSearchCriteriaTO: (state, action: PayloadAction<any>) => {
      state.searchCriteria = action.payload;
    },
  },
});

export const { saveSearchCriteriaTO } = transferOutCriteriaSearchSlice.actions;
export default transferOutCriteriaSearchSlice.reducer;
