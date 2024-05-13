import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { useStyles } from "../../../styles/makeTheme";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";

interface Props {
  open: boolean;
  onClose: () => void;
  noOfShiftKey: string;
}
function ModalCloseSale({ open, onClose, noOfShiftKey }: Props) {
  const classes = useStyles();
  const onSubmit = () => {
    onClose();
  };
  return (
    <>
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth={true}
        key="modal-add-expense"
      >
        <DialogTitle>
          <Typography sx={{ fontSize: 20, fontWeight: 400 }}>
            ปิดรหัสการขายสำเร็จ
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ justifyContent: "center" }}>
          <Box>
            <Grid container data-testid="testid-label-noOfShiftKey">
              <Grid item xs={5}>
                <Typography variant="body2">จำนวนรหัสปิดรอบ:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography variant="body2">{noOfShiftKey} </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ justifyContent: "center", mb: 3, mr: 5, ml: 5, mt: 5 }}
        >
          <Button
            data-testid="testid-btnSubmit"
            id="btnSubmit"
            variant="contained"
            color="primary"
            onClick={onSubmit}
            sx={{ width: 110, ml: 2 }}
            className={classes.MbtnSearch}
          >
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModalCloseSale;
