import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UploadFileState = {
  state: any;
};

const initialState: UploadFileState = {
  state: [],
};

export const UploadFileSlice = createSlice({
  name: "uploadFileList",
  initialState,
  reducers: {
    uploadFileState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
    clearUploadFileState: () => {
      initialState;
    },
  },
});

export const { uploadFileState, clearUploadFileState } =
  UploadFileSlice.actions;

export default UploadFileSlice.reducer;
