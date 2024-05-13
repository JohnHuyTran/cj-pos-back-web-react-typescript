import {
  render,
  screen,
  fireEvent,
  RenderResult,
  within,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";

import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";
import TextBoxSearchProduct from "../../../../components/commons/ui/texbox-search-product";
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
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <TextBoxSearchProduct
          onSelectItem={handleOnSelectItem}
          isClear={false}
          requestBody={{}}
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

describe("component textbox-search-product", () => {
  it("find text autocomplete", () => {
    expect(screen.getByTestId(/autocomplete-search/)).toBeInTheDocument();
  });

  it("find place holder", () => {
    expect(
      screen.getByPlaceholderText("บาร์โค้ด/รายละเอียดสินค้า"),
    ).toBeInTheDocument();
  });

  it("onchange value", async () => {
    const autocomplete = screen.getByTestId(/autocomplete-search/);
    const input = within(autocomplete)
      .getByTestId("textfiled-search")
      .querySelector("input") as HTMLInputElement;
    autocomplete.click();
    autocomplete.focus();
    fireEvent.change(input, { target: { value: "12PLUS" } });
    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(input.value).toEqual("12PLUS");
    // expect(handleOnSelectItem).toHaveBeenCalledTimes(1);
  });

  it("clear search data", () => {
    wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TextBoxSearchProduct
            onSelectItem={handleOnSelectItem}
            isClear={true}
            requestBody={{}}
          />
        </ThemeProvider>
      </Provider>,
    );
  });
});
