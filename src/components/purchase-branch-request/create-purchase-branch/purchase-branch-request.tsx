import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Box, Button, FormControl, MenuItem, Select } from "@mui/material";
import { Grid } from "@mui/material";
import { Typography } from "@mui/material";
import { TextField } from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useStyles } from "../../../styles/makeTheme";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import BranchListDropDown from "../../commons/ui/branch-list-dropdown";
import DatePickerComponent from "../../commons/ui/date-picker";
import { getPurchaseBranchList } from "../../../utils/enum/purchase-branch-enum";
import { getUserInfo } from "../../../store/sessionStore";
import { PERMISSION_GROUP } from "../../../utils/enum/permission-enum";
import {
  isAllowActionPermission,
  isGroupBranch,
} from "../../../utils/role-permission";
import { getBranchName } from "../../../utils/utils";
import { env } from "../../../adapters/environmentConfigs";
import { BranchListOptionType } from "../../../models/branch-model";
import LoadingModal from "../../commons/ui/loading-modal";
import { featchSearchPurchaseBranchRequestAsync } from "../../../store/slices/purchase-branch-request-slice";
import { saveSearchPurchaseBranch } from "../../../store/slices/save-search-purchase-branch-request-slice";
import { PurchaseBranchSearchRequest } from "../../../models/purchase-branch-request-model";
import AlertError from "../../commons/ui/alert-error";
import PurchaseBranchRequestList from "../create-purchase-branch/purchase-branch-request-list";
import ModalPurchaseBranchDetail from "./purchase-branch-detail";
import { ACTIONS } from "../../../utils/enum/permission-enum";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import { clearDataPurchaseBRDetail } from "../../../store/slices/purchase/purchase-branch-request-detail-slice";

interface State {
  docNo: string;
  branchCode: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}
interface loadingModalState {
  open: boolean;
}

