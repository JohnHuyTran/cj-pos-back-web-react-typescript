import React, { useEffect } from "react";
import { useStyles } from "../../styles/makeTheme";
import { useAppSelector, useAppDispatch } from "../../store/store";
import {
  FormControl,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { featchTransferReasonsListAsync } from "../../store/slices/transfer-reasons-slice";

interface Props {
  reasonsValue?: string;
  isClear: boolean;
  isDetail?: boolean;
  onChangeReasons: (branchCode: string) => void;
}

function ReasonsListDropDown({
  reasonsValue,
  isClear,
  isDetail,
  onChangeReasons,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  let reasonsList = useAppSelector(
    (state) => state.transferReasonsList.reasonsList.data,
  );
  const [reasons, setReasons] = React.useState("All");
  useEffect(() => {
    if (reasonsList === null || reasonsList.length <= 0)
      dispatch(featchTransferReasonsListAsync());

    if (reasonsValue !== "" && reasonsValue !== undefined)
      setReasons(reasonsValue);
    else setReasons("All");
  }, [isClear]);

  const handleChange = (event: any) => {
    const value = event.target.value;
    setReasons(value);
    return onChangeReasons(value ? value : "");
  };

  return (
    <FormControl fullWidth className={classes.Mselect}>
      <Select
        id="selReasons"
        value={reasons}
        onChange={handleChange}
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value={"All"}>
          {isDetail && (
            <label style={{ fontSize: 14, color: "#a2a2a2" }}>กรุณาเลือก</label>
          )}
          {!isDetail && "ทั้งหมด"}
        </MenuItem>
        {reasonsList.map((reason) => (
          <MenuItem key={reason.id} value={reason.code}>
            {reason.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default ReasonsListDropDown;
