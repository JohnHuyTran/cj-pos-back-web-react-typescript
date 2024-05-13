import React, { ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface Props {
  open: boolean;
  onClose: () => void;
  textError: string;
  items: any[];
}

export default function AlertError({
  open,
  onClose,
  textError,
  items,
}: Props): ReactElement {
  let item: any = [];
  for (let i = 0; i < items.length; i++) {
    item.push(
      <Box sx={{ textAlign: "left", paddingLeft: "10px" }}>{items[i]}</Box>,
    );
  }

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth="xs"
    >
      <DialogContent sx={{ padding: "1em" }}>
        <DialogContentText
          data-testid="txtContent"
          sx={{ textAlign: "center", whiteSpace: "pre-line", color: "#000000" }}
        >
          <ErrorOutline sx={{ color: "#F54949", fontSize: "4em" }} />
          <Box>{textError}</Box>
          <Box sx={{ textAlign: "left", paddingLeft: "10px" }}>
            เลขที่เอกสาร:
          </Box>
          {item}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "center", margin: "10px 0px 20px 0px" }}
      >
        <Button
          data-testid="btnClose"
          id="btnClose"
          variant="contained"
          color="error"
          sx={{ borderRadius: "5px", width: "126px" }}
          onClick={onClose}
        >
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
