import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useStyles } from "../../styles/makeTheme";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import BranchListDropDown from "../commons/ui/branch-list-dropdown";
import DatePickerAllComponent from "../commons/ui/date-picker-all";
import ReasonsListDropDown from "./transfer-reasons-list-dropdown";
import AlertError from "../commons/ui/alert-error";
import AlertErrorStock from "./alert-error-stock";
import LoadingModal from "../commons/ui/loading-modal";
import { getStockTransferStatusList } from "../../utils/enum/stock-transfer-enum";
import {
  Approve2MultipleStockRequest,
  StockTransferRequest,
} from "../../models/stock-transfer-model";
import { featchSearchStockTransferRtAsync } from "../../store/slices/stock-transfer-rt-slice";
import moment from "moment";
import { saveSearchStockTransferRt } from "../../store/slices/save-search-stock-transfer-rt-slice";
import StockTransferRtList from "./stock-transfer-rt-list";
import ModalCreateStockTransfer from "./stock-request-detail";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { updatestockRequestItemsState } from "../../store/slices/stock-request-items-slice";
import {
  isAllowActionPermission,
  isAllowMainMenuPermission,
  isGroupBranch,
} from "../../utils/role-permission";
import { env } from "../../adapters/environmentConfigs";
import { getBranchName } from "../../utils/utils";
import { BranchListOptionType } from "../../models/branch-model";
import { ACTIONS, PERMISSION_GROUP } from "../../utils/enum/permission-enum";
import { getUserInfo } from "../../store/sessionStore";
import { Download } from "@mui/icons-material";
import ModalUploadFile from "./stock-request-upload-file";
import ModalConfirmTransaction from "./modal-confirm-transaction";
import { approve2MultipleStockRequest } from "../../services/stock-transfer";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { mappingErrorParam } from "../../utils/exception/pos-exception";
import { ErrorDetailResponse, Header } from "../../models/api-error-model";

interface State {
  docNo: string;
  branchFrom: string;
  branchTo: string;
  dateFrom: string;
  dateTo: string;
  statuses: string;
  transferReason: string;
}

interface loadingModalState {
  open: boolean;
}

