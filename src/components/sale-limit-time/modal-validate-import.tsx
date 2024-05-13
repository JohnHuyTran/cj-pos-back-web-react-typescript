import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { ErrorOutline } from "@mui/icons-material";
import { Typography } from "@mui/material";

interface Props {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}
export default function ModalValidateImport(props: Props) {
  const handleClose = () => {
    props.onClose;
  };
  return (
    <div>
      <Dialog
        open={props.isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title-import-st"
        aria-describedby="alert-dialog-description-import-st"
        PaperProps={{ sx: { width: "464px" } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: "center" }}>
          <ErrorOutline sx={{ color: "#F54949", fontSize: "3em" }} />
          <Typography>{props.title}</Typography>
        </DialogTitle>
        <DialogContent>{props.children}</DialogContent>
      </Dialog>
    </div>
  );
}
