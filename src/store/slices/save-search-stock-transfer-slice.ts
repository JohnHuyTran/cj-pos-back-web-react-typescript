import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StockTransferRequest } from "../../models/stock-transfer-model";

type State = {
  searchStockTransfer: StockTransferRequest;
};

const initialState: State = {
  searchStockTransfer: {
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

const saveSearchStock = createSlice({
  name: "searchStockTransfer",
  initialState,
  reducers: {
    saveSearchStockTransfer: (state, action: PayloadAction<any>) => {
      state.searchStockTransfer = action.payload;
    },
    clearSearchStockTransfer: () => {
      initialState;
    },
  },
});

export const { saveSearchStockTransfer, clearSearchStockTransfer } =
  saveSearchStock.actions;
export default saveSearchStock.reducer;
