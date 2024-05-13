//@ts-nocheck
import DatePicker from "react-multi-date-picker";
import { AnySchema } from "yup";
// import InputIcon from 'react-multi-date-picker/components/input_icon';
import { useStyles } from "./date-picker-css";

import thai from "./thai";
import thai_th from "./thai_th";
// import classes from '*.module.css';

interface StateProps {
  onClickDate: any;
  isDisabled?: boolean;
  value: any | Date | number | string;
}

const DatePickerMonth: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const today = new Date();
  // console.log('today: ', today);
  // const date = '01/2022';
  const handleDateChange = (date: AnySchema) => {
    props.onClickDate(date);
  };

  return (
    <div
      className={classes.MdatepickerMulti}
      style={{ backgroundColor: props.isDisabled && "#EAEBEB" }}
    >
      <DatePicker
        onlyMonthPicker
        calendar={thai}
        locale={thai_th}
        value={props.value}
        onChange={handleDateChange}
        placeholder="กรุณาเลือกเดือน"
        editable={false}
        arrow={false}
        disabled={props.isDisabled}
      />
    </div>
  );
};

export default DatePickerMonth;
