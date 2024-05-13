import { Box, Typography, Checkbox, Link } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useStyles } from "../../../styles/makeTheme";
import { useTranslation } from "react-i18next";
import {
  Action,
  AuditHistoryType,
  DateFormat,
} from "../../../utils/enum/common-enum";
import { KEYCLOAK_GROUP_AUDIT } from "../../../utils/enum/permission-enum";
import { objectNullOrEmpty, numberWithCommas } from "../../../utils/utils";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../../models/keycolak-token-info";
import { getUserInfo } from "../../../store/sessionStore";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import {
  AuditHistory,
  AuditHistorySearchRequest,
  AuditHistorySearchResponse,
} from "../../../models/audit-history-model";
import { getAuditHistorySearch } from "../../../store/slices/audit-history-search-slice";
import { saveSearchCriteriaAH } from "../../../store/slices/audit-history-criteria-search-slice";
import { getStockAdjustmentDetail } from "../../../store/slices/stock-adjustment-detail-slice";
import { updateRefresh } from "../../../store/slices/stock-adjust-calculate-slice";
import ModalCreateStockAdjustment from "../stock-adjustment/modal-create-stock-adjustment";
const _ = require("lodash");

interface StateProps {
  onSearch: () => void;
}

const AuditHistoryList: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation(["barcodeDiscount"]);
  const [lstAuditHistory, setLstAuditHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);

  const dispatch = useAppDispatch();
  const auditHistorySearchSlice = useAppSelector(
    (state) => state.auditHistorySearchSlice,
  );
  const toSearchResponse: AuditHistorySearchResponse =
    auditHistorySearchSlice.toSearchResponse;
  const currentPage = useAppSelector(
    (state) => state.auditHistorySearchSlice.toSearchResponse.page,
  );
  const limit = useAppSelector(
    (state) => state.auditHistorySearchSlice.toSearchResponse.perPage,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());
  const payload = useAppSelector(
    (state) => state.auditHistoryCriteriaSearchSlice.searchCriteria,
  );
  const [userPermission, setUserPermission] = useState<any[]>([]);
  const userInfo = getUserInfo();
  const [auditPermission, setAuditPermission] = useState<boolean>(
    userInfo && userInfo.groups && userInfo.groups.length > 0
      ? userInfo.groups.includes(KEYCLOAK_GROUP_AUDIT)
      : false,
  );
  const [openSADetail, setOpenSADetail] = React.useState<boolean>(false);

  useEffect(() => {
    const lstAuditHistory = toSearchResponse.data;
    if (lstAuditHistory != null && lstAuditHistory.length > 0) {
      let rows = lstAuditHistory.map((data: AuditHistory, index: number) => {
        return {
          id: (currentPage - 1) * parseInt(pageSize) + index + 1,
          index: (currentPage - 1) * parseInt(pageSize) + index + 1,
          checked: AuditHistoryType.CANTCOUNT === data.type.toUpperCase(),
          skuName: data.skuName,
          skuCode: data.sku,
          documentNumber: data.document.documentNumber,
          difference: data.difference,
          numberOfAdjusted: data.numberOfAdjusted,
          store: data.store,
          unitName: data.unitName,
          confirmDateTime: convertUtcToBkkDate(
            data.confirmDate,
            DateFormat.DATE_TIME_DISPLAY_FORMAT,
          ),
          creator: data.creator,
          remark: data.remark,
          typeOf: data.document.type,
          idSA: data.document.id,
        };
      });
      setLstAuditHistory(rows);
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

  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  const stockAdjustDetail = useAppSelector(
    (state) => state.stockAdjustmentDetailSlice.stockAdjustDetail,
  );
  const handleOpenSADetail = async (params: any) => {
    try {
      await dispatch(getStockAdjustmentDetail(params.row.idSA));
      if (stockAdjustDetail) {
        setOpenSADetail(true);
        await dispatch(updateRefresh(true));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "ไม่สามารถ\n" + "นับได้",
      minWidth: 80,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(params.value)}
          disabled
          style={{ color: "#AEAEAE" }}
        />
      ),
    },
    {
      field: "index",
      headerName: "ลำดับ",
      headerAlign: "center",
      sortable: false,
      minWidth: 50,
      renderCell: (params) => (
        <Box component="div" sx={{ margin: "0 auto" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "skuName",
      headerName: "รายละเอียดสินค้า",
      minWidth: 280,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2">{params.value}</Typography>
          <Typography color="textSecondary" sx={{ fontSize: 12 }}>
            {params.getValue(params.id, "skuCode") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "documentNumber",
      headerName: "เลขที่เอกสาร",
      headerAlign: "center",
      sortable: false,
      minWidth: 160,
      renderCell: (params) => (
        <div>
          {params.getValue(params.id, "typeOf") == "SA" ? (
            <Link
              fontSize={14}
              color={"secondary"}
              component={"button"}
              variant={"subtitle1"}
              underline={"always"}
              onClick={() => handleOpenSADetail(params)}
            >
              {params.value}
            </Link>
          ) : (
            <span>{params.value} </span>
          )}
        </div>
      ),
    },
    {
      field: "difference",
      headerName: "ผลต่าง\n" + "การนับ",
      minWidth: 130,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => genDifferenceCount(Number(params.value)),
    },
    {
      field: "numberOfAdjusted",
      headerName: "จำนวนที่\n" + "ปรับสต๊อก",
      minWidth: 130,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => genDifferenceCount(Number(params.value)),
    },
    {
      field: "store",
      headerName: "คลัง",
      minWidth: 150,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
    },
    {
      field: "unitName",
      headerName: "หน่วย",
      headerAlign: "center",
      align: "center",
      sortable: false,
      minWidth: 64,
    },
    {
      field: "confirmDateTime",
      headerName: "วันที่ทำรายการ",
      headerAlign: "center",
      sortable: false,
      minWidth: 150,
    },
    {
      field: "creator",
      headerName: "ผู้สร้างรายการ",
      headerAlign: "center",
      align: "center",
      sortable: false,
      minWidth: 130,
    },
    {
      field: "remark",
      headerName: "หมายเหตุ",
      headerAlign: "center",
      align: "center",
      sortable: false,
      minWidth: 207,
    },
  ];

  const genDifferenceCount = (value: number) => {
    let colorValue: string = "#263238";
    if (value < 0) {
      colorValue = "#F54949";
    } else if (value > 0) {
      colorValue = "#446EF2";
    }
    return (
      <Typography variant="body2" sx={{ color: colorValue }}>
        {numberWithCommas(value)}
      </Typography>
    );
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    let page: string = (newPage + 1).toString();

    const payloadNewPage: AuditHistorySearchRequest = {
      perPage: pageSize,
      page: page,
      docNo: payload.docNo,
      skuCodes: payload.skuCodes,
      branch: payload.branch,
      type: payload.type,
      creationDateFrom: payload.creationDateFrom,
      creationDateTo: payload.creationDateTo,
    };

    await dispatch(getAuditHistorySearch(payloadNewPage));
    await dispatch(saveSearchCriteriaAH(payloadNewPage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());
    setLoading(true);
    const payloadNewPage: AuditHistorySearchRequest = {
      perPage: pageSize.toString(),
      page: "1",
      docNo: payload.docNo,
      skuCodes: payload.skuCodes,
      branch: payload.branch,
      type: payload.type,
      creationDateFrom: payload.creationDateFrom,
      creationDateTo: payload.creationDateTo,
    };

    await dispatch(getAuditHistorySearch(payloadNewPage));
    await dispatch(saveSearchCriteriaAH(payloadNewPage));
    setLoading(false);
  };

  return (
    <div>
      <Box mt={2} bgcolor="background.paper">
        <div
          className={classes.MdataGridPaginationTop}
          style={{ height: lstAuditHistory.length >= 10 ? "72vh" : "auto" }}
        >
          <DataGrid
            rows={lstAuditHistory}
            columns={columns}
            disableColumnMenu
            hideFooterSelectedRowCount={true}
            autoHeight={lstAuditHistory.length < 10}
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
            rowHeight={55}
          />
        </div>
      </Box>
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
      {openSADetail && (
        <ModalCreateStockAdjustment
          isOpen={openSADetail}
          openFromAP={false}
          onClickClose={() => setOpenSADetail(false)}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          userPermission={userPermission}
          viewMode={true}
        />
      )}
    </div>
  );
};

export default AuditHistoryList;
