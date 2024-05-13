import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import { ThemeProvider } from "@mui/material";
import ModalByPassByBranch from "components/accounting/close-saleshift/modal-bypass-branch";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
const handleOnClose = jest.fn();
const handleOnCallBack = jest.fn();
const noOfShiftKey = "8";
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
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ModalByPassByBranch
          open={true}
          onClose={handleOnClose}
          onCallBack={handleOnCallBack}
        />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component modal close sale", () => {
  it("find button ตกลง", () => {
    expect(screen.getByTestId(/testid-btnSubmit/)).toBeInTheDocument();
    let btnClose = screen.getByTestId(/testid-btnSubmit/);
    expect(btnClose.textContent).toEqual("ตกลง");
  });

  it("find text", () => {
    expect(screen.getByTestId(/testid-label-noOfShiftKey/)).toBeInTheDocument();
    let txtContent = screen.getByTestId(/testid-label-noOfShiftKey/);
    expect(txtContent.textContent).toEqual(`จำนวนรหัสปิดรอบ:${noOfShiftKey} `);
  });

  it("on click btn ตกลง", () => {
    fireEvent.click(screen.getByTestId(/testid-btnSubmit/));
    expect(handleOnClose).toHaveBeenCalledTimes(1);
  });
});
