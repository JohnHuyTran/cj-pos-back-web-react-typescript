import React, { Fragment, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import moment from "moment";
import NumberFormat from "react-number-format";

//css
import { useStyles } from "../../../styles/makeTheme";

//modal
import { ApiError } from "../../../models/api-error-model";

//component
import DatePickerAllComponent from "../../commons/ui/date-picker-all";
import { cashStatementEdit } from "../../../services/accounting";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import AlertError from "../../commons/ui/alert-error";
import LoadingModal from "../../commons/ui/loading-modal";

const initialStateValues: any = {
  date: new Date(),
  cashOver: 0,
  cashShort: 0,
};
interface Props {
  open: boolean;
  onClose: () => void;
  payloadEdit: any;
}

function ModalEditSearchList({ open, onClose, payloadEdit }: Props) {
  const classes = useStyles();

  const [values, setValues] = useState(initialStateValues);
  const [isValidateCash, setIsValidateCash] = useState(true);
  const [msgError, setMsgError] = useState("");
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarMsg, setSnackBarMsg] = useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [textError, setTextError] = useState("");
  const [openLoadingModal, setOpenLoadingModal] = useState(false);

  const today = new Date();
  const maxDate = moment(new Date()).add(6, "days");
  const payEdit = payloadEdit.salesDate;
  const payEditDate = moment(payEdit, "DD/MM/YYYY")
    .subtract(543, "year")
    .format("MM/DD/YYYY");
  const d = new Date(payEditDate);

  const handleDatePicker = (value: any) => {
    setValues({ ...values, date: value });
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    const removeCommar = value.replace(/\,/g, "");
    setValues({ ...values, [event.target.name]: removeCommar });
  };

  const validateCash = () => {
    const cashOver = Number(values.cashOver);
    const cashShort = Number(values.cashShort);
    if (cashOver === 0 && cashShort === 0) {
      setMsgError("กรอกจำนวนเงินไม่ถูกต้อง");
    } else if (cashOver > 0 && cashShort > 0) {
      setMsgError("จำนวนเงินต้องมี เงินขาดหรือเงินเกิน เท่านั้น");
    } else {
      return true;
    }
  };

  const handleSaveBtn = async () => {
    setOpenLoadingModal(true);
    const isValidateCashValue = validateCash();

    if (isValidateCashValue) {
      setIsValidateCash(true);

      const payloadSave: any = {
        id: payloadEdit.id,
        salesDate: moment(values.date).startOf("day").toISOString(),
        cashOver: Number(values.cashOver),
        cashShort: Number(values.cashShort),
      };

      cashStatementEdit(payloadSave)
        .then((value) => {
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setSnackBarMsg("บันทึก เรียบร้อยแล้ว");

          setTimeout(() => {
            onClose();
          }, 500);
        })
        .catch((error: ApiError) => {
          setOpenAlert(true);
          setTextError(error.message);
          setMsgError("");
        })
        .finally(() => setOpenLoadingModal(false));
    } else {
      setOpenLoadingModal(false);
      setIsValidateCash(false);
    }
  };

  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  useEffect(() => {
    setMsgError("");
    setIsValidateCash(true);

    if (Number(d.getDate()) <= Number(today.getDate())) {
      setValues({
        ...values,
        date: new Date(),
        cashOver: payloadEdit ? payloadEdit.cashOver : "0",
        cashShort: payloadEdit ? payloadEdit.cashShort : "0",
      });
    } else {
      setValues({
        ...values,
        date: d,
        cashOver: payloadEdit ? payloadEdit.cashOver : "0",
        cashShort: payloadEdit ? payloadEdit.cashShort : "0",
      });
    }
  }, [open]);

  return (
    <Fragment>
      <Dialog open={open} maxWidth="sm" fullWidth={true}>
        <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
          <Typography variant="h6">แก้ไขข้อมูล</Typography>
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={5} textAlign="right">
              <Typography variant="body1">วันที่ยอดขาย : </Typography>
            </Grid>
            <Grid item xs={5} textAlign="left">
              <DatePickerAllComponent
                onClickDate={handleDatePicker}
                value={values.date}
                type={"TO"}
                minDateTo={today}
                maxDate={maxDate}
              />
            </Grid>
            <Grid item xs={5} textAlign="right" sx={{ mt: 1 }}>
              <Typography variant="body1">เงินขาด : </Typography>
            </Grid>
            <Grid item xs={5} textAlign="left" sx={{ mt: 1 }}>
              <NumberFormat
                name="cashShort"
                value={String(values.cashShort)}
                thousandSeparator={true}
                decimalScale={2}
                className={classes.MtextFieldNumberNotStyleDisable}
                customInput={TextField}
                onChange={handleChange}
                fullWidth
                fixedDecimalScale
                allowNegative={false}
                type="text"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: `${!isValidateCash ? "#F54949" : "#000000"}`,
                    },
                    "&:hover fieldset": {
                      borderColor: `${!isValidateCash ? "#F54949" : "#000000"}`,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={5} textAlign="right">
              <Typography variant="body1">เงินเกิน : </Typography>
            </Grid>
            <Grid item xs={5} textAlign="left">
              <NumberFormat
                name="cashOver"
                value={String(values.cashOver)}
                thousandSeparator={true}
                decimalScale={2}
                className={classes.MtextFieldNumberNotStyleDisable}
                customInput={TextField}
                onChange={handleChange}
                fullWidth
                fixedDecimalScale
                allowNegative={false}
                type="text"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: `${!isValidateCash ? "#F54949" : "#000000"}`,
                    },
                    "&:hover fieldset": {
                      borderColor: `${!isValidateCash ? "#F54949" : "#000000"}`,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Typography variant="body1" color="error">
                {msgError ? msgError : ""}
              </Typography>
            </Grid>
          </Grid>

          <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
            <Button
              data-testid="testid-btnEdit"
              id="btnEdit"
              variant="contained"
              color="primary"
              size="large"
              className={classes.MbtnSearch}
              onClick={handleSaveBtn}
            >
              บันทึก
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <LoadingModal open={openLoadingModal} />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />
      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={snackBarMsg}
      />
    </Fragment>
  );
}

export default ModalEditSearchList;
