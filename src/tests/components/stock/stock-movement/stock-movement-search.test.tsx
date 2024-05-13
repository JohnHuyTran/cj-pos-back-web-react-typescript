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
import StockMovementSearch from "../../../../components/stock/stock-movement/stock-movement-search";
import { mockDataStockMovement } from "../../../mockdata-store/mock-store-stock";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
let wrapper: RenderResult<
  typeof import("@testing-library/dom/types/queries"),
  HTMLElement
>;
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store: Store<any, AnyAction>;
const handleOnSelectItem = jest.fn();
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(mockDataStockMovement);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <StockMovementSearch />
      </ThemeProvider>
    </Provider>,
  );
});
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

describe("component stock-movement-search", () => {
  it("find all items", () => {
    expect(screen.getByTestId("testid-btnClear")).toBeInTheDocument();
    expect(screen.getByTestId("testid-btnSearch")).toBeInTheDocument();
  });

  it("find place holder", () => {
    expect(screen.getByPlaceholderText(/กรุณาระบุสาขา/)).toBeInTheDocument();
  });

  it("product is empty click search -> popup error กรุณาระบุสินค้าที่ต้องการค้นหา", async () => {
    await fireEvent.click(screen.getByTestId("testid-btnSearch"));
    expect(
      screen.getByText(/กรุณาระบุสินค้าที่ต้องการค้นหา/),
    ).toBeInTheDocument();
  });

  it("input data click search", async () => {
    await fireEvent.click(screen.getByTestId("testid-btnSearch"));
    expect(screen.getByText("กรุณารอสักครู่")).toBeInTheDocument();
  });

  it("clear search data", async () => {
    await fireEvent.click(screen.getByTestId("testid-btnClear"));
    expect(screen.getAllByPlaceholderText(/กรุณาเลือกวันที่/i)).toHaveLength(2);
  });
});
