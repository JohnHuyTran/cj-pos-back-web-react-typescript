import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StockCountSearchRequest } from "../../models/stock-count-model";

type State = {
  searchCriteria: StockCountSearchRequest;
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

const stockCountCriteriaSearchSlice = createSlice({
  name: "stockCountCriteriaSearchSlice",
  initialState,
  reducers: {
    saveSearchCriteriaSC: (state, action: PayloadAction<any>) => {
      state.searchCriteria = action.payload;
    },
  },
});

export const { saveSearchCriteriaSC } = stockCountCriteriaSearchSlice.actions;
export default stockCountCriteriaSearchSlice.reducer;
