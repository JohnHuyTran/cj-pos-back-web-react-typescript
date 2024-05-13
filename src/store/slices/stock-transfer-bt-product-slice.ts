import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
};

const initialState: ItemsState = {
  state: {},
};

export const updateBTProductSlice = createSlice({
  name: "updateBTSKU",
  initialState,
  reducers: {
    updateAddItemsGroupState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
  },
});

export const { updateAddItemsGroupState } = updateBTProductSlice.actions;

export default updateBTProductSlice.reducer;