export default function StockTransferRt() {
  const { t } = useTranslation(["stockTransfer", "common"]);
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const page = "1";
  const items = useAppSelector((state) => state.searchStockTrnasferRt);
  const limit = useAppSelector(
    (state) => state.searchStockTrnasferRt.orderList.perPage,
  );
  const [values, setValues] = React.useState<State>({
    docNo: "",
    branchFrom: "",
    branchTo: "",
    dateFrom: "",
    dateTo: "",
    statuses: "ALL",
    transferReason: "",
  });

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
  };

  const [branchFromCode, setBranchFromCode] = React.useState("");
  const [branchToCode, setBranchToCode] = React.useState("");
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const [isAuthorizedBranch, setIsAuthorizedBranch] =
    React.useState<boolean>(false);
  const [displayBtnImport, setDisplayBtnImport] =
    React.useState<boolean>(false);
  const [displayBtnSubmit, setDisplayBtnSubmit] =
    React.useState<boolean>(false);
  const [groupBranchSCM, setGroupBranchSCM] = React.useState<boolean>(false);
  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [displayBtnCreate, setDisplayBtnCreate] = React.useState(false);
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : env.branch.code
      : env.branch.code,
  );

  const branchFrom = getBranchName(branchList, ownBranch);
  const branchFromMap: BranchListOptionType = {
    code: ownBranch,
    name: branchFrom ? branchFrom : "",
  };
  const [valuebranchFrom, setValuebranchFrom] =
    React.useState<BranchListOptionType | null>(
      groupBranch ? branchFromMap : null,
    );

  React.useEffect(() => {
    setDisplayBtnCreate(isAllowActionPermission(ACTIONS.STOCK_RT_MANAGE));
    const scm = getUserInfo().group === PERMISSION_GROUP.SCM;
    const oc = getUserInfo().group === PERMISSION_GROUP.OC;
    setDisplayBtnImport(scm);
    if (scm) {
      setIsAuthorizedBranch(scm);
      setGroupBranchSCM(scm);
      setDisplayBtnSubmit(scm);
    }

    if (oc) {
      setIsAuthorizedBranch(oc);
      setGroupBranchSCM(oc);
    }

    if (groupBranch) {
      setBranchFromCode(ownBranch);
      setValues({ ...values, branchFrom: ownBranch });
    }
  }, []);

  const handleChangeBranchFrom = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setBranchFromCode(branchCode);
      setValues({ ...values, branchFrom: JSON.parse(codes) });
    } else {
      setValues({ ...values, branchFrom: "" });
    }
  };

  const handleChangeBranchTo = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setBranchToCode(branchCode);
      setValues({ ...values, branchTo: JSON.parse(codes) });
    } else {
      setValues({ ...values, branchTo: "" });
    }
  };

  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const handleStartDatePicker = (value: any) => {
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };

  const handleChangeReasons = (ReasonsCode: string) => {
    if (ReasonsCode !== null) {
      let codes = JSON.stringify(ReasonsCode);
      setValues({ ...values, transferReason: JSON.parse(codes) });
    } else {
      setValues({ ...values, transferReason: "" });
    }
  };

  const onClickValidateForm = () => {
    if (startDate === null || endDate === null) {
      setOpenAlert(true);
      setTextError("กรุณาระบุวันที่โอน");
    } else {
      onClickSearchBtn();
    }
  };

  const removeSpace = (value: string) => {
    return value.replace(/\s/g, "");
  };

  const onClickSearchBtn = async () => {
    let limits;
    if (limit === 0 || limit === undefined) {
      limits = "10";
    } else {
      limits = limit.toString();
    }

    let newDocNo = removeSpace(values.docNo);

    const payload: StockTransferRequest = {
      limit: limits,
      page: page,
      docNo: newDocNo,
      branchFrom: values.branchFrom,
      branchTo: values.branchTo,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      statuses: values.statuses,
      transferReason: values.transferReason,
      clearSearch: false,
    };

    handleOpenLoading("open", true);
    await dispatch(featchSearchStockTransferRtAsync(payload));
    await dispatch(saveSearchStockTransferRt(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };

  const onClickClearBtn = () => {
    handleOpenLoading("open", true);
    setFlagSearch(false);
    setStartDate(null);
    setEndDate(null);
    setClearBranchDropDown(!clearBranchDropDown);
    setValues({
      docNo: "",
      branchFrom: values.branchFrom,
      branchTo: "",
      dateFrom: "",
      dateTo: "",
      statuses: "ALL",
      transferReason: "",
    });

    const payload: StockTransferRequest = {
      limit: limit ? limit.toString() : "10",
      page: page,
      docNo: values.docNo,
      branchFrom: values.branchFrom,
      branchTo: values.branchTo,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      statuses: values.statuses,
      transferReason: values.transferReason,
      clearSearch: true,
    };
    dispatch(featchSearchStockTransferRtAsync(payload));

    setTimeout(() => {
      handleOpenLoading("open", false);
    }, 300);
  };

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const [titleError, setTitleError] = React.useState("");
  const [payloadError, setPayloadError] = React.useState<ErrorDetailResponse>();
  //alert Errormodel
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const [openAlertErrStock, setOpenAlertErrStock] = React.useState(false);
  const [textErrStock, setTextErrStock] = React.useState("");
  //alert Errormodel
  const handleCloseAlertErrStock = () => {
    setOpenAlertErrStock(false);
  };

  //check dateFrom-dateTo
  if (endDate != null && startDate != null) {
    if (endDate < startDate) {
      setEndDate(null);
    }
  }

  const [flagSearch, setFlagSearch] = React.useState(false);
  const orderListDatas = items.orderList.data ? items.orderList.data : [];

  const [selectRowsList, setSelectRowsList] = React.useState<Array<any>>([]);
  const [stockRemaining, setStockRemaining] = React.useState<Array<any>>([]);

  const handleSelectRows = async (list: any) => {
    // setSelectRowsList(list);
    const selectRows: any = [];
    const stockRemainingQty: any = [];
    if (list.length > 0) {
      await list.forEach((data: any) => {
        selectRows.push(data.rtNo);

        const validateStockQty: any = data.itemGroups.filter((item: any) => {
          return Number(item.orderAllQty) > Number(item.remainingQty);
        });
        if (validateStockQty.length > 0) stockRemainingQty.push(data.rtNo);
      });

      setSelectRowsList(selectRows);
      setStockRemaining(stockRemainingQty);
    }
  };

  const [openCreateModal, setOpenCreateModal] = React.useState(false);
  const [typeModal, setTypeModal] = React.useState("Create");
  const handleOpenCreateModal = async () => {
    await dispatch(updateAddItemsState({}));
    await dispatch(updatestockRequestItemsState({}));
    setTypeModal("Create");
    setOpenCreateModal(true);
  };

  function handleCloseCreateModal() {
    setOpenCreateModal(false);
  }

  const [openUploadFileModal, setOpenUploadFileModal] = React.useState(false);
  const handleOpenUploadFileModal = async () => {
    setOpenUploadFileModal(true);
  };
  const handleCloseUploadFileModal = async () => {
    setOpenUploadFileModal(false);
  };

  const handleApprove2Multiple = async () => {
    setTextHeaderConfirm("ยืนยันส่งงานรายการโอนสินค้า");
    setOpenModelConfirm(true);
  };

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const searchStockTransferRt = useAppSelector(
    (state) => state.saveSearchStockRt.searchStockTransferRt,
  );
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [textHeaderConfirm, setTextHeaderConfirm] = React.useState("");
  const handleCloseModelConfirm = () => {
    setOpenModelConfirm(false);
  };

  const handleConfirm = async () => {
    handleOpenLoading("open", true);
    setOpenModelConfirm(false);
    const payload: Approve2MultipleStockRequest = {
      rtNos: selectRowsList,
    };
    await approve2MultipleStockRequest(payload)
      .then((value) => {
        dispatch(featchSearchStockTransferRtAsync(searchStockTransferRt));

        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้ส่งงานเรียบร้อยแล้ว");

        // if (value.data.insufficientBalanceRTNos.length > 0) {
        //   setTextError(
        //     mappingErrorParam(
        //       'ไม่สามารถส่งงานได้ เนื่องจากสต๊อกสินค้าคงเหลือไม่เพียงพอ กรุณาแก้ไขจำนวนที่สั่ง \n[{rtNoList}]',
        //       { rtNoList: value.data.insufficientBalanceRTNos.toString() }
        //     )
        //   );
        //   setOpenAlert(true);
        // }

        setTimeout(() => {
          handleCloseSnackBar();
        }, 300);
      })
      .catch((error: any) => {
        if (String(error.code) === "40014") {
          const header: Header = {
            field1: false,
            field2: false,
            field3: true,
            field4: false,
          };
          const payload: ErrorDetailResponse = {
            header: header,
            error_details: error.error_details,
          };
          setOpenAlert(true);
          // setTitleError('เลขที่เอกสาร');
          setTextError(error.message);
          setPayloadError(payload);
        } else {
          setOpenAlert(true);
          setTextError(error.message);
          setTitleError("");
        }
      });
    handleOpenLoading("open", false);
  };

  return (
    <>
      <Box>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("documentSearch")}
            </Typography>
            <TextField
              id="txtDocNo"
              name="docNo"
              size="small"
              value={values.docNo}
              onChange={handleChange}
              className={classes.MtextField}
              fullWidth
              placeholder="เลขที่เอกสาร RT"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาขาต้นทาง
            </Typography>
            <BranchListDropDown
              valueBranch={valuebranchFrom}
              sourceBranchCode={branchToCode}
              onChangeBranch={handleChangeBranchFrom}
              isClear={clearBranchDropDown}
              isFilterAuthorizedBranch={isAuthorizedBranch}
              disable={groupBranch}
              filterOutDC={groupBranchSCM}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาขาปลายทาง
            </Typography>
            <BranchListDropDown
              sourceBranchCode={branchFromCode}
              onChangeBranch={handleChangeBranchTo}
              isClear={clearBranchDropDown}
              isFilterAuthorizedBranch={isAuthorizedBranch}
              filterOutDC={groupBranch}
            />
          </Grid>

          <Grid item xs={4} sx={{ pt: 30 }}>
            <Typography gutterBottom variant="subtitle1" component="div">
              วันที่โอน
            </Typography>
            <Typography gutterBottom variant="subtitle1" component="div">
              ตั้งแต่*
            </Typography>
            <DatePickerAllComponent
              onClickDate={handleStartDatePicker}
              value={startDate}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography
              gutterBottom
              variant="subtitle1"
              component="div"
              sx={{ mt: 3.5 }}
            >
              ถึง*
            </Typography>
            <DatePickerAllComponent
              onClickDate={handleEndDatePicker}
              value={endDate}
              type={"TO"}
              minDateTo={startDate}
            />
          </Grid>
          <Grid item xs={4} container>
            <Typography
              gutterBottom
              variant="subtitle1"
              component="div"
              sx={{ mt: 3.5 }}
            >
              สถานะ
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selPiType"
                name="statuses"
                value={values.statuses}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"} selected={true}>
                  ทั้งหมด
                </MenuItem>
                {getStockTransferStatusList("RT").map((item, index: number) => {
                  return (
                    <MenuItem value={item.key}>
                      {t(`status.${item.value}`)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} sx={{ pt: 30 }}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาเหตุการโอน
            </Typography>
            <ReasonsListDropDown
              onChangeReasons={handleChangeReasons}
              isClear={clearBranchDropDown}
            />
          </Grid>
        </Grid>
      </Box>

      <Box mb={6}>
        <Grid container spacing={2} mt={4} mb={2}>
          <Grid item xs={5}>
            <Button
              id="btnImport"
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={handleOpenUploadFileModal}
              sx={{
                minWidth: 100,
                display: `${!displayBtnImport ? "none" : ""}`,
              }}
              className={classes.MbtnSearch}
            >
              Import
            </Button>
            <Button
              id="btnImport"
              variant="contained"
              color="primary"
              onClick={handleApprove2Multiple}
              sx={{
                ml: 2,
                minWidth: 100,
                display: `${!displayBtnSubmit ? "none" : ""}`,
              }}
              className={classes.MbtnSearch}
              disabled={selectRowsList.length === 0}
            >
              ส่งงาน
            </Button>
          </Grid>
          <Grid item xs={7} sx={{ textAlign: "end" }}>
            <Button
              id="btnCreateStockTransferModal"
              variant="contained"
              onClick={handleOpenCreateModal}
              sx={{ width: 150, display: `${displayBtnCreate ? "none" : ""}` }}
              className={classes.MbtnClear}
              startIcon={<AddCircleOutlineOutlinedIcon />}
              color="secondary"
            >
              สร้างรายการโอน
            </Button>
            <Button
              id="btnClear"
              variant="contained"
              onClick={onClickClearBtn}
              sx={{ width: 110, ml: 2 }}
              className={classes.MbtnClear}
              color="cancelColor"
            >
              เคลียร์
            </Button>
            <Button
              id="btnSearch"
              variant="contained"
              color="primary"
              onClick={onClickValidateForm}
              sx={{ width: 110, ml: 2 }}
              className={classes.MbtnSearch}
            >
              ค้นหา
            </Button>
          </Grid>
        </Grid>
      </Box>

      {flagSearch && (
        <div>
          {orderListDatas.length > 0 && (
            <StockTransferRtList onSelectRows={handleSelectRows} />
          )}
          {orderListDatas.length === 0 && (
            <Grid item container xs={12} justifyContent="center">
              <Box color="#CBD4DB">
                <h2>ไม่มีข้อมูล</h2>
              </Box>
            </Grid>
          )}
        </div>
      )}

      <LoadingModal open={openLoadingModal.open} />

      {/* <AlertError open={openAlert} onClose={handleCloseAlert} textError={textError} /> */}
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
        title={titleError}
        payload={payloadError}
      />

      <AlertErrorStock
        open={openAlertErrStock}
        onClose={handleCloseAlertErrStock}
        textError={textErrStock}
        items={stockRemaining}
      />
      {openCreateModal && (
        <ModalCreateStockTransfer
          type={typeModal}
          edit={true}
          isOpen={openCreateModal}
          onClickClose={handleCloseCreateModal}
        />
      )}

      {openUploadFileModal && (
        <ModalUploadFile
          isOpen={openUploadFileModal}
          onClickClose={handleCloseUploadFileModal}
        />
      )}

      <ModalConfirmTransaction
        open={openModelConfirm}
        onClose={handleCloseModelConfirm}
        handleConfirm={handleConfirm}
        header={textHeaderConfirm}
        title="รายการเอกสาร RT"
        value={`${selectRowsList.length} รายการ`}
      />

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />
    </>
  );
}
