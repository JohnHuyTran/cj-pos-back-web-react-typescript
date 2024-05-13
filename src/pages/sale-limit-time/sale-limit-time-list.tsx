import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { useStyles } from "../../styles/makeTheme";
import {
  genColumnValue,
  numberWithCommas,
  objectNullOrEmpty,
  stringNullOrEmpty,
} from "../../utils/utils";
import { Action, STStatus, DateFormat } from "../../utils/enum/common-enum";
import HtmlTooltip from "../../components/commons/ui/html-tooltip";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updatePayloadST } from "../../store/slices/sale-limit-time-search-slice";
import ViewBranch from "../../components/sale-limit-time/view-branch";
import STCreateModal from "../../components/sale-limit-time/sale-limit-time-create-modal";
import moment from "moment";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";
import { getUserInfo } from "../../store/sessionStore";
import { getsaleLimitTimeDetail } from "../../store/slices/sale-limit-time-detail-slice";
import LoadingModal from "../../components/commons/ui/loading-modal";
import SnackbarStatus from "../../components/commons/ui/snackbar-status";
import { getStartMultipeSaleLimitTime } from "../../services/sale-limit-time";
import AlertError from "../../components/commons/ui/alert-error";

const _ = require("lodash");
interface loadingModalState {
  open: boolean;
}
interface StateProps {
  handleSetBranch: (e: any) => void;
  onSearch: () => void;
  checkAdmin: boolean;
  handleChangePagination: (page: any, perPage: any) => void;
}
const SaleLimitTimeList: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation(["saleLimitTime"]);
  const [checkAll, setCheckAll] = React.useState<boolean>(false);
  const [lstST, setListST] = React.useState<any[]>([]);
  const responveST = useAppSelector(
    (state) => state.searchSaleLimitTime.responseST,
  );
  const payloadST = useAppSelector(
    (state) => state.searchSaleLimitTime.payloadST,
  );
  const saleLimitTimeDetail = useAppSelector(
    (state) => state.saleLimitTimeDetailSlice.saleLimitTimeDetail,
  );
  const currentPage = useAppSelector(
    (state) => state.searchSaleLimitTime.responseST.page,
  );
  const limit = useAppSelector(
    (state) => state.searchSaleLimitTime.responseST.perPage,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());

  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({ open: false });
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const list: any[] = responveST.data;

    if (list != null) {
      let rows = list.map((item: any, index: number) => {
        return {
          checked: false,
          id: item.id,
          index: (currentPage - 1) * parseInt(pageSize) + index + 1,
          documentNumber: item.documentNumber,
          status: item.status,
          description: item.description,
          remark: item.remark,
          stStartTime: item.stStartTime,
          stEndTime: item.stEndTime,
          branch: item.stDetail,
          createdAt: convertUtcToBkkDate(item.createdAt),
        };
      });
      setListST(rows);
      setPageSize(responveST.perPage.toString());
    }
  }, [responveST]);

  useEffect(() => {
    const userInfo: KeyCloakTokenInfo = getUserInfo();
    if (!objectNullOrEmpty(userInfo) && !objectNullOrEmpty(userInfo.acl)) {
      setIsAdmin(
        userInfo.acl["service.posback-campaign"]
          ? userInfo.acl["service.posback-campaign"].includes(
              "campaign.st.create",
            )
          : false,
      );
    }
  }, []);

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const onCheckCell = async (params: GridRenderCellParams, event: any) => {
    await setListST((prevData: any[]) => {
      const data = [...prevData];
      data[params.row.index - 1].checked = event.target.checked;
      return data;
    });
    let lstUnCheck = lstST.filter(
      (it: any) => !it.checked && STStatus.DRAFT == it.status,
    );
    if (lstUnCheck != null && lstUnCheck.length > 0) setCheckAll(false);
    else setCheckAll(true);
  };

  const onCheckAll = async (event: any) => {
    setCheckAll(event.target.checked);
    let lstSTHandle = _.cloneDeep(lstST);
    for (let item of lstSTHandle) {
      if (
        STStatus.DRAFT == item.status &&
        moment(item.stStartTime) >= moment(new Date())
      ) {
        item.checked = event.target.checked;
      }
    }
    setListST(lstSTHandle);
  };

  const onCheckDisable = (item: any) => {
    if (STStatus.DRAFT != item.status) {
      return true;
    } else {
      if (moment(item.stStartTime) < moment(new Date())) {
        return true;
      } else {
        return false;
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: t("numberOrder"),
      width: 130,
      headerAlign: "center",
      align: "center",
      sortable: false,
      hide: !isAdmin,
      renderHeader: (params) => (
        <FormControl component="fieldset" sx={{ marginLeft: "0px" }}>
          <FormGroup aria-label="position" row>
            <FormControlLabel
              className={classes.MFormControlLabel}
              value="top"
              control={
                <Checkbox checked={checkAll} onClick={onCheckAll.bind(this)} />
              }
              label="เลือกทั้งหมด"
              labelPlacement="top"
            />
          </FormGroup>
        </FormControl>
      ),
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(params.value)}
          disabled={onCheckDisable(params.row)}
          onClick={onCheckCell.bind(this, params)}
        />
      ),
    },
    {
      field: "index",
      headerName: "ลำดับ",
      headerAlign: "center",
      sortable: false,
      minWidth: 70,
    },
    {
      field: "documentNumber",
      headerName: "เลขที่เอกสาร ST",
      headerAlign: "center",
      sortable: false,
      minWidth: 170,
    },
    {
      field: "status",
      headerName: "สถานะ",
      headerAlign: "center",
      sortable: false,
      minWidth: 170,
      renderCell: (params) => genRowStatus(params),
    },
    {
      field: "description",
      headerName: "รายละเอียด",
      headerAlign: "center",
      sortable: false,
      minWidth: 170,
      renderCell: (params) => renderCell(params.value),
    },
    {
      field: "branch",
      headerName: "สาขา",
      headerAlign: "center",
      sortable: false,
      minWidth: 170,
      renderCell: (params) => genBranch(params),
    },
    {
      field: "createdAt",
      headerName: "วันที่สร้าง รายการ",
      headerAlign: "center",
      sortable: false,
      minWidth: 160,
    },
    {
      field: "stStartTime",
      headerName: "วัน/เวลา ที่เริ่ม",
      headerAlign: "center",
      sortable: false,
      minWidth: 160,
      renderCell: (params) => {
        const start = params.value?.toString();
        return (
          <div>
            <Typography variant="body2" noWrap>
              {moment(start).add(543, "year").format("DD/MM/YYYY")}
            </Typography>
            <Typography variant="body2" noWrap>
              {moment(start).format("HH:mm ")}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "stEndTime",
      headerName: "วัน/เวลา ที่สิ้นสุด",
      headerAlign: "center",
      sortable: false,
      minWidth: 160,
      renderCell: (params) => {
        const end = params.value?.toString();
        return (
          <div>
            <Typography variant="body2" noWrap>
              {moment(end).add(543, "year").format("DD/MM/YYYY")}
            </Typography>
            <Typography variant="body2" noWrap>
              {moment(end).format("HH:mm ")}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "remark",
      headerName: "หมายเหตุ",
      headerAlign: "center",
      sortable: false,
      minWidth: 170,
      renderCell: (params) => {
        if (params.value) {
          let len = String(params.value).length;
          return (
            <Tooltip title={params.value ? params.value : ""}>
              <Typography>
                {String(params.value).slice(0, 31)}
                {len > 30 ? "..." : ""}
              </Typography>
            </Tooltip>
          );
        }
      },
    },
  ];

  const renderCell = (value: any) => {
    return (
      <HtmlTooltip title={<React.Fragment>{value}</React.Fragment>}>
        <Typography variant="body2" noWrap>
          {value}
        </Typography>
      </HtmlTooltip>
    );
  };

  const genBranch = (params: GridValueGetterParams) => {
    const branch = _.cloneDeep(params.value);
    return <ViewBranch values={branch} />;
  };

  const genRowStatusValue = (statusLabel: string, styleCustom: any) => {
    return (
      <HtmlTooltip title={<React.Fragment>{statusLabel}</React.Fragment>}>
        <Typography className={classes.MLabelBDStatus} sx={styleCustom}>
          {statusLabel}
        </Typography>
      </HtmlTooltip>
    );
  };

  const genRowStatus = (params: GridValueGetterParams) => {
    let statusDisplay;
    let status = params.value ? params.value.toString() : "";
    const statusLabel = genColumnValue(
      "label",
      "value",
      status,
      t("lstStatus", { returnObjects: true }),
    );

    switch (status) {
      case STStatus.DRAFT:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#FBA600",
          backgroundColor: "#FFF0CA",
        });
        break;
      case STStatus.START:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case STStatus.END:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#676767",
          backgroundColor: "#EAEBEB;",
        });
        break;
      case STStatus.CANCEL:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#F54949",
          backgroundColor: "#FFD7D7",
        });
        break;
    }
    return statusDisplay;
  };
  const handlePageChange = async (newPage: number) => {
    let page: string = (newPage + 1).toString();
    const newPayload = {
      ...payloadST,
      page: page,
      perPage: pageSize,
    };
    await dispatch(updatePayloadST(newPayload));
    props.handleChangePagination(page, pageSize);
  };
  const handlePageSizeChange = async (cPageSize: number) => {
    setPageSize(cPageSize.toString());
    const newPayload = {
      ...payloadST,
      perPage: cPageSize.toString(),
      page: "1",
    };
    await dispatch(updatePayloadST(newPayload));
    props.handleChangePagination("1", cPageSize);
  };
  const handleCloseCreateModal = () => {
    setOpenDetailModal(false);
    props.handleSetBranch(true);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const handleClickCell = async (params: GridCellParams) => {
    const chkPN = params.colDef.field;
    if (chkPN !== "checked") {
      props.handleSetBranch(false);
      handleOpenLoading("open", true);
      try {
        await dispatch(getsaleLimitTimeDetail(params.row.id));
        if (saleLimitTimeDetail.data.length > 0 || saleLimitTimeDetail.data) {
          setOpenDetailModal(true);
        }
      } catch (error) {
        console.log(error);
      }

      handleOpenLoading("close", false);
    }
  };
  const handleStartAll = async () => {
    const listID = lstST
      .filter((el: any) => !!el.checked)
      .map((item: any) => item.id);
    try {
      const body = {
        stIds: listID,
      };
      const rs = await getStartMultipeSaleLimitTime(body);

      if (rs.code === 20000) {
        setOpenPopup(true);
        setPopupMsg(
          "คุณได้เริ่มใช้งานการกำหนดเวลา (งด) ขายสินค้าเรียบร้อยแล้ว",
        );
        props.onSearch();
      } else {
        setOpenAlert(true);
      }
    } catch (error) {
      setOpenAlert(true);
    }
  };

  return (
    <>
      {props.checkAdmin && (
        <Box sx={{ marginBottom: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            className={classes.MbtnSearch}
            sx={{ marginRight: "20px", width: "126px" }}
            onClick={handleStartAll}
            disabled={!lstST.find((item: any) => !!item.checked)}
          >
            เริ่มต้นใช้งาน
          </Button>
        </Box>
      )}
      <div
        className={classes.MdataGridPaginationTop}
        style={{ height: lstST.length >= 10 ? "60vh" : "auto", width: "100%" }}
      >
        <DataGrid
          columns={columns}
          rows={lstST}
          pagination
          page={currentPage - 1}
          hideFooterSelectedRowCount={true}
          pageSize={parseInt(pageSize)}
          rowCount={responveST.total}
          paginationMode="server"
          rowHeight={45}
          autoHeight={lstST.length < 10}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onCellClick={handleClickCell}
          scrollbarSize={10}
        />
      </div>
      {openDetailModal && (
        <STCreateModal
          type={"Detail"}
          isAdmin={isAdmin}
          setOpenPopup={setOpenPopup}
          setPopupMsg={setPopupMsg}
          isOpen={openDetailModal}
          onClickClose={handleCloseCreateModal}
          onSearch={props.onSearch}
        />
      )}
      <LoadingModal open={openLoadingModal.open} />
      <AlertError
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        textError={"กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน"}
      />
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
    </>
  );
};
export default SaleLimitTimeList;
