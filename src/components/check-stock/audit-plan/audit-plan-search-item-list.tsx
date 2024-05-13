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
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import {
  Action,
  DateFormat,
  StockActionStatus,
} from "../../../utils/enum/common-enum";
import { objectNullOrEmpty, stringNullOrEmpty } from "../../../utils/utils";
import HtmlTooltip from "../../../components/commons/ui/html-tooltip";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import SnackbarStatus from "../../../components/commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../../models/keycolak-token-info";
import { getUserInfo } from "../../../store/sessionStore";
import moment from "moment";
import {
  AuditPlan,
  AuditPlanSearchRequest,
  AuditPlanSearchResponse,
} from "../../../models/audit-plan";
import { auditPlanGetSearch } from "../../../store/slices/audit-plan-search-slice";
import { getAuditPlanDetail } from "../../../store/slices/audit-plan-detail-slice";
import ModalCreateAuditPlan from "./audit-plan-create";
import LoadingModal from "../../commons/ui/loading-modal";

const _ = require("lodash");

interface loadingModalState {
  open: boolean;
}
interface PropsValues {
  documentNumber: string;
  branch: string;
  status: string;
  fromDate: any | Date | number | string;
  toDate: any | Date | number | string;
}

interface StateProps {
  onSearch: () => void;
  reSearch: (branch: string) => void;
  values: PropsValues;
}

