import { Box, Chip, TextField, Typography } from "@mui/material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowData,
} from "@mui/x-data-grid";
import moment from "moment";
import React from "react";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { isGroupBranch, isGroupSupport } from "utils/role-permission";
import { stringNullOrEmpty } from "utils/utils";
import {
  CloseSaleShiftInfo,
  CloseSaleShiftRequest,
} from "../../../models/branch-accounting-model";
import {
  featchCloseSaleShiptListAsync,
  savePayloadSearch,
} from "../../../store/slices/accounting/close-saleshift-slice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import {
  CLOSE_SALE_SHIFT_ENUM,
  STATUS,
} from "../../../utils/enum/accounting-enum";
import LoadingModal from "../../commons/ui/loading-modal";
import ModalBypassBySupport from "./modal-bypass-support";
import ModalSaveCloseShiftKey from "./modal-save-close-shift-key";

function CloseSaleShiftSearchList() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation(["expense", "common"]);
  const payloadSearch = useAppSelector(
    (state) => state.closeSaleShiftSlice.payloadSearch,
  );
  const items = useAppSelector(
    (state) => state.closeSaleShiftSlice.closeSaleShift,
  );
  const cuurentPage = useAppSelector(
    (state) => state.closeSaleShiftSlice.closeSaleShift.page,
  );
  const limit = useAppSelector(
    (state) => state.closeSaleShiftSlice.closeSaleShift.perPage,
  );
  const [pageSize, setPageSize] = React.useState(limit);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] = React.useState<{
    open: boolean;
  }>({
    open: false,
  });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const [shiftCodeSelect, setShiftCodeSelect] = React.useState("");
  const [branchCodeSelect, setBranchCodeSelect] = React.useState("");
  const [openPopupCloseShiftKey, setOpenPopupCloseShiftKey] =
    React.useState(false);
  const [openModalBypassBySupport, setOpenModalBypassBySupport] =
    React.useState(false);
  const [payloadCloseShiftKey, setPayloadCloseShiftKey] =
    React.useState<CloseSaleShiftInfo>();
  const columns: GridColDef[] = [
    {
      field: "posUser",

      headerName: "รหัสพนักงาน",
      width: 120,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "posCode",

      headerName: "เครื่องขาย",
      minWidth: 100,
      // flex: 0.35,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "shiftCode",
      headerName: "เลขรหัสรอบขาย",
      minWidth: 145,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "statusDisplay",
      headerName: "สถานะรหัส",
      width: 100,
      headerAlign: "center",
      sortable: false,
      align: "center",
      renderCell: (params) => {
        const _status = params.getValue(params.id, "status");
        if (_status === CLOSE_SALE_SHIFT_ENUM.DRAFT) {
          return (
            <Chip
              label={params.value}
              size="small"
              sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
            />
          );
        } else if (_status === CLOSE_SALE_SHIFT_ENUM.CORRECT) {
          return (
            <Chip
              label={params.value}
              size="small"
              sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
            />
          );
        } else if (_status === CLOSE_SALE_SHIFT_ENUM.PENDING_REVIEW) {
          return (
            <Chip
              label={params.value}
              size="small"
              sx={{ color: "#F54949", backgroundColor: "#FFD7D7" }}
            />
          );
        }
      },
    },
    {
      field: "shiftAmount",
      headerName: "ยอดขายปิดรอบ",
      width: 130,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params) => {
        const billAmount = !stringNullOrEmpty(
          params.getValue(params.id, "billAmount"),
        )
          ? params.getValue(params.id, "billAmount")
          : 0;
        const shiftAmount = !stringNullOrEmpty(params.value)
          ? Number(params.value)
          : 0;
        const isDiff = shiftAmount != billAmount;
        const _status = params.row.status;
        if (!stringNullOrEmpty(params.value)) {
          return (
            <NumberFormat
              value={String(params.value)}
              displayType={"text"}
              fixedDecimalScale
              thousandSeparator={true}
              decimalScale={2}
              style={{
                color:
                  isDiff && _status === CLOSE_SALE_SHIFT_ENUM.DRAFT
                    ? "#F54949"
                    : "#000",
              }}
            />
          );
        } else {
          return "-";
        }
      },
    },
    {
      field: "billAmount",
      headerName: "ยอดขายในบิลขาย",
      minWidth: 140,
      // flex: 0.3,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params) => {
        const shiftAmount = !stringNullOrEmpty(
          params.getValue(params.id, "shiftAmount"),
        )
          ? Number(params.getValue(params.id, "shiftAmount"))
          : 0;
        const billAmount = !stringNullOrEmpty(params.value)
          ? Number(params.value)
          : 0;
        const isDiff = shiftAmount != billAmount;
        const _status = params.row.status;
        if (!stringNullOrEmpty(params.value)) {
          return (
            <NumberFormat
              value={String(params.value)}
              displayType={"text"}
              fixedDecimalScale
              thousandSeparator={true}
              decimalScale={2}
              style={{
                color:
                  isDiff && _status === CLOSE_SALE_SHIFT_ENUM.DRAFT
                    ? "#F54949"
                    : "#000",
              }}
            />
          );
        } else {
          return "-";
        }
      },
    },
    {
      field: "confirmAmount",
      headerName: "ยอดขายที่สาขากรอก",
      minWidth: 160,
      // flex: 0.25,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params) => {
        const value = Number(params.value || 0);
        if (!stringNullOrEmpty(params.value)) {
          return (
            <NumberFormat
              value={String(params.value)}
              displayType={"text"}
              fixedDecimalScale
              thousandSeparator={true}
              decimalScale={2}
            />
          );
        } else {
          return "-";
        }
      },
    },
    {
      field: "shiftKey",
      headerName: "รหัสปิดรอบ",
      width: 120,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const value = !stringNullOrEmpty(params.value) ? params.value : "-";
        return value;
      },
    },
    {
      field: "noOfSaleBill",
      headerName: "จำนวนบิลขาย",
      width: 120,
      align: "right",
      sortable: false,
      headerAlign: "center",
      renderCell: (params) => {
        const value = !stringNullOrEmpty(params.value) ? params.value : "0";
        return value;
      },
    },
    {
      field: "noOfReturnBill",
      headerName: "จำนวนบิลคืน",
      width: 120,
      align: "right",
      sortable: false,
      headerAlign: "center",
      renderCell: (params) => {
        const value = !stringNullOrEmpty(params.value) ? params.value : "0";
        return value;
      },
    },
    {
      field: "shiftDate",
      headerName: "วันที่บันทึก",
      width: 150,
      align: "center",
      sortable: false,
      headerAlign: "center",
    },
    {
      field: "bypassStatusDisplay",
      headerName: "การ Bypass",
      width: 110,
      headerAlign: "center",
      sortable: false,
      align: "center",
      renderCell: (params) => {
        const _status = params.getValue(params.id, "bypassStatus");
        if (_status === CLOSE_SALE_SHIFT_ENUM.NONE) {
          return (
            <Chip
              label={params.value}
              size="small"
              sx={{ color: "#AEAEAE", backgroundColor: "#EEEEEE" }}
            />
          );
        } else if (_status === CLOSE_SALE_SHIFT_ENUM.PENDING_REVIEW) {
          return (
            <Chip
              label={params.value}
              size="small"
              sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
            />
          );
        } else if (_status === CLOSE_SALE_SHIFT_ENUM.REVIEWED) {
          return (
            <Chip
              label={params.value}
              size="small"
              sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
            />
          );
        }
      },
    },
    {
      field: "bypassComment",
      headerName: "หมายเหตุ",
      width: 150,
      align: "center",
      sortable: false,
      headerAlign: "center",
    },
  ];

  const handlePageChange = async (newPage: number) => {
    handleOpenLoading("open", true);
    let page: number = newPage + 1;
    const payload: CloseSaleShiftRequest = {
      shiftDate: payloadSearch.shiftDate,
      branchCode: payloadSearch.branchCode,
      status: payloadSearch.status,
      bypassStatus: payloadSearch.bypassStatus,
      page: page,
      limit: pageSize,
    };

    await dispatch(featchCloseSaleShiptListAsync(payload));
    await dispatch(savePayloadSearch(payload));
    handleOpenLoading("open", false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize);
    handleOpenLoading("open", true);
    const payload: CloseSaleShiftRequest = {
      shiftDate: payloadSearch.shiftDate,
      branchCode: payloadSearch.branchCode,
      status: payloadSearch.status,
      bypassStatus: payloadSearch.bypassStatus,
      page: 1,
      limit: pageSize,
    };

    await dispatch(featchCloseSaleShiptListAsync(payload));
    await dispatch(savePayloadSearch(payload));
    handleOpenLoading("open", false);
  };
  const currentlySelected = async (params: GridCellParams) => {
    const shiftAmount = params.row.shiftAmount;
    const billAmount = params.row.billAmount;
    const status = params.row.status;
    const byPassStatus = params.row.bypassStatus;
    if (
      shiftAmount != null &&
      shiftAmount === billAmount &&
      status === STATUS.DRAFT &&
      isGroupBranch()
    ) {
      handleOpenLoading("open", true);
      const payload: CloseSaleShiftInfo = {
        branchCode: params.row.branchCode,
        shiftCode: params.row.shiftCode,
        shiftKey: params.row.shiftKey,
        shiftDate: params.row.shiftDate,
        shiftAmount: params.row.shiftAmount,
        billAmount: params.row.billAmount,
        confirmAmount: params.row.confirmAmount,
        noOfSaleBill: params.row.noOfSaleBill,
        noOfReturnBill: params.row.noOfReturnBill,
        status: "",
        posCode: params.row.posCode,
        posUser: params.row.posUser,
      };
      setPayloadCloseShiftKey(payload);
      handleOpenLoading("open", false);
      setOpenPopupCloseShiftKey(true);
    } else if (
      isGroupSupport() &&
      status === CLOSE_SALE_SHIFT_ENUM.CORRECT &&
      byPassStatus === CLOSE_SALE_SHIFT_ENUM.PENDING_REVIEW
    ) {
      setShiftCodeSelect(params.row.shiftCode);
      setBranchCodeSelect(params.row.branchCode);
      setOpenModalBypassBySupport(true);
    }
  };
  let rows: any = items.data.map((item: CloseSaleShiftInfo, index: number) => {
    return {
      id: index,
      posUser: item.posUser,
      posCode: item.posCode,
      shiftCode: item.shiftCode,
      status: item.status,
      statusDisplay: t(`status.${item.status}`),
      shiftAmount: item.shiftAmount,
      billAmount: item.billAmount,
      confirmAmount: item.confirmAmount,
      shiftKey: item.shiftKey,
      noOfSaleBill: item.noOfSaleBill,
      noOfReturnBill: item.noOfReturnBill,
      shiftDate: `${convertUtcToBkkDate(item.shiftDate)} ${moment(
        item.shiftDate,
      ).format("HH:mm ")}`,
      branchCode: item.branchCode,
      bypassStatus: item.bypass?.status,
      bypassStatusDisplay: t(`status.${item.bypass?.status}`),
      bypassComment: item.bypass?.remark,
    };
  });
  return (
    <div
      className={classes.MdataGridPaginationTop}
      style={{ height: rows.length >= 10 ? "80vh" : "auto" }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnMenu
        autoHeight={rows.length >= 10 ? false : true}
        scrollbarSize={10}
        pagination
        page={cuurentPage - 1}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        rowCount={items.total}
        paginationMode="server"
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onCellClick={currentlySelected}
        loading={loading}
        rowHeight={65}
        columnBuffer={13}
      />
      <LoadingModal open={openLoadingModal.open} />
      <ModalSaveCloseShiftKey
        open={openPopupCloseShiftKey}
        payload={payloadCloseShiftKey}
        onClose={() => setOpenPopupCloseShiftKey(false)}
      />
      <ModalBypassBySupport
        shiftCode={shiftCodeSelect}
        open={openModalBypassBySupport}
        onClose={() => {
          setOpenModalBypassBySupport(false);
        }}
        branchCode={branchCodeSelect}
      />
    </div>
  );
}

export default CloseSaleShiftSearchList;
