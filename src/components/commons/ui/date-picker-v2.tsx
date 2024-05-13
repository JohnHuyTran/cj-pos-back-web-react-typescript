//@ts-nocheck
import React, { useState } from "react";
// npm i @date-io/moment@1.x moment
import OverwriteMomentBE from "./OverwriteMoment"; // choose your lib
import { useStyles } from "./date-picker-css";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  DatePicker,
} from "@material-ui/pickers";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import moment from "moment";

interface StateProps {
  onClickDate: any;
  value: any | Date | number | string;
  type?: string;
  minDateTo?: any | Date | number | string;
  placeHolder?: string | "กรุณาเลือกวันที่";
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
  const minDay = moment(today);
  const handleDateChange = (date: any) => {
    props.onClickDate(date);
  };

  let datePicker;
  if (props.type === "TO") {
    datePicker = (
      <DatePicker
        disableToolbar
        clearable
        autoOk
        fullWidth
        variant="inline"
        inputVariant="outlined"
        format="DD/MM/YYYY"
        className={
          props.error ? classes.MdatepickerError : classes.MdatepickerV2
        }
        value={props.value}
        onChange={handleDateChange}
        disabled={props.disabled}
        data-testid="EndDate"
        // InputProps={{
        //   endAdornment: (
        //     <IconButton size="small" onClick={() => handleDateChange(null)}>
        //       <CloseIcon fontSize="small" />
        //     </IconButton>
        //   ),
        //   readOnly: true,
        // }}
        InputAdornmentProps={{
          position: "start",
        }}
        // maxDate={today}
        minDate={props.minDateTo}
        placeholder={props.placeHolder}
      />
    );
  } else {
    datePicker = (
      <DatePicker
        disableToolbar
        clearable
        autoOk
        fullWidth
        variant="inline"
        inputVariant="outlined"
        format="DD/MM/YYYY"
        className={
          props.error ? classes.MdatepickerError : classes.MdatepickerV2
        }
        value={props.value}
        onChange={handleDateChange}
        data-testid="StartDate"
        // InputProps={{
        //   endAdornment: (
        //     <IconButton size="small" onClick={() => handleDateChange(null)}>
        //       <CloseIcon fontSize="small" />
        //     </IconButton>
        //   ),
        //   readOnly: true,
        // }}
        InputAdornmentProps={{
          position: "start",
        }}
        // maxDate={today}
        minDate={minDay}
        minDateMessage={""}
        placeholder={props.placeHolder}
        disabled={props.disabled}
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
