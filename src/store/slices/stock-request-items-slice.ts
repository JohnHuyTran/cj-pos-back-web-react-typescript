import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
};

const initialState: ItemsState = {
  state: {},
};

export const stockRequestItemsSlice = createSlice({
  name: "stockRequestItems",
  initialState,
  reducers: {
    updatestockRequestItemsState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
  },
});

export const { updatestockRequestItemsState } = stockRequestItemsSlice.actions;

export default stockRequestItemsSlice.reducer;
