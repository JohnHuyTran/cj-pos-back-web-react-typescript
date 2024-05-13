import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../environment-base";
import { get } from "../../adapters/posback-adapter";
import { SaleLimitTimeDetailResponse } from "../../models/sale-limit-time";
import { env } from "../../adapters/environmentConfigs";

type State = {
  saleLimitTimeDetail: SaleLimitTimeDetailResponse;
  error: string;
};

const initialState: State = {
  saleLimitTimeDetail: {
    ref: "",
    code: 0,
    message: "",
    data: {},
  },
  error: "",
};

export const getsaleLimitTimeDetail = createAsyncThunk(
  "getsaleLimitTimeDetail",
  async (id: string) => {
    try {
      const apiRootPath = `${environment.sell.saleLimitTime.detail.url}/${id}`;
      let response: SaleLimitTimeDetailResponse = {
        ref: "",
        code: 0,
        message: "",
        data: {},
      };
      response = await get(apiRootPath).then();
      return response;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
);

const saleLimitTimeDetailSlice = createSlice({
  name: "saleLimitTimeDetailSlice",
  initialState,
  reducers: {
    clearDataFilter: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getsaleLimitTimeDetail.pending, () => {
      initialState;
    }),
      builder.addCase(
        getsaleLimitTimeDetail.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.saleLimitTimeDetail = action.payload;
        },
      ),
      builder.addCase(getsaleLimitTimeDetail.rejected, () => {
        initialState;
      });
  },
});

export const { clearDataFilter } = saleLimitTimeDetailSlice.actions;
export default saleLimitTimeDetailSlice.reducer;
