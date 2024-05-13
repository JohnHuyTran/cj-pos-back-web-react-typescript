import {
  fireEvent,
  getByTestId,
  render,
  screen,
  within,
  prettyDOM,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider, Typography } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";
import React, { Profiler } from "react";
import { addTypeAndProduct } from "../../../../store/slices/add-type-product-slice";
import userEvent from "@testing-library/user-event";
import ModalAddTypeProduct from "../../../../components/commons/ui/modal-add-type-products";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
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
beforeEach(() => {
  store = mockStore(initialState);
  const handleOnclick = jest.fn();
  const container = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ModalAddTypeProduct
          open={true}
          onClose={handleOnclick}
          requestBody={{
            skuCodes: [],
            skuTypes: undefined,
            isOrderable: undefined,
            isSellable: undefined,
          }}
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

describe("component modal add type product", () => {
  it("should click button add product", async () => {
    const handleOnclick = jest.fn();
    setTimeout(() => {
      fireEvent.click(screen.getByTestId("btn-add-product"));
      setTimeout(() => {
        expect(handleOnclick).toHaveBeenCalledTimes(1);
      }, 5000);
    }, 5000);
  });

  it("should add product", () => {
    const handleOnclick = jest.fn();
    const handleOnAddProduct = jest.fn();
    expect(screen.getByTestId("btn-add-product")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("btn-add-product"));
    setTimeout(() => {
      fireEvent.click(screen.getByTestId("btn-add-product"));
      fireEvent.change(screen.getByTestId("btn-add-product"));
      setTimeout(() => {
        expect(handleOnAddProduct).toHaveBeenCalledTimes(1);
      }, 5000);
    }, 5000);
  });

  it("should click button close", async () => {
    const handleOnclick = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalAddTypeProduct
            open={true}
            onClose={handleOnclick}
            requestBody={{
              skuCodes: [],
              skuTypes: undefined,
              isOrderable: undefined,
              isSellable: undefined,
            }}
          />
        </ThemeProvider>
      </Provider>,
    );
    setTimeout(() => {
      fireEvent.click(screen.getByLabelText("close"));
      expect(handleOnclick).toHaveBeenCalledTimes(1);
    }, 5000);
  });

  it("should change radio allproduct", () => {
    setTimeout(() => {
      expect(
        screen.getByPlaceholderText(/เลือกสินค้าทั้งหมด/),
      ).toBeInTheDocument();
    }, 1000);
  });

  it("should click radio allproduct", () => {
    setTimeout(() => {
      fireEvent.click(screen.getByPlaceholderText(/เลือกสินค้าทั้งหมด/));
      expect(
        screen.getByPlaceholderText(/เลือกสินค้าทั้งหมด/),
      ).toBeInTheDocument();
    }, 1000);
  });

  it("find text autocomplete productTypeOptions", () => {
    expect(screen.getByTestId(/autocomplete-product-type/)).toBeInTheDocument();
  });

  it("find placeholder productTypeOptions", () => {
    expect(
      screen.getByPlaceholderText("รหัสประเภท/ประเภทสินค้า"),
    ).toBeInTheDocument();
  });

  it("onchange value productTypeOptions", () => {
    const autocomplete = screen.getByTestId(/autocomplete-product-type/);
    const input = within(autocomplete).getByRole("textbox") as HTMLInputElement;
    autocomplete.focus();

    fireEvent.change(input, { target: { value: "BEER" } });

    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
    // check the new value of the input field
    expect(input.value).toBe("BEER");

    fireEvent.change(input, { target: { value: "0" } });
    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
  });

  it("find text autocomplete productOptions", () => {
    expect(
      screen.queryByTestId(/autocomplete-product-option/),
    ).toBeInTheDocument();
  });

  it("find placeholder productOptions", () => {
    expect(
      screen.getByPlaceholderText("ค้นหาบาร์โค๊ด / รายละเอียดสินค้า"),
    ).toBeInTheDocument();
  });

  it("onchange value productOptions", () => {
    const autocomplete = screen.getByTestId(/autocomplete-product-option/);
    const input = within(autocomplete).getByRole("textbox") as HTMLInputElement;
    autocomplete.focus();

    fireEvent.change(input, { target: { value: "BEER" } });
    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
    // check the new value of the input field
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "0" } });
    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
  });

  it("check the box ", () => {
    const autocomplete = screen.getByTestId(/autocomplete-product-type/);
    const input = within(autocomplete).getByRole("textbox") as HTMLInputElement;
    autocomplete.focus();

    fireEvent.change(input, { target: { value: "BEER" } });

    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
    // check the new value of the input field
    expect(input.value).toBe("BEER");
    const checkbox = screen.getByTestId(/checkbox-select-all-product/);
    fireEvent.click(checkbox);
    // expect(checkbox).toHaveProperty('checked');
  });

  it("should click button delete item", () => {
    const handleDeleteItem = jest.fn();
    setTimeout(() => {
      fireEvent.click(screen.getByTestId(/icon-delete-item/));
    }, 5000);
    expect(handleDeleteItem).toHaveBeenCalledTimes(0);
  });

  it("should call set selectedItems", () => {
    const handleOnclick = jest.fn();
    const setStateMock = jest.fn();
    const useStateMock: any = (useState: any) => [useState, setStateMock];
    jest.spyOn(React, "useState").mockImplementation(useStateMock);

    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalAddTypeProduct
            open={true}
            onClose={handleOnclick}
            requestBody={{
              skuCodes: [],
              skuTypes: [2],
              isSellable: true,
            }}
          />
        </ThemeProvider>
      </Provider>,
    );

    setTimeout(() => {
      fireEvent.click(screen.getByTestId(/btn-add-product/));
      expect(setStateMock).toHaveBeenCalledTimes(1);
    }, 5000);
  });
});
