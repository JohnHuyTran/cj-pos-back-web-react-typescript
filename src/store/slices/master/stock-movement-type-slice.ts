import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get } from "../../../adapters/posback-adapter";
import { environment } from "../../../environment-base";
import { StockMovementMasterResponse } from "../../../models/stock-model";

type State = {
  masterStockMovementType: StockMovementMasterResponse;
  error: string;
};

const initialState: State = {
  masterStockMovementType: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchMasterStockMovementTypeListAsync = createAsyncThunk(
  "MasterStockMovementType",
  async () => {
    try {
      const path = environment.master.stock.movementType.url;

      let response = await get(path).then();

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const masterStockMovementTypeSlice = createSlice({
  name: "MasterStockMovementType",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchMasterStockMovementTypeListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchMasterStockMovementTypeListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.masterStockMovementType = action.payload;
        },
      ),
      builer.addCase(featchMasterStockMovementTypeListAsync.rejected, () => {
        initialState;
      });
  },
});

// export const { clearDataFilter } = dcCheckOrderSlice.actions;
export default masterStockMovementTypeSlice.reducer;
