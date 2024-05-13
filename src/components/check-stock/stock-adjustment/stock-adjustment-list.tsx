import { Box, Typography } from "@mui/material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useStyles } from "../../../styles/makeTheme";
import { useTranslation } from "react-i18next";
import {
  Action,
  DateFormat,
  StockActionStatus,
  STORE_TYPE,
} from "../../../utils/enum/common-enum";
import { objectNullOrEmpty, stringNullOrEmpty } from "../../../utils/utils";
import HtmlTooltip from "../../commons/ui/html-tooltip";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../../models/keycolak-token-info";
import { getUserInfo } from "../../../store/sessionStore";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import {
  StockAdjustment,
  StockAdjustmentSearchRequest,
  StockAdjustmentSearchResponse,
} from "../../../models/stock-adjustment-model";
import { getStockAdjustmentSearch } from "../../../store/slices/stock-adjustment-search-slice";
import { saveSearchCriteriaSA } from "../../../store/slices/stock-adjustment-criteria-search-slice";
import ModalCreateStockAdjustment from "./modal-create-stock-adjustment";
import { getStockAdjustmentDetail } from "../../../store/slices/stock-adjustment-detail-slice";
import { getAuditPlanDetail } from "../../../store/slices/audit-plan-detail-slice";
import { updateRefresh } from "../../../store/slices/stock-adjust-calculate-slice";

const _ = require("lodash");

interface loadingModalState {
  open: boolean;
}

interface StateProps {
  onSearch: () => void;
  type: string;
}

