import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { useAppSelector } from "../../../store/store";
import {
  ExpensePeriod,
  PeriodInfo,
} from "../../../models/branch-accounting-model";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import moment from "moment";
import ExpenseDetail from "./expense-detail";

interface Props {
  open: boolean;
  onClose: () => void;
  type: string;
  onConfirm: (value: ExpensePeriod) => void;
}

function ModalSelectPeriod({ open, onClose, type, onConfirm }: Props) {
  const classes = useStyles();
  const periods = useAppSelector(
    (state) => state.expensePeriodTypeSlice.expensePeriodList,
  );
  const periodDate: any = periods.data ? periods.data : [];
  const [valuesPeriod, setValuesPeriod] = useState("0");
  const [dataSelect, setDataSelect] = useState<ExpensePeriod>({
    period: 0,
    startDate: "",
    endDate: "",
  });

  const handleChange = (event: any) => {
    const value = event.target.value;

    setValuesPeriod(value);
    setDataSelect(periodDate[value]);
  };

  const handleConfirm = () => {
    onConfirm(dataSelect);
    onClose();
  };

  useEffect(() => {
    setDataSelect(periodDate[0]);
  }, [open]);

  return (
    <div>
      <Dialog
        open={open}
        maxWidth="xs"
        fullWidth={true}
        key="modal-select-period"
      >
        <DialogContent>
          <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
            กรุณาเลือกงวดเบิกที่ต้องการดำเนินการ
          </Typography>

          <FormControl fullWidth className={classes.Mselect}>
            <Select
              id="selPeriod"
              name="period"
              value={valuesPeriod}
              onChange={handleChange}
              inputProps={{ "aria-label": "Without label" }}
            >
              {/* <MenuItem disabled value="Select">
                <Typography>กรุณาเลือก</Typography>
              </MenuItem> */}

              {periodDate.map((value: any, indexs: number) => (
                <MenuItem value={indexs}>
                  งวด{" "}
                  {convertUtcToBkkDate(
                    moment(value.startDate).startOf("day").toISOString(),
                  )}{" "}
                  -{" "}
                  {convertUtcToBkkDate(
                    moment(value.endDate).startOf("day").toISOString(),
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button
            id="btnCancel"
            variant="contained"
            size="small"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 80, mr: 2 }}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            size="small"
            color="primary"
            sx={{ borderRadius: 2, width: 80 }}
            onClick={handleConfirm}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ModalSelectPeriod;
