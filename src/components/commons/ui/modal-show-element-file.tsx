import { Button, Box, Typography, Grid } from "@mui/material";
import React, { ReactElement, useEffect } from "react";
import { useState } from "react";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import { useReactToPrint } from "react-to-print";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import theme from "../../../styles/theme";
import { getFileUrlHuawei } from "../../../services/master-service";
import { ApiError } from "../../../models/api-error-model";
import { objectNullOrEmpty, stringNullOrEmpty } from "../../../utils/utils";

interface ModalShowElementProps {
  attachFile: any[];
  currentFileOpenKey?: string;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onPrint?: () => void;
}

interface fileDisplayList {
  branchCode?: string;
  file?: File;
  fileKey?: string;
  fileName?: string;
  status?: string;
  mimeType?: string;
}

export default function ModalShowElementFile({
  attachFile,
  currentFileOpenKey,
}: ModalShowElementProps): ReactElement {
  const [numPages, setNumPages] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const pdfWrapper = React.useRef<HTMLDivElement>(null);
  const [initialPageSize, setInitialPageSize] = React.useState(false);

  const [lstAttachFile, setLstAttachFile] = React.useState<any>(attachFile);
  const [accordionFile, setAccordionFile] = useState<boolean>(true);
  const lstFileWrapper = React.useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<any>({
    url: "",
    isImage: false,
    fileName: "",
    isShow: false,
  });

  useEffect(() => {
    if (
      !stringNullOrEmpty(currentFileOpenKey) &&
      lstAttachFile &&
      lstAttachFile.length > 0
    ) {
      const currentFileOpen = lstAttachFile.find(
        (it: any) => it.fileKey === currentFileOpenKey,
      );
      if (!objectNullOrEmpty(currentFileOpen)) {
        getHuaweiFileUrl(currentFileOpen);
      }
    }
  }, [currentFileOpenKey]);

  const setPdfSize = () => {
    if (pdfWrapper && pdfWrapper.current) {
      setInitialWidth(pdfWrapper.current.getBoundingClientRect().width);
    }
  };

  function onDocumentLoadSuccess(pdf: any) {
    setNumPages(pdf.numPages);
    // window.addEventListener('resize', throttle(setPdfSize, 300));
    setPdfSize();
    return () => {
      // window.removeEventListener('resize', throttle(setPdfSize, 300));
    };
  }

  const onDocumentLoadFail = (error: any) => {
    // setOpenAlert(true);
  };

  const handleClose = () => {};

  const onSourceSuccess = () => {
    if (!initialPageSize) {
      if (pdfWrapper && pdfWrapper.current) {
        setStyle(
          `${pdfWrapper.current.getBoundingClientRect().width}px ${
            pdfWrapper.current.getBoundingClientRect().height
          }px`,
        );
      } else {
        setStyle("A4 landscape");
      }
    }
    setInitialPageSize(true);
  };

  const setStyle = (cssPageSize: string) => {
    const style = document.createElement("style");
    style.innerHTML = `@page {size: ${cssPageSize}}`;
    style.id = "page-orientation";
    document.head.appendChild(style);
  };

  const showPrint = useReactToPrint({
    documentTitle: values.fileName,
    onBeforeGetContent: onSourceSuccess,
    content: () => pdfWrapper.current,
    onAfterPrint: () => handleClose(),
  });

  const getHuaweiFileUrl = (item: fileDisplayList) => {
    const keys = item.fileKey ? item.fileKey : "";
    const branchCode = item.branchCode ? item.branchCode : "";
    const name = item.fileName ? item.fileName : "";

    getFileUrlHuawei(keys, branchCode)
      .then((resp) => {
        if (resp && resp.data) {
          setValues({
            ...values,
            url: resp.data,
            isImage: item.mimeType === "image/jpeg",
            fileName: name,
            isShow: true,
          });
        }
      })
      .catch((error: ApiError) => {
        console.log("error", error);
      });
  };

  const calHeightShowPdf = () => {
    let heightWhenHaveExpand = 60;
    if (lstFileWrapper && lstFileWrapper.current) {
      heightWhenHaveExpand =
        70 -
        (lstFileWrapper.current.getBoundingClientRect().height /
          window.innerHeight) *
          100;
    }
    return accordionFile ? heightWhenHaveExpand + "vh" : "70vh";
  };

  return (
    <div style={{ width: "100%" }}>
      <Grid container xs={12}>
        <Grid item xs={3} sx={{ textAlign: "left", minWidth: 120 }}>
          {showPrint ? (
            <Button
              id="btnPrint"
              data-testid="btn-print"
              variant="contained"
              color="secondary"
              sx={{ width: 100, height: "36.5px" }}
              onClick={showPrint}
              endIcon={<LocalPrintshopOutlinedIcon />}
            >
              พิมพ์
            </Button>
          ) : null}
        </Grid>
        <Grid item xs={8} mb={5}>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: "5px",
              border: `1px dashed ${theme.palette.primary.main}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => {
                if (lstAttachFile.length > 0) setAccordionFile(!accordionFile);
              }}
            >
              <Typography sx={{ fontSize: "14px", color: "#676767" }}>
                เอกสารแนบ จำนวน {lstAttachFile.length}/5
              </Typography>
              {accordionFile ? (
                <KeyboardArrowUp color="primary" />
              ) : (
                <KeyboardArrowDown color="primary" />
              )}
            </Box>

            <Box
              sx={{ display: accordionFile ? "visible" : "none" }}
              ref={lstFileWrapper}
            >
              {lstAttachFile.length > 0 &&
                lstAttachFile.map((item: fileDisplayList, index: number) => (
                  <Box
                    key={index}
                    component="a"
                    href={void 0}
                    sx={{
                      color: theme.palette.secondary.main,
                      cursor: item.status === "old" ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      color="secondary"
                      sx={{
                        textDecoration: "underline",
                        fontSize: "13px",
                        whiteSpace: "normal",
                      }}
                      noWrap
                      onClick={() => getHuaweiFileUrl(item)}
                    >
                      {item.fileName}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Grid container xs={12}>
        {values.isShow && !values.isImage && (
          <div
            id="pdfWrapper"
            style={{
              width: "100%",
              height: calHeightShowPdf(),
              overflow: "auto",
            }}
            data-testid="testid-pdfWrapper-document"
          >
            <Document
              inputRef={pdfWrapper}
              file={values.url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadFail}
              error={"ไม่สามารถโหลดไฟล์ PDF กรุณาคลิกเพื่อโหลดอีกครั้ง."}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  onLoadSuccess={onSourceSuccess}
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={initialWidth - 25}
                />
              ))}
            </Document>
          </div>
        )}

        {values.isShow && values.isImage && (
          <div
            id="pdfWrapper"
            style={{
              margin: "auto",
              minWidth: "200px",
            }}
            ref={pdfWrapper}
            data-testid="testid-pdfWrapper-image"
          >
            <img
              src={values.url}
              style={{
                width: "-webkit-fill-available",
                height: "-webkit-fill-available",
              }}
            />
          </div>
        )}
      </Grid>
    </div>
  );
}
