import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorDetail } from "../../models/api-error-model";

type ItemsState = {
  state: any;
  errorLists: any;
};

const initialState: ItemsState = {
  state: {},
  errorLists: {},
};

export const AddItemsSlice = createSlice({
  name: "addItems",
  initialState,
  reducers: {
    updateAddItemsState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
    updateErrorList: (state, action: PayloadAction<any>) => {
      state.errorLists = action.payload;
    },
  },
});

export const { updateAddItemsState, updateErrorList } = AddItemsSlice.actions;

export default AddItemsSlice.reducer;
