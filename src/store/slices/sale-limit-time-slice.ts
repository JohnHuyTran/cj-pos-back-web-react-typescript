import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ItemsState = {
  state: any;
  checkEdit: boolean;
  productList: string;
};

const initialState: ItemsState = {
  state: {},
  checkEdit: false,
  productList: "รายการสินค้าทั้งหมด",
};

export const saleLimitTime = createSlice({
  name: "saleLimitTime",
  initialState,
  reducers: {
    updatesaleLimitTimeState: (state, action: PayloadAction<any>) => {
      state.state = action.payload;
    },
    setCheckEdit: (state, action) => {
      state.checkEdit = action.payload;
    },
    setProductList: (state, action) => {
      state.productList = action.payload;
    },
  },
});

export const { updatesaleLimitTimeState, setCheckEdit, setProductList } =
  saleLimitTime.actions;

export default saleLimitTime.reducer;
