import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  ExpenseInfo,
  payLoadAdd,
} from "../../../models/branch-accounting-model";
import {
  addSummaryItem,
  haveUpdateData,
} from "../../../store/slices/accounting/accounting-slice";
import LoadingModal from "../../commons/ui/loading-modal";
import {
  isFilterFieldInExpense,
  isFilterOutFieldInAdd,
  stringNullOrEmpty,
} from "../../../utils/utils";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";

interface Props {
  open: boolean;
  onClose: () => void;
  payload: any;
}
function ModalUpdateExpenseSummary({ open, onClose, payload }: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [isopen, setIsopen] = React.useState(open);
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [isDisableSaveBtn, setIsDisableSaveBtn] = React.useState(false);
  const expenseMasterList = useAppSelector(
    (state) => state.masterExpenseListSlice.masterExpenseList.data,
  );
  const [values, setValues] = React.useState({});
  const [sumOther, setSumOther] = React.useState(0);
  const [testList, setTestList] = React.useState<any>([]);

  const [flagEdit, setFlagEdit] = React.useState<boolean>(false);
  const [sumExpense, setSumExpense] = React.useState<number>(0);

  const handleSaveBtn = async () => {
    setOpenLoadingModal(true);

    let data: any;
    let sum: number = 0;
    let _otherSum: number = 0;
    testList.map((e: any) => {
      data = { ...data, [e.key]: e.value };
      if (!isFilterOutFieldInAdd(e.key)) {
        sum += Number(e.value) || 0;

        const master = getMasterExpenInto(e.key);
        const _isOtherExpense = master ? master.isOtherExpense : false;
        if (_isOtherExpense) {
          _otherSum += Number(e.value) || 0;
        }
      }
    });
    data = { ...data, total: sum, SUMOTHER: _otherSum };
    if (sum > 0) {
      await dispatch(addSummaryItem(data));
      await dispatch(haveUpdateData(true));
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setIsDisableSaveBtn(true);
    }
    setOpenLoadingModal(false);
  };

  useEffect(() => {
    setTestList(payload);
    if (payload) {
      let _otherSum: number = 0;
      let sum: number = 0;
      payload
        // .filter((i: payLoadAdd) => !isFilterOutFieldInAdd(i.key) && isOtherExpenseField(i.key))
        .map((i: payLoadAdd) => {
          if (!isFilterOutFieldInAdd(i.key) && isOtherExpenseField(i.key)) {
            _otherSum += Number(i.value);
          }
          if (!isFilterOutFieldInAdd(i.key)) {
            sum += Number(i.value);
          }
        });
      setSumOther(_otherSum);
      setIsDisableSaveBtn(false);
      setSumExpense(sum);
    }
  }, [open, payload]);

  const handleChangeNew = (value: any, name: any) => {
    const onlyNumber = value.replace(/[^0-9]/g, "");
    let sum: number = 0;
    const data = Number(onlyNumber) || 0;
    testList.forEach((element: any) => {
      if (element.key === name) {
        element.value = data;
      }
      sum += element.value;
    });

    setSumExpense(sum);
    if (sum > 0) {
      setIsDisableSaveBtn(false);
    }
    setFlagEdit(true);
  };

  const handleChangeNewOnOtherExpense = (value: any, name: any) => {
    const onlyNumber = value.replace(/[^0-9]/g, "");
    let _otherSum: number = 0;
    let sum: number = 0;
    const data = Number(onlyNumber) || 0;
    testList.forEach((element: any) => {
      if (element.key === name) {
        element.value = data;
      }
      if (
        !isFilterFieldInExpense(element.key) &&
        isOtherExpenseField(element.key)
      ) {
        if (element.key === name) {
          _otherSum += Number(data);
        } else {
          _otherSum += element.value;
        }
      }
      sum += element.value;
    });

    setSumOther(_otherSum);
    setSumExpense(sum);
    setFlagEdit(true);
    if (sum > 0) {
      setIsDisableSaveBtn(false);
    }
  };

  useEffect(() => {
    setTestList(testList);

    setFlagEdit(false);
  }, [flagEdit === true]);
  const getMasterExpenInto = (key: any) =>
    expenseMasterList.find((e: ExpenseInfo) => e.expenseNo === key);
  const isOtherExpenseField = (key: any) => {
    const master = getMasterExpenInto(key);
    return master?.isOtherExpense;
  };

  return (
    <div>
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth={true}
        key="modal-add-expense"
      >
        <BootstrapDialogTitle id="dialog-title" onClose={onClose} />
        <DialogContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={3}>
              ยอดเงินอนุมัติ : {Number(sumExpense)}
            </Grid>
            <Grid item xs={4}></Grid>
            <>
              <Grid container spacing={2} mb={2} mt={2} ml={1}>
                {testList
                  .filter(
                    (i: payLoadAdd) =>
                      !isFilterOutFieldInAdd(i.key) && !i.isOtherExpense,
                  )
                  .map((i: payLoadAdd) => {
                    const master = getMasterExpenInto(i.key);
                    return (
                      <>
                        <Grid item xs={2}>
                          <Typography variant="body2">{i.title}: </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <TextField
                            id={i.key}
                            name={i.key}
                            size="small"
                            value={i.value}
                            onChange={(event) =>
                              handleChangeNew(event.target.value, i.key)
                            }
                            className={classes.MtextField}
                            fullWidth
                            placeholder=""
                            autoComplete="off"
                            disabled={!master?.isActive}
                          />
                        </Grid>
                      </>
                    );
                  })}
              </Grid>
              <Grid container spacing={2} mt={2}>
                <Grid item xs={2} ml={1}>
                  ค่าอื่นๆ:
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    id="txtDocNo"
                    name="sumOther"
                    size="small"
                    value={sumOther}
                    // onChange={handleOnChange}
                    className={classes.MtextField}
                    fullWidth
                    placeholder=""
                    autoComplete="off"
                    disabled={true}
                  />
                </Grid>
              </Grid>

              <Grid
                container
                spacing={2}
                mb={2}
                mt={2}
                ml={1}
                pr={2}
                pb={2}
                sx={{ border: 1, borderColor: "#EAEBEB" }}
              >
                {testList
                  .filter(
                    (i: payLoadAdd) =>
                      i.isOtherExpense && !isFilterOutFieldInAdd(i.key),
                  )
                  .map((i: payLoadAdd) => {
                    const master = getMasterExpenInto(i.key);
                    return (
                      <>
                        <Grid item xs={2}>
                          <Typography variant="body2">{i.title}: </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <TextField
                            id="txtDocNo"
                            name={i.key}
                            size="small"
                            value={i.value}
                            onChange={(event) =>
                              handleChangeNewOnOtherExpense(
                                event.target.value,
                                i.key,
                              )
                            }
                            className={classes.MtextField}
                            fullWidth
                            placeholder=""
                            disabled={!master?.isActive}
                          />
                        </Grid>
                      </>
                    );
                  })}
              </Grid>
            </>
          </Grid>
          <DialogActions>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                data-testid="testid-btnAdd"
                id="btnAdd"
                variant="contained"
                color="secondary"
                onClick={handleSaveBtn}
                className={classes.MbtnSearch}
                size="large"
                disabled={isDisableSaveBtn ? true : false}
                startIcon={<AddCircleOutlineIcon />}
              >
                บันทึก
              </Button>
            </Box>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <LoadingModal open={openLoadingModal} />
    </div>
  );
}

export default ModalUpdateExpenseSummary;
