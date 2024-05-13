import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import SnackbarStatus from "../../../../components/commons/ui/snackbar-status";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarStatus
          open={true}
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
          isSuccess={true}
          contentMsg="คุณได้บันทึกข้อมูลเรียบร้อยแล้ว"
        />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component SnackbarStatus", () => {
  it("find snackbar", () => {
    expect(screen.getByTestId(/txtSnackbar/)).toBeInTheDocument();
  });
  it("find text status", () => {
    let txtAlert = screen.getByTestId(/txtSnackbar/);
    expect(txtAlert.textContent).toEqual("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
  });
});
