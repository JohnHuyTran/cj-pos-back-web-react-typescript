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

import ConfirmCloseModel from "../../../../components/commons/ui/confirm-exit-model";
import React from "react";
let wrapper;
const mockStore = configureStore();
const handleClose = jest.fn();
const handleConfirm = jest.fn();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConfirmCloseModel
          open={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
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

describe("component confirm exit model", () => {
  it("find label message ", () => {
    expect(
      screen.getByText(/ข้อมูลที่แก้ไขยังไม่ได้รับการบันทึก/),
    ).toBeInTheDocument();
  });

  it("action confirm ", () => {
    fireEvent.click(screen.getByText("ยืนยัน"));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
  it("action cancel ", () => {
    fireEvent.click(screen.getByText("ยกเลิก"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
