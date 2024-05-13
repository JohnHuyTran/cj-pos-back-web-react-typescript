import { Dialog, Button, DialogContent } from "@mui/material";
import React, { ReactElement } from "react";
import { useState } from "react";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import throttle from "lodash.throttle";
import { useReactToPrint } from "react-to-print";
import AlertError from "./alert-error";
import { HighlightOff } from "@mui/icons-material";

interface ModalShowHuaweiFilerop {
  open: boolean;
  url: string;
  isImage: boolean;
  isPrint?: boolean;
  fileName: string;
  onClose: () => void;
  onPrint?: () => void;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onPrint?: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, onPrint, ...other } = props;
  return (
    <DialogTitle sx={{ m: 1, p: 2 }} {...other}>
      {children}

      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme: any) => theme.palette.grey[400],
          }}
        >
          <HighlightOff fontSize="large" />
        </IconButton>
      ) : null}

      {onPrint ? (
        <Button
          id="btnPrint"
          data-testid="btn-print"
          variant="contained"
          color="secondary"
          onClick={onPrint}
          endIcon={<LocalPrintshopOutlinedIcon />}
        >
          พิมพ์
        </Button>
      ) : null}
    </DialogTitle>
  );
};

export default function ModalShowHuaweiFile({
  open,
  url,
  isImage,
  isPrint,
  fileName,
  onClose,
}: ModalShowHuaweiFilerop): ReactElement {
  const [numPages, setNumPages] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const [openAlert, setOpenAlert] = useState(false);
  const pdfWrapper = React.useRef<HTMLDivElement>(null);
  const [initialPageSize, setInitialPageSize] = React.useState(false);

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
    setOpenAlert(true);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

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
    documentTitle: fileName,
    onBeforeGetContent: onSourceSuccess,
    content: () => pdfWrapper.current,
    onAfterPrint: () => handleClose(),
  });

  React.useEffect(() => {
    setInitialPageSize(false);
  }, [open]);
  return (
    <div>
      <Dialog open={open} maxWidth={false}>
        {isPrint !== false && (
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={handleClose}
            onPrint={showPrint}
          />
        )}

        {isPrint === false && (
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={handleClose}
          />
        )}

        <DialogContent
          sx={{
            minWidth: 600,
            minHeight: 600,
            textAlign: "center",
          }}
        >
          {!isImage && (
            <div
              id="pdfWrapper"
              style={{ width: "80vw" }}
              ref={pdfWrapper}
              data-testid="testid-pdfWrapper-document"
            >
              <Document
                file={{ url }}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadFail}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    onLoadSuccess={onSourceSuccess}
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={initialWidth}
                  />
                ))}
              </Document>
            </div>
          )}

          {isImage && (
            <div
              id="pdfWrapper"
              style={{ minWidth: "200px" }}
              ref={pdfWrapper}
              data-testid="testid-pdfWrapper-image"
            >
              <img
                src={url}
                style={{
                  width: "-webkit-fill-available",
                  height: "-webkit-fill-available",
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError="Failed to load PDF"
      />
    </div>
  );
}
