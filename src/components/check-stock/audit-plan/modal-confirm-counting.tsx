import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { FormControl, MenuItem, Select } from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { Box } from "@mui/system";
import { STORE_TYPE } from "../../../utils/enum/common-enum";

interface Confirm {
  open: boolean;
  onClose: () => void;
  onConfirm: (store: number) => void;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

export default function ModalConfirmCounting(props: Confirm) {
  const { open, onClose, onConfirm } = props;
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [error, setError] = React.useState<boolean>(false);

  const handleChangeValue = (e: any) => {
    setValue(e.target.value);
    setError(false);
  };

  const handleClose = () => {
    onClose();
  };

  const confirmApproveBtn = () => {
    if (value == 0) {
      setError(true);
      return;
    }
    onConfirm(value);
    onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
            width={350}
          >
            <Typography variant="body1" align="center" mt={3}>
              กรุณาเลือกคลัง
            </Typography>
            <Box textAlign={"center"} mt={1.5} mb={1}>
              <FormControl
                sx={{ width: "70%", textAlign: "left" }}
                className={classes.Mselect}
              >
                <Select
                  id="status"
                  name="status"
                  value={value}
                  error={error}
                  onChange={handleChangeValue}
                  inputProps={{ "aria-label": "Without label" }}
                  renderValue={
                    value !== 0
                      ? undefined
                      : () => (
                          <Typography color={"#AEAEAE"}>กรุณาเลือก</Typography>
                        )
                  }
                >
                  <MenuItem value={STORE_TYPE.FRONT}>หน้าร้าน</MenuItem>
                  <MenuItem value={STORE_TYPE.BACK}>หลังร้าน</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button
            id="btnCancel"
            variant="contained"
            size="small"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 80, mr: 2 }}
            onClick={handleClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            size="small"
            color="primary"
            sx={{ borderRadius: 2, width: 80 }}
            onClick={confirmApproveBtn}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
