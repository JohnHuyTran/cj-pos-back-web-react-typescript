import { Box, Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { useStyles } from "../../styles/makeTheme";
import {
  getBranchName,
  objectNullOrEmpty,
  onChange,
  onChangeDate,
  stringNullOrEmpty,
} from "../../utils/utils";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import DatePickerComponent from "../../components/commons/ui/date-picker";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { SearchOff } from "@mui/icons-material";
import AlertError from "../../components/commons/ui/alert-error";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { barcodeDiscountSearch } from "../../store/slices/barcode-discount-search-slice";
import { saveSearchCriteriaTO } from "../../store/slices/transfer-out-criteria-search-slice";
import LoadingModal from "../../components/commons/ui/loading-modal";
import {
  Action,
  DateFormat,
  TO_TYPE,
  TOStatus,
} from "../../utils/enum/common-enum";
import SnackbarStatus from "../../components/commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";
import { getUserInfo } from "../../store/sessionStore";
import { BranchListOptionType } from "../../models/branch-model";
import { isGroupBranch } from "../../utils/role-permission";
import TransferOutList from "./transfer-out-list";
import SelectBranch from "./transfer-out-branch";
import { TransferOutSearchRequest } from "../../models/transfer-out-model";
import { transferOutGetSearch } from "../../store/slices/transfer-out-search-slice";
import ModalCreateTransferOut from "../../components/transfer-out/modal-create-transfer-out";

const _ = require("lodash");

interface State {
  documentNumber: string;
  branch: string;
  status: string;
  fromDate: any | Date | number | string;
  approveDate: any | Date | number | string;
}

interface loadingModalState {
  open: boolean;
}

const TransferOutSearch = () => {
  const classes = useStyles();
  const { t } = useTranslation(["barcodeDiscount", "common"]);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [lstStatus, setLstStatus] = React.useState([]);
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
  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);

  const dispatch = useAppDispatch();
  const page = "1";
  const limit = useAppSelector(
    (state) => state.transferOutSearchSlice.toSearchResponse.perPage,
  );
  const barcodeDiscountSearchSlice = useAppSelector(
    (state) => state.transferOutSearchSlice,
  );
  const [userPermission, setUserPermission] = useState<any[]>([]);
  const [approvePermission, setApprovePermission] = useState<boolean>(false);
  const [requestPermission, setRequestPermission] = useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const [openModal, setOpenModal] = React.useState(false);
  const [listBranchSelect, setListBranchSelect] = React.useState<
    BranchListOptionType[]
  >([]);
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const [values, setValues] = React.useState<State>({
    documentNumber: "",
    branch: "ALL",
    status: "ALL",
    fromDate: new Date(),
    approveDate: new Date(),
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
  useEffect(() => {
    setLstStatus(t("lstStatus", { returnObjects: true }));
    //permission
    const userInfo: KeyCloakTokenInfo = getUserInfo();
    if (!objectNullOrEmpty(userInfo) && !objectNullOrEmpty(userInfo.acl)) {
      let userPermission =
        userInfo.acl["service.posback-campaign"] != null &&
        userInfo.acl["service.posback-campaign"].length > 0
          ? userInfo.acl["service.posback-campaign"]
          : [];
      setUserPermission(userPermission);
      setApprovePermission(
        userPermission != null && userPermission.length > 0
          ? userPermission.includes("campaign.to.approve")
          : false,
      );
      setRequestPermission(
        userPermission != null && userPermission.length > 0
          ? userPermission.includes("campaign.to.create")
          : false,
      );
      // setValues({
      //   ...values,
      //   status: userPermission.includes('campaign.to.approve')
      //     ? TOStatus.WAIT_FOR_APPROVAL
      //     : userPermission.includes('campaign.to.create')
      //     ? TOStatus.DRAFT
      //     : 'ALL',
      // });
    }
  }, []);
  useEffect(() => {
    if (listBranchSelect.length > 0) {
      let branches = listBranchSelect.map((item: any) => item.code).join(",");
      setValues({ ...values, branch: branches });
    } else {
      setValues({ ...values, branch: "" });
    }
  }, [listBranchSelect]);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleOpenModal = () => {
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
      branch: "",
      status: "ALL",
      fromDate: new Date(),
      approveDate: new Date(),
    });

    const payload: TransferOutSearchRequest = {
      perPage: (limit ? limit : 10).toString(),
      page: page,
      query: values.documentNumber,
      branch: values.branch,
      status: values.status,
      startDate: moment(values.fromDate).startOf("day").toISOString(),
      endDate: moment(values.approveDate).endOf("day").toISOString(),
      clearSearch: true,
      type: TO_TYPE.TO_ACTIVITY + "",
    };
    dispatch(barcodeDiscountSearch(payload));
    if (!requestPermission) {
      setListBranchSelect([]);
    }
  };

  const validateSearch = () => {
    let isValid = true;
    if (values.status == "ALL") {
      if (
        stringNullOrEmpty(values.fromDate) ||
        stringNullOrEmpty(values.approveDate)
      ) {
        isValid = false;
        setOpenAlert(true);
        setTextError("กรุณากรอกวันที่");
      }
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
    const payload: TransferOutSearchRequest = {
      perPage: limits,
      page: page,
      query: values.documentNumber.trim(),
      branch: values.branch,
      status: values.status,
      startDate: moment(values.fromDate).startOf("day").toISOString(),
      endDate: moment(values.approveDate).endOf("day").toISOString(),
      type: TO_TYPE.TO_ACTIVITY + "",
    };

    handleOpenLoading("open", true);
    await dispatch(transferOutGetSearch(payload));
    await dispatch(saveSearchCriteriaTO(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };

  let dataTable;
  const res = barcodeDiscountSearchSlice.toSearchResponse;
  const [flagSearch, setFlagSearch] = React.useState(false);
  if (flagSearch) {
    if (res && res.data && res.data.length > 0) {
      dataTable = <TransferOutList onSearch={onSearch} />;
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
              {"เลขที่เอกสารเบิก"}
            </Typography>
            <TextField
              id="documentNumber"
              name="documentNumber"
              size="small"
              value={values.documentNumber}
              onChange={onChange.bind(this, setValues, values)}
              className={classes.MtextField}
              fullWidth
              placeholder={"เลขที่เอกสารเบิก"}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("branch")}
            </Typography>
            <SelectBranch
              disabled={requestPermission}
              listSelect={listBranchSelect}
              setListSelect={setListBranchSelect}
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
                <MenuItem value={"ALL"}>{t("all")}</MenuItem>
                <MenuItem value={TOStatus.DRAFT}>บันทึก</MenuItem>
                <MenuItem value={TOStatus.WAIT_FOR_APPROVAL}>
                  รออนุมัติ
                </MenuItem>
                <MenuItem value={TOStatus.APPROVED}>อนุมัติ</MenuItem>
                <MenuItem value={TOStatus.REJECTED}>ไม่อนุมัติ</MenuItem>
                <MenuItem value={TOStatus.CLOSED}>ปิดงาน</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Typography mt={2}>วันที่ทำรายการ</Typography>
        <Grid container rowSpacing={3} columnSpacing={6}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {"ตั้งแต่"}
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
              {"ถึง"}
            </Typography>
            <DatePickerComponent
              onClickDate={onChangeDate.bind(
                this,
                setValues,
                values,
                "approveDate",
              )}
              type={"TO"}
              minDateTo={values.fromDate}
              value={values.approveDate}
            />
          </Grid>
          <Grid item xs={4}>
            {/* <SearchBranch /> */}
          </Grid>
        </Grid>
        <Grid container rowSpacing={3} columnSpacing={6} mt={1}>
          <Grid item xs={12} style={{ textAlign: "right" }}>
            {requestPermission && (
              <Button
                id="btnCreate"
                variant="contained"
                sx={{ width: "120px", height: "40px" }}
                className={classes.MbtnSearch}
                color="secondary"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={handleOpenModal}
              >
                {"เบิก"}
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
      {openModal && (
        <ModalCreateTransferOut
          isOpen={openModal}
          onClickClose={handleCloseModal}
          setOpenPopup={setOpenPopup}
          setPopupMsg={setPopupMsg}
          action={Action.INSERT}
          onSearchMain={onSearch}
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

export default TransferOutSearch;
