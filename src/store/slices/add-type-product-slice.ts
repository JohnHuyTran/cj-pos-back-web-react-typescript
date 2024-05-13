import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
};

const initialState: ItemsState = {
  state: [],
};

export const addTypeAndProduct = createSlice({
  name: "addTypeAndProduct",
  initialState,
  reducers: {
    updateAddTypeAndProductState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
  },
});

export const { updateAddTypeAndProductState } = addTypeAndProduct.actions;

export default addTypeAndProduct.reducer;
