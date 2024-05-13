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
import {
  inputAdornmentClasses,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import ModelConfirm from "../../../../components/commons/ui/modal-delete-confirm";
import React from "react";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  const handleOnClick = jest.fn();
  const handleOnClose = jest.fn();
  const container = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ModelConfirm
          open={true}
          onClose={handleOnClose}
          productName=""
          skuCode=""
          barCode=""
        />
      </ThemeProvider>
    </Provider>,
  );
});
jest.mock("react-i18next", () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));
describe("component modal delete confirm ", () => {
  it("should click btn-cancle ", () => {
    const handleOnClick = jest.fn();
    const handleOnClose = jest.fn();
    fireEvent.click(screen.getByTestId(/btnCancle/));
    waitFor(() => {
      expect(handleOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("find text btn-cancle", () => {
    const handleOnClose = jest.fn();
    expect(screen.getByTestId(/btnCancle/)).toBeInTheDocument();
  });

  it("should click btn-confirm ", () => {
    const handleOnDeleteItem = jest.fn();
    const handleOnClose = jest.fn();
    fireEvent.click(screen.getByTestId(/btnConfirm/));
    waitFor(() => {
      expect(handleOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("find text btn-confirm", () => {
    const handleOnClose = jest.fn();
    expect(screen.getByTestId(/btnConfirm/)).toBeInTheDocument();
  });
});
