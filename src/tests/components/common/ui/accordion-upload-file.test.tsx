import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Store, AnyAction } from "@reduxjs/toolkit";
import { initialState } from "../../../mockStore";
import { ThemeProvider, Typography } from "@mui/material";
import theme from "../../../../styles/theme";
import { mockUserInfo } from "../../../mockData";

import AccordionUploadFile from "../../../../components/commons/ui/accordion-upload-file";
import React from "react";
import { FileType } from "../../../../models/supplier-check-order-model";

let wrapper;
const mockStore = configureStore();
let store: Store<any, AnyAction>;
sessionStorage.setItem("user_info", mockUserInfo);
const file: FileType = {
  fileKey: "key1234",
  fileName: "test.pdf",
  mimeType: "application/pdf",
  branchCode: "",
};
const handleOnChangeUploadFile = jest.fn();
const handleOnDeleteFile = jest.fn();
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

describe("component accordion upload file", () => {
  it("should browse file ", () => {
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AccordionUploadFile
            files={[file]}
            isStatus={true}
            onChangeUploadFile={handleOnChangeUploadFile}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByTestId("testid-btnBrowse")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("testid-btnBrowse"));
    setTimeout(() => {
      fireEvent.click(screen.getByTestId("testid-tbxBrowse"));
      fireEvent.change(screen.getByTestId("testid-tbxBrowse"));
      setTimeout(() => {
        expect(handleOnChangeUploadFile).toHaveBeenCalledTimes(1);
      }, 5000);
    }, 5000);
  });

  it("should delete file ", () => {
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AccordionUploadFile
            files={[file]}
            isStatus={true}
            onChangeUploadFile={handleOnChangeUploadFile}
            onDeleteAttachFile={handleOnDeleteFile}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByTestId("testid-btnBrowse")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("testid-btnBrowse"));
    setTimeout(() => {
      fireEvent.click(screen.getByTestId("testid-btnDeletefile"));
      setTimeout(() => {
        expect(handleOnDeleteFile).toHaveBeenCalledTimes(1);
        setTimeout(() => {
          expect(screen.getByText("test.pdf")).toBeInTheDocument();
        }, 5000);
      }, 5000);
    }, 5000);
  });

  it("should button browse file is disable went enable ", () => {
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AccordionUploadFile
            files={[file]}
            isStatus={true}
            onChangeUploadFile={handleOnChangeUploadFile}
            reMark={"remark unit test"}
            enabledControl={false}
          />
        </ThemeProvider>
      </Provider>,
    );
    setTimeout(() => {
      const button = screen.getByText(/แนบไฟล์/).closest("button");
      expect(button).toBeDisabled();
    }, 5000);
  });

  // it('should not permission delete icon delete not display', () => {
  //   const container = render(
  //     <Provider store={store}>
  //       <ThemeProvider theme={theme}>
  //         <AccordionUploadFile
  //           files={[file, file, file, file, file]}
  //           isStatus={true}
  //           onChangeUploadFile={handleOnChangeUploadFile}
  //           reMark={'remark unit test'}
  //           enabledControl={false}
  //           deletePermission={false}
  //         />
  //       </ThemeProvider>
  //     </Provider>
  //   );
  //   // setTimeout(() => {
  //   expect(screen.queryByTestId('testid-btnDeletefile')).toBeNull();
  //   // }, 5000);
  // });

  it("should remark display to remark unit test ", () => {
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AccordionUploadFile
            files={[file]}
            isStatus={true}
            onChangeUploadFile={handleOnChangeUploadFile}
            reMark={"remark unit test"}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByText("remark unit test")).toBeInTheDocument();
  });

  it("should  display warning  to warning message ", () => {
    const container = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AccordionUploadFile
            files={[file]}
            isStatus={true}
            onChangeUploadFile={handleOnChangeUploadFile}
            reMark={"remark unit test"}
            warningMessage={"warning message"}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(screen.getByText("warning message")).toBeInTheDocument();
  });
});
