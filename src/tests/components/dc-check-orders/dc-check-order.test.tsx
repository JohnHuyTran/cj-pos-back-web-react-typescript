// componets/Greetings.test.tsx

import {
  fireEvent,
  getByText,
  prettyDOM,
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import DCCheckOrderSearch from "../../../components/dc-check-orders/dc-check-order";

import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../styles/theme";
import { mockUserInfo } from "../../mockData";
import { getByClass, getById } from "../../../utils/custom-testing-library";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let wrapper: RenderResult<
  typeof import("@testing-library/dom/types/queries"),
  HTMLElement
>;
// const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  // wrapper = render(
  //   <Provider store={store}>
  //     <ThemeProvider theme={theme}>
  //       <DCCheckOrderSearch />
  //     </ThemeProvider>
  //   </Provider>
  // );
});
// const mockDispatch = jest.fn();
// jest.mock('react-redux', () => ({
//   useSelector: jest.fn(),
//   useDispatch: () => mockDispatch,
// }));
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

describe("show screen", () => {
  it("find btn search", async () => {
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );

    expect(getById("btnSearch")).toBeInTheDocument();
    expect(renderer.getByText("ค้นหา")).toBeInTheDocument();
    await fireEvent.click(renderer.getByText("ค้นหา"));
    expect(renderer.getByText("กรุณารอสักครู่")).toBeInTheDocument();
  });
  it("is click btn clear defaul value is clear", async () => {
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );
    expect(renderer.getByText(/เคลียร์/)).toBeInTheDocument();
    await waitFor(() => fireEvent.click(renderer.getByText(/เคลียร์/)));
  });

  it("find btn approve is disable", async () => {
    const renderer: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCCheckOrderSearch />
        </ThemeProvider>
      </Provider>,
    );
    const button = renderer.getByText(/อนุมัติ/).closest("button");
    expect(button).toBeDisabled();
  });
});
