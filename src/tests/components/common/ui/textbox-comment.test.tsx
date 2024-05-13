import {
  render,
  screen,
  waitFor,
  fireEvent,
  RenderResult,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { TextField, ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import TextBoxComment from "../../../../components/commons/ui/textbox-comment";
import userEvent from "@testing-library/user-event";

let wrapper: RenderResult<
  typeof import("@testing-library/dom/types/queries"),
  HTMLElement
>;
const mockStore = configureStore();
const rowDisplay_value = 2;
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  // wrapper = render(
  //   <Provider store={store}>
  //     <ThemeProvider theme={theme}>
  //       <TextBoxComment
  //         fieldName={'comment label'}
  //         defaultValue={'default value to unit test'}
  //         maxLength={100}
  //         onChangeComment={function (value: string): void {}}
  //         isDisable={false}
  //         rowDisplay={rowDisplay_value}
  //       />
  //     </ThemeProvider>
  //   </Provider>
  // );
});

const handleChangeComment = () => {};

// describe('component text-comment', () => {
//   it('find text box', () => {
//     expect(screen.getByTestId(/form-field-tbxComment/)).toBeInTheDocument();
//   });
//   it('show input with initial value set ', () => {
//     expect(screen.getByDisplayValue(/default value to unit test/)).toBeInTheDocument();
//   });
//   it('find label subject', () => {
//     expect(screen.getByText(/comment label/)).toBeInTheDocument();
//   });
//   it('find label warning msg', () => {
//     let txtContent = screen.getByTestId(/div-warning-msg/);
//     expect(screen.getByTestId(/div-warning-msg/)).toBeInTheDocument();
//     expect(txtContent.textContent).toEqual('26/100');
//   });

//   it('onchange value', async () => {
//     const element = screen.getByDisplayValue('default value to unit test') as HTMLInputElement;
//     fireEvent.change(element, { target: { value: 'change value' } });
//     expect(element.value).toBe('change value');
//   });

//   it('onclick value', async () => {
//     const element = screen.getByDisplayValue('default value to unit test') as HTMLInputElement;
//     fireEvent.click(element, { target: { value: 'change value' } });
//     expect(element.value).toBe('change value');
//   });
// });

describe("component text-comment", () => {
  it("find text box set row display", async () => {
    await waitFor(() => {
      const container = render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <TextBoxComment
              fieldName={"comment label"}
              defaultValue={"default value to unit test"}
              maxLength={100}
              onChangeComment={function (value: string): void {}}
              isDisable={false}
              rowDisplay={rowDisplay_value}
            />
          </ThemeProvider>
        </Provider>,
      );
    });

    expect(screen.getByTestId(/form-field-tbxComment/)).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(/default value to unit test/),
    ).toBeInTheDocument();

    expect(screen.getByText(/comment label/)).toBeInTheDocument();

    let txtContent = screen.getByTestId(/div-warning-msg/);
    expect(screen.getByTestId(/div-warning-msg/)).toBeInTheDocument();
    expect(txtContent.textContent).toEqual("26/100");

    const element = screen.getByDisplayValue(
      "default value to unit test",
    ) as HTMLInputElement;
    fireEvent.change(element, { target: { value: "change value" } });
    expect(element.value).toBe("change value");

    fireEvent.click(element, { target: { value: "change value" } });
    expect(element.value).toBe("change value");
  });

  it("find text box not set row display", async () => {
    await waitFor(() => {
      const container = render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <TextBoxComment
              fieldName={"comment label"}
              defaultValue={"default value to unit test"}
              maxLength={100}
              onChangeComment={function (value: string): void {}}
              isDisable={false}
              // rowDisplay={rowDisplay_value}
            />
          </ThemeProvider>
        </Provider>,
      );
    });
    expect(screen.getByTestId(/form-field-tbxComment/)).toBeInTheDocument();
  });
});
