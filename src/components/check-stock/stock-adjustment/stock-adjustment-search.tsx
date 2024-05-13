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
import { SearchOff } from "@mui/icons-material";
import AlertError from "../../commons/ui/alert-error";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import LoadingModal from "../../commons/ui/loading-modal";
import { StockActionStatus } from "../../../utils/enum/common-enum";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../../models/keycolak-token-info";
import { getUserInfo } from "../../../store/sessionStore";
import { BranchListOptionType } from "../../../models/branch-model";
import { getStockAdjustmentSearch } from "../../../store/slices/stock-adjustment-search-slice";
import StockAdjustmentList from "./stock-adjustment-list";
import BranchListDropDown from "../../commons/ui/branch-list-dropdown";
import { isChannelBranch } from "../../../utils/role-permission";
import { StockAdjustmentSearchRequest } from "../../../models/stock-adjustment-model";
import { saveSearchCriteriaSA } from "../../../store/slices/stock-adjustment-criteria-search-slice";

const _ = require("lodash");

interface State {
  documentNumber: string;
  branch: string;
  status: string;
  type: string;
  startDate: any | Date | number | string;
  endDate: any | Date | number | string;
}

interface loadingModalState {
  open: boolean;
}

const StockAdjustmentSearch = () => {
  const classes = useStyles();
  const { t } = useTranslation(["barcodeDiscount", "common"]);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);

  const dispatch = useAppDispatch();
  const page = "1";
  const limit = useAppSelector(
    (state) => state.stockAdjustmentSearchSlice.toSearchResponse.perPage,
  );
  const stockAdjustmentSearchSlice = useAppSelector(
    (state) => state.stockAdjustmentSearchSlice,
  );
  const [requestPermission, setRequestPermission] = useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const [listBranchSelect, setListBranchSelect] = React.useState<
    BranchListOptionType[]
  >([]);
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : ""
      : "",
  );
  const [groupBranch, setGroupBranch] = React.useState(isChannelBranch);
  const branchName = getBranchName(branchList, ownBranch);
  const branchMap: BranchListOptionType = {
    code: ownBranch,
    name: branchName ? branchName : "",
  };
  const [branchOptions, setBranchOptions] =
    React.useState<BranchListOptionType | null>(groupBranch ? branchMap : null);
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const [values, setValues] = React.useState<State>({
    documentNumber: "",
    branch: groupBranch ? ownBranch : "ALL",
    status: "ALL",
    type: "ALL",
    startDate: new Date(),
    endDate: new Date(),
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
      setBranchOptions({
        code: ownBranch,
        name: branchName ? branchName : "",
      });
    }
  }, [branchList]);

  useEffect(() => {
    //permission
    const userInfo: KeyCloakTokenInfo = getUserInfo();
    if (!objectNullOrEmpty(userInfo) && !objectNullOrEmpty(userInfo.acl)) {
      let userPermissionCampaign =
        userInfo.acl["service.posback-campaign"] != null &&
        userInfo.acl["service.posback-campaign"].length > 0
          ? userInfo.acl["service.posback-campaign"]
          : [];
      setRequestPermission(
        userPermissionCampaign != null && userPermissionCampaign.length > 0
          ? userPermissionCampaign.includes("campaign.to.create")
          : false,
      );
      setValues({
        ...values,
        status: "ALL",
      });
    }
  }, []);

  useEffect(() => {
    if (listBranchSelect.length > 0) {
      let branches = listBranchSelect.map((item: any) => item.code).join(",");
      setValues({ ...values, branch: branches });
    }
  }, [listBranchSelect]);

  const handleChangeBranch = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branch: JSON.parse(codes) });
    } else {
      setValues({ ...values, branch: "" });
    }
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
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
      type: "ALL",
      startDate: new Date(),
      endDate: new Date(),
    });

    const payload: StockAdjustmentSearchRequest = {
      perPage: (limit ? limit : 10).toString(),
      page: page,
      docNo: values.documentNumber,
      branch: values.branch,
      status: values.status,
      creationDateFrom: moment(values.startDate).startOf("day").toISOString(),
      creationDateTo: moment(values.endDate).endOf("day").toISOString(),
      clearSearch: true,
    };
    dispatch(getStockAdjustmentSearch(payload));
    if (!requestPermission) {
      setListBranchSelect([]);
    }
  };

  const validateSearch = () => {
    let isValid = true;
    if (
      stringNullOrEmpty(values.startDate) ||
      stringNullOrEmpty(values.endDate) ||
      (!requestPermission &&
        (stringNullOrEmpty(values.branch) || "ALL" === values.branch))
    ) {
      isValid = false;
      setOpenAlert(true);
      setTextError("กรุณากรอกข้อมูลค้นหา");
    }
    return isValid;
  };

  const onSearch = async () => {
    if (!validateSearch()) {
      return;
    }
    let limits;
    if (limit === 0) {
      limits = "10";
    } else {
      limits = limit ? limit.toString() : "10";
    }
    const payload: StockAdjustmentSearchRequest = {
      perPage: limits,
      page: page,
      docNo: values.documentNumber.trim(),
      branch: values.branch,
      status: values.status,
      creationDateFrom: moment(values.startDate).startOf("day").toISOString(),
      creationDateTo: moment(values.endDate).endOf("day").toISOString(),
    };

    handleOpenLoading("open", true);
    await dispatch(getStockAdjustmentSearch(payload));
    await dispatch(saveSearchCriteriaSA(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };

  let dataTable;
  const res = stockAdjustmentSearchSlice.toSearchResponse;
  const [flagSearch, setFlagSearch] = React.useState(false);
  if (flagSearch) {
    if (res && res.data && res.data.length > 0) {
      dataTable = (
        <StockAdjustmentList onSearch={onSearch} type={values.type} />
      );
    } else {
      dataTable = (
        <Grid item container xs={12} justifyContent="center">
          <Box color="#CBD4DB">
            <h2>
              {t("noData")} <SearchOff fontSize="large" />
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
              {"ค้นหาเอกสาร"}
            </Typography>
            <TextField
              id="documentNumber"
              name="documentNumber"
              size="small"
              value={values.documentNumber}
              onChange={onChange.bind(this, setValues, values)}
              className={classes.MtextField}
              fullWidth
              placeholder={"เลขที่เอกสาร SA"}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography
              gutterBottom
              variant="subtitle1"
              component="div"
              mb={1}
              align="left"
              sx={{ display: "flex", width: "100%" }}
            >
              {t("branch")}
              <Typography sx={{ color: "#F54949", marginRight: "5px" }}>
                {" "}
                *{" "}
              </Typography>
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
              {t("status")}
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="status"
                name="status"
                value={values.status}
                onChange={onChange.bind(this, setValues, values)}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"} selected={true}>
                  {t("all")}
                </MenuItem>
                <MenuItem value={StockActionStatus.DRAFT}>บันทึก</MenuItem>
                <MenuItem value={StockActionStatus.CONFIRM}>ยืนยัน</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Typography mt={2}>วันที่สร้างรายการ</Typography>
        <Grid container rowSpacing={3} columnSpacing={6}>
          <Grid item xs={4}>
            <Typography
              gutterBottom
              variant="subtitle1"
              component="div"
              mb={1}
              align="left"
              sx={{ display: "flex", width: "100%" }}
            >
              {"ตั้งแต่"}
              <Typography sx={{ color: "#F54949", marginRight: "5px" }}>
                {" "}
                *{" "}
              </Typography>
            </Typography>
            <DatePickerComponent
              onClickDate={onChangeDate.bind(
                this,
                setValues,
                values,
                "startDate",
              )}
              value={values.startDate}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography
              gutterBottom
              variant="subtitle1"
              component="div"
              mb={1}
              align="left"
              sx={{ display: "flex", width: "100%" }}
            >
              {"ถึง"}
              <Typography sx={{ color: "#F54949", marginRight: "5px" }}>
                {" "}
                *{" "}
              </Typography>
            </Typography>
            <DatePickerComponent
              onClickDate={onChangeDate.bind(
                this,
                setValues,
                values,
                "endDate",
              )}
              type={"TO"}
              minDateTo={values.startDate}
              value={values.endDate}
            />
          </Grid>
        </Grid>
        <Grid container rowSpacing={3} columnSpacing={6} mt={1}>
          <Grid item xs={12} style={{ textAlign: "right" }}>
            <Button
              id="btnClear"
              variant="contained"
              sx={{ width: "126px", height: "40px", ml: 2 }}
              className={classes.MbtnClear}
              color="cancelColor"
              onClick={onClear}
            >
              {t("common:button.clear")}
            </Button>
            <Button
              id="btnSearch"
              variant="contained"
              color="primary"
              sx={{ width: "126px", height: "40px", ml: 2 }}
              className={classes.MbtnSearch}
              onClick={onSearch}
            >
              {t("common:button.search")}
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
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
    </>
  );
};

export default StockAdjustmentSearch;
