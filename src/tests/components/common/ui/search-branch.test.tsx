import {
  fireEvent,
  getByTestId,
  render,
  screen,
  within,
  prettyDOM,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, useDispatch } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider, Typography } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";
import SearchBranch from "../../../../components/commons/ui/search-branch";
import React, { Profiler, useState } from "react";
import * as moduleApi from "../../../../store/slices/search-branches-province-slice";
// import { cleanup, renderHook, act } from '@testing-library/react-hooks';
let wrapper;
const mockStore = configureStore();
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
describe("component search branch", () => {
  it("check the box", () => {
    const handleOnclick = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      expect(screen.getByLabelText(/เลือกสาขาทั้งหมด/)).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText(/เลือกสาขาทั้งหมด/));
      expect(screen.getByLabelText("เลือกสาขาทั้งหมด")).toHaveProperty(
        "checked",
      );
    });
  });

  it("find placeholder combo-box-province ", () => {
    const handleOnclick = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      expect(
        screen.getByLabelText("รหัสประเภท/ประเภทสินค้า"),
      ).toBeInTheDocument();
    });
  });

  it("find placeholder combo-box-branch ", () => {
    const handleOnclick = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      expect(
        screen.getByPlaceholderText("ค้นหาบาร์โค๊ด / รายละเอียดสินค้า"),
      ).toBeInTheDocument();
    });
  });

  it("should click button clear form", () => {
    const handleOnclick = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      fireEvent.click(screen.getByTestId(/buttonClear/));
      expect(handleOnclick).toHaveBeenCalledTimes(1);
    });
  });

  it("should click button add form", () => {
    const handleOnclick = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      fireEvent.click(screen.getByTestId(/buttonAdd/));
      expect(handleOnclick).toHaveBeenCalledTimes(1);
    });
  });

  it("should call setAllBranches", () => {
    const setStateMock = jest.fn();
    const useStateMock: any = (useState: any) => [useState, setStateMock];
    jest.spyOn(React, "useState").mockImplementation(useStateMock);

    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );

    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      fireEvent.click(screen.getByTestId(/iconCloseModal/));
      expect(setStateMock).toHaveBeenCalledTimes(1);
    });
  });

  it("should click close modal", () => {
    const handleOnclose = jest.fn();
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      const buttonclose = screen.getByTestId(/iconCloseModal/);
      fireEvent.click(buttonclose);
    });
    // expect(handleOnclose).toHaveBeenCalledTimes(1);
  });

  it("test fetchProvinceListAsync is called", () => {
    beforeEach(() => {
      store.getState().open = true;
      store.getState().allBranches = true;
    });
    jest.spyOn(React, "useEffect").mockImplementation((f) => f());
    jest.spyOn(moduleApi, "fetchProvinceListAsync");
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    setTimeout(() => {
      expect(moduleApi.fetchProvinceListAsync).toHaveBeenCalledTimes(1);
    }, 5000);
  });

  it("test fetchBranchProvinceListAsync is called", () => {
    beforeEach(() => {
      store.getState().open = true;
      store.getState().allBranches = true;
    });
    jest.spyOn(React, "useEffect").mockImplementation((f) => f());
    jest.spyOn(moduleApi, "fetchBranchProvinceListAsync");
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    setTimeout(() => {
      expect(moduleApi.fetchBranchProvinceListAsync).toHaveBeenCalledTimes(1);
    }, 5000);
  });

  it("test fetchTotalBranch is called", () => {
    beforeEach(() => {
      store.getState().open = true;
      store.getState().allBranches = true;
    });
    jest.spyOn(React, "useEffect").mockImplementation((f) => f());
    jest.spyOn(moduleApi, "fetchTotalBranch");
    jest.spyOn(moduleApi, "fetchProvinceListAsync");
    jest.spyOn(moduleApi, "fetchBranchProvinceListAsync");
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    setTimeout(() => {
      expect(moduleApi.fetchTotalBranch).toHaveBeenCalledTimes(1);
      expect(moduleApi.fetchProvinceListAsync).toHaveBeenCalledTimes(1);
      expect(moduleApi.fetchBranchProvinceListAsync).toHaveBeenCalledTimes(1);
    }, 5000);
  });

  it("onchange value input combo-box-branch", () => {
    beforeEach(() => {
      store.getState().open = true;
      store.getState().allBranches = true;
    });
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );

    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      const autocomplete = screen.getByPlaceholderText(
        "ค้นหาบาร์โค๊ด / รายละเอียดสินค้า",
      );
      const input = within(autocomplete).getByRole(
        "textbox",
      ) as HTMLInputElement;
      autocomplete.focus();

      fireEvent.change(input, { target: { value: "mockValue" } });

      // navigate to the first item in the autocomplete box
      fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
      // select the first item
      fireEvent.keyDown(autocomplete, { key: "Enter" });
      // check the new value of the input field
      setTimeout(() => {
        expect(screen.queryByTestId("autocomplete-box-search")).toBe(
          "mockValue",
        );
      }, 5000);
    });
  });

  it("should disabled autocomplete-box-search", () => {
    beforeEach(() => {
      store.getState().open = true;
      store.getState().allBranches = true;
    });
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={true} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      const autocomplete = screen.getByTestId(/autocomplete-box-search/);
      expect(autocomplete).toBeDisabled();
    });
  });

  it("should disabled autocomplete-box-province", () => {
    beforeEach(() => {
      store.getState().open = true;
      store.getState().allBranches = true;
    });
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={true} />
        </ThemeProvider>
      </Provider>,
    );
    waitFor(() => {
      fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
      const button = screen.getByRole("radio", { name: "เลือกสาขาเอง" });
      fireEvent.click(button);
      const autocomplete = screen.getByTestId(/autocomplete-box-province/);
      expect(autocomplete).toBeDisabled();
    });
  });

  it("should setOpen called", () => {
    const setStateMock = jest.fn();
    const useStateOpenMock = jest.spyOn(React, "useEffect");
    useStateOpenMock.mockImplementation((open) => [open, setStateMock]);
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    fireEvent.click(screen.getByPlaceholderText(/กรุณาเลือก/));
    expect(setStateMock).toHaveBeenCalledTimes(0);
  });

  it("should load branchprovinceListAsync", () => {
    beforeEach(() => {
      store.getState().open = true;
      store = mockStore(store);
    });
    const dispatch = jest.fn();
    const useDispatch = jest.fn(() => () => {});
    useDispatch.mockReturnValue(dispatch);
    dispatch.mockReturnValue("Rachaburi");
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SearchBranch disabled={false} />
        </ThemeProvider>
      </Provider>,
    );
    const loadBranchProvinceList = () => Promise.resolve({ params: "0199" });

    // const { result, waitForValueToChange } = renderHook(() => moduleApi.fetchBranchProvinceListAsync('0199'));
    // setTimeout(() => {
    //   waitForValueToChange(() => result.current.toString);
    // }, 5000);
  });
});
