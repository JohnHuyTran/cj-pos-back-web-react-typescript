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
import SupplierCheckOrderSearch from "../../../components/stock-transfer/stock-transfer";
import { mockUserInfo, mockUserInfoGroupDC } from "../../mockData";
import theme from "../../../styles/theme";
import {
  mockDataBtDetailDataEmpty,
  mockDataBtDetailDraft,
  mockDataBtSearchDataEmpty,
} from "../../mockdata-store/mock-store-stock-transfer-bt";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(mockDataBtDetailDraft);
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

describe("component stock-transfer-bt search", () => {
  it("find all items", async () => {
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SupplierCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );
    expect(renderer.getByTestId("testid-txtDocNo")).toBeInTheDocument();
    expect(renderer.getByTestId("testid-btnClear")).toBeInTheDocument();
    expect(renderer.getByTestId("testid-btnSearch")).toBeInTheDocument();

    const element = renderer.getByPlaceholderText(
      "เลขที่เอกสาร BT, RT",
    ) as HTMLInputElement;
    fireEvent.change(element, { target: { value: "BT22060101-000062" } });
    expect(element.value).toBe("BT22060101-000062");

    const autocomplete = renderer.queryAllByTestId(
      "autocomplete-search-branch-list",
    )[1];
    const input = within(autocomplete).getByRole("textbox") as HTMLInputElement;
    autocomplete.focus();
    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
    expect(input.value).toEqual("B004-CJค้าส่งบ้านเลือก");
  });

  it("select from branch", async () => {
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SupplierCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );

    const autocomplete = renderer.queryAllByTestId(
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
  });

  it("select date picker", async () => {
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SupplierCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );
    fireEvent.click(renderer.getByTestId(/startDateIconClose/));
    fireEvent.click(renderer.getByTestId(/endDateIconClose/));
  });

  it("onclick btn search in case no data -> show loading ", async () => {
    store = mockStore(mockDataBtSearchDataEmpty);
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SupplierCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );
    await fireEvent.click(renderer.getByTestId("testid-btnSearch"));
    expect(renderer.getByText("กรุณารอสักครู่")).toBeInTheDocument();
  });

  it("onclick btn search in case have data-> show loading in case ", async () => {
    sessionStorage.setItem("user_info", mockUserInfoGroupDC);
    store = mockStore(mockDataBtDetailDataEmpty);
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SupplierCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );
    await fireEvent.click(renderer.getByTestId("testid-btnSearch"));
    expect(renderer.getByText("กรุณารอสักครู่")).toBeInTheDocument();
  });

  it("onclice btn clear -> date from,to is กรุณาเลือกวันที่ and click search show popup error กรุณาระบุวันที่โอน ", async () => {
    store = mockStore(mockDataBtSearchDataEmpty);
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SupplierCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );
    await fireEvent.click(renderer.getByTestId("testid-btnClear"));
    expect(renderer.queryAllByPlaceholderText("กรุณาเลือกวันที่")).toHaveLength(
      2,
    );

    await fireEvent.click(renderer.getByTestId("testid-btnSearch"));
    expect(renderer.getByText("กรุณาระบุวันที่โอน")).toBeInTheDocument();

    await fireEvent.click(renderer.getByTestId("btnClose"));
    await new Promise((r) => setTimeout(r, 1000));
    expect(renderer.queryByText("กรุณาระบุวันที่โอน")).toBeNull();
  });
});
