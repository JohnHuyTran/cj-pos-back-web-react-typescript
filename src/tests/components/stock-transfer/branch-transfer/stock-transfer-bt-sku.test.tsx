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
import { mockUserInfo } from "../../../mockData";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { mockDataBtDetailDraft } from "../../../mockdata-store/mock-store-stock-transfer-bt";
import BranchTransferListSKU from "../../../../components/stock-transfer/branch-transfer/stock-transfer-bt-sku";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store: Store<any, AnyAction>;
const handleOnUpdateItemList = jest.fn();
const handleOnSelectSku = jest.fn();
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

describe("component stock-transfer-bt-sku", () => {
  it("find skucode 000000000020001504 in data grid", async () => {
    store = mockStore(mockDataBtDetailDraft);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListSKU
            onSelectSku={handleOnSelectSku}
            skuList={[
              {
                skuCode: "000000000020001504",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
            ]}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(screen.getAllByRole("row")[1]).toContainHTML("000000000020001504");

    const row = screen.getAllByRole("row")[1];

    fireEvent.click(screen.getByText("จอห์นสันเบบี้ออยล์125ml"));
    expect(handleOnSelectSku).toHaveBeenCalledTimes(1);
  });

  it("sku item > 5", async () => {
    store = mockStore(mockDataBtDetailDraft);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BranchTransferListSKU
            onSelectSku={handleOnSelectSku}
            skuList={[
              {
                skuCode: "000000000020001504",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001505",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001506",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001507",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001508",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001509",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001510",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001511",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001512",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001513",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001514",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
              {
                skuCode: "000000000020001515",
                productName: "จอห์นสันเบบี้ออยล์125ml",
                remainingQty: 75,
                orderAllQty: 66,
                actualAllQty: 0,
              },
            ]}
            onUpdateItemList={handleOnUpdateItemList}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(screen.getAllByRole("row")[1]).toContainHTML("000000000020001504");
  });
});
