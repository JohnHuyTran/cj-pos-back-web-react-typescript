import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
};

const initialState: ItemsState = {
  state: {},
};

export const itemsToteSlice = createSlice({
  name: "itemsTote",
  initialState,
  reducers: {
    updateItemsToteState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
  },
});

export const { updateItemsToteState } = itemsToteSlice.actions;

export default itemsToteSlice.reducer;
