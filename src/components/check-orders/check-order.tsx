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
import { useAppSelector, useAppDispatch } from "../../store/store";
import { featchOrderListAsync } from "../../store/slices/check-order-slice";
import {
  saveSearchCriteria,
  clearSearchCriteria,
} from "../../store/slices/save-search-order";
import { getShipmentTypeText } from "../../utils/enum/check-order-enum";
import { ShipmentRequest } from "../../models/order-model";
import OrderList from "./order-list";
import DatePickerComponent from "../commons/ui/date-picker";
import LoadingModal from "../commons/ui/loading-modal";
import { useStyles } from "../../styles/makeTheme";
import { SearchOff } from "@mui/icons-material";
import AlertError from "../commons/ui/alert-error";
import BranchListDropDown from "../commons/ui/branch-list-dropdown";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { shipmentStatus } from "../../utils/enum/check-order-enum";
import OrderReceiveDetail from "../check-orders/order-receive-detail";
import { isGroupBranch } from "../../utils/role-permission";
import { getUserInfo } from "../../store/sessionStore";
import { getBranchName } from "../../utils/utils";
import { env } from "../../adapters/environmentConfigs";
import { BranchListOptionType } from "../../models/branch-model";
import { PERMISSION_GROUP } from "../../utils/enum/permission-enum";
import { gridColumnsTotalWidthSelector } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

// moment.locale("en");
moment.locale("th");

interface State {
  orderShipment: string;
  // orderNo: string;
  orderStatus: string;
  orderType: string;
  dateFrom: string;
  dateTo: string;
  branchFrom: string;
  branchTo: string;
}
interface loadingModalState {
  open: boolean;
}