function PurchaseBranchRequest() {
  const { t } = useTranslation(["purchaseBranch", "common"]);
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const page = "1";
  const limit = useAppSelector(
    (state) => state.purchaseBranchRequestSlice.orderList.perPage,
  );
  const items = useAppSelector((state) => state.purchaseBranchRequestSlice);
  const dataList = items.orderList.data;

  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");

  const [displayCreate, setDisplayCreate] = React.useState(
    isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE),
  );
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [branchToCode, setBranchToCode] = React.useState("");
  const [isAuthorizedBranch, setIsAuthorizedBranch] =
    React.useState<boolean>(true);
  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : env.branch.code
      : env.branch.code,
  );

  const [values, setValues] = React.useState<State>({
    docNo: "",
    branchCode: "",
    dateFrom: "",
    dateTo: "",
    status: "ALL",
  });

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  useEffect(() => {
    const pi = getUserInfo().group === PERMISSION_GROUP.PI;
    const pcm = getUserInfo().group === PERMISSION_GROUP.PCM;
    if (pi) setIsAuthorizedBranch(!pi);
    if (pcm) setIsAuthorizedBranch(!pcm);
    if (groupBranch) setValues({ ...values, branchCode: ownBranch });
  }, [branchList]);

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value.trim() });
    // console.log(values);
  };

  const branchFrom = getBranchName(branchList, ownBranch);
  const branchFromMap: BranchListOptionType = {
    code: ownBranch,
    name: branchFrom ? branchFrom : "",
  };
  const [valuebranchFrom, setValuebranchFrom] =
    React.useState<BranchListOptionType | null>(
      groupBranch ? branchFromMap : null,
    );

  const handleChangeBranch = (branch: string) => {
    if (branch !== null) {
      let codes = JSON.stringify(branch);
      setBranchToCode(branch);
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

  const onClickValidateForm = () => {
    if (startDate === null || endDate === null) {
      setOpenAlert(true);
      setTextError("กรุณากรอกวันที่สร้างรายการ");
    } else {
      onClickSearchBtn();
    }
  };

  const [flagSearch, setFlagSearch] = React.useState(false);

  const onClickSearchBtn = async () => {
    let limits;
    if (limit === 0) {
      limits = "10";
    } else {
      limits = limit.toString();
    }

    const payload: PurchaseBranchSearchRequest = {
      limit: limits,
      page: page,
      docNo: values.docNo,
      branchCode: values.branchCode,
      status: values.status,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      clearSearch: false,
    };

    handleOpenLoading("open", true);
    await dispatch(featchSearchPurchaseBranchRequestAsync(payload));
    await dispatch(saveSearchPurchaseBranch(payload));
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
      branchCode: groupBranch ? values.branchCode : "",
      dateFrom: "",
      dateTo: "",
      status: "ALL",
    });

    const payload: PurchaseBranchSearchRequest = {
      limit: limit ? limit.toString() : "10",
      page: page,
      docNo: values.docNo,
      branchCode: values.branchCode,
      status: values.status,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      clearSearch: true,
    };

    dispatch(featchSearchPurchaseBranchRequestAsync(payload));

    setTimeout(() => {
      handleOpenLoading("open", false);
    }, 300);
  };

  //alert Errormodel
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const handleOpenCreateModal = async () => {
    handleOpenLoading("open", true);
    await dispatch(updateAddItemsState({}));
    await dispatch(clearDataPurchaseBRDetail());
    handleOpenModal();
    handleOpenLoading("open", false);
  };
  const handleOpenModal = () => {
    setOpenDetailModal(true);
  };
  const handleCloseModal = () => {
    setOpenDetailModal(false);
  };

  return (
    <>
      <Box mb={6}>
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
              placeholder="เลขที่เอกสาร BR"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาขาที่สร้างรายการ
            </Typography>
            <BranchListDropDown
              valueBranch={valuebranchFrom}
              sourceBranchCode={branchToCode}
              onChangeBranch={handleChangeBranch}
              isClear={clearBranchDropDown}
              isFilterAuthorizedBranch={isAuthorizedBranch}
              disable={groupBranch}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สถานะ
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selStatus"
                name="status"
                value={values.status}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"}>ทั้งหมด</MenuItem>
                {getPurchaseBranchList().map((item: any) => {
                  return (
                    <MenuItem key={item.key} value={item.key}>
                      {t(`status.${item.value}`)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} sx={{ pt: 30 }}>
            <Typography gutterBottom variant="subtitle1" component="div">
              วันที่สร้างรายการ
            </Typography>
            <Typography gutterBottom variant="subtitle1" component="div">
              ตั้งแต่ <span style={{ color: "#F54949" }}>*</span>
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
              ถึง <span style={{ color: "#F54949" }}>*</span>
            </Typography>
            <DatePickerComponent
              onClickDate={handleEndDatePicker}
              value={endDate}
              type={"TO"}
              minDateTo={startDate}
            />
          </Grid>
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
            id="btnCreateDoc"
            variant="contained"
            onClick={handleOpenCreateModal}
            sx={{ minWidth: "15%", display: `${displayCreate ? "none" : ""}` }}
            className={classes.MbtnClear}
            startIcon={<AddCircleOutlineOutlinedIcon />}
            color="secondary"
          >
            สร้างเอกสารใหม่
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
      </Box>

      {flagSearch && (
        <div>
          {dataList.length > 0 && <PurchaseBranchRequestList />}
          {dataList.length === 0 && (
            <Grid item container xs={12} justifyContent="center">
              <Box color="#CBD4DB">
                <h2>ไม่มีข้อมูล</h2>
              </Box>
            </Grid>
          )}
        </div>
      )}

      <LoadingModal open={openLoadingModal.open} />

      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />

      {openDetailModal && (
        <ModalPurchaseBranchDetail
          isOpen={openDetailModal}
          onClickClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default PurchaseBranchRequest;
