import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NavState = {
  state: boolean;
};

const initialState: NavState = {
  state: true,
};

export const navSlice = createSlice({
  name: "navigate",
  initialState,
  reducers: {
    changeState: (state, action: PayloadAction<boolean>) => {
      state.state = action.payload;
    },
  },
});

export const { changeState } = navSlice.actions;

export default navSlice.reducer;
