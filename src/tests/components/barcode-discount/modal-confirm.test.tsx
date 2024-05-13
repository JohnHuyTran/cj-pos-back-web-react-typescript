import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import React from "react";
import { initialState } from "../../mockStore";
import { mockUserInfo } from "../../mockData";
import { ThemeProvider } from "@mui/material";
import theme from "../../../styles/theme";
import ModelConfirm from "../../../components/barcode-discount/modal-confirm";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
const onConfirm = jest.fn();
const onClose = jest.fn();
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ModelConfirm
          open={true}
          onClose={onClose}
          onConfirm={onConfirm}
          barCode={"BD22050101-000001"}
          headerTitle={"Header Title"}
          documentField={"Document Field"}
        />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component check stock", () => {
  it("find button cancel", () => {
    expect(screen.getByText("ยกเลิก")).toBeInTheDocument();
    fireEvent.click(screen.getByText("ยกเลิก"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("find button confirm", async () => {
    expect(screen.getByText("ยืนยัน")).toBeInTheDocument();
    await waitFor(() => fireEvent.click(screen.getByText("ยืนยัน")));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
