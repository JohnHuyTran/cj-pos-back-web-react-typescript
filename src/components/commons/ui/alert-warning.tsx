import { ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  text: string;
}

export default function AlertError({
  open,
  onClose,
  text,
}: Props): ReactElement {
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
          <br />
          {text}{" "}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "center", margin: "10px 0px 20px 0px" }}
      >
        <Button
          data-testid="btnClose"
          id="btnClose"
          variant="contained"
          color="primary"
          sx={{ borderRadius: "5px", width: "126px" }}
          onClick={onClose}
        >
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
