import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../../environment-base";
import { getParams } from "../../../adapters/posback-adapter";
import { ContentType } from "../../../utils/enum/common-enum";
import {
  DistrictsResponse,
  SearchDistrictsRequest,
} from "../../../models/search-districts-model";

type State = {
  districtsList: DistrictsResponse;
  error: string;
};

const initialState: State = {
  districtsList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchDistrictsListAsync = createAsyncThunk(
  "DistrictsList",
  async (payload: SearchDistrictsRequest) => {
    try {
      const path = `${environment.master.districts.url}`;
      let response = await getParams(path, payload, ContentType.JSON).then();

      if (response === 204) {
        let responseCode: any = {
          ref: "",
          code: response,
          message: "",
          data: [],
        };

        return responseCode;
      }

      return response;
    } catch (error) {
      throw error;
    }
  },
);

const searchDistrictsSlice = createSlice({
  name: "searchDistricts",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchDistrictsListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchDistrictsListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.districtsList = action.payload;
        },
      ),
      builer.addCase(featchDistrictsListAsync.rejected, () => {
        initialState;
      });
  },
});

export default searchDistrictsSlice.reducer;
