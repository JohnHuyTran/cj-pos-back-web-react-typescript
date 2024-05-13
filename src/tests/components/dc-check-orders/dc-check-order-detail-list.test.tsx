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
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState, mocksliceDcOrderListOver10 } from "../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../styles/theme";
import { mockUserInfo, mockUserInfoGroupDC } from "../../mockData";
import { getByClass, getById } from "../../../utils/custom-testing-library";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import DCOrderList from "../../../components/dc-check-orders/dc-order-list";
import DCOrderEntries from "../../../components/dc-check-orders/dc-check-order-detail-list";
import {
  mockDataDcCheckOrderDetailIsLDAndStatusChecked,
  mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck,
} from "../../mockdata-store/mock-store-dc-check-order";
import { DataGridProps } from "@mui/x-data-grid";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let store: Store<any, AnyAction>;
let container;
const onSelectRows = jest.fn();
sessionStorage.setItem("user_info", mockUserInfoGroupDC);
beforeEach(async () => {});
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
jest.mock("@mui/x-data-grid", () => {
  const { DataGrid } = jest.requireActual("@mui/x-data-grid");
  return {
    ...jest.requireActual("@mui/x-data-grid"),
    DataGrid: (props: DataGridProps) => {
      return <DataGrid {...props} columnBuffer={2} columnThreshold={2} />;
    },
  };
});

describe("component dc-order-detail-list", () => {
  it("show data grid", async () => {
    const handleOnUpdateItems = jest.fn();
    const handleClearCommment = jest.fn();
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderEntries
            items={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.items
            }
            clearCommment={handleClearCommment}
            isTote={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.sdType === 0
                ? true
                : false
            }
            onUpdateItems={handleOnUpdateItems}
            isLD={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.docType === "LD"
                ? true
                : false
            }
            isWaitForCheck={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.verifyDCStatus === 0
            }
          />
        </ThemeProvider>
      </Provider>,
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("9999990138302");
  });

  it("show data grid > 10 row", async () => {
    const handleOnUpdateItems = jest.fn();
    const handleClearCommment = jest.fn();
    store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderEntries
            items={
              mockDataDcCheckOrderDetailIsLDAndStatusChecked.dcCheckOrderDetail
                .orderDetail.data.items
            }
            clearCommment={handleClearCommment}
            isTote={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.sdType === 0
                ? true
                : false
            }
            onUpdateItems={handleOnUpdateItems}
            isLD={false}
            isWaitForCheck={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.verifyDCStatus === 0
            }
          />
        </ThemeProvider>
      </Provider>,
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("9999990138302");
  });

  it("select sdNo", async () => {
    const handleOnUpdateItems = jest.fn();
    const handleClearCommment = jest.fn();
    // store = mockStore(mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck);
    const onClickClose = jest.fn();
    const container = await render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DCOrderEntries
            items={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.items
            }
            clearCommment={handleClearCommment}
            isTote={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.sdType === 0
                ? true
                : false
            }
            onUpdateItems={handleOnUpdateItems}
            isLD={false}
            isWaitForCheck={
              mockDataDcCheckOrderDetailIsLDAndStatusWaitCheck
                .dcCheckOrderDetail.orderDetail.data.verifyDCStatus === 0
            }
          />
        </ThemeProvider>
      </Provider>,
    );

    // expect(screen.getByLabelText('SD-1234')).toBeInTheDocument();
    // fireEvent.click(screen.getByLabelText('Next page'));
  });
});
