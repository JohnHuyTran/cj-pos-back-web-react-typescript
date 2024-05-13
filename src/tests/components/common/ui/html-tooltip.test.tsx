import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider, Typography } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import HtmlTooltip from "../../../../components/commons/ui/html-tooltip";
import React from "react";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
});

describe("component tooltip", () => {
  it("find message ", () => {
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HtmlTooltip title={<React.Fragment>{"tooltip"}</React.Fragment>}>
            <Typography variant="body2" noWrap>
              {"Tooltip value"}
            </Typography>
          </HtmlTooltip>
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByText(/Tooltip value/)).toBeInTheDocument();
  });
});
