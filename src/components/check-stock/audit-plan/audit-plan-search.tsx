import { Box, Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { useStyles } from "../../../styles/makeTheme";
import {
  getBranchName,
  objectNullOrEmpty,
  onChange,
  onChangeDate,
  stringNullOrEmpty,
} from "../../../utils/utils";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import DatePickerComponent from "../../commons/ui/date-picker";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AlertError from "../../commons/ui/alert-error";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import LoadingModal from "../../commons/ui/loading-modal";
import { Action, StockActionStatus } from "../../../utils/enum/common-enum";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../../models/keycolak-token-info";
import { getUserInfo } from "../../../store/sessionStore";
import { BranchListOptionType } from "../../../models/branch-model";
import { isChannelBranch } from "../../../utils/role-permission";
import BranchListDropDown from "../../commons/ui/branch-list-dropdown";
import ModalCreateAuditPlan from "./audit-plan-create";
import moment from "moment";
import { SearchOff } from "@mui/icons-material";
import AuditPlanItemList from "./audit-plan-search-item-list";
import {
  auditPlanGetSearch,
  clearDataFilter,
} from "../../../store/slices/audit-plan-search-slice";
import { AuditPlanSearchRequest } from "../../../models/audit-plan";
import { updateAddTypeAndProductState } from "../../../store/slices/add-type-product-slice";

const _ = require("lodash");

interface State {
  documentNumber: string;
  branch: string;
  status: string;
  fromDate: any | Date | number | string;
  toDate: any | Date | number | string;
}

interface loadingModalState {
  open: boolean;
}

const AuditPlanSearch = () => {
  const classes = useStyles();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : ""
      : "",
  );
  const branchName = getBranchName(branchList, ownBranch);
  const [groupBranch, setGroupBranch] = React.useState(isChannelBranch);
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const [branchMap, setBranchMap] = React.useState<BranchListOptionType>({
    code: ownBranch,
    name: branchName ? branchName : "",
  });
  const dispatch = useAppDispatch();
  const page = "1";

  const auditPlanSearchSlice = useAppSelector(
    (state) => state.auditPlanSearchSlice,
  );
  const limit = auditPlanSearchSlice.apSearchResponse.perPage;

  const [branchOptions, setBranchOptions] =
    React.useState<BranchListOptionType | null>(groupBranch ? branchMap : null);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const userInfo = getUserInfo();
  const managePermission =
    userInfo.acl["service.posback-stock"] != null &&
    userInfo.acl["service.posback-stock"].length > 0
      ? userInfo.acl["service.posback-stock"].includes("stock.ap.manage")
      : false;
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const handleChangeBranch = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branch: JSON.parse(codes) });
    } else {
      setValues({ ...values, branch: "" });
    }
  };
  const [values, setValues] = React.useState<State>({
    documentNumber: "",
    branch: groupBranch ? ownBranch : "ALL",
    status: "ALL",
    fromDate: new Date(),
    toDate: new Date(),
  });

  useEffect(() => {
    if (groupBranch) {
      setOwnBranch(
        getUserInfo().branch
          ? getBranchName(branchList, getUserInfo().branch)
            ? getUserInfo().branch
            : ""
          : "",
      );
    }
  }, [branchList]);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleOpenModal = () => {
    dispatch(updateAddTypeAndProductState([]));
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const onClear = async () => {
    setClearBranchDropDown(!clearBranchDropDown);
    setFlagSearch(false);
    setValues({
      documentNumber: "",
      branch: groupBranch ? ownBranch : "ALL",
      status: "ALL",
      fromDate: new Date(),
      toDate: new Date(),
    });
    dispatch(clearDataFilter());
  };

  const validateSearch = () => {
    let isValid = true;
    if (
      stringNullOrEmpty(values.fromDate) ||
      stringNullOrEmpty(values.toDate) ||
      values.branch == "ALL"
    ) {
      isValid = false;
      setOpenAlert(true);
      setTextError("กรุณาระบุข้อมูล");
    }
    return isValid;
  };

  const onSearch = async () => {
    if (!validateSearch()) return;
    let limits;
    if (limit === 0) {
      limits = "10";
    } else {
      limits = limit ? limit.toString() : "10";
    }
    const payload: AuditPlanSearchRequest = {
      perPage: limits,
      page: page,
      docNo: values.documentNumber.trim(),
      branch: values.branch,
      status: values.status,
      creationDateFrom: moment(values.fromDate).startOf("day").toISOString(),
      creationDateTo: moment(values.toDate).endOf("day").toISOString(),
    };

    handleOpenLoading("open", true);
    await dispatch(auditPlanGetSearch(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };

  const onReSearch = async (branch: string) => {
    let limits;
    if (limit === 0) {
      limits = "10";
    } else {
      limits = limit ? limit.toString() : "10";
    }
    const payload: AuditPlanSearchRequest = {
      perPage: limits,
      page: page,
      docNo: values.documentNumber.trim(),
      branch: branch,
      status: values.status,
      creationDateFrom: moment(values.fromDate).startOf("day").toISOString(),
      creationDateTo: moment(values.toDate).endOf("day").toISOString(),
    };

    handleOpenLoading("open", true);
    await dispatch(auditPlanGetSearch(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };
  let dataTable;
  const res = auditPlanSearchSlice.apSearchResponse;

  const [flagSearch, setFlagSearch] = React.useState(false);
  if (flagSearch) {
    if (res && res.data && res.data.length > 0) {
      dataTable = (
        <AuditPlanItemList
          values={values}
          onSearch={onSearch}
          reSearch={onReSearch}
        />
      );
    } else {
      dataTable = (
        <Grid item container xs={12} justifyContent="center">
          <Box color="#CBD4DB">
            <h2>
              {"ไม่มีข้อมูล"} <SearchOff fontSize="large" />
            </h2>
          </Box>
        </Grid>
      );
    }
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }} mb={3}>
        <Grid container rowSpacing={3} columnSpacing={6} mt={0.1}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ค้นหาเอกสาร
            </Typography>
            <TextField
              id="documentNumber"
              name="documentNumber"
              size="small"
              value={values.documentNumber}
              onChange={onChange.bind(this, setValues, values)}
              className={classes.MtextField}
              fullWidth
              placeholder={"เลขที่เอกสาร AP/SC/SA/SL"}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาขา<span style={{ color: "#F54949" }}>*</span>
            </Typography>
            <BranchListDropDown
              valueBranch={branchOptions}
              sourceBranchCode={ownBranch}
              onChangeBranch={handleChangeBranch}
              isClear={clearBranchDropDown}
              disable={groupBranch}
              isFilterAuthorizedBranch={true}
              placeHolder={"กรุณาเลือก"}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สถานะ
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="status"
                name="status"
                value={values.status}
                onChange={onChange.bind(this, setValues, values)}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"}>ทั้งหมด</MenuItem>
                <MenuItem value={StockActionStatus.DRAFT}>บันทึก</MenuItem>
                <MenuItem value={StockActionStatus.CONFIRM}>ยืนยัน</MenuItem>
                <MenuItem value={StockActionStatus.COUNTING}>
                  เริ่มตรวจนับ
                </MenuItem>
                <MenuItem value={StockActionStatus.END}>ปิดงาน</MenuItem>
                <MenuItem value={StockActionStatus.CANCEL}>ยกเลิก</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Typography mt={2}>วันที่สร้างรายการ</Typography>
        <Grid container rowSpacing={3} columnSpacing={6}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ตั้งแต่ <span style={{ color: "#F54949" }}>*</span>
            </Typography>
            <DatePickerComponent
              onClickDate={onChangeDate.bind(
                this,
                setValues,
                values,
                "fromDate",
              )}
              value={values.fromDate}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ถึง <span style={{ color: "#F54949" }}>*</span>
            </Typography>
            <DatePickerComponent
              onClickDate={onChangeDate.bind(this, setValues, values, "toDate")}
              type={"TO"}
              minDateTo={values.fromDate}
              value={values.toDate}
            />
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
        <Grid container rowSpacing={3} columnSpacing={6} mt={1}>
          <Grid item xs={12} style={{ textAlign: "right" }}>
            {managePermission && (
              <Button
                id="btnCreate"
                variant="contained"
                sx={{ width: "150px", height: "40px" }}
                className={classes.MbtnSearch}
                color="secondary"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={handleOpenModal}
              >
                สร้างเอกสารใหม่
              </Button>
            )}

            <Button
              id="btnClear"
              variant="contained"
              sx={{ width: "126px", height: "40px", ml: 2 }}
              className={classes.MbtnClear}
              color="cancelColor"
              onClick={onClear}
            >
              เคลียร์
            </Button>
            <Button
              id="btnSearch"
              variant="contained"
              color="primary"
              sx={{ width: "126px", height: "40px", ml: 2 }}
              className={classes.MbtnSearch}
              onClick={onSearch}
            >
              ค้นหา
            </Button>
          </Grid>
        </Grid>
      </Box>
      {dataTable}
      <LoadingModal open={openLoadingModal.open} />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />
      {openModal && (
        <ModalCreateAuditPlan
          isOpen={openModal}
          onClickClose={handleCloseModal}
          setOpenPopup={setOpenPopup}
          setPopupMsg={setPopupMsg}
          action={Action.INSERT}
          onSearchMain={onSearch}
          onReSearchMain={onReSearch}
        />
      )}
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
    </>
  );
};

export default AuditPlanSearch;
