import { Box, setRef, TextField, Typography } from "@mui/material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridRowData,
} from "@mui/x-data-grid";
import React, { useEffect } from "react";
import NumberFormat from "react-number-format";
import {
  AccountAccountExpenses,
  ExpenseInfo,
  ExpensePeriod,
  payLoadAdd,
  SumItems,
  SumItemsItem,
} from "../../../models/branch-accounting-model";
import { getUserInfo } from "../../../store/sessionStore";
import { updateSummaryRows } from "../../../store/slices/accounting/accounting-slice";
import store, { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import { getExpenseStatus, STATUS } from "../../../utils/enum/accounting-enum";
import {
  isFilterFieldInExpense,
  isFilterOutFieldInAdd,
  stringNullOrEmpty,
  stringNumberNullOrEmpty,
} from "../../../utils/utils";
import ExpenseDetailTransaction from "./expense-detail-transaction";
import ModalUpdateExpenseSummary from "./modal-update-expense-sumary-format";

interface Props {
  type: string;
  periodProps: ExpensePeriod;
  edit: boolean;
}

function ExpenseDetailSummary({ type, periodProps, edit }: Props) {
  const classes = useStyles();
  const _ = require("lodash");
  const dispatch = useAppDispatch();

  const [editAction, setEditAction] = React.useState(edit);
  const [expenseType, setExpenseType] = React.useState(type);
  const [period, setPeriod] = React.useState<ExpensePeriod>({
    period: 0,
    startDate: "",
    endDate: "",
  });
  const [pageSize, setPageSize] = React.useState<number>(10);
  const expenseAccountDetail = useAppSelector(
    (state) => state.expenseAccountDetailSlice.expenseAccountDetail,
  );
  const expenseData: any = expenseAccountDetail.data
    ? expenseAccountDetail.data
    : null;
  const status = expenseData && expenseData.status ? expenseData.status : "";
  const expenseMasterList = useAppSelector(
    (state) => state.masterExpenseListSlice.masterExpenseList.data,
  );
  const summaryRows = useAppSelector(
    (state) => state.expenseAccountDetailSlice.summaryRows,
  );
  const payloadAddSummaryItem = useAppSelector(
    (state) => state.expenseAccountDetailSlice.addSummaryItem,
  );
  const [newExpenseAllList, setNewExpenseAllList] = React.useState<
    ExpenseInfo[]
  >([]);
  const [openModalUpdatedExpenseSummary, setOpenModalUpdateExpenseSummary] =
    React.useState(false);
  const [payloadAdd, setPayloadAdd] = React.useState<payLoadAdd[]>();
  const getMasterExpenseAll = (key: any) =>
    expenseMasterList.find(
      (e: ExpenseInfo) => e.expenseNo === key && e.typeCode === type,
    );
  const getMasterExpenInto = (key: any) =>
    expenseMasterList.find(
      (e: ExpenseInfo) => e.expenseNo === key && e.typeCode === type,
    );
  const frontColor = (value: any) => {
    const _value = stringNullOrEmpty(value) ? "" : value.toString();
    return _value.includes("+")
      ? "#446EF2"
      : _value.includes("-")
        ? "#F54949"
        : "#000";
  };
  const columns: GridColDef[] = newExpenseAllList.map((i: ExpenseInfo) => {
    const master = getMasterExpenInto(i.expenseNo);
    const hideColumn = master ? master.isOtherExpense : false;
    if (i.expenseNo === "total") {
      return {
        field: i.expenseNo,
        headerName: i.accountNameTh,
        flex: 1,
        headerAlign: "center",
        align: "right",
        sortable: false,
        hide: hideColumn,
        renderCell: (params: GridRenderCellParams) => {
          if (isFilterFieldInExpense(params.field)) {
            const _prefix = params.getValue(params.id, "isShowDiff")
              ? params.getValue(params.id, "isShowDiff")
              : false;
            const value = (params.value || 0) > 0 ? true : false;
            return (
              <NumberFormat
                value={String(params.value)}
                thousandSeparator={true}
                decimalScale={2}
                className={classes.MtextFieldNumberNotStyleDisable}
                disabled={true}
                customInput={TextField}
                sx={{
                  ".MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: frontColor(params.value),
                    // color: color,
                  },
                }}
                prefix={_prefix && value ? "+" : ""}
                fixedDecimalScale
                type="text"
              />
            );
          }
        },
      };
    } else {
      return {
        field: i.expenseNo,
        headerName: i.accountNameTh,
        // minWidth: 70,
        flex: 1,
        headerAlign: "center",
        sortable: false,
        hide: hideColumn,
        renderCell: (params: GridRenderCellParams) => {
          if (isFilterFieldInExpense(params.field)) {
            return (
              <Box
                component="div"
                sx={{ paddingLeft: "5px", color: frontColor(params.value) }}
              >
                {params.value}
              </Box>
            );
          } else {
            const _prefix = params.getValue(params.id, "isShowDiff")
              ? params.getValue(params.id, "isShowDiff")
              : false;
            const value = (params.value || 0) > 0 ? true : false;
            return (
              <NumberFormat
                value={String(params.value)}
                thousandSeparator={true}
                decimalScale={2}
                className={classes.MtextFieldNumberNotStyleDisable}
                disabled={true}
                customInput={TextField}
                sx={{
                  ".MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: frontColor(params.value),
                    // color: color,
                  },
                }}
                fixedDecimalScale
                prefix={_prefix && value ? "+" : ""}
              />
              // <TextField
              //   variant='outlined'
              //   name={`txb${i.expenseNo}`}
              //   inputProps={{ style: { textAlign: 'right' } }}
              //   sx={{
              //     '.MuiInputBase-input.Mui-disabled': {
              //       WebkitTextFillColor: frontColor(params.value),
              //       // color: color,
              //     },
              //   }}
              //   value={params.value}
              //   disabled={true}
              //   autoComplete='off'
              // />
            );
          }
        },
      };
    }
  });
  useEffect(() => {
    setExpenseType(type);
    setEditAction(edit);
    let _newExpenseAllList: ExpenseInfo[] = [];
    const headerDescription: ExpenseInfo = {
      accountNameTh: " ",
      skuCode: "",
      approvalLimit1: 0,
      approvalLimit2: 0,
      isActive: true,
      requiredDocumentTh: "",
      expenseNo: "description",
      isOtherExpense: false,
      typeCode: "",
      accountCode: "",
      typeNameTh: "",
    };
    const headerOtherSum: ExpenseInfo = {
      accountNameTh: "อื่นๆ",
      skuCode: "",
      approvalLimit1: 0,
      approvalLimit2: 0,
      isActive: true,
      requiredDocumentTh: "",
      expenseNo: "SUMOTHER",
      isOtherExpense: false,
      typeCode: "",
      accountCode: "",
      typeNameTh: "",
    };
    const headerSum: ExpenseInfo = {
      accountNameTh: "รวม",
      skuCode: "",
      approvalLimit1: 0,
      approvalLimit2: 0,
      isActive: true,
      requiredDocumentTh: "",
      expenseNo: "total",
      isOtherExpense: false,
      typeCode: "",
      accountCode: "",
      typeNameTh: "",
    };
    _newExpenseAllList.push(headerDescription);
    const summary: SumItems = expenseData ? expenseData.sumItems : null;
    const entries: SumItemsItem[] =
      summary && summary.items ? summary.items : [];
    if (edit && entries.length > 0) {
      entries
        .filter(
          (entrie: SumItemsItem) => !isFilterOutFieldInAdd(entrie.expenseNo),
        )
        .map((entrie: SumItemsItem, i: number) => {
          const master = getMasterExpenseAll(entrie.expenseNo);
          if (master) {
            _newExpenseAllList.push(master);
          }
        });
    } else {
      expenseMasterList
        .filter((i: ExpenseInfo) => i.isActive && i.typeCode === expenseType)
        .map((i: ExpenseInfo) => {
          _newExpenseAllList.push(i);
        });
    }

    _newExpenseAllList.push(headerOtherSum);
    _newExpenseAllList.push(headerSum);
    setNewExpenseAllList(_newExpenseAllList);
  }, [expenseType, type]);

  React.useEffect(() => {
    setPeriod(periodProps);
    setExpenseType(type);
    setEditAction(edit);
  }, [periodProps]);

  const currentlySelected = async (params: GridCellParams) => {
    const info = getExpenseStatus(expenseData.status);
    const isAllow =
      info?.groupAllow === getUserInfo().group && info?.allowShowSummary;
    if (params.id === 2 && isAllow) {
      let listPayload: payLoadAdd[] = [];
      const arr = Object.entries(params.row);
      await arr.forEach((element: any, index: number) => {
        const master = getMasterExpenInto(element[0]);
        const _title = master?.accountNameTh || "Field";
        const _isOtherExpense = master?.isOtherExpense || false;
        const _expenseType = master?.typeCode;
        if (_expenseType !== expenseType) {
          return;
        }
        const item: payLoadAdd = {
          id: index,
          key: element[0],
          value: element[1],
          title: _title,
          isOtherExpense: _isOtherExpense,
        };
        listPayload.push(item);
      });
      await setPayloadAdd(listPayload);
      setOpenModalUpdateExpenseSummary(true);
    }
  };

  const storeSummaryItem = async (_item: any) => {
    if (_item) {
      let totalOtherWithDraw: number = 0;
      let infosWithDraw: any;
      let infosApprove: any;
      let totalWithDraw: number = 0;
      let totalApprove: number = 0;
      let rows: any[] = [];
      const expenseAccountDetail =
        store.getState().expenseAccountDetailSlice.expenseAccountDetail;
      const expenseData: any = expenseAccountDetail.data
        ? expenseAccountDetail.data
        : null;
      const summary: SumItems = expenseData ? expenseData.sumItems : null;
      const entries: SumItemsItem[] =
        summary && summary.items ? summary.items : [];
      entries.map((entrie: SumItemsItem, i: number) => {
        infosWithDraw = {
          ...infosWithDraw,

          [entrie.expenseNo]: entrie.withdrawAmount,
        };
        if (!isFilterOutFieldInAdd(entrie.expenseNo)) {
          totalWithDraw += entrie?.withdrawAmount || 0;
        }

        const master = getMasterExpenInto(entrie.expenseNo);
        const _isOtherExpense = master ? master.isOtherExpense : false;
        if (_isOtherExpense) {
          totalOtherWithDraw += entrie?.withdrawAmount || 0;
        }
      });
      const arr = Object.entries(_item);
      await arr.forEach((element: any, index: number) => {
        const key = element[0];
        if (key === "total") {
          totalApprove = element[1];
        }
        infosApprove = {
          ...infosApprove,
          [key]: element[1],
        };
      });
      let infoDiff: any;
      arr.map((element: any, i: number) => {
        const key = element[0];
        const value = element[1] || 0;
        const withDraw = entries.find(
          (entrie: SumItemsItem, i: number) => entrie.expenseNo === key,
        );
        const withdrawAmount = withDraw?.withdrawAmount || 0;
        const diff = value - withdrawAmount;
        infoDiff = {
          ...infoDiff,
          [key]: diff > 0 ? `+${diff}` : diff,
        };
      });

      infoDiff = {
        ...infoDiff,
        id: 3,
        description: "ผลต่าง",
      };

      const _totalDiff = Number(totalApprove) - Number(totalWithDraw);
      const totalDiff = _totalDiff > 0 ? `+${_totalDiff}` : _totalDiff;
      rows = [
        {
          ...infosWithDraw,
          id: 1,
          description: "ยอดเงินเบิก",
          SUMOTHER: totalOtherWithDraw,
          total: totalWithDraw,
        },
        { ...infosApprove, id: 2, description: "ยอดเงินอนุมัติ", infosApprove },
        { ...infoDiff, total: totalDiff, isShowDiff: true },
      ];
      dispatch(updateSummaryRows(rows));
    }
  };

  let rows: [] = summaryRows ? summaryRows : [];
  useEffect(() => {
    storeSummaryItem(payloadAddSummaryItem);
  }, [payloadAddSummaryItem]);

  return (
    <React.Fragment>
      <Box mt={2} bgcolor="background.paper">
        <div
          style={{ width: "100%", height: rows.length >= 8 ? "70vh" : "auto" }}
          className={classes.MdataGridDetail}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            pagination
            disableColumnMenu
            autoHeight={rows.length >= 8 ? false : true}
            scrollbarSize={10}
            rowHeight={65}
            onCellClick={currentlySelected}
          />
        </div>
        <ExpenseDetailTransaction
          type={expenseType}
          periodProps={period}
          edit={editAction}
        />
        <ModalUpdateExpenseSummary
          open={openModalUpdatedExpenseSummary}
          onClose={() => setOpenModalUpdateExpenseSummary(false)}
          payload={payloadAdd}
        />
      </Box>
    </React.Fragment>
  );
}

export default ExpenseDetailSummary;
