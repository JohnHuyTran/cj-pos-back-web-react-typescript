import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { stat } from "fs";
import { get } from "../../../adapters/posback-adapter";
import { environment } from "../../../environment-base";
import { featchExpenseDetailAsyncMockup } from "../../../mockdata/branch-accounting";
import {
  ExpenseDetailResponseType,
  ExpenseMasterResponseType,
} from "../../../models/branch-accounting-model";
import { getPathExpenseDetail } from "../../../services/accounting";

type State = {
  expenseAccountDetail: ExpenseDetailResponseType;
  error: string;
  summaryRows: any;
  intialRows: any;
  itemRows: any;
  addNewItem: any;
  addSummaryItem: any;
  haveUpdateData: boolean;
};

const initialState: State = {
  expenseAccountDetail: {
    ref: "",
    code: 0,
    message: "",
    data: null,
  },
  error: "",
  summaryRows: [],
  intialRows: [],
  itemRows: [],
  addNewItem: null,
  addSummaryItem: null,
  haveUpdateData: false,
};

export const featchExpenseDetailAsync = createAsyncThunk(
  "ExpenseDetail",
  async (docNo: string) => {
    try {
      const path = getPathExpenseDetail(
        docNo,
        environment.branchAccounting.expense.detail.url,
      );
      return await get(path).then();

      // return featchExpenseDetailAsyncMockup();
    } catch (error) {
      throw error;
    }
  },
);

const expenseAccountDetailSlice = createSlice({
  name: "ExpenseDetail",
  initialState,
  reducers: {
    updateToInitialState: (state) => {
      state.expenseAccountDetail = {
        ref: "",
        code: 0,
        message: "",
        data: null,
      };
    },
    initialItems: (state, action: PayloadAction<any>) => {
      state.intialRows = action.payload;
    },
    addNewItem: (state, action: PayloadAction<any>) => {
      state.addNewItem = action.payload;
    },
    updateSummaryRows: (state, action: PayloadAction<any>) => {
      state.summaryRows = action.payload;
    },
    updateItemRows: (state, action: PayloadAction<any>) => {
      state.itemRows = action.payload;
    },
    addSummaryItem: (state, action: PayloadAction<any>) => {
      state.addSummaryItem = action.payload;
    },
    haveUpdateData: (state, action: PayloadAction<any>) => {
      state.haveUpdateData = action.payload;
    },
  },
  extraReducers: (builer) => {
    builer.addCase(featchExpenseDetailAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchExpenseDetailAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.expenseAccountDetail = action.payload;
        },
      ),
      builer.addCase(featchExpenseDetailAsync.rejected, () => {
        initialState;
      });
  },
});

export const {
  updateSummaryRows,
  updateItemRows,
  updateToInitialState,
  addNewItem,
  initialItems,
  addSummaryItem,
  haveUpdateData,
} = expenseAccountDetailSlice.actions;
export default expenseAccountDetailSlice.reducer;
