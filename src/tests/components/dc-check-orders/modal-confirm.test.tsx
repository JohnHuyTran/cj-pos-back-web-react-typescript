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
import DCOrderList from "../../../components/dc-check-orders/dc-order-list";
import ModelConfirm from "../../../components/dc-check-orders/modal-confirm";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
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

describe("component dc-order-list", () => {
  it("find content popup", async () => {
    const onClose = jest.fn();
    const onUpdateAction = jest.fn();
    const handleActionVerify = jest.fn();
    let container;
    await waitFor(() => {
      container = render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ModelConfirm
              open={true}
              onClose={onClose}
              onUpdateAction={onUpdateAction}
              idDC={"SD22060101-000004"}
              sdNo={"SD22060101-000004"}
              docRefNo={"LD20220601001001"}
              comment={"unit test comment"}
              handleActionVerify={handleActionVerify}
              subject={"ยืนยันอนุมัติผลต่างการรับสินค้า"}
            />
          </ThemeProvider>
        </Provider>,
      );
    });
    expect(
      screen.getByText("ยืนยันอนุมัติผลต่างการรับสินค้า"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/เลขที่เอกสาร SD |SD22060101-000004/i),
    ).toBeInTheDocument();
  });

  it("click ยืนยัน is call function", async () => {
    const onClose = jest.fn();
    const onUpdateAction = jest.fn();
    const handleActionVerify = jest.fn();
    let container;
    await waitFor(() => {
      container = render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ModelConfirm
              open={true}
              onClose={onClose}
              onUpdateAction={onUpdateAction}
              idDC={"SD22060101-000004"}
              sdNo={"SD22060101-000004"}
              docRefNo={"LD20220601001001"}
              comment={"unit test comment"}
              handleActionVerify={handleActionVerify}
              subject={"ยืนยันอนุมัติผลต่างการรับสินค้า"}
            />
          </ThemeProvider>
        </Provider>,
      );
    });

    fireEvent.click(getById("btnConfirm")!);
    expect(handleActionVerify).toHaveBeenCalledTimes(1);
  });

  it("click ยกเลิก is call function", async () => {
    const onClose = jest.fn();
    const onUpdateAction = jest.fn();
    const handleActionVerify = jest.fn();
    let container;
    await waitFor(() => {
      container = render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ModelConfirm
              open={true}
              onClose={onClose}
              onUpdateAction={onUpdateAction}
              idDC={"SD22060101-000004"}
              sdNo={"SD22060101-000004"}
              docRefNo={"LD20220601001001"}
              comment={"unit test comment"}
              handleActionVerify={handleActionVerify}
              subject={"ยืนยันอนุมัติผลต่างการรับสินค้า"}
            />
          </ThemeProvider>
        </Provider>,
      );
    });
    fireEvent.click(getById("btnCancle")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
