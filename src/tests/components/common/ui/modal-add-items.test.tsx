import {
  render,
  screen,
  waitFor,
  fireEvent,
  RenderResult,
  getByTestId,
  within,
  wait,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { inputAdornmentClasses, TextField, ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";
import ModalAddItems from "../../../../components/commons/ui/modal-add-items";
import { getById } from "../../../../utils/custom-testing-library";

// let wrapper: RenderResult<typeof import('@testing-library/dom/types/queries'), HTMLElement>;
const mockStore = configureStore();

let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
const handleOnClose = jest.fn();
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
describe("component modal-add-items", () => {
  // it('find componet and placeholder', async () => {
  //   let rendered: ReturnType<typeof render>;

  //   await act(() => {
  //     rendered = render(
  //       <Provider store={store}>
  //         <ThemeProvider theme={theme}>
  //           <ModalAddItems
  //             open={true}
  //             onClose={handleOnClose}
  //             requestBody={{
  //               skuCodes: undefined,
  //               skuTypes: undefined,
  //               isOrderable: undefined,
  //               isSellable: undefined,
  //               productTypeCodes: undefined,
  //               isControlStock: undefined,
  //             }}
  //           />
  //         </ThemeProvider>
  //       </Provider>
  //     );
  //   });
  //   expect(screen.getByTestId('autocomplete-search-branch-list')).toBeInTheDocument();
  //   expect(screen.getByTestId('testid-tbxSearch')).toBeInTheDocument();
  //   expect(screen.getByTestId('testid-btnAdd')).toBeInTheDocument();
  //   expect(screen.getByPlaceholderText('บาร์โค้ด/รายละเอียดสินค้า')).toBeInTheDocument();
  // });

  // it('onselect items', async () => {
  //   const autocomplete = screen.getByTestId(/autocomplete-search-branch-list/);
  //   const input = within(autocomplete).getByRole('textbox') as HTMLInputElement;
  //   autocomplete.focus();

  //   // fireEvent.input(input, { target: { value: '12PLUS' } });
  //   // fireEvent.change(input, { target: { value: '12PLUS' } });

  //   // setTimeout(() => {
  //   // navigate to the first item in the autocomplete box
  //   fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  //   fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  //   // select the first item
  //   // fireEvent.keyDown(autocomplete, { key: 'Enter' });
  //   //   setTimeout(() => {
  //   // check the new value of the input field
  //   expect(screen.getByText(/12PLUSบอดี้&แฮร์เพอร์ฟูมลอนดอนแพร์25ml Pack/i)).toBeInTheDocument();
  //   //   }, 5000);
  //   // }, 5000);
  // });

  it("onselect items", async () => {
    store = await mockStore(initialState);
    const { debug, getAllByRole } = await render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalAddItems
            open={true}
            onClose={handleOnClose}
            requestBody={{
              skuCodes: ["000000000020039124"],
              isSellable: true,
              isControlStock: true,
            }}
          />
        </ThemeProvider>
      </Provider>,
    );
    // preview.debug();
    const autocomplete = screen.getByTestId("autocomplete-search-branch-list");
    const input = within(autocomplete).getByRole("textbox") as HTMLInputElement;
    autocomplete.focus();
    input.focus();
    // await fireEvent.keyDown(autocomplete, { key: '1' });
    // jest.setTimeout(5000);
    // await fireEvent.keyDown(autocomplete, { key: '8' });
    // jest.setTimeout(5000);
    // await fireEvent.keyDown(autocomplete, { key: '8' });
    // jest.setTimeout(5000);
    // await fireEvent.keyDown(autocomplete, { key: '5' });
    // jest.setTimeout(5000);
    // await fireEvent.keyDown(autocomplete, { key: '1' });
    // jest.setTimeout(5000);
    // await fireEvent.keyDown(autocomplete, { key: '1' });
    // jest.setTimeout(5000);
    // await fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    // jest.setTimeout(5000);
    // // await fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    // jest.setTimeout(5000);
    // fireEvent.keyDown(autocomplete, { key: 'Enter' });
    // jest.setTimeout(5000);

    // expect(input.value).toEqual('12PLUSบอดี้&แฮร์เพอร์ฟูมลอนดอนแพร์25ml Carton');
    expect(
      screen.queryByText("12PLUSบอดี้&แฮร์เพอร์ฟูมลอนดอนแพร์25ml Carton"),
    ).toBeNull();
  });

  // it('on close modal', async () => {
  //   let rendered: ReturnType<typeof render>;

  //   await act(() => {
  //     rendered = render(
  //       <Provider store={store}>
  //         <ThemeProvider theme={theme}>
  //           <ModalAddItems
  //             open={true}
  //             onClose={handleOnClose}
  //             requestBody={{
  //               skuCodes: undefined,
  //               skuTypes: undefined,
  //               isOrderable: undefined,
  //               isSellable: undefined,
  //               productTypeCodes: undefined,
  //               isControlStock: undefined,
  //             }}
  //           />
  //         </ThemeProvider>
  //       </Provider>
  //     );
  //   });
  //   fireEvent.click(screen.getByTestId('testid-btnClose'));
  //   expect(handleOnClose).toHaveBeenCalledTimes(1);
  // });

  // it('on add item modal', async () => {
  //   let rendered: ReturnType<typeof render>;

  //   await act(() => {
  //     rendered = render(
  //       <Provider store={store}>
  //         <ThemeProvider theme={theme}>
  //           <ModalAddItems
  //             open={true}
  //             onClose={handleOnClose}
  //             requestBody={{
  //               skuCodes: undefined,
  //               skuTypes: undefined,
  //               isOrderable: undefined,
  //               isSellable: undefined,
  //               productTypeCodes: undefined,
  //               isControlStock: undefined,
  //             }}
  //           />
  //         </ThemeProvider>
  //       </Provider>
  //     );
  //   });
  //   // setTimeout(() => {
  //   fireEvent.click(screen.getByTestId('testid-btnAdd'));
  //   expect(handleOnClose).toHaveBeenCalledTimes(1);
  //   // }, 1000);
  // });
});
