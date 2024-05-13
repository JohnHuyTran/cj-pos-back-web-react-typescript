import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import AlertError from "../../../../components/commons/ui/alert-error";
import {
  ErrorDetail,
  ErrorDetailResponse,
  Header,
} from "../../../../models/api-error-model";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
const handleOnClose = jest.fn();
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
  wrapper = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AlertError
          open={true}
          onClose={handleOnClose}
          textError="กรุณาตรวจสอบข้อมูล"
        />
      </ThemeProvider>
    </Provider>,
  );
});

describe("component AlertError", () => {
  // console.debug('debug:', inputField);
  it("find button close", () => {
    expect(screen.getByTestId(/btnClose/)).toBeInTheDocument();
    let btnClose = screen.getByTestId(/btnClose/);
    expect(btnClose.textContent).toEqual("ปิด");
  });

  it("find alert text error", () => {
    expect(screen.getByTestId(/txtContent/)).toBeInTheDocument();
    let txtContent = screen.getByTestId(/txtContent/);
    expect(txtContent.textContent).toEqual("กรุณาตรวจสอบข้อมูล");
  });

  it("on click btn close", () => {
    fireEvent.click(screen.getByTestId(/btnClose/));
    expect(handleOnClose).toHaveBeenCalledTimes(1);
  });

  it("find alert text error", () => {
    const headers: Header = {
      field1: true,
      field2: true,
      field3: true,
      field4: true,
    };
    const errDetail: ErrorDetail = {
      skuCode: "000000000020008534",
      productName: "วาสลีนเมนออยโฟม(ฟ้า)100g",
      barcode: "8999999001988",
      barcodeName: "วาสลีนเมนออยโฟม(ฟ้า)100g Piece",
      qty: 10,
      docNo: "BT22060101-000061",
      toteCode: "T000000000",
      description: "Tote invalide",
    };
    const payloadData: ErrorDetailResponse = {
      header: headers,
      error_details: [errDetail, errDetail, errDetail],
    };
    const renders = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AlertError
            open={true}
            onClose={handleOnClose}
            textError="กรุณาตรวจสอบข้อมูล"
            payload={payloadData}
            title={"รายการ"}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(renders.queryAllByText("8999999001988")).toHaveLength(3);
  });
});
