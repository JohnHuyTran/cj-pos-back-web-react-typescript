import React from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import AlertError from "../../commons/ui/alert-error";
import { updateAddTypeAndProductState } from "../../../store/slices/add-type-product-slice";
import {
  isAllowActionPermission,
  isGroupBranch,
} from "../../../utils/role-permission";
import { getUserInfo } from "../../../store/sessionStore";
import { getBranchName, stringNullOrEmpty } from "../../../utils/utils";
import { ACTIONS } from "../../../utils/enum/permission-enum";
import { env } from "../../../adapters/environmentConfigs";
import BranchListDropDown from "../../commons/ui/branch-list-dropdown";
import { BranchListOptionType } from "../../../models/branch-model";
import DatePickerComponent from "../../commons/ui/date-picker";
import _ from "lodash";
import { OutstandingRequest } from "../../../models/stock-model";
import {
  featchStockMovementeSearchAsync,
  savePayloadSearch,
} from "../../../store/slices/stock/stock-movement-search-slice";
import moment from "moment";
import { SearchOff } from "@mui/icons-material";
import StockMovementSearchList from "./stock-movement-search-list";
import LoadingModal from "../../commons/ui/loading-modal";
import TextBoxSearchProduct from "../../commons/ui/texbox-search-product";
import { clearSearchAllProductAsync } from "../../../store/slices/search-type-product-slice";
interface State {
  storeId: number;
  locationId: string;
  skuCodes: string;
  branchCode: string;
  dateFrom: string;
  dateTo: string;
}
function StockMovementSearch() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );
  const items = useAppSelector(
    (state) => state.stockMovementSearchSlice.stockList,
  );
  const payloadSlice = useAppSelector(
    (state) => state.stockMovementSearchSlice.savePayloadSearch,
  );
  const [disableSearchBtn, setDisableSearchBtn] = React.useState(true);

  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [values, setValues] = React.useState<State>({
    storeId: 0,
    locationId: "ALL",
    skuCodes: "",
    branchCode: "",
    dateFrom: "",
    dateTo: "",
  });
  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
    if (name === "storeId" && value != values.storeId) {
      setValues({ ...values, [event.target.name]: value });
      dispatch(updateAddTypeAndProductState([]));
    } else {
      setValues({ ...values, [event.target.name]: value });
    }
  };

  const handleChangeProduct = (value: any) => {
    if (value) {
      setValues({ ...values, skuCodes: value.skuCode });
    } else {
      setValues({ ...values, skuCodes: "" });
    }
  };
  const page = 1;
  const limit = useAppSelector(
    (state) => state.stockMovementSearchSlice.stockList.perPage,
  );
  const [flagSearch, setFlagSearch] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] = React.useState<{
    open: boolean;
  }>({
    open: false,
  });
  const [limitStartDate, setLimitStartDate] = React.useState<Date | null>(
    new Date(),
  );
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const [clearSKUDropDown, setClearSKUDropDown] =
    React.useState<boolean>(false);
  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const [branchFromCode, setBranchFromCode] = React.useState("");
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : env.branch.code
      : env.branch.code,
  );
  React.useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 7);
    setStartDate(defaultDate);

    const limitMonths = new Date();
    limitMonths.setMonth(limitMonths.getMonth() - 5);
    limitMonths.setDate(1);
    setLimitStartDate(limitMonths);

    setDisableSearchBtn(isAllowActionPermission(ACTIONS.STOCK_MOVEMENT_VIEW));
    if (groupBranch) {
      setBranchFromCode(ownBranch);
      setValues({ ...values, branchCode: ownBranch });
    }

    dispatch(updateAddTypeAndProductState([]));
  }, []);

  const branchFrom = getBranchName(branchList, ownBranch);
  const branchFromMap: BranchListOptionType = {
    code: ownBranch,
    name: branchFrom ? branchFrom : "",
  };
  const [valuebranchFrom, setValuebranchFrom] =
    React.useState<BranchListOptionType | null>(
      groupBranch ? branchFromMap : null,
    );

  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const [skuTypes, setSkuTypes] = React.useState<number[]>([1, 2]);
  const handleCloseModalAddItems = () => {
    setOpenModelAddItems(false);
  };

  const handleChangeBranchFrom = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setBranchFromCode(branchCode);
      setValues({ ...values, branchCode: JSON.parse(codes) });
    } else {
      setValues({ ...values, branchCode: "" });
    }
  };

  const handleStartDatePicker = (value: any) => {
    setStartDate(value);
  };
  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };
  //check dateFrom-dateTo
  if (endDate != null && startDate != null) {
    if (endDate < startDate) {
      setEndDate(null);
    }
  }
  const onClickClearBtn = async () => {
    handleOpenLoading("open", true);
    setStartDate(null);
    setEndDate(null);
    setValues({
      storeId: 0,
      locationId: "ALL",
      skuCodes: "",
      branchCode: "",
      dateFrom: "",
      dateTo: "",
    });
    setClearSKUDropDown(!clearSKUDropDown);

    if (!groupBranch) {
      setClearBranchDropDown(!clearBranchDropDown);
      setBranchFromCode("");
    }
    await dispatch(updateAddTypeAndProductState([]));
    dispatch(clearSearchAllProductAsync({}));
    setTimeout(() => {
      setFlagSearch(false);
      handleOpenLoading("open", false);
    }, 300);
  };

  const onClickSearchBtn = async () => {
    handleOpenLoading("open", true);
    if (isValidateInput()) {
      let limits: number;
      if (limit === 0 || limit === undefined) {
        limits = 10;
      } else {
        limits = limit;
      }

      const payload: OutstandingRequest = {
        limit: limits,
        page: page,
        skuCodes: [values.skuCodes],
        locationCode: values.locationId === "ALL" ? "" : values.locationId,
        branchCode: branchFromCode,
        dateFrom: moment(startDate).startOf("day").toISOString(),
        dateTo: moment(endDate).endOf("day").toISOString(),
      };

      await dispatch(featchStockMovementeSearchAsync(payload));
      await dispatch(savePayloadSearch(payload));
      setFlagSearch(true);
    }
    handleOpenLoading("open", false);
  };

  const isValidateInput = () => {
    if (!values.skuCodes) {
      setOpenAlert(true);
      setTextError("กรุณาระบุสินค้าที่ต้องการค้นหา");
      return false;
    }
    if (stringNullOrEmpty(branchFromCode)) {
      setOpenAlert(true);
      setTextError("กรุณาระบุสาขา");
      return false;
    }

    if (startDate === null || endDate === null) {
      setOpenAlert(true);
      setTextError("กรุณาระบุวันที่เคลื่อนไหวสินค้า");
      return false;
    }

    return true;
  };

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              ค้นหาสินค้า*
            </Typography>
            <TextBoxSearchProduct
              onSelectItem={handleChangeProduct}
              isClear={clearSKUDropDown}
              requestBody={{
                isControlStock: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              คลัง
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="tbxlocationId"
                name="locationId"
                value={values.locationId}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"} selected={true}>
                  ทั้งหมด
                </MenuItem>
                <MenuItem key={"1"} value={"001"}>
                  หน้าร้าน
                </MenuItem>
                <MenuItem key={"2"} value={"002"}>
                  หลังร้าน
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} sx={{ pt: 30 }}>
            <Typography gutterBottom variant="subtitle1" component="div">
              สาขา
            </Typography>
            <BranchListDropDown
              valueBranch={valuebranchFrom}
              sourceBranchCode={branchFromCode}
              onChangeBranch={handleChangeBranchFrom}
              isClear={clearBranchDropDown}
              disable={groupBranch}
              isFilterAuthorizedBranch={groupBranch ? false : true}
              placeHolder="กรุณาระบุสาขา"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              วันที่เคลื่อนไหวสินค้า ตั้งแต่*
            </Typography>
            <DatePickerComponent
              onClickDate={handleStartDatePicker}
              value={startDate}
              minDateTo={limitStartDate}
              type={"TO"}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div">
              ถึง*
            </Typography>
            <DatePickerComponent
              onClickDate={handleEndDatePicker}
              value={endDate}
              type={"TO"}
              minDateTo={startDate}
            />
          </Grid>
          <Grid item xs={4}></Grid>
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
              data-testid="testid-btnClear"
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
              data-testid="testid-btnSearch"
              id="btnSearch"
              variant="contained"
              color="primary"
              onClick={onClickSearchBtn}
              sx={{
                width: "13%",
                ml: 2,
                display: `${disableSearchBtn ? "none" : ""}`,
              }}
              className={classes.MbtnSearch}
            >
              ค้นหา
            </Button>
          </Grid>
        </Grid>
      </Box>

      {flagSearch && items.data.length > 0 && <StockMovementSearchList />}

      {flagSearch && items.data.length === 0 && (
        <Grid container xs={12} justifyContent="center">
          <Box color="#CBD4DB" justifyContent="center">
            <h2>
              ไม่มีข้อมูล <SearchOff fontSize="large" />
            </h2>
          </Box>
        </Grid>
      )}
      <LoadingModal open={openLoadingModal.open} />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />
    </React.Fragment>
  );
}

export default StockMovementSearch;
