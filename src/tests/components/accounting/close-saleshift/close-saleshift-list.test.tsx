import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import { ThemeProvider } from "@mui/material";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import CloseSaleShiftSearch from "components/accounting/close-saleshift/close-saleshift-search";
import CloseSaleShiftSearchList from "components/accounting/close-saleshift/close-saleshift-list";
import {
  mockStoreSearchCloseSaleShift,
  mockStoreSearchCloseSaleShiftMoreTenRecords,
  mockStoreSearchCloseSaleShiftNoData,
} from "tests/mockdata-store/mock-store-accounting";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let wrapper;
let store: Store<any, AnyAction>;
const handleOnClose = jest.fn();

sessionStorage.setItem("user_info", mockUserInfo);
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
beforeEach(() => {
  store = mockStore(initialState);
});

describe("component modal close sale", () => {
  // console.debug('debug:', inputField);

  it("find item in data grid", () => {
    store = mockStore(mockStoreSearchCloseSaleShift);
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearchList />
        </ThemeProvider>
      </Provider>,
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("20220811T03-001");
  });

  it("find item in data grid > 10 record", () => {
    store = mockStore(mockStoreSearchCloseSaleShiftMoreTenRecords);
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearchList />
        </ThemeProvider>
      </Provider>,
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("20220811T03-001");
  });

  it("on select shiftCode 20220801T05-021 , to dispaly popup", async () => {
    store = mockStore(mockStoreSearchCloseSaleShift);
    const container: any = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CloseSaleShiftSearchList />
        </ThemeProvider>
      </Provider>,
    );
    const row = container.getByText("20220801T05-021");
    row.focus();
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.click(row);
    await new Promise((r) => setTimeout(r, 1000));
    expect(container.getByText("บันทึกรหัสปิดรอบ")).toBeInTheDocument();
  });
  // it('on click button บันทึก ', async () => {
  //   const input = screen.getByTestId('testid-tbx-shiftKey').querySelector('input') as HTMLInputElement;
  //   await fireEvent.change(input, { target: { value: '186A00' } });
  //   await fireEvent.keyPress(input, { key: 'Enter', code: 13 });

  //   fireEvent.click(screen.getByTestId(/testid-btnSubmit/));

  //   await new Promise((r) => setTimeout(r, 4000));
  //   expect(screen.getByText('กรุณารอสักครู่')).toBeInTheDocument();
  // });

  // it('on close modal', () => {
  //   fireEvent.click(screen.getByTestId('testid-title-btnClose'));
  //   expect(handleOnClose).toHaveBeenCalledTimes(1);
  // });

  // it('payload in null', async () => {
  //   const container: any = render(
  //     <Provider store={store}>
  //       <ThemeProvider theme={theme}></ThemeProvider>
  //     </Provider>
  //   );
  //   expect(container.getByRole('grid')).toBeInTheDocument();
  // });
});