function CheckOrderSearch() {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { t } = useTranslation(["orderReceive", "common"]);
  // const limit = "10";
  const page = "1";
  const items = useAppSelector((state) => state.checkOrderList);
  const limit = useAppSelector(
    (state) => state.checkOrderList.orderList.perPage,
  );
  const [displayBtnOrderReceive, setDisplayBtnOrderReceive] =
    React.useState(false);
  const [branchOC, setbranchOC] = React.useState(false);
  const ocUserInfo = getUserInfo().group === PERMISSION_GROUP.OC;

  const [values, setValues] = React.useState<State>({
    orderShipment: "",
    orderStatus: ocUserInfo ? "WAIT_FOR_APPROVAL_1" : "ALL",
    orderType: "ALL",
    dateFrom: "",
    dateTo: "",
    branchFrom: "",
    branchTo: "",
  });

  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");

  React.useEffect(() => {
    if (groupBranch) {
      setBranchToCode(ownBranch);
      setValues({ ...values, branchTo: ownBranch });
    }

    const branch = getUserInfo().group === PERMISSION_GROUP.BRANCH;
    const oc = getUserInfo().group === PERMISSION_GROUP.OC;
    setDisplayBtnOrderReceive(branch);
    setbranchOC(oc);
  }, []);

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
    // console.log(values);
  };
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const onClickValidateForm = () => {
    if (startDate !== null || endDate !== null) {
      if (startDate === null || endDate === null) {
        setOpenAlert(true);
        setTextError("กรุณากรอกวันที่รับสินค้าให้ครบ");
      } else {
        onClickSearchBtn();
      }
    } else {
      if (
        values.orderShipment === "" &&
        values.orderStatus === "ALL" &&
        values.orderType === "ALL" &&
        startDate === null &&
        endDate === null &&
        values.branchFrom === "" &&
        values.branchFrom === ""
      ) {
        setOpenAlert(true);
        setTextError("กรุณากรอกข้อมูลค้นหา");
      } else {
        onClickSearchBtn();
      }
    }
  };

  const onClickSearchBtn = async () => {
    let limits;
    if (limit === 0) {
      limits = "10";
    } else {
      limits = limit.toString();
    }

    let newOrderShipment = removeSpace(values.orderShipment);

    const payload: ShipmentRequest = {
      limit: limits,
      page: page,
      paramQuery: newOrderShipment,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      sdStatus: values.orderStatus,
      sdType: parseInt(values.orderType),
      shipBranchFrom: values.branchFrom,
      shipBranchTo: values.branchTo,
      clearSearch: false,
    };

    handleOpenLoading("open", true);
    await dispatch(featchOrderListAsync(payload));
    await dispatch(saveSearchCriteria(payload));

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
      orderShipment: "",
      // orderNo: "",
      orderStatus: "ALL",
      orderType: "ALL",
      dateFrom: "",
      dateTo: "",
      branchFrom: "",
      branchTo: values.branchTo,
    });

    const payload: ShipmentRequest = {
      limit: limit.toString(),
      page: page,

      paramQuery: values.orderShipment,
      // sdNo: values.orderNo,
      dateFrom: moment(startDate).format("DD/MM/YYYY"),
      dateTo: moment(endDate).format("DD/MM/YYYY"),
      sdStatus: values.orderStatus,
      sdType: parseInt(values.orderType),
      clearSearch: true,
    };

    dispatch(featchOrderListAsync(payload));
    dispatch(clearSearchCriteria());

    setTimeout(() => {
      handleOpenLoading("open", false);
    }, 300);
  };

  const handleStartDatePicker = (value: any) => {
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };

  const [branchFromCode, setBranchFromCode] = React.useState("");
  const [branchToCode, setBranchToCode] = React.useState("");
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : env.branch.code
      : env.branch.code,
  );
  const branchTo = getBranchName(branchList, ownBranch);
  const branchToMap: BranchListOptionType = {
    code: ownBranch,
    name: branchTo ? branchTo : "",
  };
  const [valuebranchTo, setValuebranchTo] =
    React.useState<BranchListOptionType | null>(
      groupBranch ? branchToMap : null,
    );

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

  let orderListData;
  const orderListDatas = items.orderList.data ? items.orderList.data : [];
  const [flagSearch, setFlagSearch] = React.useState(false);
  if (flagSearch) {
    if (orderListDatas.length > 0) {
      orderListData = <OrderList />;
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

  const [openOrderReceiveModal, setOpenOrderReceiveModal] =
    React.useState(false);
  const handleOpenOrderReceiveModal = () => {
    setOpenOrderReceiveModal(true);
  };

  function handleCloseOrderReceiveModal() {
    setOpenOrderReceiveModal(false);
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

  const removeSpace = (value: string) => {
    return value.replace(/\s/g, "");
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ค้นหาเอกสาร
            </Typography>
            <TextField
              id="txtOrderShipment"
              name="orderShipment"
              size="small"
              value={values.orderShipment}
              onChange={handleChange}
              className={classes.MtextField}
              fullWidth
              placeholder="เลขที่เอกสาร LD/BT/SD"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาขาต้นทาง
            </Typography>
            <BranchListDropDown
              sourceBranchCode={branchToCode}
              onChangeBranch={handleChangeBranchFrom}
              isClear={clearBranchDropDown}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาขาปลายทาง
            </Typography>
            <BranchListDropDown
              valueBranch={valuebranchTo}
              sourceBranchCode={branchFromCode}
              onChangeBranch={handleChangeBranchTo}
              isClear={clearBranchDropDown}
              disable={groupBranch}
              isFilterAuthorizedBranch={groupBranch}
            />
          </Grid>

          <Grid item xs={4} sx={{ pt: 30 }}>
            <Typography gutterBottom variant="subtitle1" component="div">
              วันที่รับสินค้า
            </Typography>
            <Typography gutterBottom variant="subtitle1" component="div">
              ตั้งแต่
            </Typography>
            <DatePickerComponent
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
              ถึง
            </Typography>
            <DatePickerComponent
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
                id="selOrderStatus"
                name="orderStatus"
                value={values.orderStatus}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                {/* {branchOC && (
                  <>
                    <MenuItem value={'ALL'}>
                      ทั้งหมด
                    </MenuItem>
                    <MenuItem key={shipmentStatus[0].key} value={shipmentStatus[0].key}>
                      {shipmentStatus[0].text}
                    </MenuItem>
                    <MenuItem key={shipmentStatus[1].key} value={shipmentStatus[1].key}>
                      {shipmentStatus[1].text}
                    </MenuItem>
                    <MenuItem key={shipmentStatus[2].key} value={shipmentStatus[2].key}>
                      {shipmentStatus[2].text}
                    </MenuItem>
                    <MenuItem key={shipmentStatus[3].key} value={shipmentStatus[3].key}>
                      {shipmentStatus[3].text}
                    </MenuItem>
                  </>
                )} */}

                <MenuItem value={"ALL"}>ทั้งหมด</MenuItem>
                {shipmentStatus.map((status) => (
                  <MenuItem
                    key={status.key}
                    value={status.key}
                    // selected={status.key === 'WAIT_FOR_APPROVE_1' ? true : false}
                  >
                    {t(`status.${status.key}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} sx={{ pt: 30 }}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ประเภท
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selOrderType"
                name="orderType"
                value={values.orderType}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"} selected={true}>
                  ทั้งหมด
                </MenuItem>
                <MenuItem value={"0"}>{getShipmentTypeText(0)}</MenuItem>
                <MenuItem value={"1"}>{getShipmentTypeText(1)}</MenuItem>
                <MenuItem value={"2"}>{getShipmentTypeText(2)}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

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
              id="btnCreateStockTransferModal"
              variant="contained"
              onClick={handleOpenOrderReceiveModal}
              sx={{
                minWidth: "15%",
                display: `${!displayBtnOrderReceive ? "none" : ""}`,
              }}
              className={classes.MbtnClear}
              startIcon={<AddCircleOutlineOutlinedIcon />}
              color="secondary"
            >
              รับสินค้า
            </Button>
            <Button
              id="btnClear"
              variant="contained"
              onClick={onClickClearBtn}
              sx={{ width: "13%", ml: 2 }}
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
              sx={{ width: "13%", ml: 2 }}
              className={classes.MbtnSearch}
            >
              ค้นหา
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box mt={6}></Box>
      {/* {items.orderList && <OrderList />} */}
      {orderListData}
      <LoadingModal open={openLoadingModal.open} />

      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />

      {openOrderReceiveModal && (
        <OrderReceiveDetail
          defaultOpen={openOrderReceiveModal}
          onClickClose={handleCloseOrderReceiveModal}
        />
      )}
    </>
  );
}

export default CheckOrderSearch;
