//@ts-nocheck
import React, { useState } from "react";

import moment from "moment";
// npm i @date-io/moment@1.x moment
import OverwriteMomentBE from "./OverwriteMoment"; // choose your lib
import { useStyles } from "./date-picker-css";

import {
  DatePicker,
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
interface StateProps {
  onClickDate: any;
  value: any | Date | number | string;
  type?: string;
  minDateTo?: any | Date | number | string;
  maxDate?: any | Date | number | string;
  disabled?: boolean;
  isError?: boolean;
  hyperText?: string;
  placeHolder?: string;
  disableMinDateMsg?: boolean;
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

// export default function DatePickerComponent() {
const DatePickerAllComponent: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const today = new Date();
  // const [selectedDate, setSelectedDate] = React.useState(
  //   moment().add(0, "years")
  // );

  const handleDateChange = (date: any) => {
    props.onClickDate(date);
  };

  let datePicker;
  if (props.type === "TO") {
    datePicker = (
      <KeyboardDatePicker
        disableToolbar
        clearable="true"
        autoOk
        fullWidth
        variant="inline"
        inputVariant="outlined"
        format="DD/MM/YYYY"
        className={classes.Mdatepicker}
        value={props.value}
        onChange={handleDateChange}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={() => !props.disabled && handleDateChange(null)}
              data-testid="endDateIconClose"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
          readOnly: true,
        }}
        InputAdornmentProps={{
          position: "start",
        }}
        minDate={props.minDateTo}
        maxDate={props.maxDate ? props.maxDate : ""}
        placeholder={props.placeHolder ? props.placeHolder : "กรุณาเลือกวันที่"}
        minDateMessage={
          props.disableMinDateMsg
            ? ""
            : "วันที่ ต้องมากกว่าหรือเท่ากับวันที่ปัจจุบัน"
        }
        disabled={props.disabled ? props.disabled : false}
        helperText={props.hyperText}
        error={props.isError}
      />
    );
  } else {
    datePicker = (
      <KeyboardDatePicker
        disableToolbar
        clearable="true"
        autoOk
        fullWidth
        variant="inline"
        inputVariant="outlined"
        format="DD/MM/YYYY"
        className={classes.Mdatepicker}
        value={props.value}
        onChange={handleDateChange}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={() => handleDateChange(null)}
              data-testid="startDateIconClose"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
          readOnly: true,
        }}
        InputAdornmentProps={{
          position: "start",
        }}
        placeholder="กรุณาเลือกวันที่"
        disabled={props.disabled ? props.disabled : false}
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

export default DatePickerAllComponent;
