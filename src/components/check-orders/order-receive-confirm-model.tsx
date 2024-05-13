import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdateAction: (status: string) => void;
  sdNo: string;
  docRefNo: string;
  isTote?: boolean;
  toteCode?: string;
}

export default function OrderReceiveConfirmModel({
  open,
  onClose,
  onUpdateAction,
  sdNo,
  docRefNo,
  isTote,
  toteCode,
}: Props): ReactElement {
  const handleConfirm = () => {
    onUpdateAction("ok");
    onClose();
  };

  const handleClose = () => {
    onUpdateAction("cancel");
    onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ minWidth: 500 }}
      >
        {isTote && (
          <>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                sx={{ color: "#263238" }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ marginBottom: 2 }}
                >
                  ยืนยันการรับ-โอนสินค้า(Tote)
                </Typography>
                <Typography variant="body1" align="center">
                  เลขที่เอกสาร <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                  <label style={{ color: "#36C690" }}>
                    <b>{docRefNo}</b>
                  </label>
                </Typography>

                <Typography variant="body1" align="center">
                  เลข Tote <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                  <label style={{ color: "#36C690" }}>
                    <b>{toteCode}</b>
                  </label>
                </Typography>
              </DialogContentText>
            </DialogContent>
          </>
        )}

        {!isTote && (
          <>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                sx={{ color: "#263238" }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ marginBottom: 2 }}
                >
                  ยืนยันการรับ-โอนสินค้า
                </Typography>
                <Typography variant="body1" align="center">
                  เลขที่เอกสาร <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                  <label style={{ color: "#36C690" }}>
                    <b>{docRefNo}</b>
                  </label>
                </Typography>

                <Typography variant="body1" align="center">
                  เลขที่เอกสาร SD <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                  <label style={{ color: "#36C690" }}>
                    <b>{sdNo}</b>
                  </label>
                </Typography>
              </DialogContentText>
            </DialogContent>
          </>
        )}

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 80, mr: 2 }}
            onClick={handleClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, width: 80 }}
            onClick={handleConfirm}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
