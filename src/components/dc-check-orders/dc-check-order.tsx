import moment from "moment";
import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Button } from "@mui/material";
import store, { useAppSelector, useAppDispatch } from "../../store/store";
import { featchOrderListDcAsync } from "../../store/slices/dc-check-order-slice";
import { saveSearchCriteriaDc } from "../../store/slices/save-search-order-dc-slice";
import {
  CheckOrderRequest,
  DataType,
  RequestListType,
  VerifySDListRequestType,
  VerifySDListResponseType,
} from "../../models/dc-check-order-model";
import DCOrderList from "./dc-order-list";
import { useStyles } from "../../styles/makeTheme";
import DatePickerComponent from "../commons/ui/date-picker";
import LoadingModal from "../commons/ui/loading-modal";
import { FemaleSharp, SearchOff } from "@mui/icons-material";
import AlertError from "../commons/ui/alert-error";
import BranchListDropDown from "../commons/ui/branch-list-dropdown";
import { getUserInfo } from "../../store/sessionStore";
import { getBranchName } from "../../utils/utils";
import { env } from "../../adapters/environmentConfigs";
import { BranchListOptionType } from "../../models/branch-model";
import {
  isAllowActionPermission,
  isGroupDC,
} from "../../utils/role-permission";
import { ACTIONS } from "../../utils/enum/permission-enum";
import {
  setItemId,
  setReloadScreen,
} from "../../store/slices/dc-check-order-detail-slice";
import { BranchInfo } from "../../models/search-branch-model";
import { ApiError } from "../../models/api-error-model";
import { verifyDCOrderShipmentList } from "../../services/order-shipment";
import i18n from "../../locales/i18n";
import { mappingErrorParam } from "../../utils/exception/pos-exception";

moment.locale("th");

interface State {
  docNo: string;
  shipBranchFrom: string;
  verifyDCStatus: string;
  dateFrom: string;
  dateTo: string;
  sdType: string;
  sortBy: string;
  shipBranchTo: string;
}
interface loadingModalState {
  open: boolean;
}

interface branchListOptionType {
  name: string;
  code: string;
}

