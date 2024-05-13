import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ShipmentRequest } from "../../models/order-model";

type State = {
  searchCriteria: ShipmentRequest;
};

const initialState: State = {
  searchCriteria: {
    limit: "",
    page: "",
    sortBy: "",
    sortDirection: "",
    paramQuery: "",
    sdNo: "",
    dateFrom: "",
    dateTo: "",
    sdStatus: "",
    sdType: -1,
  },
};

const saveSearchOrder = createSlice({
  name: "searchCriteria",
  initialState,
  reducers: {
    saveSearchCriteria: (state, action: PayloadAction<any>) => {
      state.searchCriteria = action.payload;
    },
    clearSearchCriteria: () => {
      initialState;
    },
  },
});

export const { saveSearchCriteria, clearSearchCriteria } =
  saveSearchOrder.actions;
export default saveSearchOrder.reducer;
