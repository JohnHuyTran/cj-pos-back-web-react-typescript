//@ts-nocheck
import React, { useState } from "react";
// npm i @date-io/moment@1.x moment
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import OverwriteMomentBE from "../commons/ui/OverwriteMoment";
import { useStyles } from "../commons/ui/date-picker-css";

interface StateProps {
  onClickDate: any;
  value: any | Date | number | string;
  type?: string;
  minDateTo?: any | Date | number | string;
  error?: boolean;
  disabled?: boolean;
}

const defaultMaterialTheme = createTheme({
  palette: {
    primary: {
      main: "#36C690",
    },
  },
  typography: {
    fontFamily: "Kanit",
  },
});

const DatePickerComponent: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const today = new Date();
  const handleDateChange = (date: any) => {
    props.onClickDate(date);
  };

  let datePicker;
  if (props.type === "TO") {
    datePicker = (
      <KeyboardDatePicker
        disableToolbar
        clearable
        autoOk
        fullWidth
        variant="inline"
        inputVariant="outlined"
        format="DD/MM/YYYY"
        style={{ backgroundColor: props.disabled ? "#f1f1f1" : "transparent" }}
        className={
          props.error ? classes.MdatepickerError : classes.MdatepickerDetail
        }
        value={props.value}
        disabled={props.disabled}
        onChange={handleDateChange}
        InputProps={{
          endAdornment: !props.disabled && (
            <IconButton size="small" onClick={() => handleDateChange(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
          readOnly: true,
        }}
        InputAdornmentProps={{
          position: "start",
        }}
        // maxDate={today}
        minDate={props.minDateTo}
        placeholder="กรุณาเลือกวันที่"
      />
    );
  } else {
    datePicker = (
      <KeyboardDatePicker
        disableToolbar
        clearable
        autoOk
        fullWidth
        variant="inline"
        inputVariant="outlined"
        format="DD/MM/YYYY"
        style={{ backgroundColor: props.disabled ? "#f1f1f1" : "transparent" }}
        className={
          props.error ? classes.MdatepickerError : classes.MdatepickerDetail
        }
        value={props.value}
        disabled={props.disabled}
        onChange={handleDateChange}
        InputProps={{
          endAdornment: !props.disabled && (
            <IconButton size="small" onClick={() => handleDateChange(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
          readOnly: true,
        }}
        InputAdornmentProps={{
          position: "start",
        }}
        // maxDate={today}
        minDate={today}
        placeholder="กรุณาเลือกวันที่"
      />
    );
  }

  return (
    <div>
      <MuiPickersUtilsProvider utils={OverwriteMomentBE} locale="th">
        <ThemeProvider theme={defaultMaterialTheme}>{datePicker}</ThemeProvider>
      </MuiPickersUtilsProvider>
    </div>
  );
};

export default DatePickerComponent;