function DCCheckOrderSearch() {
  const [disableSearchBtn, setDisableSearchBtn] = React.useState(true);
  const [disableApproveBtn, setDisableApproveBtn] = React.useState(true);
  const page = "1";
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.dcCheckOrderList);
  const limit = useAppSelector(
    (state) => state.dcCheckOrderList.orderList.perPage,
  );
  const [values, setValues] = React.useState<State>({
    docNo: "",
    shipBranchFrom: "",
    shipBranchTo: "",
    verifyDCStatus: "ALL",
    dateFrom: "",
    dateTo: "",
    sdType: "ALL",
    sortBy: "",
  });
  const [groupDC, setGroupDC] = React.useState<boolean>(false);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  // const [valueBranchList, setValueBranchList] = React.useState<branchListOptionType | null>(null);

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");

  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const [branchFromCode, setBranchFromCode] = React.useState("");
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const authorizedBranchList = useAppSelector(
    (state) => state.authorizedhBranchSlice,
  );

  const filterAuthorizedBranch = () => {
    return authorizedBranchList.branchList.data?.branches.find(
      (item: BranchInfo) => item.isDC === true,
    );
  };

  const defaultBranch = () => {
    if (isGroupDC()) {
      const branch = filterAuthorizedBranch();
      return branch ? branch.code : env.branch.code;
    } else {
      return getUserInfo().branch
        ? getBranchName(branchList, getUserInfo().branch)
          ? getUserInfo().branch
          : env.branch.code
        : env.branch.code;
    }
  };
  const [ownBranch, setOwnBranch] = React.useState(defaultBranch());
  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
  };

  React.useEffect(() => {
    setDisableSearchBtn(isAllowActionPermission(ACTIONS.ORDER_VER_VIEW));
    setDisableApproveBtn(
      isAllowActionPermission(ACTIONS.ORDER_VER_APPROVE_ALL),
    );
    setBranchFromCode(ownBranch);
    setValues({ ...values, shipBranchFrom: ownBranch });
    // setGroupDC(isGroupDC());
  }, []);

  const branchFrom = getBranchName(branchList, ownBranch);
  const branchFromMap: BranchListOptionType = {
    code: ownBranch,
    name: branchFrom ? branchFrom : "",
  };
  const [valuebranchFrom, setValuebranchFrom] =
    React.useState<BranchListOptionType | null>(branchFromMap);

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
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

    const payload: CheckOrderRequest = {
      limit: limits,
      page: page,
      docNo: newDocNo,
      shipBranchFrom: values.shipBranchFrom,
      shipBranchTo: values.shipBranchTo,
      verifyDCStatus: values.verifyDCStatus,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      sdType: values.sdType,
      sortBy: values.sortBy,
      clearSearch: false,
    };

    handleOpenLoading("open", true);
    await dispatch(featchOrderListDcAsync(payload));
    await dispatch(saveSearchCriteriaDc(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };

  const onClickValidateForm = () => {
    dispatch(setReloadScreen(false));
    dispatch(setItemId(""));
    if (
      values.docNo === "" &&
      // valueBranchList === null &&
      values.verifyDCStatus === "ALL" &&
      startDate === null &&
      endDate === null &&
      values.sdType === "ALL"
    ) {
      setOpenAlert(true);
      setTextError("กรุณากรอกวันที่รับสินค้า");
    } else if (
      values.docNo === "" &&
      // valueBranchList === null &&
      values.verifyDCStatus === "ALL" &&
      values.sdType === "ALL"
    ) {
      if (startDate === null || endDate === null) {
        setOpenAlert(true);
        setTextError("กรุณากรอกวันที่รับสินค้า");
      } else {
        onClickSearchBtn();
      }
    } else {
      onClickSearchBtn();
    }
  };

  const onClickClearBtn = async () => {
    handleOpenLoading("open", true);
    setFlagSearch(false);
    setStartDate(null);
    setEndDate(null);
    setClearBranchDropDown(!clearBranchDropDown);
    setValues({
      docNo: "",
      shipBranchFrom: values.shipBranchFrom,
      shipBranchTo: "",
      verifyDCStatus: "ALL",
      dateFrom: "",
      dateTo: "",
      sdType: "ALL",
      sortBy: "",
    });

    const payload: CheckOrderRequest = {
      limit: limit ? limit.toString() : "10",
      page: page,
      docNo: values.docNo,
      shipBranchFrom: values.shipBranchFrom,
      shipBranchTo: values.shipBranchTo,
      verifyDCStatus: values.verifyDCStatus,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      sdType: values.sdType,
      sortBy: values.sortBy,
      clearSearch: true,
    };

    dispatch(featchOrderListDcAsync(payload));
    dispatch(setReloadScreen(false));
    dispatch(setItemId(""));
    setTimeout(() => {
      handleOpenLoading("open", false);
    }, 300);
  };

  const handleStartDatePicker = (value: Date) => {
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };

  const handleChangeBranchFrom = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, shipBranchFrom: JSON.parse(codes) });
    } else {
      setValues({ ...values, shipBranchFrom: "" });
    }
  };

  const handleChangeBranchTo = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, shipBranchTo: JSON.parse(codes) });
    } else {
      setValues({ ...values, shipBranchTo: "" });
    }
  };
  const [selectRowsList, setSelectRowsList] = React.useState<Array<any>>([]);
  const handleSelectRows = async (list: any) => {
    setSelectRowsList(list);
  };
  let orderListData;
  const orderListDatas = items.orderList.data ? items.orderList.data : [];
  const [flagSearch, setFlagSearch] = React.useState(false);
  if (flagSearch) {
    if (orderListDatas.length > 0) {
      orderListData = <DCOrderList onSelectRows={handleSelectRows} />;
    } else {
      orderListData = (
        <Grid item container xs={12} justifyContent="center">
          <Box color="#CBD4DB">
            <h2>
              ไม่มีข้อมูล <SearchOff fontSize="large" />
            </h2>
          </Box>
        </Grid>
      );
    }
  }

  //check dateFrom-dateTo
  if (endDate != null && startDate != null) {
    if (endDate < startDate) {
      setEndDate(null);
    }
  }

  //alert Errormodel
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleOnApprove = () => {
    handleOpenLoading("open", true);
    const items: RequestListType[] = selectRowsList.map(
      (item: any, index: number) => {
        return {
          sdNo: item,
        };
      },
    );

    const payload: VerifySDListRequestType = {
      requestList: items,
    };
    verifyDCOrderShipmentList(payload)
      .then(
        function (value: VerifySDListResponseType) {
          const data: DataType[] = value.data;
          const errorList = data
            .filter((item: DataType) => item.code !== 20100)
            .map((item: DataType) => ` ${item.sdNo}`);
          console.log(errorList);
          if (errorList && errorList.length > 0) {
            const err_msg = i18n.t(`error:${`stockDiff.verifyListReject`}`);
            setTextError(
              mappingErrorParam(err_msg, { docNoList: errorList.toString() }),
            );
            setOpenAlert(true);
          }
        },
        function (error: ApiError) {
          setOpenAlert(true);
          setTextError(error.message);
        },
      )
      .finally(async () => {
        const payloadSearchDC =
          store.getState().saveSearchOrderDc.searchCriteriaDc;
        await dispatch(featchOrderListDcAsync(payloadSearchDC));
        handleOpenLoading("open", false);
      });
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              ค้นหาเอกสาร
            </Typography>
            <TextField
              id="txtDocNo"
              name="docNo"
              size="small"
              value={values.docNo}
              onChange={handleChange}
              className={classes.MtextField}
              fullWidth
              placeholder="เลขที่เอกสาร LD/BT/SD"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              สาขาต้นทาง
            </Typography>
            <BranchListDropDown
              valueBranch={valuebranchFrom}
              sourceBranchCode={""}
              onChangeBranch={handleChangeBranchFrom}
              isClear={clearBranchDropDown}
              disable={true}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              สาขาปลายทาง
            </Typography>
            <BranchListDropDown
              sourceBranchCode={branchFromCode}
              onChangeBranch={handleChangeBranchTo}
              isClear={clearBranchDropDown}
              isFilterAuthorizedBranch={isGroupDC() ? true : false}
            />
          </Grid>
          <Grid item xs={4} sx={{ pt: 40 }}>
            <Typography gutterBottom variant="subtitle1" component="div">
              วันที่รับสินค้า ตั้งแต่
            </Typography>
            <DatePickerComponent
              onClickDate={handleStartDatePicker}
              value={startDate}
              data-testid="dateFrom"
            />
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ width: "100%" }}>
              <Typography gutterBottom variant="subtitle1" component="div">
                ถึง
              </Typography>
              <DatePickerComponent
                onClickDate={handleEndDatePicker}
                value={endDate}
                type={"TO"}
                minDateTo={startDate}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              สถานะการตรวจสอบผลต่าง
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selVerifyDCStatus"
                name="verifyDCStatus"
                value={values.verifyDCStatus}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"} selected={true}>
                  ทั้งหมด
                </MenuItem>
                <MenuItem value={"0"}>รอการตรวจสอบ</MenuItem>
                <MenuItem value={"1"}>ตรวจสอบแล้ว</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} sx={{ pt: 30 }}>
            {" "}
            <Typography gutterBottom variant="subtitle1" component="div">
              ประเภท
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selSdType"
                name="sdType"
                value={values.sdType}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"} selected={true}>
                  ทั้งหมด
                </MenuItem>
                <MenuItem value={"0"}>ลังกระดาษ/Tote</MenuItem>
                <MenuItem value={"1"}>สินค้าภายในTote</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} container alignItems="flex-end"></Grid>
          <Grid item xs={4} container alignItems="flex-end"></Grid>

          <Grid item xs={4} container alignItems="flex-end">
            <Grid item container xs={12} sx={{ mt: 3 }} direction="row">
              <Button
                id="btnApprove"
                variant="contained"
                color="secondary"
                onClick={handleOnApprove}
                sx={{
                  width: "45%",
                  ml: 1,
                  display: `${disableApproveBtn ? "none" : ""}`,
                }}
                className={classes.MbtnClear}
                disabled={selectRowsList.length === 0}
              >
                อนุมัติ
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={4} container alignItems="flex-end"></Grid>
          <Grid item xs={4} container alignItems="flex-end">
            <Grid
              item
              container
              xs={12}
              sx={{ mt: 3 }}
              justifyContent="flex-end"
              direction="row"
              alignItems="flex-end"
            >
              <Button
                id="btnClear"
                variant="contained"
                onClick={onClickClearBtn}
                sx={{ width: "45%" }}
                className={classes.MbtnClear}
                color="cancelColor"
                fullWidth={true}
              >
                เคลียร์
              </Button>
              <Button
                id="btnSearch"
                variant="contained"
                color="primary"
                onClick={onClickValidateForm}
                sx={{
                  width: "45%",
                  ml: 1,
                  display: `${disableSearchBtn ? "none" : ""}`,
                }}
                className={classes.MbtnSearch}
                fullWidth={true}
              >
                ค้นหา
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box mt={6}></Box>
      {/* {items.orderList && <DCOrderList />} */}
      {orderListData}
      <LoadingModal open={openLoadingModal.open} />

      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />
    </>
  );
}

export default DCCheckOrderSearch;
