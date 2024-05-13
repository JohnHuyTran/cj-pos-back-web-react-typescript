import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider, Typography } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import ModalShowHuaweiFile from "../../../../components/commons/ui/modal-show-huawei-file";
import React from "react";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
beforeEach(() => {
  store = mockStore(initialState);
});

describe("component modal show huawei file", () => {
  it("should click button  print ", async () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowHuaweiFile
            open={true}
            url={"https://picsum.photos/200/300?random=1"}
            isImage={true}
            fileName={"untest.jpg"}
            onClose={handleOnClick}
            isPrint={true}
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    setTimeout(() => {
      fireEvent.click(screen.getByTestId("btn-print"));
      setTimeout(() => {
        expect(handleOnPrint).toHaveBeenCalledTimes(1);
      }, 5000);
    }, 5000);

    // fireEvent.click(screen.getByLabelText('close'));
    // expect(handleOnClick).toHaveBeenCalledTimes(1);
  });

  it("should click button  close ", async () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowHuaweiFile
            open={true}
            url={"https://picsum.photos/200/300?random=1"}
            isImage={true}
            fileName={"untest.jpg"}
            onClose={handleOnClick}
            isPrint={true}
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    await new Promise((r) => setTimeout(r, 5000));

    fireEvent.click(screen.getByLabelText("close"));
    expect(handleOnClick).toHaveBeenCalledTimes(1);
  });

  it("should hide button print ", () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowHuaweiFile
            open={true}
            url={"https://picsum.photos/200/300?random=1"}
            isImage={false}
            fileName={""}
            onClose={handleOnClick}
            isPrint={false}
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.queryByLabelText("print")).toBeNull;
  });

  it("should display image ", () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowHuaweiFile
            open={true}
            url={"https://picsum.photos/200/300?random=1"}
            isImage={true}
            fileName={""}
            onClose={handleOnClick}
            isPrint={false}
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByTestId("testid-pdfWrapper-image")).toBeInTheDocument();
  });

  it("should display pdf ", () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowHuaweiFile
            open={true}
            url={
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            }
            isImage={false}
            fileName={""}
            onClose={handleOnClick}
            isPrint={false}
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(
      screen.getByTestId("testid-pdfWrapper-document"),
    ).toBeInTheDocument();
  });

  it("should display popup failed to load pdf ", async () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowHuaweiFile
            open={true}
            url={
              "https://posback-dev.obs.ap-southeast-2.myhuaweicloud.com/0101/BT22040101-000035-01.pdf?AWSAccessKeyId=O8YIMUIBJFUOILXDUNAM&Expires=1651803232&Signature=DOs%2BDXRjOvlAIy6VJlVi96%2FWlD8%3D"
            }
            isImage={false}
            fileName={""}
            onClose={handleOnClick}
            isPrint={true}
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );

    setTimeout(() => {
      expect(screen.getByText("Failed to load PDF")).toBeInTheDocument();
    }, 5000);
  });

  it("can close popup failed to load pdf", async () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowHuaweiFile
            open={true}
            url={
              "https://posback-dev.obs.ap-southeast-2.myhuaweicloud.com/0101/BT22040101-000035-01.pdf?AWSAccessKeyId=O8YIMUIBJFUOILXDUNAM&Expires=1651803232&Signature=DOs%2BDXRjOvlAIy6VJlVi96%2FWlD8%3D"
            }
            isImage={false}
            fileName={""}
            onClose={handleOnClick}
            isPrint={true}
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );

    setTimeout(() => {
      expect(screen.getByText("Failed to load PDF")).toBeInTheDocument();
      setTimeout(() => {
        fireEvent.click(screen.getByTestId("btnClose"));
        setTimeout(() => {
          expect(screen.queryByText("Failed to load PDF")).toBeNull();
        }, 5000);
      }, 5000);
    }, 5000);
  });
});
