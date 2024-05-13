import {
  render,
  screen,
  fireEvent,
  RenderResult,
  within,
  getByTestId,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { ThemeProvider } from "@mui/material";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { mockUserInfo, mockUserInfoGroupDC } from "../../mockData";
import theme from "../../../styles/theme";
import {
  mockDataBtDetailDataEmpty,
  mockDataBtDetailDraft,
  mockDataBtDetailItemEmpty,
  mockDataBtSearchDataEmpty,
} from "../../mockdata-store/mock-store-stock-transfer-bt";
import StockTransferList from "../../../components/stock-transfer/stock-transfer-list";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store: Store<any, AnyAction>;
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

describe("component stock-transfer-bt search", () => {
  it("find items", async () => {
    store = mockStore(mockDataBtDetailItemEmpty);

    const renderer = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferList />
        </ThemeProvider>
      </Provider>,
    );
    expect(renderer.getByRole("grid")).toBeInTheDocument();
    expect(renderer.getAllByRole("row")[1]).toContainHTML("BT22060101-000062");
  });

  it("select BT22060101-000062 -> show modal detail", async () => {
    store = mockStore(mockDataBtDetailDraft);
    const renderer = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferList />
        </ThemeProvider>
      </Provider>,
    );
    const row = renderer.getByText("BT22060101-000062");
    row.focus();
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.click(row);
    await new Promise((r) => setTimeout(r, 1000));
    expect(renderer.getByText("ตรวจสอบรายการใบโอน")).toBeInTheDocument();
    // await new Promise((r) => setTimeout(r, 1000));
    await fireEvent.click(renderer.getByTestId("testid-title-btnClose"));
    // await new Promise((r) => setTimeout(r, 1000));
    expect(renderer.queryByText("ตรวจสอบรายการใบโอน")).toBeNull;
  });
});
