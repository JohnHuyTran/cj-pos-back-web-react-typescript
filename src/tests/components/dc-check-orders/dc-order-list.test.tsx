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
import { initialState, mocksliceDcOrderListOver10 } from "../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../styles/theme";
import { mockUserInfo, mockUserInfoGroupDC } from "../../mockData";
import { getByClass, getById } from "../../../utils/custom-testing-library";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import DCOrderList from "../../../components/dc-check-orders/dc-order-list";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let store: Store<any, AnyAction>;
let container;
const onSelectRows = jest.fn();
sessionStorage.setItem("user_info", mockUserInfoGroupDC);
beforeEach(async () => {
  //   store = mockStore(initialState);
  //   await waitFor(() => {
  //     container = render(
  //       <Provider store={store}>
  //         <ThemeProvider theme={theme}>
  //           <DCOrderList onSelectRows={onSelectRows} />
  //         </ThemeProvider>
  //       </Provider>
  //     );
  //   });
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

describe("component dc-order-list", () => {
  it("show datagrid -> have LD20220601001001", async () => {
    store = mockStore(initialState);
    // await waitFor(() => {
    container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderList onSelectRows={onSelectRows} />
        </ThemeProvider>
      </Provider>,
    );
    // });
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("LD20220601001001");
  });

  it("on click cell -> is show detail", async () => {
    // await waitFor(() => fireEvent.click(screen.getAllByRole('row')[2]));
    // expect(screen.getByText(/ตรวจสอบผลต่าง (DC)/i)).toBeInTheDocument();
  });

  it("on select item  -> is show detail", async () => {
    store = mockStore(mocksliceDcOrderListOver10);
    // await waitFor(() => {
    container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderList onSelectRows={onSelectRows} />
        </ThemeProvider>
      </Provider>,
    );
    // });
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});
