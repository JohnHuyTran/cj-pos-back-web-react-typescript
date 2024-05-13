import {
  render,
  screen,
  waitFor,
  fireEvent,
  RenderResult,
  getByTestId,
  within,
  wait,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { inputAdornmentClasses, TextField, ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import BranchListDropDown from "../../../../components/commons/ui/branch-list-dropdown";
import { BranchListOptionType } from "../../../../models/branch-model";

let wrapper: RenderResult<
  typeof import("@testing-library/dom/types/queries"),
  HTMLElement
>;
const mockStore = configureStore();
const defaultBranch: BranchListOptionType = {
  name: "สาขา 0101",
  code: "0101",
};
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BranchListDropDown
          sourceBranchCode={""}
          onChangeBranch={function (branchCode: string): void {}}
          isClear={false}
        />
      </ThemeProvider>
    </Provider>,
  );
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

describe("component branch-list-dropdown", () => {
  it("find text autocomplete", () => {
    expect(
      screen.getByTestId(/autocomplete-search-branch-list/),
    ).toBeInTheDocument();
  });

  it("find place holder", () => {
    expect(screen.getByPlaceholderText("ทั้งหมด")).toBeInTheDocument();
  });

  //   it('onchange value', async () => {
  //     const { getByTestId, getByRole, queryByRole } = render(
  //       <Provider store={store}>
  //         <ThemeProvider theme={theme}>
  //           <BranchListDropDown
  //             sourceBranchCode={''}
  //             onChangeBranch={function (branchCode: string): void {}}
  //             isClear={false}
  //           />
  //         </ThemeProvider>
  //       </Provider>
  //     );

  //     const autocomplete = getByTestId(/autocomplete-search-branch-list/);
  //     const input = within(autocomplete).getByRole('textbox') as HTMLInputElement;
  //     autocomplete.focus();

  //     fireEvent.change(input, { target: { value: '0239' } });

  //     // navigate to the first item in the autocomplete box
  //     fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  //     // select the first item
  //     fireEvent.keyDown(autocomplete, { key: 'Enter' });
  //     // check the new value of the input field
  //     expect(input.value).toEqual('B004-CJค้าส่งบ้านเลือก');
  //   });

  it("onchange value", async () => {
    const autocomplete = screen.getByTestId(/autocomplete-search-branch-list/);
    const input = within(autocomplete).getByRole("textbox") as HTMLInputElement;
    autocomplete.focus();

    // fireEvent.change(input, { target: { value: '0239' } });

    // navigate to the first item in the autocomplete box
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
    // select the first item
    fireEvent.keyDown(autocomplete, { key: "Enter" });
    // check the new value of the input field
    expect(input.value).toEqual("B004-CJค้าส่งบ้านเลือก");
  });
});
