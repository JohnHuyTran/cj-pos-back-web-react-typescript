import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridRowData,
  GridRowParams,
  GridValueGetterParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import { useStyles } from "../../../styles/makeTheme";
import LoadingModal from "../../commons/ui/loading-modal";
import { Chip, TextField, Typography } from "@mui/material";
import { numberWithCommas, stringNullOrEmpty } from "../../../utils/utils";
import ExpenseDetail from "./expense-detail";
import {
  addNewItem,
  addSummaryItem,
  featchExpenseDetailAsync,
  haveUpdateData,
  initialItems,
  updateItemRows,
  updateSummaryRows,
  updateToInitialState,
} from "../../../store/slices/accounting/accounting-slice";
import { uploadFileState } from "../../../store/slices/upload-file-slice";
import {
  ExpenseSearch,
  ExpenseSearchResponse,
} from "../../../models/branch-accounting-model";
import { featchBranchAccountingListAsync } from "../../../store/slices/accounting/accounting-search-slice";
import { saveExpenseSearch } from "../../../store/slices/accounting/save-accounting-search-slice";
import { getUserInfo, setInit } from "../../../store/sessionStore";
import { PERMISSION_GROUP } from "../../../utils/enum/permission-enum";
import NumberFormat from "react-number-format";
import HtmlTooltip from "components/commons/ui/html-tooltip";

interface loadingModalState {
  open: boolean;
}

export interface DataGridProps {
  onSelectRows: (rowsList: Array<any>) => void;
}

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 70,
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ paddingLeft: "20px" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "branchCode",
    headerName: "สาขา",
    minWidth: 180,
    flex: 1,
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => (
      <div>
        <Typography variant="body2" sx={{ lineHeight: "120%" }}>
          {params.value}-{params.getValue(params.id, "branchName") || ""}
        </Typography>
      </div>
    ),
  },
  {
    field: "docNo",
    headerName: "เลขที่เอกสาร",
    minWidth: 180,
    flex: 1,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "expensePeriod",
    headerName: "งวดเบิก",
    minWidth: 140,
    flex: 1.2,
    headerAlign: "center",
    align: "center",
    sortable: false,
  },
  {
    field: "typeText",
    headerName: "ประเภท",
    minWidth: 130,
    flex: 1,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "status",
    headerName: "สถานะ",
    minWidth: 80,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => {
      if (
        params.value === "DRAFT" ||
        params.value === "SEND_BACK_EDIT" ||
        params.value === "WAITTING_EDIT_ATTACH_FILE" ||
        params.value === "WAITTING_APPROVAL1" ||
        params.value === "WAITTING_APPROVAL2" ||
        params.value === "WAITTING_ACCOUNTING" ||
        params.value === "WAITTING_APPROVAL3"
      ) {
        return (
          <Chip
            label={params.getValue(params.id, "statusText")}
            size="small"
            sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
          />
        );
      } else if (params.value === "APPROVED" || params.value === "SAP_ERROR") {
        return (
          <Chip
            label={params.getValue(params.id, "statusText")}
            size="small"
            sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
          />
        );
      } else if (params.value === "CLOSED") {
        return (
          <Chip
            label={params.getValue(params.id, "statusText")}
            size="small"
            sx={{ color: "#F54949", backgroundColor: "#FFD7D7" }}
          />
        );
      }
    },
  },
  {
    field: "sumWithdrawAmount",
    headerName: "ยอดเงินเบิก",
    minWidth: 105,
    headerAlign: "center",
    align: "right",
    sortable: false,
    // renderCell: (params) => numberWithCommas(params.value),
    renderCell: (params: GridRenderCellParams) => {
      return (
        <NumberFormat
          value={String(params.value)}
          thousandSeparator={true}
          decimalScale={2}
          disabled={true}
          customInput={TextField}
          sx={{
            ".MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "#000",
            },
            ".MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            ".MuiInputBase-input": {
              textAlign: "right",
            },
          }}
          fixedDecimalScale
          type="text"
        />
      );
    },
  },
  {
    field: "sumApprovalAmount",
    headerName: "ยอดเงินอนุมัติ",
    minWidth: 115,
    headerAlign: "center",
    align: "right",
    sortable: false,
    // renderCell: (params) => numberWithCommas(params.value),
    renderCell: (params: GridRenderCellParams) => {
      return (
        <NumberFormat
          value={String(params.value)}
          thousandSeparator={true}
          decimalScale={2}
          disabled={true}
          customInput={TextField}
          sx={{
            ".MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "#000",
            },
            ".MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            ".MuiInputBase-input": {
              textAlign: "right",
            },
          }}
          fixedDecimalScale
          type="text"
        />
      );
    },
  },
  {
    field: "difAmount",
    headerName: "ผลต่าง",
    minWidth: 100,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => calDiff(params),
  },
  {
    field: "expenseDate",
    headerName: "วันที่ค่าใช้จ่าย",
    minWidth: 120,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => {
      const status = params.getValue(params.id, "status");
      if (
        status === "APPROVED" ||
        status === "CLOSED" ||
        status === "SAP_ERROR"
      ) {
        return params.value;
      } else {
        return "";
      }
    },
  },
  {
    field: "approvedDate",
    headerName: "วันที่อนุมัติเงินสำรอง",
    minWidth: 160,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => {
      const status = params.getValue(params.id, "status");
      if (
        status === "APPROVED" ||
        status === "CLOSED" ||
        status === "SAP_ERROR"
      ) {
        return params.value;
      } else {
        return "";
      }
    },
  },
  {
    field: "errorMsgSap",
    headerName: "หมายเหตุ",
    minWidth: 160,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <>
          <HtmlTooltip title={<React.Fragment>{params.value}</React.Fragment>}>
            <Typography
              variant="body2"
              sx={{ lineHeight: "120%", whiteSpace: "nowrap" }}
              noWrap
            >
              {params.value}
            </Typography>
          </HtmlTooltip>
        </>
      );
    },
  },
];

