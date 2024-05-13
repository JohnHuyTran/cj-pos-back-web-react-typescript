import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import React from "react";
import { initialState } from "../../mockStore";
import { mockUserInfo } from "../../mockData";
import { ThemeProvider } from "@mui/material";
import theme from "../../../styles/theme";
import ModalReject from "../../../components/barcode-discount/modal-reject";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
const onClose = jest.fn();
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ModalReject
          open={true}
          onClose={onClose}
          barCode={"BD22050101-000055"}
          id={"628df8f7e4d8f0764304b7f8"}
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

describe("component reject", () => {
  it("find button cancel", () => {
    expect(screen.getByText("ยกเลิก")).toBeInTheDocument();
    fireEvent.click(screen.getByText("ยกเลิก"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("find button reject", async () => {
    expect(screen.getByText("ยืนยัน")).toBeInTheDocument();
    await waitFor(() => fireEvent.click(screen.getByText("ยืนยัน")));
  });
});
