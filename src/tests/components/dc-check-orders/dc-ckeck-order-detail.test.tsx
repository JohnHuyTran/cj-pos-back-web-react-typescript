import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { Provider } from "react-redux";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { ThemeProvider } from "@mui/material";
import theme from "../../../styles/theme";
import { mockUserInfo, mockUserInfoGroupOC } from "../../mockData";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import DCOrderDetail from "../../../components/dc-check-orders/dc-ckeck-order-detail";
import {
  mockDataDcCheckOrderDetailIsBTAndStatusWaitCheck,
  mockDataDcCheckOrderDetailIsLDAndStatusChecked,
  mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck,
  mockDataDcCheckOrderDetailReasonIsEmpty,
} from "../../mockdata-store/mock-store-dc-check-order";
import userEvent from "@testing-library/user-event";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  // store = mockStore(initialState);
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

describe("component dc-order-detail", () => {
  it("Is DocType =LD and status is wait for check -> show btn approve & btn reject", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    // });
    expect(container.getByText("ตรวจสอบผลต่าง (DC)")).toBeInTheDocument();
    expect(container.queryByTestId("testid-btnApprove")).toBeInTheDocument();
    expect(container.queryByTestId("testid-btnReject")).toBeInTheDocument();
  });

  it("Is is reason in empty -> to be call dispatch", async () => {
    store = mockStore(mockDataDcCheckOrderDetailReasonIsEmpty);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    // });
    expect(container.getByText("ตรวจสอบผลต่าง (DC)")).toBeInTheDocument();
    expect(container.queryByTestId("testid-btnApprove")).toBeInTheDocument();
    expect(container.queryByTestId("testid-btnReject")).toBeInTheDocument();
  });

  it("Is DocType =LD and status is wait for check on click approve show popup confirm", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    await fireEvent.click(container.getByTestId("testid-btnApprove"));
    expect(screen.getByTestId("testid-alert-confirm")).toBeInTheDocument();
  });

  it("Is DocType =LD and status is wait for check on click btnReject show popup error input reason", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    await fireEvent.click(container.getByTestId("testid-btnReject"));
    expect(screen.getByText(/กรุณาระบุเหตุผลที่แก้ไข/i)).toBeInTheDocument();
  });

  it("Is DocType =LD and status is wait for check on click btnReject show popup error attach file", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = await render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );

    const reason = await screen.getByTestId(/testid-reason/);
    await fireEvent.mouseDown(reason);
    // Click the entries you want to select
    setTimeout(async () => {
      await fireEvent.click(screen.getByText("สาขาขอยกเลิก"));
      // Close the select using Escape or Tab or clicking away
      await fireEvent.keyDown(document.activeElement!, {
        key: "Escape",
        code: "Escape",
      });
      // await waitFor();
      expect(screen.getByText(/กรุณาแนบเอกสาร/i)).toBeInTheDocument();
    }, 5000);
  });

  it("Is DocType =LD and status is wait for check on click btnApprove is done", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    await fireEvent.click(container.getByTestId("testid-btnApprove"));
    await fireEvent.click(container.getByTestId("testid-btnConfirm"));
    expect(screen.getByText("กรุณารอสักครู่")).toBeInTheDocument();
  });

  it("Is DocType = LD and status is checked -> hide btn approve & btn reject", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusChecked);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    expect(container.getByText("ตรวจสอบผลต่าง (DC)")).toBeInTheDocument();
    expect(container.queryByTestId("testid-btnApprove")).toBeNull();
    expect(container.queryByTestId("testid-btnReject")).toBeNull();
  });

  it("Is DocType = BT and status is wait -> btn check", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsBTAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    expect(container.getByText("ตรวจสอบผลต่าง (DC)")).toBeInTheDocument();
    expect(container.queryByTestId("testid-btnChecked")).toBeInTheDocument();
  });

  it("Is DocType = BT and status to wait and click btn check-> show waring input comment", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsBTAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    await fireEvent.click(container.getByTestId("testid-btnChecked"));
    expect(screen.getByText(/กรุณากรอก หมายเหตุ/i)).toBeInTheDocument();
  });

  it("Is click Close", async () => {
    store = mockStore(mockDataDcCheckOrderDetailIsBTAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );
    fireEvent.click(screen.getByTestId("testid-title-btnClose"));
    expect(onClickClose).toHaveBeenCalledTimes(1);
  });

  it("Is group oc hide btn", async () => {
    await sessionStorage.setItem("user_info", mockUserInfoGroupOC);
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderDetail isOpen={true} idDC={""} onClickClose={onClickClose} />
        </ThemeProvider>
      </Provider>,
    );

    // const button = screen.getByTestId(/testid-btnApprove/);

    // const h3 = await screen.findByRole('button', { name: 'btnApprove', hidden: true });
  });
});
