import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StockTransferRequest } from "../../models/stock-transfer-model";

type State = {
  searchStockTransferRt: StockTransferRequest;
};

const initialState: State = {
  searchStockTransferRt: {
    limit: "10",
    page: "1",
    docNo: "",
    branchFrom: "",
    branchTo: "",
    dateFrom: "",
    dateTo: "",
    statuses: "",
    transferReason: "",
  },
};

const saveSearchStockRt = createSlice({
  name: "searchStockTransferRt",
  initialState,
  reducers: {
    saveSearchStockTransferRt: (state, action: PayloadAction<any>) => {
      state.searchStockTransferRt = action.payload;
    },
    clearSearchStockTransferRt: () => {
      initialState;
    },
  },
});

export const { saveSearchStockTransferRt, clearSearchStockTransferRt } =
  saveSearchStockRt.actions;
export default saveSearchStockRt.reducer;
