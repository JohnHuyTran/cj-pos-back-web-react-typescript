import { InfoRounded } from "@mui/icons-material";
import { Dialog, DialogContent, Grid, Typography } from "@mui/material";
import React from "react";
import { ExpenseInfo } from "../../../models/branch-accounting-model";
import { useAppSelector } from "../../../store/store";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
interface Props {
  open: boolean;
  onClickClose: () => void;
  type: string;
}
function ModelDescriptionExpense({ open, onClickClose, type }: Props) {
  const expenseMasterList = useAppSelector(
    (state) => state.masterExpenseListSlice.masterExpenseList.data,
  );
  return (
    <Dialog open={open} maxWidth="xs" fullWidth={true}>
      <DialogContent>
        <BootstrapDialogTitle id="dialog-title" onClose={onClickClose}>
          <Typography sx={{ fontWeight: "bold" }} variant="body2">
            รายการเอกสารแนบ
          </Typography>
          {expenseMasterList
            .filter(
              (i: ExpenseInfo) =>
                i.isActive && i.typeCode === type && !i.isOtherExpense,
            )
            .map((i: ExpenseInfo, index: number) => {
              return (
                <Typography variant="body2" key={index}>
                  {i.accountNameTh} :{i.requiredDocumentTh}
                </Typography>
              );
            })}
          <Typography variant="subtitle1">อื่นๆ</Typography>
          {expenseMasterList
            .filter(
              (i: ExpenseInfo) =>
                i.isActive && i.typeCode === type && i.isOtherExpense,
            )
            .map((i: ExpenseInfo, index: number) => {
              return (
                <Typography variant="body2" key={index}>
                  {i.accountNameTh} :{i.requiredDocumentTh}
                </Typography>
              );
            })}
        </BootstrapDialogTitle>
      </DialogContent>
    </Dialog>
  );
}

export default ModelDescriptionExpense;
