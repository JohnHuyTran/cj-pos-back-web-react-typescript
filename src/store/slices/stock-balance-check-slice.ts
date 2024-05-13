import { createSlice } from "@reduxjs/toolkit";

type ItemsState = {
  checkStock: any;
};
const initialState: ItemsState = {
  checkStock: [],
};

const stockBalanceCheckSlice = createSlice({
  name: "stockBalanceCheckSlice",
  initialState,
  reducers: {
    updateCheckStock: (state, action: any) => {
      state.checkStock = action.payload;
    },
  },
});
export const { updateCheckStock } = stockBalanceCheckSlice.actions;
export default stockBalanceCheckSlice.reducer;
