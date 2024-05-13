import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
import "./locales/i18n";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { StylesProvider, createGenerateClassName } from "@mui/styles";
import theme from "./styles/theme";
import reportWebVitals from "./reportWebVitals";
import store from "./store/store";
import App from "./App";

const generateClassName = createGenerateClassName({
  productionPrefix: "pos",
});
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Suspense fallback="">
              <CssBaseline />
              <App />
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </StylesProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
