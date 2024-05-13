import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import AlertWarning from "../../../../components/commons/ui/alert-warning";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AlertWarning
          open={true}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          text="กรุณารอสักครู่"
        />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component AlertWarning", () => {
  // console.debug('debug:', inputField);
  it("find button close", () => {
    expect(screen.getByTestId(/btnClose/)).toBeInTheDocument();
    let btnClose = screen.getByTestId(/btnClose/);
    expect(btnClose.textContent).toEqual("ปิด");
  });

  it("find alert text", () => {
    expect(screen.getByTestId(/txtContent/)).toBeInTheDocument();
    let txtContent = screen.getByTestId(/txtContent/);
    expect(txtContent.textContent).toEqual("กรุณารอสักครู่ ");
  });
});
