import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider, Typography } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";
import ModalShowPDF from "../../../../components/commons/ui/modal-show-file";
import React from "react";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
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
describe("component modal show file", () => {
  it("modal show document pdf with path file", async () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowPDF
            open={true}
            onClose={handleOnClick}
            url={"https://picsum.photos/200/300?random=1"}
            statusFile={1}
            sdImageFile={"SD22060101-001234"}
            fileName={"unittest.jpg"}
            btnPrintName="พิมพ์ใบผลต่าง"
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
    const handleOnClose = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowPDF
            open={true}
            onClose={handleOnClose}
            url={"https://picsum.photos/200/300?random=1"}
            statusFile={1}
            sdImageFile={"SD22060101-001234"}
            fileName={"unittest.jpg"}
            btnPrintName="พิมพ์ใบผลต่าง"
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    await new Promise((r) => setTimeout(r, 5000));

    fireEvent.click(screen.getByTestId("btn-close"));
    expect(handleOnClose).toHaveBeenCalledTimes(1);
  });

  it("should hide button print ", () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowPDF
            open={true}
            onClose={handleOnClick}
            url={"https://picsum.photos/200/300?random=1"}
            statusFile={1}
            sdImageFile={"SD22060101-001234"}
            fileName={"unittest.jpg"}
            btnPrintName="พิมพ์ใบผลต่าง"
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    // await new Promise((r) => setTimeout(r, 5000));
    expect(screen.queryByLabelText("print")).toBeNull;
  });

  it("should display document if statusFile = 1 ", () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowPDF
            open={true}
            onClose={handleOnClick}
            url={
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            }
            statusFile={1}
            sdImageFile={"SD22060101-001234"}
            fileName={""}
            btnPrintName="พิมพ์ใบผลต่าง"
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByTestId("testid-pdfWrapper-1")).toBeInTheDocument();
  });

  it("should display document if statusFile = 2 ", () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowPDF
            open={true}
            onClose={handleOnClick}
            url={
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            }
            statusFile={2}
            sdImageFile={"SD22060101-001234"}
            fileName={""}
            btnPrintName="พิมพ์ใบผลต่าง"
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByTestId("testid-pdfWrapper-2")).toBeInTheDocument();
  });

  it("should display popup failed to load pdf ", async () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowPDF
            open={true}
            onClose={handleOnClick}
            url={
              "https://posback-dev.obs.ap-southeast-2.myhuaweicloud.com/0101/BT22040101-000035-01.pdf?AWSAccessKeyId=O8YIMUIBJFUOILXDUNAM&Expires=1651803232&Signature=DOs%2BDXRjOvlAIy6VJlVi96%2FWlD8%3D"
            }
            statusFile={1}
            sdImageFile={""}
            fileName={""}
            btnPrintName="พิมพ์ใบผลต่าง"
            onPrint={handleOnPrint}
          />
        </ThemeProvider>
      </Provider>,
    );

    setTimeout(() => {
      expect(screen.getByText("Failed to load PDF")).toBeInTheDocument();
    }, 5000);
  });

  it("should display popup failed to load pdf ", async () => {
    const handleOnClick = jest.fn();
    const handleOnPrint = jest.fn();
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ModalShowPDF
            open={true}
            onClose={handleOnClick}
            url={
              "https://posback-dev.obs.ap-southeast-2.myhuaweicloud.com/0101/BT22040101-000035-01.pdf?AWSAccessKeyId=O8YIMUIBJFUOILXDUNAM&Expires=1651803232&Signature=DOs%2BDXRjOvlAIy6VJlVi96%2FWlD8%3D"
            }
            statusFile={1}
            sdImageFile={""}
            fileName={""}
            btnPrintName="พิมพ์ใบผลต่าง"
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
          <ModalShowPDF
            open={true}
            onClose={handleOnClick}
            url={
              "https://posback-dev.obs.ap-southeast-2.myhuaweicloud.com/0101/BT22040101-000035-01.pdf?AWSAccessKeyId=O8YIMUIBJFUOILXDUNAM&Expires=1651803232&Signature=DOs%2BDXRjOvlAIy6VJlVi96%2FWlD8%3D"
            }
            statusFile={2}
            sdImageFile={"SD22060101-001234"}
            fileName={""}
            btnPrintName="พิมพ์ใบผลต่าง"
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
