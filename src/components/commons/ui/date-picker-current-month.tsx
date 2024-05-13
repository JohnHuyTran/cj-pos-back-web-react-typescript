//@ts-nocheck
import React from "react";
// npm i @date-io/moment@1.x moment
import OverwriteMomentBE from "./OverwriteMoment"; // choose your lib
import { useStyles } from "./date-picker-css";

import {
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
  error?: boolean;
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
const DatePickerComponent: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // let serv_utc = moment.utc(props.value, 'YYYY-MM-DD HH:mm:ss').toDate();
  // const firstDay = new Date(serv_utc.getFullYear(), serv_utc.getMonth(), 1);
  // const lastDay = new Date(serv_utc.getFullYear(), serv_utc.getMonth() + 1, 0);

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
        className={props.error ? classes.MdatepickerError : classes.Mdatepicker}
        value={props.value}
        onChange={handleDateChange}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={() => handleDateChange(null)}
              data-testid="endDateIconClose"
              id="endDateIconClose"
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
        // minDate={today}
        // maxDate={lastDay}
        placeholder="กรุณาเลือกวันที่"
        minDateMessage={"วันที่ต้องมากกว่าเท่ากับ วันที่ค่าใช้จ่าย"}
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
        className={props.error ? classes.MdatepickerError : classes.Mdatepicker}
        value={props.value}
        onChange={handleDateChange}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              onClick={() => handleDateChange(null)}
              data-testid="startDateIconClose"
              id="startDateIconClose"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
          readOnly: true,
        }}
        InputAdornmentProps={{
          position: "start",
        }}
        minDate={firstDay}
        maxDate={lastDay}
        placeholder="กรุณาเลือกวันที่"
        minDateMessage={"วันที่ภายในเดือนปัจจุบันเท่านั้น"}
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
