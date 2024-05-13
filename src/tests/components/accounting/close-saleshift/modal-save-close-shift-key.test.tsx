import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import { ThemeProvider } from "@mui/material";
import ModalSaveCloseShiftKey from "../../../../components/accounting/close-saleshift/modal-save-close-shift-key";
import { CloseSaleShiftInfo } from "models/branch-accounting-model";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let wrapper;
let store: Store<any, AnyAction>;
const handleOnClose = jest.fn();
const noOfShiftKey = "8";
const payload: CloseSaleShiftInfo = {
  branchCode: "0101",
  shiftCode: "20220810013-001",
  shiftKey: "",
  shiftDate: "2022-08-10T02:55:12.956Z",
  shiftAmount: 1000,
  billAmount: 1000,
  confirmAmount: 0,
  noOfSaleBill: 1,
  noOfReturnBill: 0,
  status: "",
  posCode: "001",
  posUser: "unit-test",
};
sessionStorage.setItem("user_info", mockUserInfo);
jest.mock("react-i18next", () => ({
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
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ModalSaveCloseShiftKey
          open={true}
          payload={payload}
          onClose={handleOnClose}
        />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component modal close sale", () => {
  // console.debug('debug:', inputField);
  it("find button ตกลง", () => {
    const button = screen.getByTestId(/testid-btnSubmit/).closest("button");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("find text", () => {
    expect(
      screen.getByText("กรุณาสแกน Barcode เพื่อเพิ่มรหัสปิดรอบ"),
    ).toBeInTheDocument();
    // expect(screen.getByText(`จำนวนรหัสปิดรอบ: 8`)).toBeInTheDocument();
  });

  it("find item in data grid", () => {
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML(`${payload.shiftCode}`);
  });

  it("on click button บันทึก ", async () => {
    const input = screen
      .getByTestId("testid-tbx-shiftKey")
      .querySelector("input") as HTMLInputElement;
    await fireEvent.change(input, { target: { value: "186A00" } });
    await fireEvent.keyPress(input, { key: "Enter", code: 13 });

    fireEvent.click(screen.getByTestId(/testid-btnSubmit/));

    await new Promise((r) => setTimeout(r, 4000));
    expect(screen.getByText("กรุณารอสักครู่")).toBeInTheDocument();
  });

  it("on close modal", () => {
    fireEvent.click(screen.getByTestId("testid-title-btnClose"));
    expect(handleOnClose).toHaveBeenCalledTimes(1);
  });

  it("payload in null", async () => {
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalSaveCloseShiftKey
            open={true}
            payload={null}
            onClose={handleOnClose}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(container.getByRole("grid")).toBeInTheDocument();
  });
});
