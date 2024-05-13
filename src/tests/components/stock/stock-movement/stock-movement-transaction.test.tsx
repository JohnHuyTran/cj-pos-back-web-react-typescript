import {
  render,
  screen,
  fireEvent,
  RenderResult,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";
import {
  mockDataMovementTransaction,
  mockDataStockMovement,
} from "../../../mockdata-store/mock-store-stock";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import StockMovementTransaction from "../../../../components/stock/stock-movement/stock-movement-transaction";
let wrapper: RenderResult<
  typeof import("@testing-library/dom/types/queries"),
  HTMLElement
>;
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store: Store<any, AnyAction>;
const handleClose = jest.fn();
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(mockDataStockMovement);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <StockMovementTransaction
          open={true}
          onClose={handleClose}
          movementTransaction={mockDataMovementTransaction}
        />
      </ThemeProvider>
    </Provider>,
  );
});
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

describe("component stock-movement-transaction", () => {
  it("find transaction in data grid have doc no : 18851123803233", () => {
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toContainHTML("18851123803233");

    fireEvent.click(screen.getByTestId("testid-btnClose"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
