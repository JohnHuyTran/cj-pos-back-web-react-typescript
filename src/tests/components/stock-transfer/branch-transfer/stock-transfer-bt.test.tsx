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
import StockTransferBT from "../../../../components/stock-transfer/branch-transfer/stock-transfer-bt";
import {
  mockDataBtDetailDraft,
  mockDataBtDetailDraftNoUpdate,
  mockDataBtDetailReadyToTransfer,
  mockDataBtDetailTransfering,
  mockDataBtDetailWaitForPickup,
} from "../../../mockdata-store/mock-store-stock-transfer-bt";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store: Store<any, AnyAction>;
const handleOnClose = jest.fn();
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

describe("component stock-transfer-bt", () => {
  it("find all button is status draft and group branch", async () => {
    store = mockStore(mockDataBtDetailDraftNoUpdate);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByText("อยู่ระหว่างดำเนินการ: -")).toBeInTheDocument();
    expect(screen.getByTestId("testid-btnSave")).toBeInTheDocument();
    expect(screen.getByTestId("testid-btnSendToDC")).toBeInTheDocument();
    expect(screen.getByTestId("testid-btnAddItem")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("testid-title-btnClose"));
    expect(handleOnClose).toHaveBeenCalledTimes(1);
  });

  it("on click item is show follow expect result", async () => {
    store = mockStore(mockDataBtDetailDraft);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
        </ThemeProvider>
      </Provider>,
    );

    //call scroll
    let scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    fireEvent.click(screen.getByTestId("testid-btnTop"));
    expect(scrollIntoViewMock).toBeCalled();

    fireEvent.click(screen.getByText("จอห์นสันเบบี้ออยล์125ml"));
    expect(
      screen.getByText(
        "รายการสินค้า: จอห์นสันเบบี้ออยล์125ml (000000000020001504)",
      ),
    ).toBeInTheDocument();
    await fireEvent.click(screen.getByText("เรียกดูเอกสารใบโอน BT"));
    expect(screen.getByText("Loading PDF…")).toBeInTheDocument();
  });

  // it('can click เรียกดูเอกสารใบโอน BT -> show modal', async () => {
  //   store = mockStore(mockDataBtDetailDraft);
  //   const wrapper = render(
  //     <Provider store={store}>
  //       <ThemeProvider theme={theme}>
  //         <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
  //       </ThemeProvider>
  //     </Provider>
  //   );

  //   await fireEvent.click(screen.getByText('เรียกดูเอกสารใบโอน BT'));
  //   expect(screen.getByText('Loading PDF…')).toBeInTheDocument();
  // });

  it("find all button is status wait for picker and group branch", () => {
    store = mockStore(mockDataBtDetailWaitForPickup);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
        </ThemeProvider>
      </Provider>,
    );
    expect(
      screen.getByText("อยู่ระหว่างดำเนินการ: status.WAIT_FOR_PICKUP"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("testid-btnApprove")).toBeInTheDocument();
    expect(screen.queryByTestId("testid-btnSave")).toBeNull();
    expect(screen.queryByTestId("testid-btnAddItem")).toBeNull();
  });

  it("find all button is status wait for picker and group dc", () => {
    sessionStorage.setItem("user_info", mockUserInfoGroupDC);
    store = mockStore(mockDataBtDetailWaitForPickup);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
        </ThemeProvider>
      </Provider>,
    );

    expect(
      screen.getByText("อยู่ระหว่างดำเนินการ: status.WAIT_FOR_PICKUP"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("testid-btnApprove")).toBeNull();
    expect(screen.queryByTestId("testid-btnSave")).toBeNull();
    expect(screen.queryByTestId("testid-btnAddItem")).toBeNull();
  });

  it("find all button is status ready to transfer and group branch", () => {
    sessionStorage.setItem("user_info", mockUserInfo);
    store = mockStore(mockDataBtDetailReadyToTransfer);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
        </ThemeProvider>
      </Provider>,
    );
    expect(
      screen.getByText("อยู่ระหว่างดำเนินการ: status.READY_TO_TRANSFER"),
    ).toBeInTheDocument();
    expect(screen.getByText("เรียกดูเอกสารใบโอน BT")).toBeInTheDocument();
    expect(screen.queryByTestId("testid-btnApprove")).toBeNull();
    expect(screen.queryByTestId("testid-btnSave")).toBeNull();
    expect(screen.queryByTestId("testid-btnAddItem")).toBeNull();
  });

  it("find all button is status ready to transfer and group dc", () => {
    sessionStorage.setItem("user_info", mockUserInfoGroupDC);
    store = mockStore(mockDataBtDetailReadyToTransfer);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
        </ThemeProvider>
      </Provider>,
    );
    expect(
      screen.getByText("อยู่ระหว่างดำเนินการ: status.READY_TO_TRANSFER"),
    ).toBeInTheDocument();
    expect(screen.getByText("รอบรถเข้าต้นทางตั้งแต่")).toBeInTheDocument();
    expect(screen.queryByTestId("testid-btnApprove")).toBeNull();
    expect(screen.queryByTestId("testid-btnSave")).toBeInTheDocument();
    expect(screen.queryByTestId("testid-btnAddItem")).toBeNull();
  });

  it("find all button is status ready to transfering and group branch", () => {
    sessionStorage.setItem("user_info", mockUserInfo);
    store = mockStore(mockDataBtDetailTransfering);
    const wrapper = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <StockTransferBT isOpen={true} onClickClose={handleOnClose} />
        </ThemeProvider>
      </Provider>,
    );
    expect(
      screen.getByText("อยู่ระหว่างดำเนินการ: status.TRANSFERING"),
    ).toBeInTheDocument();
    expect(screen.getByText("แนบไฟล์")).toBeInTheDocument();
    expect(screen.queryByTestId("testid-btnApprove")).toBeNull();
    expect(screen.queryByTestId("testid-btnSave")).toBeNull();
    expect(screen.queryByTestId("testid-btnAddItem")).toBeNull();
  });
});
