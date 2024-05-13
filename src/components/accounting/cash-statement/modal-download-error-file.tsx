import React, { ReactElement, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { DialogActions, DialogContentText, Link } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import moment from "moment";

interface Props {
  open: boolean;
  onClickClose: () => void;
  titelError: string;
  textError: string;
  linkFileError: any;
  base64EncodeFile: any;
}

export default function ModalDownloadErrorFile({
  open,
  onClickClose,
  titelError,
  textError,
  linkFileError,
  base64EncodeFile,
}: Props): ReactElement {
  // useEffect(() => {}, [open === true]);

  const handleDownloadErrorFile = () => {
    var contentType = "application/vnd.ms-excel";
    const blob = b64toBlob(base64EncodeFile, contentType);
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);

    a.download = `FINANCE_RESULT_${moment(new Date()).format(
      "YYYYMMDDhhmmss",
    )}.xlsx`;
    a.click();
    onClickClose();
  };

  const b64toBlob = (b64Data: any, contentType = "", sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays: any = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="xs"
      >
        <DialogContent sx={{ padding: "1em" }}>
          <DialogContentText
            sx={{ textAlign: "center", whiteSpace: "pre-line" }}
          >
            <ErrorOutline sx={{ color: "#FF0000", fontSize: "4em" }} />
            <br />
            {titelError}
            <div style={{ color: "#FF0000" }}>{textError}</div>
            {linkFileError && (
              <Link
                onClick={handleDownloadErrorFile}
                style={{ color: "#FF0000", cursor: "pointer" }}
              >
                ดาวน์โหลดผลการ import file คลิ๊กที่ link นี้
              </Link>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ display: "block", textAlign: "center" }}>
          <Button
            id="btnClose"
            variant="contained"
            color="error"
            sx={{
              borderRadius: "5px",
              display: `${linkFileError ? "none" : ""}`,
            }}
            onClick={onClickClose}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
