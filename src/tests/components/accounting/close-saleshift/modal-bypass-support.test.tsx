import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";
import { ThemeProvider } from "@mui/material";
import ModalBypassBySupport from "components/accounting/close-saleshift/modal-bypass-support";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
const handleOnClose = jest.fn();
const shiftCode = "20220823017-003";
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
        <ModalBypassBySupport
          shiftCode={shiftCode}
          branchCode={"M04C"}
          open={true}
          onClose={handleOnClose}
        />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component modal bypass support", () => {
  it("find items", () => {
    const button = screen.getByTestId(/testid-btnSubmit/).closest("button");
    let txtContent = screen.getByTestId(/testid-label-shiftCode/);
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByTestId(/testid-btnCancle/)).toBeInTheDocument();
    expect(screen.getByTestId(/testid-label-shiftCode/)).toBeInTheDocument();
    expect(screen.getByTestId(/form-field-tbxComment/)).toBeInTheDocument();
    expect(txtContent.textContent).toEqual(`เลขรหัสรอบขาย: ${shiftCode}`);
  });

  it("on input comment & click ตกลง ", async () => {
    const input = screen.getByTestId(
      /form-field-tbxComment/,
    ) as HTMLInputElement;
    await fireEvent.change(input, { target: { defaultValue: "unit test" } });
    await fireEvent.keyPress(input, { key: "Enter", code: 13 });

    // await new Promise((r) => setTimeout(r, 4000));
    fireEvent.click(screen.getByTestId(/testid-btnSubmit/));
  });

  it("on click btn ยกเลิก", () => {
    fireEvent.click(screen.getByTestId(/testid-btnCancle/));
    expect(handleOnClose).toHaveBeenCalledTimes(1);
  });
});
