import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
};

const initialState: ItemsState = {
  state: [],
};

export const addToDestroyProductSlice = createSlice({
  name: "addToDestroyProductSlice",
  initialState,
  reducers: {
    updateAddDestroyProductState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
  },
});

export const { updateAddDestroyProductState } =
  addToDestroyProductSlice.actions;

export default addToDestroyProductSlice.reducer;
