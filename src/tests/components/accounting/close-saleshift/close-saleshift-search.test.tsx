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
import { mockUserInfo, mockUserInfoGroupDC } from "../../../mockData";

import { ThemeProvider } from "@mui/material";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import CloseSaleShiftSearch from "components/accounting/close-saleshift/close-saleshift-search";
import {
  mockStoreSearchCloseSaleShift,
  mockStoreSearchCloseSaleShiftNoData,
} from "tests/mockdata-store/mock-store-accounting";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let wrapper;
let store: Store<any, AnyAction>;
const handleOnClose = jest.fn();

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
  store = mockStore(mockStoreSearchCloseSaleShift);
  // wrapper = render(
  //   <Provider store={store}>
  //     <ThemeProvider theme={theme}>
  //       <CloseSaleShiftSearch />
  //     </ThemeProvider>
  //   </Provider>
  // );
});

describe("component modal close sale", () => {
  // console.debug('debug:', inputField);
  it("find all items", () => {
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearch />
        </ThemeProvider>
      </Provider>,
    );
    const btnImport = screen.getByTestId(/testid-btnImport/).closest("button");
    const btnBypass = screen.getByTestId(/testid-btnBypass/).closest("button");
    const btnCreateStockTransferModal = screen
      .getByTestId(/testid-btnCreateStockTransferModal/)
      .closest("button");
    const btnClear = screen.getByTestId(/testid-btnClear/).closest("button");
    const btnSearch = screen.getByTestId(/testid-btnSearch/).closest("button");
    expect(btnImport).toBeInTheDocument();
    expect(btnBypass).toBeInTheDocument();
    expect(btnCreateStockTransferModal).toBeInTheDocument();
    expect(btnClear).toBeInTheDocument();
    expect(btnSearch).toBeInTheDocument();
    expect(btnImport).toBeDisabled();
    expect(btnBypass).toBeDisabled();
  });

  it("on click button search ", async () => {
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearch />
        </ThemeProvider>
      </Provider>,
    );
    const button = screen.getByTestId(/testid-btnSearch/);
    fireEvent.click(button);

    await new Promise((r) => setTimeout(r, 4000));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("on click button clear ", async () => {
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearch />
        </ThemeProvider>
      </Provider>,
    );
    const button = screen.getByTestId(/testid-btnClear/);
    fireEvent.click(button);
  });

  it("on click button clear by user no role branch ", async () => {
    sessionStorage.setItem("user_info", mockUserInfoGroupDC);
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearch />
        </ThemeProvider>
      </Provider>,
    );
    const button = screen.getByTestId(/testid-btnClear/);
    fireEvent.click(button);
    expect(screen.getByPlaceholderText(/กรุณาเลือกวันที่/)).toBeInTheDocument();

    const buttonSearch = screen.getByTestId(/testid-btnSearch/);
    fireEvent.click(buttonSearch);
    expect(screen.getByText(/กรุณาเลือกวันที่ยอดขาย/)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 1000));
    fireEvent.click(screen.getByTestId(/endDateIconClose/));
  });

  it("on click button search with condition no data", async () => {
    store = mockStore(mockStoreSearchCloseSaleShiftNoData);
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearch />
        </ThemeProvider>
      </Provider>,
    );
    // fireEvent.click(screen.getByTestId(/endDateIconClose/));
    const autocomplete = container.queryAllByTestId(
      "autocomplete-search-branch-list",
    )[0];
    const input = within(autocomplete).getByRole("textbox") as HTMLInputElement;
    autocomplete.focus();
    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
    expect(input.value).toEqual("B004-CJค้าส่งบ้านเลือก");

    const button = screen.getByTestId(/testid-btnSearch/);
    fireEvent.click(button);

    await new Promise((r) => setTimeout(r, 4000));
    expect(screen.queryAllByRole("grid")).toEqual([]);
    expect(screen.getByText(/ไม่มีข้อมูล/)).toBeInTheDocument();
  });
});
