import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authentication } from "../../adapters/keycloak-adapter";
import { loginForm } from "../../models/user-interface";

type AuthState = {
  token: string | null;
  isLogin: boolean;
  refreshToken: string | null;
  sessionState: string | null;
  error: string | null;
};

const initialState: AuthState = {
  token: "",
  isLogin: false,
  refreshToken: "",
  sessionState: "",
  error: "",
};

export const loginKeyCloakAsync = createAsyncThunk(
  "login",
  async (payload: loginForm, store) => {
    try {
      const response = await authentication(payload);
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isLogin = false;
      state.token = "";
      state.refreshToken = "";
      state.error = "";
    },
    refreshTokenState: (state, action: PayloadAction<any>) => {
      state.token = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginKeyCloakAsync.pending, (state) => {
      state.isLogin = false;
      state.token = "";
      state.refreshToken = "";
      state.error = "";
    });
    builder.addCase(
      loginKeyCloakAsync.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.sessionState = action.payload.session_state;
        state.isLogin = true;
      },
    );
    builder.addCase(loginKeyCloakAsync.rejected, (state, action) => {
      // state.isLogin = false;
      // state.token = '';
      // state.refreshToken = '';
      // state.sessionState = '';
      state.error = action.error.message || "";
      state.token = "123";
      state.refreshToken = "123";
      state.sessionState = "123";
      state.isLogin = false;
    });
  },
});

export const { logout } = authSlice.actions;
export const { refreshTokenState } = authSlice.actions;
export default authSlice.reducer;
