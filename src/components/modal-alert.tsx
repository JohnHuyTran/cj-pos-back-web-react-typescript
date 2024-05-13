import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface SimpleDialogProps {
  open: boolean;
  errormsg: string;
  onClose: (value: string) => void;
}

export default function ModalAlert(props: SimpleDialogProps) {
  const { open, errormsg, onClose } = props;

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="xs"
      >
        <DialogContent sx={{ textAlign: "center" }}>
          <InfoOutlinedIcon color="error" sx={{ fontSize: 60 }} />
          <DialogContentText id="alert-dialog-description">
            {errormsg}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleListItemClick("OK")}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
