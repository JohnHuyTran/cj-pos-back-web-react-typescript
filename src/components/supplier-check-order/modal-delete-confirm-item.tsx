import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";

interface Props {
  open: boolean;
  itemMsg?: string;
  onClose: (confirm: boolean) => void;
}

export default function ModelDelConfirm({
  open,
  onClose,
  itemMsg,
}: Props): ReactElement {
  const handleDeleteItem = async () => {
    return onClose(true);
  };

  const handleClose = () => {
    return onClose(false);
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      sx={{ minWidth: 800 }}
    >
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          sx={{ color: "#263238" }}
        >
          <Typography variant="h6" align="center" sx={{ marginBottom: 1 }}>
            ยืนยันการยกเลิกใบคืนสินค้า
          </Typography>
          {itemMsg && (
            <Typography variant="body1" align="left">
              เลขที่ใบเอกสาร PN{" "}
              <label style={{ color: "#AEAEAE", marginRight: 5 }}>|</label>{" "}
              <label style={{ color: "#36C690" }}>
                <b>{itemMsg}</b>
                {/* <br />
              <label style={{ color: '#AEAEAE', fontSize: 14, marginLeft: '3.8em' }}>{skuCode}</label> */}
              </label>
            </Typography>
          )}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mb: 2, pl: 6, pr: 6 }}>
        <Button
          id="btnCancle"
          variant="contained"
          color="cancelColor"
          sx={{ borderRadius: 2, width: 90, mr: 2 }}
          onClick={handleClose}
        >
          ยกเลิก
        </Button>
        <Button
          id="btnConfirm"
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, width: 90 }}
          onClick={handleDeleteItem}
        >
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
}
