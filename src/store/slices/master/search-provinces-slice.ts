import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { environment } from "../../../environment-base";
import { getParams } from "../../../adapters/posback-adapter";
import {
  ProvincesResponse,
  SearchProvincesRequest,
} from "../../../models/search-provinces-model";
import { ContentType } from "../../../utils/enum/common-enum";

type State = {
  provincesList: ProvincesResponse;
  error: string;
};

const initialState: State = {
  provincesList: {
    ref: "",
    code: 0,
    message: "",
    data: [],
  },
  error: "",
};

export const featchProvincesListAsync = createAsyncThunk(
  "ProvincesList",
  async (payload: SearchProvincesRequest) => {
    try {
      const path = `${environment.master.provinces.url}`;
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

const searchProvincesSlice = createSlice({
  name: "searchProvinces",
  initialState,
  reducers: {},
  extraReducers: (builer) => {
    builer.addCase(featchProvincesListAsync.pending, () => {
      initialState;
    }),
      builer.addCase(
        featchProvincesListAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.provincesList = action.payload;
        },
      ),
      builer.addCase(featchProvincesListAsync.rejected, () => {
        initialState;
      });
  },
});

export default searchProvincesSlice.reducer;
