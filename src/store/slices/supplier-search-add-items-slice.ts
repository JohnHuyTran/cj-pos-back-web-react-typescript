import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SupplierItem } from "../../mockdata/supplier-items";

type SupplierItemsState = {
  state: any;
};

const initialState: SupplierItemsState = {
  state: {},
};

export const SupplierSearchAddItemsSlice = createSlice({
  name: "supplierSearchAddItems",
  initialState,
  reducers: {
    updateSearchItemsState: (state, action: PayloadAction<any>) => {
      // console.log('payload: ', JSON.stringify(action.payload));
      state.state = action.payload;
    },
    // deleteSearchItemsState: (state, action) => {
    //   console.log(`action.payload = ${action.payload}`); // returns correct id

    //   state.state.filter((arrow) => arrow.barcode !== action.payload);
    // },
  },
});

export const { updateSearchItemsState } = SupplierSearchAddItemsSlice.actions;

export default SupplierSearchAddItemsSlice.reducer;