function useApiRef() {
  const apiRef = useGridApiRef();
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "",
        width: 0,
        minWidth: 0,
        sortable: false,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        },
      }),
    [columns],
  );

  return { apiRef, columns: _columns };
}

var calDiff = function (params: GridValueGetterParams) {
  if (
    params.getValue(params.id, "status") === "APPROVED" ||
    params.getValue(params.id, "status") === "WAITTING_APPROVAL3" ||
    params.getValue(params.id, "status") === "CLOSED" ||
    params.getValue(params.id, "status") === "SAP_ERROR"
  ) {
    const diff =
      Number(params.getValue(params.id, "sumApprovalAmount")) -
      Number(params.getValue(params.id, "sumWithdrawAmount"));

    // if (diff > 0) return <label style={{ color: '#446EF2', fontWeight: 700 }}> +{numberWithCommas(diff)} </label>;
    // if (diff < 0) return <label style={{ color: '#F54949', fontWeight: 700 }}> {numberWithCommas(diff)} </label>;
    // return <label style={{ color: '#000', fontSize: '1rem' }}> {numberWithCommas(diff)} </label>;

    let _diff = String(diff);
    if (diff > 0) _diff = `+${_diff}`;
    const frontColor = _diff.includes("+")
      ? "#446EF2"
      : _diff.includes("-")
        ? "#F54949"
        : "#000";

    return (
      <NumberFormat
        value={String(diff)}
        thousandSeparator={true}
        decimalScale={2}
        disabled={true}
        customInput={TextField}
        sx={{
          ".MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: frontColor,
          },
          ".MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          ".MuiInputBase-input": {
            textAlign: "right",
          },
        }}
        prefix={diff > 0 ? "+" : ""}
        fixedDecimalScale
        type="text"
      />
    );
  }
  return <label style={{ color: "#000", fontSize: "1rem" }}> 0.00 </label>;
};

