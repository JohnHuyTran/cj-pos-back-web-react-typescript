import {
  render,
  screen,
  fireEvent,
  RenderResult,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo, mockUserInfoGroupDC } from "../../../mockData";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import {
  mockDataBtDetailDataEmpty,
  mockDataBtDetailDraft,
  mockDataBtDetailItemEmpty,
  mockDataBtDetailWaitForPickup,
} from "../../../mockdata-store/mock-store-stock-transfer-bt";
import BranchTransferListItem from "../../../../components/stock-transfer/branch-transfer/stock-transfer-bt-item";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store: Store<any, AnyAction>;
const handleOnUpdateItemList = jest.fn();
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {});
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

describe("component stock-transfer-bt-item", () => {
  it("find barcode 8850007060987 in data grid", async () => {
    store = mockStore(mockDataBtDetailDraft);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListItem
            skuCodeSelect={"000000000020001504"}
            skuNameSelect={"จอห์นสันเบบี้ออยล์125ml"}
            isClickSKU={true}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("8850007060987");
    const row = screen.getAllByRole("row")[1];
    fireEvent.click(row);
    fireEvent.click(screen.getByText("8850007060987"));
  });

  it("BT is status WAIT_FOR_PICKUP cannot modify", async () => {
    sessionStorage.setItem("user_info", mockUserInfoGroupDC);
    store = mockStore(mockDataBtDetailWaitForPickup);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListItem
            skuCodeSelect={"000000000020014210"}
            skuNameSelect={"อาทโนแมทพลัส 90วันรีฟีล"}
            isClickSKU={true}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("8850273128411");
  });

  it("not select sku is show all", async () => {
    sessionStorage.setItem("user_info", mockUserInfoGroupDC);
    store = mockStore(mockDataBtDetailWaitForPickup);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListItem
            skuCodeSelect={""}
            skuNameSelect={"อาทโนแมทพลัส 90วันรีฟีล"}
            isClickSKU={true}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("8850273128411");
  });

  it("BT item is empty", async () => {
    store = mockStore(mockDataBtDetailItemEmpty);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListItem
            skuCodeSelect={"000000000020001504"}
            skuNameSelect={"จอห์นสันเบบี้ออยล์125ml"}
            isClickSKU={true}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")[1]).toEqual(undefined);
  });

  it("BT data is empty", async () => {
    store = mockStore(mockDataBtDetailDataEmpty);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListItem
            skuCodeSelect={"000000000020001504"}
            skuNameSelect={"จอห์นสันเบบี้ออยล์125ml"}
            isClickSKU={true}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")[1]).toEqual(undefined);
  });

  it("can select checkbox รายการสินค้า", async () => {
    store = mockStore(mockDataBtDetailDraft);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListItem
            skuCodeSelect={"000000000020001504"}
            skuNameSelect={"จอห์นสันเบบี้ออยล์125ml"}
            isClickSKU={false}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    const chkBox = screen.getByRole("checkbox");
    fireEvent.click(chkBox);
    expect(
      screen.getByText("รายการสินค้า: รายการสินค้าทั้งหมด"),
    ).toBeInTheDocument();
    fireEvent.click(chkBox);
    expect(
      screen.getByText(
        "รายการสินค้า: จอห์นสันเบบี้ออยล์125ml (000000000020001504)",
      ),
    ).toBeInTheDocument();
  });
});
