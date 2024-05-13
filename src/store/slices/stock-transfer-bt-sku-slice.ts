import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
};

const initialState: ItemsState = {
  state: {},
};

export const updateBTSkuSlice = createSlice({
  name: "updateBTSKU",
  initialState,
  reducers: {
    updateAddItemSkuGroupState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
  },
});

export const { updateAddItemSkuGroupState } = updateBTSkuSlice.actions;

export default updateBTSkuSlice.reducer;