function ExpenseSearchList({ onSelectRows }: DataGridProps) {
  const { t } = useTranslation(["expense", "common"]);
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => state.searchBranchAccounting);
  const cuurentPage = useAppSelector(
    (state) => state.searchBranchAccounting.branchAccountingList.page,
  );
  const limit = useAppSelector(
    (state) => state.searchBranchAccounting.branchAccountingList.perPage,
  );
  const res: any = items.branchAccountingList;
  const payload = useAppSelector(
    (state) => state.saveExpenseSearchRequest.searchExpense,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());

  const { apiRef, columns } = useApiRef();
  const rows = res.data.map((data: any, indexs: number) => {
    return {
      id: indexs,
      index: (cuurentPage - 1) * parseInt(pageSize) + indexs + 1,
      docNo: data.docNo,
      expensePeriod: `${convertUtcToBkkDate(
        data.expensePeriod.startDate,
      )}-${convertUtcToBkkDate(data.expensePeriod.endDate)}`,
      startDate: convertUtcToBkkDate(data.expensePeriod.startDate),
      endDate: convertUtcToBkkDate(data.expensePeriod.endDate),
      branchCode: data.branchCode,
      branchName: data.branchName,
      type: data.type,
      typeText: t(`type.${data.type}`),
      status: data.status,
      statusText: t(`status.${data.status}`),
      sumWithdrawAmount: data.sumWithdrawAmount,
      sumApprovalAmount: data.sumApprovalAmount,
      expenseDate: convertUtcToBkkDate(data.expenseDate),
      approvedDate: convertUtcToBkkDate(data.approvedDate),
      errorMsgSap: data.errorMsgSap,
    };
  });

  // console.log('rows:', JSON.stringify(rows));
  // console.log('res.total:', JSON.stringify(res.total));

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const [loading, setLoading] = React.useState<boolean>(false);
  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    let page: string = (newPage + 1).toString();
    const payloadNewpage: ExpenseSearch = {
      limit: pageSize,
      page: page,
      type: payload.type,
      status: payload.status,
      branchCode: payload.branchCode,
      month: payload.month,
      year: payload.year,
      period: payload.period,
    };

    await dispatch(featchBranchAccountingListAsync(payloadNewpage));
    await dispatch(saveExpenseSearch(payloadNewpage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());
    setLoading(true);
    const payloadNewpage: ExpenseSearch = {
      limit: pageSize.toString(),
      page: "1",
      type: payload.type,
      status: payload.status,
      branchCode: payload.branchCode,
      month: payload.month,
      year: payload.year,
      period: payload.period,
    };

    await dispatch(featchBranchAccountingListAsync(payloadNewpage));
    await dispatch(saveExpenseSearch(payloadNewpage));
    setLoading(false);
  };

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const currentlySelected = async (params: GridCellParams) => {
    const value = params.colDef.field;
    handleOpenLoading("open", true);
    await handleOpenDetailModal(params.row.docNo);
    handleOpenLoading("open", false);
  };

  const [edit, setEdit] = React.useState(false);
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const handleOpenDetailModal = async (docNo: string) => {
    await dispatch(haveUpdateData(false));
    await dispatch(uploadFileState([]));
    await dispatch(addSummaryItem(null));
    await dispatch(updateToInitialState());
    await dispatch(updateSummaryRows([]));
    await dispatch(updateItemRows([]));
    await dispatch(initialItems([]));
    await dispatch(addNewItem(null));
    await dispatch(featchExpenseDetailAsync(docNo));
    setInit("Y");

    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = async () => {
    await dispatch(uploadFileState([]));
    setOpenDetailModal(false);
  };

  const handleSubmitRowSelect = async () => {
    const rowSelect = apiRef.current.getSelectedRows();
    let rowSelectList: any = [];
    rowSelect.forEach((data: GridRowData) => {
      // rowSelectList.push(data.rtNo);
      rowSelectList.push(data);
    });

    return onSelectRows(rowSelectList ? rowSelectList : []);
  };

  const [groupACCM, setGroupACCM] = React.useState(false);
  useEffect(() => {
    const accountManager =
      getUserInfo().group === PERMISSION_GROUP.ACCOUNT_MANAGER;
    setGroupACCM(accountManager);
  }, []);

  return (
    <div>
      <Box mt={2} bgcolor="background.paper">
        <div
          className={classes.MdataGridPaginationTop}
          style={{ height: rows.length >= 10 ? "80vh" : "auto" }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            onCellClick={currentlySelected}
            autoHeight={rows.length >= 10 ? false : true}
            scrollbarSize={10}
            page={cuurentPage - 1}
            pageSize={parseInt(pageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            rowCount={res.total}
            paginationMode="server"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            rowHeight={65}
            pagination
            checkboxSelection={groupACCM ? true : false}
            isRowSelectable={(params: GridRowParams) =>
              params.row.status === "WAITTING_APPROVAL3"
            }
            onSelectionModelChange={handleSubmitRowSelect}
            disableSelectionOnClick
          />
        </div>
      </Box>

      <LoadingModal open={openLoadingModal.open} />

      {openDetailModal && (
        <ExpenseDetail
          isOpen={openDetailModal}
          onClickClose={handleCloseDetailModal}
          edit={true}
        />
      )}
    </div>
  );
}

export default ExpenseSearchList;
