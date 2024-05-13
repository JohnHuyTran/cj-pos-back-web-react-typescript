import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UploadFileState = {
  state: any;
};

const initialState: UploadFileState = {
  state: [],
};

export const toDestroyDiscountAttachAfterSlice = createSlice({
  name: "toDestroyDiscountAttachAfterSlice",
  initialState,
  reducers: {
    uploadFileAfterState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
    clearUploadFileState: () => {
      initialState;
    },
  },
});

export const { uploadFileAfterState, clearUploadFileState } =
  toDestroyDiscountAttachAfterSlice.actions;

export default toDestroyDiscountAttachAfterSlice.reducer;