const StockAdjustmentList: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation(["barcodeDiscount"]);
  const [lstStockAdjustment, setLstStockAdjustment] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({ open: false });
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);

  const dispatch = useAppDispatch();
  const stockAdjustmentSearchSlice = useAppSelector(
    (state) => state.stockAdjustmentSearchSlice,
  );
  const toSearchResponse: StockAdjustmentSearchResponse =
    stockAdjustmentSearchSlice.toSearchResponse;
  const currentPage = useAppSelector(
    (state) => state.stockAdjustmentSearchSlice.toSearchResponse.page,
  );
  const limit = useAppSelector(
    (state) => state.stockAdjustmentSearchSlice.toSearchResponse.perPage,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());
  const payload = useAppSelector(
    (state) => state.stockAdjustmentCriteriaSearchSlice.searchCriteria,
  );
  const [userPermission, setUserPermission] = useState<any[]>([]);

  useEffect(() => {
    const lstStockAdjustment = toSearchResponse.data;
    if (lstStockAdjustment != null && lstStockAdjustment.length > 0) {
      let rows = lstStockAdjustment.map(
        (data: StockAdjustment, index: number) => {
          return {
            id: data.id,
            index: (currentPage - 1) * parseInt(pageSize) + index + 1,
            documentNumber: data.documentNumber,
            createdDate: convertUtcToBkkDate(
              data.createdDate,
              DateFormat.DATE_FORMAT,
            ),
            status: data.status,
            branch: stringNullOrEmpty(data.branchCode)
              ? stringNullOrEmpty(data.branchName)
                ? ""
                : data.branchName
              : data.branchCode +
                " - " +
                (stringNullOrEmpty(data.branchName) ? "" : data.branchName),
            createdBy: data.createdBy,
            APId: data.APId,
            APDocumentNumber: data.APDocumentNumber,
          };
        },
      );
      setLstStockAdjustment(rows);
      //permission
      const userInfo: KeyCloakTokenInfo = getUserInfo();
      if (!objectNullOrEmpty(userInfo) && !objectNullOrEmpty(userInfo.acl)) {
        setUserPermission(
          userInfo.acl["service.posback-stock"] != null &&
            userInfo.acl["service.posback-stock"].length > 0
            ? userInfo.acl["service.posback-stock"]
            : [],
        );
      }
    }
  }, [toSearchResponse]);

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: t("numberOrder"),
      headerAlign: "center",
      sortable: false,
      flex: 0.6,
      renderCell: (params) => (
        <Box component="div" sx={{ margin: "0 auto" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "documentNumber",
      headerName: "เลขที่เอกสาร",
      headerAlign: "center",
      sortable: false,
      flex: 1.2,
    },
    {
      field: "createdDate",
      headerName: "วันที่สร้างรายการ",
      headerAlign: "center",
      align: "center",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Box component="div" sx={{ marginLeft: "0.2rem" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "branch",
      headerName: "สาขาที่สร้างรายการ",
      headerAlign: "center",
      sortable: false,
      flex: 1.5,
      renderCell: (params) => (
        <Box component="div" sx={{ marginLeft: "0 auto" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "createdBy",
      headerName: "ผู้สร้างรายการ",
      headerAlign: "center",
      sortable: false,
      flex: 1.2,
      renderCell: (params) => (
        <Box component="div" sx={{ marginLeft: "1rem" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: t("status"),
      headerAlign: "center",
      align: "center",
      sortable: false,
      flex: 1.2,
      renderCell: (params) => genRowStatus(params),
    },
  ];

  const genRowStatus = (params: GridValueGetterParams) => {
    let statusDisplay;
    let status = params.value ? params.value.toString() : "";
    switch (status) {
      case StockActionStatus.DRAFT:
        statusDisplay = genRowStatusValue("บันทึก", {
          color: "#FBA600",
          backgroundColor: "#FFF0CA",
        });
        break;
      case StockActionStatus.CONFIRM:
        statusDisplay = genRowStatusValue("ยืนยัน", {
          color: "#20AE79",
          backgroundColor: "#E7FFE9",
        });
        break;
    }
    return statusDisplay;
  };

  const genRowStatusValue = (statusLabel: any, styleCustom: any) => {
    return (
      <HtmlTooltip title={<React.Fragment>{statusLabel}</React.Fragment>}>
        <Typography className={classes.MLabelBDStatus} sx={styleCustom}>
          {statusLabel}
        </Typography>
      </HtmlTooltip>
    );
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    let page: string = (newPage + 1).toString();

    const payloadNewPage: StockAdjustmentSearchRequest = {
      perPage: pageSize,
      page: page,
      docNo: payload.docNo,
      branch: payload.branch,
      status: payload.status,
      creationDateFrom: payload.creationDateFrom,
      creationDateTo: payload.creationDateTo,
    };

    await dispatch(getStockAdjustmentSearch(payloadNewPage));
    await dispatch(saveSearchCriteriaSA(payloadNewPage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());
    setLoading(true);
    const payloadNewPage: StockAdjustmentSearchRequest = {
      perPage: pageSize.toString(),
      page: "1",
      docNo: payload.docNo,
      branch: payload.branch,
      status: payload.status,
      creationDateFrom: payload.creationDateFrom,
      creationDateTo: payload.creationDateTo,
    };

    await dispatch(getStockAdjustmentSearch(payloadNewPage));
    await dispatch(saveSearchCriteriaSA(payloadNewPage));
    setLoading(false);
  };

  const onSearchAgain = async () => {
    const payloadNew: StockAdjustmentSearchRequest = {
      perPage: payload.perPage,
      page: payload.page,
      docNo: payload.docNo,
      branch: payload.branch,
      status: payload.status,
      creationDateFrom: payload.creationDateFrom,
      creationDateTo: payload.creationDateTo,
    };
    await dispatch(getStockAdjustmentSearch(payloadNew));
  };

  const stockAdjustDetail = useAppSelector(
    (state) => state.stockAdjustmentDetailSlice.stockAdjustDetail,
  );
  const currentlySelected = async (params: GridCellParams) => {
    const chkPN = params.colDef.field;
    handleOpenLoading("open", true);
    if (chkPN !== "checked") {
      try {
        await dispatch(getAuditPlanDetail(params.row.APId));
        await dispatch(getStockAdjustmentDetail(params.row.id));
        if (stockAdjustDetail) {
          setOpenDetail(true);
          await dispatch(updateRefresh(true));
        }
      } catch (error) {
        console.log(error);
      }
    }
    handleOpenLoading("open", false);
  };

  return (
    <div>
      <Box mt={2} bgcolor="background.paper">
        <div
          className={classes.MdataGridPaginationTop}
          style={{ height: lstStockAdjustment.length >= 10 ? "60vh" : "auto" }}
        >
          <DataGrid
            rows={lstStockAdjustment}
            columns={columns}
            disableColumnMenu
            hideFooterSelectedRowCount={true}
            autoHeight={lstStockAdjustment.length < 10}
            onCellClick={currentlySelected}
            scrollbarSize={10}
            pagination
            page={currentPage - 1}
            pageSize={parseInt(pageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            rowCount={toSearchResponse.total}
            paginationMode="server"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            rowHeight={45}
          />
        </div>
      </Box>
      {openDetail && (
        <ModalCreateStockAdjustment
          isOpen={openDetail}
          openFromAP={false}
          onClickClose={handleCloseDetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          userPermission={userPermission}
          onSearchMain={onSearchAgain}
        />
      )}
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
    </div>
  );
};

export default StockAdjustmentList;
