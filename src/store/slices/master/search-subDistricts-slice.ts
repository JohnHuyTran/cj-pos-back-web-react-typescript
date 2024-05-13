import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../../environment-base";
import { getParams } from "../../../adapters/posback-adapter";
import { ContentType } from "../../../utils/enum/common-enum";
import {
  SearchSubDistrictsRequest,
  SubDistrictsResponse,
} from "../../../models/search-subDistricts-model";

type State = {
  subDistrictsList: SubDistrictsResponse;
  error: string;
};

const initialState: State = {
  subDistrictsList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchsSubDistrictsListAsync = createAsyncThunk(
  "SubDistrictsList",
  async (payload: SearchSubDistrictsRequest) => {
    try {
      const path = `${environment.master.subDistricts.url}`;
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

const searchSubDistrictsSlice = createSlice({
  name: "searchDistricts",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchsSubDistrictsListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchsSubDistrictsListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.subDistrictsList = action.payload;
        },
      ),
      builer.addCase(featchsSubDistrictsListAsync.rejected, () => {
        initialState;
      });
  },
});

export default searchSubDistrictsSlice.reducer;
