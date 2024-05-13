import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import Steppers from "../../../../components/commons/ui/steppers";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Steppers status={0} stepsList={["บันทึก", "อนุมัติ"]} />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component Steppers", () => {
  it("find box stepper", () => {
    expect(screen.getByTestId(/boxStepper/)).toBeInTheDocument();
  });

  it("find text Step", () => {
    expect(screen.getByTestId(/stepper/)).toBeInTheDocument();
    let txtStep = screen.getByTestId(/stepper/);
    expect(txtStep.textContent).toEqual("บันทึก2อนุมัติ");
  });
});