const AuditPlanItemList: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const [lstAuditPlan, setLstAuditPlan] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({ open: false });
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);

  const dispatch = useAppDispatch();
  const auditPlanSearchSlice = useAppSelector(
    (state) => state.auditPlanSearchSlice,
  );
  const apSearchResponse: AuditPlanSearchResponse =
    auditPlanSearchSlice.apSearchResponse;
  const currentPage = useAppSelector(
    (state) => state.auditPlanSearchSlice.apSearchResponse.page,
  );
  const limit = useAppSelector(
    (state) => state.auditPlanSearchSlice.apSearchResponse.perPage,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());
  const [userPermission, setUserPermission] = useState<any[]>([]);

  useEffect(() => {
    const listAuditPlan = apSearchResponse.data;
    if (listAuditPlan != null && listAuditPlan.length > 0) {
      let rows = listAuditPlan.map((data: AuditPlan, index: number) => {
        const docNoSA =
          data.relatedSaDocuments && data.relatedSaDocuments.length
            ? `, ${data.relatedSaDocuments[0].documentNumber}`
            : "";
        const docNoSC =
          data.relatedScDocuments && data.relatedScDocuments.length
            ? _.uniqBy(data.relatedScDocuments, "documentNumber")
                .map((item: any) => item.documentNumber)
                .join(", ")
            : "";
        return {
          id: data.id,
          index: (currentPage - 1) * parseInt(pageSize) + index + 1,
          documentNumberAP: data.documentNumber,
          status: data.status,
          creationDate: convertUtcToBkkDate(
            data.createdDate,
            DateFormat.DATE_FORMAT,
          ),
          countingDate: convertUtcToBkkDate(
            data.countingDate,
            DateFormat.DATE_FORMAT,
          ),
          product: data.product,
          createrName: data.createdBy,
          branch: `${data.branchCode}-${data.branchName}`,
          relatedScDocuments: docNoSC + docNoSA,
        };
      });
      setLstAuditPlan(rows);

      //permission
      const userInfo: KeyCloakTokenInfo = getUserInfo();
      if (!objectNullOrEmpty(userInfo) && !objectNullOrEmpty(userInfo.acl)) {
        setUserPermission(
          userInfo.acl["service.posback-campaign"] != null &&
            userInfo.acl["service.posback-campaign"].length > 0
            ? userInfo.acl["service.posback-campaign"]
            : [],
        );
      }
    }
  }, [apSearchResponse]);

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
      field: "documentNumberAP",
      headerName: "เลขที่เอกสาร",
      headerAlign: "center",
      sortable: false,
      minWidth: 180,
    },
    {
      field: "relatedScDocuments",
      headerName: "เลขที่เอกสารอ้างอิง",
      headerAlign: "center",
      sortable: false,
      minWidth: 290,
    },
    {
      field: "status",
      headerName: "สถานะ",
      headerAlign: "center",
      align: "center",
      sortable: false,
      minWidth: 150,
      renderCell: (params) => genRowStatus(params),
    },
    {
      field: "creationDate",
      headerName: "วันที่สร้างรายการ",
      headerAlign: "center",
      sortable: false,
      minWidth: 160,
    },
    {
      field: "countingDate",
      headerName: "กำหนดตรวจนับ",
      headerAlign: "center",
      sortable: false,
      minWidth: 160,
    },
    {
      field: "branch",
      headerName: "สาขาที่สร้างรายการ",
      headerAlign: "center",
      sortable: false,
      minWidth: 280,
    },
    {
      field: "createrName",
      headerName: "ผู้สร้างรายการ",
      headerAlign: "center",
      sortable: false,
      minWidth: 160,
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
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case StockActionStatus.COUNTING:
        statusDisplay = genRowStatusValue("เริ่มตรวจนับ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9;",
        });
        break;
      case StockActionStatus.END:
        statusDisplay = genRowStatusValue("ปิดงาน", {
          color: "#676767",
          backgroundColor: "#EAEBEB",
        });
        break;
      case StockActionStatus.CANCEL:
        statusDisplay = genRowStatusValue("ยกเลิก", {
          color: "#F54949",
          backgroundColor: "#FFD7D7",
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
    const payloadNewPage: AuditPlanSearchRequest = {
      perPage: pageSize,
      page: page,
      docNo: props.values.documentNumber,
      branch: props.values.branch,
      status: props.values.status,
      creationDateFrom: moment(props.values.fromDate)
        .startOf("day")
        .toISOString(),
      creationDateTo: moment(props.values.toDate).endOf("day").toISOString(),
    };
    await dispatch(auditPlanGetSearch(payloadNewPage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());
    setLoading(true);
    const payloadNewPage: AuditPlanSearchRequest = {
      perPage: pageSize.toString(),
      page: "1",
      docNo: props.values.documentNumber,
      branch: props.values.branch,
      status: props.values.status,
      creationDateFrom: moment(props.values.fromDate)
        .startOf("day")
        .toISOString(),
      creationDateTo: moment(props.values.toDate).endOf("day").toISOString(),
    };
    await dispatch(auditPlanGetSearch(payloadNewPage));
    setLoading(false);
  };

  const auditPlanDetail = useAppSelector(
    (state) => state.auditPlanDetailSlice.auditPlanDetail,
  );
  const currentlySelected = async (params: GridCellParams) => {
    handleOpenLoading("open", true);
    try {
      await dispatch(getAuditPlanDetail(params.row.id));
      if (!objectNullOrEmpty(auditPlanDetail.data)) {
        setOpenDetail(true);
      }
    } catch (error) {
      console.log(error);
    }
    handleOpenLoading("open", false);
  };

  return (
    <div>
      <Box mt={2} bgcolor="background.paper">
        <div
          className={classes.MdataGridPaginationTop}
          style={{ height: lstAuditPlan.length >= 10 ? "60vh" : "auto" }}
        >
          <DataGrid
            rows={lstAuditPlan}
            columns={columns}
            disableColumnMenu
            hideFooterSelectedRowCount={true}
            onCellClick={currentlySelected}
            autoHeight={lstAuditPlan.length < 10}
            scrollbarSize={10}
            pagination
            page={currentPage - 1}
            pageSize={parseInt(pageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            rowCount={apSearchResponse.total}
            paginationMode="server"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            rowHeight={45}
          />
        </div>
      </Box>
      {openDetail && (
        <ModalCreateAuditPlan
          isOpen={openDetail}
          onClickClose={handleCloseDetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onReSearchMain={props.reSearch}
          onSearchMain={props.onSearch}
          openLink={true}
        />
      )}

      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
};

export default AuditPlanItemList;
