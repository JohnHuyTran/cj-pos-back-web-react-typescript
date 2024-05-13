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
  isFilterOutFieldForPayload,
  isFilterOutFieldInAdd,
  stringNullOrEmpty,
} from "../../../utils/utils";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import NumberFormat from "react-number-format";
import { setInit } from "store/sessionStore";

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
      const value = e.value;
      let _data: any;
      if (!isFilterOutFieldForPayload(e.key)) {
        _data = value
          .toString()
          .replace(/[^0-9.]/g, "")
          .replace(/,/g, "");
        _data = parseFloat(_data);
        data = { ...data, [e.key]: _data };
      } else {
        data = { ...data, [e.key]: e.value };
      }
      if (!isFilterOutFieldInAdd(e.key)) {
        sum += _data;

        const master = getMasterExpenInto(e.key);
        const _isOtherExpense = master ? master.isOtherExpense : false;
        if (_isOtherExpense) {
          _otherSum += _data;
        }
      }
    });
    data = { ...data, total: sum, SUMOTHER: _otherSum };
    if (sum > 0) {
      await dispatch(addSummaryItem(data));
      await dispatch(haveUpdateData(true));
      setInit("N");
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
            if (typeof i.value === "string") {
              _otherSum += parseFloat(i.value);
            } else {
              _otherSum += i.value;
            }
          }
          if (!isFilterOutFieldInAdd(i.key)) {
            if (typeof i.value === "string") {
              sum += parseFloat(i.value);
            } else {
              sum += i.value;
            }
          }
        });
      setSumOther(_otherSum);
      setIsDisableSaveBtn(false);
      setSumExpense(sum);
    }
  }, [open, payload]);

  const handleChangeNew = (value: any, name: any) => {
    const _data = value.replace(/[^0-9.]/g, "").replace(/,/g, "");
    const onlyNumber = parseFloat(_data || 0);
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
    const _data = value.replace(/[^0-9.]/g, "").replace(/,/g, "");
    const data = parseFloat(_data || 0);
    let _otherSum: number = 0;
    let sum: number = 0;
    testList.forEach((element: any) => {
      if (element.key === name) {
        element.value = data;
      }
      if (
        !isFilterFieldInExpense(element.key) &&
        isOtherExpenseField(element.key)
      ) {
        if (element.key === name) {
          _otherSum += data;
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
              ยอดเงินอนุมัติ :{" "}
              <NumberFormat
                value={sumExpense}
                displayType={"text"}
                decimalScale={2}
                thousandSeparator={true}
                fixedDecimalScale
              />
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
                          <Typography
                            variant="body2"
                            sx={{ wordWrap: "break-word" }}
                          >
                            {i.title}:{" "}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          {/* <TextField
                            id={i.key}
                            name={i.key}
                            size='small'
                            value={i.value}
                            onChange={(event) => handleChangeNew(event.target.value, i.key)}
                            className={classes.MtextField}
                            fullWidth
                            placeholder=''
                            autoComplete='off'
                            disabled={!master?.isActive}
                          /> */}
                          <NumberFormat
                            id={i.key}
                            name={i.key}
                            value={i.value}
                            onChange={(event: any) =>
                              handleChangeNew(event.target.value, i.key)
                            }
                            decimalScale={2}
                            className={classes.MtextFieldNumberNotStyleDisable}
                            disabled={!master?.isActive}
                            customInput={TextField}
                            fixedDecimalScale
                            autoComplete="off"
                            thousandSeparator={true}
                            allowNegative={false}
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
                  {/* <TextField
                    id='txtDocNo'
                    name='sumOther'
                    size='small'
                    value={sumOther}
                    // onChange={handleOnChange}
                    className={classes.MtextField}
                    fullWidth
                    placeholder=''
                    autoComplete='off'
                    disabled={true}
                  /> */}

                  <NumberFormat
                    id="txtDocNo"
                    name="sumOther"
                    value={String(sumOther)}
                    // onChange={handleOnChange}
                    decimalScale={2}
                    className={classes.MtextFieldNumberNotStyleDisable}
                    disabled={true}
                    customInput={TextField}
                    fixedDecimalScale
                    autoComplete="off"
                    thousandSeparator={true}
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
                          <Typography
                            variant="body2"
                            sx={{ wordWrap: "break-word" }}
                          >
                            {i.title}:{" "}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          {/* <TextField
                            id='txtDocNo'
                            name={i.key}
                            size='small'
                            value={i.value}
                            onChange={(event) => handleChangeNewOnOtherExpense(event.target.value, i.key)}
                            className={classes.MtextField}
                            fullWidth
                            placeholder=''
                            disabled={!master?.isActive}
                          /> */}
                          <NumberFormat
                            id={i.key}
                            name={i.key}
                            value={i.value}
                            onChange={(event: any) =>
                              handleChangeNewOnOtherExpense(
                                event.target.value,
                                i.key,
                              )
                            }
                            decimalScale={2}
                            className={classes.MtextFieldNumberNotStyleDisable}
                            disabled={!master?.isActive}
                            customInput={TextField}
                            fixedDecimalScale
                            autoComplete="off"
                            thousandSeparator={true}
                            allowNegative={false}
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
