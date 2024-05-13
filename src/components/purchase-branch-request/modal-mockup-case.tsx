import React, { ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Typography,
} from "@mui/material";
import { useStyles } from "../../styles/makeTheme";

interface Props {
  open: boolean;
  onClose: (caseNo: string) => void;
  caseNo: string;
}

export default function modalMockupCase({
  open,
  onClose,
  caseNo,
}: Props): ReactElement {
  const classes = useStyles();

  const [valueCase, setValueCase] = React.useState(null);
  const handleChange = (event: any) => {
    const value = event.target.value;
    console.log(value);
    setValueCase(value);
  };

  const handleClose = () => {
    return onClose(valueCase ? valueCase : "5");
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xs"
    >
      <DialogContent sx={{ padding: "1em" }}>
        <DialogContentText
          data-testid="txtContent"
          sx={{ textAlign: "left", color: "#000000" }}
        >
          <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
            กรุณากรอกเลขResponse Case <br /> ที่ต้องการTest
          </Typography>
          <TextField
            id="txtDocNo"
            name="docNo"
            size="small"
            value={valueCase}
            inputProps={{ maxLength: 1 }}
            onChange={handleChange}
            fullWidth
            className={classes.MtextField}
            placeholder="กรุณากรอกเลข 1 - 6"
            autoComplete="off"
          />
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
          onClick={handleClose}
          disabled={valueCase === null}
        >
          ตกลง
        </Button>
      </DialogActions>
    </Dialog>
  );
}
