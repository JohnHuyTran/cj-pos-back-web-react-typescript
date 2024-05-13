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
import store, { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import DatePickerAllComponent from "../../commons/ui/date-picker-all";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  ExpenseInfo,
  ExpensePeriod,
  payLoadAdd,
} from "../../../models/branch-accounting-model";
import { values } from "lodash";
import {
  addNewItem,
  haveUpdateData,
  updateItemRows,
} from "../../../store/slices/accounting/accounting-slice";
import LoadingModal from "../../commons/ui/loading-modal";
import userEvent from "@testing-library/user-event";
import { setInit } from "../../../store/sessionStore";
import {
  isFilterFieldInExpense,
  isFilterOutFieldForPayload,
  isFilterOutFieldInAdd,
  stringNullOrEmpty,
  stringNumberNullOrEmpty,
} from "../../../utils/utils";
import moment from "moment";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import { STATUS } from "../../../utils/enum/accounting-enum";
import { border } from "@mui/system";
import NumberFormat from "react-number-format";
import { isGroupBranch } from "utils/role-permission";

interface Props {
  open: boolean;
  onClose: () => void;
  periodProps?: ExpensePeriod;
  edit: boolean;
  payload: any;
  type: string;
}
function ModalAddExpense({
  open,
  onClose,
  periodProps,
  edit,
  payload,
  type,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [isEdit, setisEdit] = React.useState(edit);
  const [isopen, setIsopen] = React.useState(open);
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [isErrorDate, setIsErrorDate] = React.useState(false);
  const [errorDate, setErrorDate] = React.useState("");
  const [disableCalendar, setDisableCalendar] = React.useState(false);
  const [isDisableSaveBtn, setIsDisableSaveBtn] = React.useState(true);
  const expenseMasterList = useAppSelector(
    (state) => state.masterExpenseListSlice.masterExpenseList.data,
  );
  const items = store.getState().expenseAccountDetailSlice.itemRows;
  const _initialItems = useAppSelector(
    (state) => state.expenseAccountDetailSlice.intialRows,
  );
  const expenseAccountDetail = useAppSelector(
    (state) => state.expenseAccountDetailSlice.expenseAccountDetail,
  );
  const expenseData: any = expenseAccountDetail.data
    ? expenseAccountDetail.data
    : null;
  const [enableSaveBtn, setEnableSaveBtn] = React.useState(false);

  const [values, setValues] = React.useState({});
  const [sumOther, setSumOther] = React.useState(0);
  const { v4: uuidv4 } = require("uuid");
  const [testList, setTestList] = React.useState<any>(payload);
  const [expenseType, setExpenseType] = React.useState<any>(type);

  const [flagEdit, setFlagEdit] = React.useState<boolean>(false);
  const handleStartDatePicker = (value: any) => {
    const selectDate = moment(new Date(value)).format("DD/MM/YYYY");
    const itemCheck = items && items.length > 0 ? items : _initialItems;
    let isError = false;
    itemCheck.forEach((e: any) => {
      const arr = Object.entries(e);
      const _dateTime = arr.find((e: any) => e[0] === "dateTime");
      const dateTime = _dateTime ? _dateTime[1] : null;
      let existingDate = "";
      if (typeof dateTime === "object") {
        existingDate = moment(dateTime).startOf("day").format("DD/MM/YYYY");
      } else if (typeof dateTime === "string") {
        existingDate = moment(new Date(dateTime)).format("DD/MM/YYYY");
      }

      if (selectDate === existingDate) {
        isError = true;
        return;
      }
    });

    if (isError) {
      setIsErrorDate(true);
      setErrorDate("เลือกวันที่ซ้ำ กรุณาเลือกใหม่");
    } else {
      setIsErrorDate(false);
      setErrorDate("");
    }
    setStartDate(value);
  };

  const handleSaveBtn = async () => {
    let isError = false;
    if (startDate === null) {
      setErrorDate("กรุณาเลือกวันที่");
      setIsErrorDate(true);
    } else {
      setOpenLoadingModal(true);
      if (edit) {
        let data: any;
        let sum: number = 0;
        let _otherSum: number = 0;
        let _otherDetail: string = "";
        let _isOverApprovalLimit1 = false;
        let _isOverApprovalLimit2 = false;
        testList.map((e: any) => {
          const value = e.value;
          let _data: any;
          if (!isFilterOutFieldForPayload(e.key)) {
            _data = value
              .toString()
              .replace(/[^0-9.]/g, "")
              .replace(/,/g, "");

            _data = Math.round(parseFloat(_data) * 100) / 100;
            data = { ...data, [e.key]: Number(_data) };
          } else {
            data = { ...data, [e.key]: e.value };
          }

          if (!isFilterOutFieldInAdd(e.key)) {
            sum += _data;
          }
          const master = getMasterExpenInto(e.key);
          const amount = _data;
          if (!isFilterFieldInExpense(e.key) && master?.isOtherExpense) {
            _otherSum += _data;
            if (_data > 0) {
              _otherDetail += `${getOtherExpenseName(e.key)},`;
            }

            if (amount > master.approvalLimit1) {
              _isOverApprovalLimit1 = true;
            }
            if (amount > master.approvalLimit2) {
              _isOverApprovalLimit2 = true;
            }
          }
        });

        data = {
          ...data,
          total: Math.round(sum * 100) / 100,
          SUMOTHER: _otherSum,
          otherDetail: _otherDetail.substring(0, _otherDetail.length - 1),
          isOverApprovalLimit1: _isOverApprovalLimit1,
          isOverApprovalLimit2: _isOverApprovalLimit2,
        };

        if (sum > 0) {
          await dispatch(addNewItem(data));
        } else {
          isError = true;
          setIsDisableSaveBtn(true);
        }
      } else {
        let allItem = {};
        let _otherSum: number = 0;
        let _otherDetail: string = "";
        let _isOverApprovalLimit1 = false;
        let _isOverApprovalLimit2 = false;
        const arr = Object.entries(values);
        expenseMasterList
          .filter((e: ExpenseInfo) => e.isActive && e.typeCode === expenseType)
          .map((e: ExpenseInfo) => {
            allItem = {
              ...allItem,
              [e.expenseNo]: Number(0),
            };
          });

        let preData: any;
        arr.map((element: any) => {
          const master = getMasterExpenInto(element[0]);
          const key = element[0];
          const _amount = (element[1] || 0)
            .replace(/[^0-9.]/g, "")
            .replace(/,/g, "");
          const amount = parseFloat(_amount);

          if (!isFilterFieldInExpense(element[0]) && master?.isOtherExpense) {
            _otherSum += amount;
            if (amount > 0) {
              _otherDetail += `${getOtherExpenseName(element[0])},`;
            }
            if (amount > master.approvalLimit1) {
              _isOverApprovalLimit1 = true;
            }
            if (amount > master.approvalLimit2) {
              _isOverApprovalLimit2 = true;
            }
          }
          preData = { ...preData, [element[0]]: amount };
        });
        allItem = {
          ...allItem,
          ...preData,
        };
        const data = {
          ...allItem,
          id: uuidv4(),
          total: sum(preData),
          date: convertUtcToBkkDate(
            moment(startDate).startOf("day").toISOString(),
          ),
          dateTime: startDate,
          SUMOTHER: _otherSum,
          otherDetail: _otherDetail.substring(0, _otherDetail.length - 1),
          isOverApprovalLimit1: _isOverApprovalLimit1,
          isOverApprovalLimit2: _isOverApprovalLimit2,
        };
        if (sum(preData) > 0) {
          await dispatch(addNewItem(data));
        } else {
          isError = true;
          setIsDisableSaveBtn(true);
        }
      }
      setOpenLoadingModal(false);
      if (!isError) {
        await dispatch(haveUpdateData(true));
        setInit("N");
        onClose();
      }
    }
  };

  // const handleSaveBtn = async () => {
  //   setOpenLoadingModal(true);

  //   const data = { ...values, id: uuidv4(), total: 100, date: '09/07' };
  //   await dispatch(addNewItem(data));
  //   setInit('N');
  //   setTimeout(() => {
  //     setOpenLoadingModal(false);
  //     onClose();
  //   }, 300);
  // };Math.round(parseFloat(obj[key] || 0) * 100) / 100

  function sum(obj: any) {
    return Object.keys(obj).reduce(
      (sum, key) => sum + Math.round(parseFloat(obj[key] || 0) * 100) / 100,
      0,
    );
  }

  const handleChange = (event: any) => {
    const data = event.target.value.replace(/[^0-9.]/g, "").replace(/,/g, "");
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
    let sum: number = 0;
    const arr = Object.entries(values);
    arr.map((element: any) => {
      if (!isFilterFieldInExpense(element[0])) {
        sum += element[1];
      }
    });
    sum += parseFloat(data);
    if (sum > 0) {
      setIsDisableSaveBtn(false);
    }
  };
  const handleOnChange = (event: any) => {
    const data = event.target.value.replace(/[^0-9.]/g, "").replace(/,/g, "");
    const _data = event.target.value;
    const value = parseFloat(data);
    const name = event.target.name;
    setValues({ ...values, [event.target.name]: _data });

    const arr = Object.entries(values);
    let _otherSum: number = 0;
    let isNewItem = true;
    arr.map((element: any) => {
      if (
        !isFilterFieldInExpense(element[0]) &&
        isOtherExpenseField(element[0])
      ) {
        if (name === element[0]) {
          _otherSum += value;
          isNewItem = false;
        } else {
          const _element = element[1].replace(/[^0-9.]/g, "").replace(/,/g, "");
          _otherSum += parseFloat(_element);
        }
      }
    });
    if (isNewItem) {
      _otherSum += value;
    }

    // _otherSum += value;
    setSumOther(_otherSum);
    if (_otherSum > 0) {
      setIsDisableSaveBtn(false);
    }
  };

  useEffect(() => {
    setTestList(payload);
    setExpenseType(type);
    setValues({});
    if (payload && edit) {
      let _otherSum: number = 0;
      payload
        .filter(
          (i: payLoadAdd) =>
            !isFilterOutFieldInAdd(i.key) && isOtherExpenseField(i.key),
        )
        .map((i: payLoadAdd) => {
          _otherSum += Number(i.value);
        });
      const date = payload.find((i: payLoadAdd) => i.key === "dateTime");
      setSumOther(_otherSum);
      setIsDisableSaveBtn(false);
      setIsErrorDate(false);
      setStartDate(date.value);
      setDisableCalendar(true);
    } else {
      setSumOther(0);
      setStartDate(null);
      setIsDisableSaveBtn(true);
      setDisableCalendar(false);
      setIsErrorDate(false);
      setErrorDate("");
    }
    if (expenseData) {
      if (isGroupBranch()) {
        setEnableSaveBtn(
          expenseData.status === STATUS.DRAFT ||
            expenseData.status === STATUS.SEND_BACK_EDIT,
        );
      }
    } else {
      setEnableSaveBtn(true);
    }
  }, [open, edit, payload]);

  const handleChangeNew = (value: any, name: any) => {
    // const onlyNumber = value;
    // const data = Number(onlyNumber);
    testList.forEach((element: any) => {
      if (element.key === name) {
        element.value = value;
      }
    });
    setFlagEdit(true);
  };
  const handleChangeNewOnOtherExpense = (value: any, name: any) => {
    let _otherSum: number = 0;
    // const data = Number(onlyNumber);
    const _data = value.replace(/[^0-9.]/g, "").replace(/,/g, "");
    const data = parseFloat(_data || 0);
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
    });
    setSumOther(_otherSum);
    setFlagEdit(true);
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
  const getOtherExpenseName = (key: any) => {
    return getMasterExpenInto(key)?.accountNameTh;
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
              เพิ่มรายการจ่ายวันที่ :
            </Grid>
            <Grid item xs={4}>
              <DatePickerAllComponent
                onClickDate={handleStartDatePicker}
                value={startDate}
                type={"TO"}
                minDateTo={
                  periodProps?.startDate ? periodProps.startDate : startDate
                }
                maxDate={periodProps?.endDate ? periodProps.endDate : endDate}
                isError={isErrorDate}
                hyperText={isErrorDate ? errorDate : ""}
                disabled={disableCalendar}
              />
            </Grid>
            {!edit && (
              <>
                <Grid container spacing={2} mb={2} mt={2} ml={1}>
                  {expenseMasterList
                    .filter(
                      (i: ExpenseInfo) =>
                        i.isActive &&
                        !i.isOtherExpense &&
                        i.typeCode === expenseType,
                    )
                    .map((i: ExpenseInfo) => {
                      const arr = Object.entries(values);
                      const defaul = arr.find((e: any) => e[0] === i.expenseNo);

                      return (
                        <>
                          <Grid item xs={2}>
                            <Typography
                              variant="body2"
                              sx={{ wordWrap: "break-word" }}
                            >
                              {i.accountNameTh}:{" "}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            {/* <TextField
                              id={i.expenseNo}
                              name={i.expenseNo}
                              size='small'
                              value={defaul ? defaul[1] : ''}
                              onChange={handleChange}
                              className={classes.MtextField}
                              fullWidth
                              placeholder=''
                              autoComplete='off'
                              disabled={enableSaveBtn ? false : true}
                            /> */}

                            <NumberFormat
                              id={i.expenseNo}
                              name={i.expenseNo}
                              value={String(defaul ? defaul[1] : "")}
                              onChange={handleChange}
                              decimalScale={2}
                              className={
                                classes.MtextFieldNumberNotStyleDisable
                              }
                              disabled={enableSaveBtn ? false : true}
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
                <Grid container spacing={2} mt={2} ml={1}>
                  <Grid item xs={2}>
                    ค่าอื่นๆ:
                  </Grid>
                  <Grid item xs={2}>
                    {/* <TextField
                      id='txbSumOther'
                      name='sumOther'
                      size='small'
                      value={sumOther}
                      className={classes.MtextField}
                      fullWidth
                      placeholder=''
                      autoComplete='off'
                      disabled={true}
                    /> */}

                    <NumberFormat
                      id="txbSumOther"
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
                  {expenseMasterList
                    .filter(
                      (i: ExpenseInfo) =>
                        i.isActive &&
                        i.isOtherExpense &&
                        i.typeCode === expenseType,
                    )
                    .map((i: ExpenseInfo) => {
                      const arr = Object.entries(values);
                      const defaul = arr.find((e: any) => e[0] === i.expenseNo);
                      return (
                        <>
                          <Grid item xs={2}>
                            <Typography
                              variant="body2"
                              sx={{ wordWrap: "break-word" }}
                            >
                              {i.accountNameTh}:{" "}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            {/* <TextField
                              id={i.expenseNo}
                              name={i.expenseNo}
                              size='small'
                              value={defaul ? defaul[1] : ''}
                              onChange={handleOnChange}
                              className={classes.MtextField}
                              fullWidth
                              placeholder=''
                              autoComplete='off'
                              disabled={enableSaveBtn ? false : true}
                            /> */}

                            <NumberFormat
                              id={i.expenseNo}
                              name={i.expenseNo}
                              value={String(defaul ? defaul[1] : "")}
                              onChange={handleOnChange}
                              decimalScale={2}
                              className={
                                classes.MtextFieldNumberNotStyleDisable
                              }
                              disabled={enableSaveBtn ? false : true}
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
            )}

            {edit && testList && (
              <>
                <Grid container spacing={2} mb={2} mt={2} ml={1}>
                  {testList
                    .filter(
                      (i: payLoadAdd) =>
                        !isFilterOutFieldInAdd(i.key) &&
                        !isOtherExpenseField(i.key),
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
                              {master?.accountNameTh}:{" "}
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
                              disabled={master?.isActive && enableSaveBtn ? false : true}
                            /> */}

                            <NumberFormat
                              id={i.key}
                              name={i.key}
                              value={i.value}
                              onChange={(event: any) =>
                                handleChangeNew(event.target.value, i.key)
                              }
                              decimalScale={2}
                              className={
                                classes.MtextFieldNumberNotStyleDisable
                              }
                              disabled={
                                master?.isActive && enableSaveBtn ? false : true
                              }
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
                <Grid container spacing={2} mt={2} ml={1}>
                  <Grid item xs={2}>
                    ค่าอื่นๆ:
                  </Grid>
                  <Grid item xs={2}>
                    {/* <TextField
                      id='txtDocNo'
                      name='sumOther'
                      size='small'
                      value={sumOther}
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
                        !isFilterOutFieldInAdd(i.key) &&
                        isOtherExpenseField(i.key),
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
                              {master?.accountNameTh}:{" "}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            {/* <TextField
                              id={i.key}
                              name={i.key}
                              size='small'
                              value={i.value}
                              onChange={(event) => handleChangeNewOnOtherExpense(event.target.value, i.key)}
                              className={classes.MtextField}
                              fullWidth
                              placeholder=''
                              autoComplete='off'
                              disabled={master?.isActive && enableSaveBtn ? false : true}
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
                              className={
                                classes.MtextFieldNumberNotStyleDisable
                              }
                              disabled={
                                master?.isActive && enableSaveBtn ? false : true
                              }
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
            )}
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
                disabled={
                  isErrorDate || startDate === null || isDisableSaveBtn
                    ? true
                    : false
                }
                startIcon={<AddCircleOutlineIcon />}
                sx={{ display: enableSaveBtn ? "" : "none" }}
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

export default ModalAddExpense;
