import {
  render,
  screen,
  waitFor,
  fireEvent,
  RenderResult,
  getByTestId,
  within,
  wait,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { inputAdornmentClasses, TextField, ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import { BootstrapDialogTitle } from "../../../../components/commons/ui/dialog-title";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
});

describe("component dailog title", () => {
  it("action close", () => {
    const handleClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BootstrapDialogTitle id="unit test" onClose={handleClose} />
        </ThemeProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("not find button close", () => {
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BootstrapDialogTitle id="unit test" />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});
