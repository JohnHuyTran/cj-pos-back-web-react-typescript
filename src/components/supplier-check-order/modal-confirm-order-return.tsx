import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { Typography } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  handleConfirm: () => void;
  header: string;
  title1: string;
  title2: string;
  valuePN: string;
  valuePI: string;
}

function ModalConfirmOrderReturn({
  open,
  onClose,
  handleConfirm,
  header,
  title1,
  title2,
  valuePN,
  valuePI,
}: Props): ReactElement {
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ minWidth: 500 }}
      >
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
              {header}
            </Typography>
            {valuePI && (
              <Typography variant="body1" align="center">
                {title2} <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                <label style={{ color: "#36C690" }}>
                  <b>{valuePI}</b>
                </label>
              </Typography>
            )}
            <Typography variant="body1" align="center">
              {title1} <label style={{ color: "#AEAEAE" }}>|</label>{" "}
              <label style={{ color: "#36C690" }}>
                <b>{valuePN}</b>
              </label>
            </Typography>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 80, mr: 2 }}
            onClick={onClose}
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

export default ModalConfirmOrderReturn;
