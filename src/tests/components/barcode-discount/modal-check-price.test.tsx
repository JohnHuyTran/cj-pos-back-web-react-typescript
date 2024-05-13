import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import React from "react";
import { initialState } from "../../mockStore";
import { mockUserInfo } from "../../mockData";
import { ThemeProvider } from "@mui/material";
import theme from "../../../styles/theme";
import ModalCheckPrice from "../../../components/barcode-discount/modal-check-price";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
const onClose = jest.fn();
const products = initialState.stockBalanceCheckSlice.checkPrice;
const inittal = {
  addItems: {
    state: [
      {
        barcode: "8859065101014",
        skuCode: "000000000020030140",
        unitCode: "ST",
        unitName: "ชิ้น",
        barcodeName: "12นางพญาครีมไวท์ซีรีย์20g Piece",
        unitPrice: 39,
        unitPriceText: "39.00",
        baseUnit: 1,
        qty: 1,
        skuName: "12นางพญาครีมไวท์ซีรีย์20g",
        ProductTypeCode: "31100",
        ProductTypeName: "MOISTURIZER FOR FACE",
      },
    ],
  },
};

sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(inittal);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ModalCheckPrice products={products} open={true} onClose={onClose} />
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

describe("component check price", () => {
  it("find button close", () => {
    expect(screen.getByText("ปิด")).toBeInTheDocument();
    fireEvent.click(screen.getByText("ปิด"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("find data change price", () => {
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("8859065101014");
  });
});
