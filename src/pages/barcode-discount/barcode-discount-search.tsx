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
import { PrintSharp, SearchOff } from "@mui/icons-material";
import BarcodeDiscountList from "./barcode-discount-list";
import { BarcodeDiscountSearchRequest } from "../../models/barcode-discount-model";
import AlertError from "../../components/commons/ui/alert-error";
import ModalCreateBarcodeDiscount from "../../components/barcode-discount/modal-create-barcode-discount";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { barcodeDiscountSearch } from "../../store/slices/barcode-discount-search-slice";
import { saveSearchCriteriaBD } from "../../store/slices/barcode-discount-criteria-search-slice";
import LoadingModal from "../../components/commons/ui/loading-modal";
import { Action } from "../../utils/enum/common-enum";
import SnackbarStatus from "../../components/commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";
import { getUserInfo } from "../../store/sessionStore";
import { ACTIONS } from "../../utils/enum/permission-enum";
import ModalConfirmPrintedBarcode from "../../components/barcode-discount/modal-confirm-printed-barcode";
import BranchListDropDown from "../../components/commons/ui/branch-list-dropdown";
import { BranchListOptionType } from "../../models/branch-model";
import { isGroupBranch } from "../../utils/role-permission";

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

const BarcodeDiscountSearch = () => {
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
    branch: "ALL",
    status: "ALL",
    fromDate: new Date(),
    toDate: new Date(),
  });
  const [valuePrints, setValuePrints] = React.useState<any>({
    action: Action.INSERT,
    dialogTitle: "พิมพ์บาร์โค้ด",
    printNormal: true,
    printInDetail: false,
    ids: "",
    lstProductNotPrinted: [],
    lstProductPrintAgain: [],
    lstProductPrint: [],
  });

  const dispatch = useAppDispatch();
  const page = "1";
  const limit = useAppSelector(
    (state) => state.barcodeDiscountSearchSlice.bdSearchResponse.perPage,
  );
  const barcodeDiscountSearchSlice = useAppSelector(
    (state) => state.barcodeDiscountSearchSlice,
  );
  const barcodeDiscountPrint = useAppSelector(
    (state) => state.barcodeDiscountPrintSlice.state,
  );
  const printInDetail = useAppSelector(
    (state) => state.barcodeDiscountPrintSlice.inDetail,
  );
  const [userPermission, setUserPermission] = useState<any[]>([]);
  const [approvePermission, setApprovePermission] = useState<boolean>(false);
  const [printPermission, setPrintPermission] = useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const [openModalPrint, setOpenModalPrint] = React.useState(false);

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
          ? userPermission.includes(ACTIONS.CAMPAIGN_BD_APPROVE)
          : false,
      );
      setPrintPermission(
        userPermission != null && userPermission.length > 0
          ? userPermission.includes(ACTIONS.CAMPAIGN_BD_PRINT)
          : false,
      );
    }
  }, []);

  const getStatusText = (key: string) => {
    if (lstStatus === null || lstStatus.length === 0) {
      return "";
    }
    let item: any = lstStatus.find((item: any) => item.value === key);
    return item.label;
  };

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

  const handleOpenModalPrint = () => {
    setOpenModalPrint(true);
  };

  const handleCloseModalPrint = () => {
    setOpenModalPrint(false);
  };

  const handleChangeBranch = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branch: JSON.parse(codes) });
    } else {
      setValues({ ...values, branch: "" });
    }
  };

  const onClear = async () => {
    setClearBranchDropDown(!clearBranchDropDown);
    setFlagSearch(false);
    setValues({
      documentNumber: "",
      branch: "ALL",
      status: "ALL",
      fromDate: new Date(),
      toDate: new Date(),
    });

    const payload: BarcodeDiscountSearchRequest = {
      perPage: (limit ? limit : 10).toString(),
      page: page,
      query: values.documentNumber,
      branch: values.branch,
      status: values.status,
      startDate: moment(values.fromDate).startOf("day").toISOString(),
      endDate: moment(values.toDate).endOf("day").toISOString(),
      clearSearch: true,
    };
    dispatch(barcodeDiscountSearch(payload));
  };

  const validateSearch = () => {
    let isValid = true;
    if (
      stringNullOrEmpty(values.fromDate) ||
      stringNullOrEmpty(values.toDate)
    ) {
      isValid = false;
      setOpenAlert(true);
      setTextError(t("msg.inputDateSearch"));
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
    const payload: BarcodeDiscountSearchRequest = {
      perPage: limits,
      page: page,
      query: values.documentNumber.trim(),
      branch: values.branch,
      status: values.status,
      startDate: moment(values.fromDate).startOf("day").toISOString(),
      endDate: moment(values.toDate).endOf("day").toISOString(),
    };

    handleOpenLoading("open", true);
    await dispatch(barcodeDiscountSearch(payload));
    await dispatch(saveSearchCriteriaBD(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };

  const onPrintedBarcode = async () => {
    let lstProductNotPrinted = [];
    let ids = [];
    if (
      barcodeDiscountPrint &&
      barcodeDiscountPrint.length > 0 &&
      !printInDetail
    ) {
      let barcodeDiscountPrintData = _.cloneDeep(barcodeDiscountPrint);
      for (const item of barcodeDiscountPrintData) {
        ids.push(item.id);
        let products = item.products;
        if (products && products.length > 0) {
          for (const itPro of products) {
            if (
              !stringNullOrEmpty(itPro.expiredDate) &&
              moment(itPro.expiredDate).isBefore(moment(new Date()), "day")
            ) {
              itPro.documentNumber = item.documentNumber;
              lstProductNotPrinted.push(itPro);
            }
          }
        }
      }
    }

    await setValuePrints({
      ...valuePrints,
      ids: ids,
      printNormal: !(lstProductNotPrinted && lstProductNotPrinted.length > 0),
      printInDetail: printInDetail,
      lstProductNotPrinted: lstProductNotPrinted,
      lstProductPrint: (barcodeDiscountPrint || [])
        .reduce(
          (s: any, c: any) => [
            ...s,
            ...c.products.map((p: any) => ({
              ...p,
              percentDiscount: c.percentDiscount,
            })),
          ],
          [],
        )
        .filter((product: any) =>
          moment(product?.expiredDate).isSameOrAfter(moment(new Date()), "day"),
        )
        .map((product: any) => ({
          ...product,
          numberOfPrinting: product.numberOfApproved,
          unit: product.unitFactor,
          priceAfterDiscount: product.percentDiscount
            ? Number(
                product.price -
                  Math.floor(
                    Number(product.requestedDiscount || 0) *
                      (product.price / 100),
                  ),
              ).toFixed(2)
            : Number(
                product.price -
                  Number(
                    String(product.requestedDiscount).replace(/,/g, "") || 0,
                  ),
              ).toFixed(2),
        })),
    });
    handleOpenModalPrint();
  };

  const onConfirmModalPrint = async () => {
    onSearch();
  };

  let dataTable;
  const res = barcodeDiscountSearchSlice.bdSearchResponse;
  const [flagSearch, setFlagSearch] = React.useState(false);
  if (flagSearch) {
    if (res && res.data && res.data.length > 0) {
      dataTable = <BarcodeDiscountList onSearch={onSearch} />;
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
              {t("documentSearch")}
            </Typography>
            <TextField
              id="documentNumber"
              name="documentNumber"
              size="small"
              value={values.documentNumber}
              onChange={onChange.bind(this, setValues, values)}
              className={classes.MtextField}
              fullWidth
              placeholder={t("bdDocumentNumber")}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("branch")}
            </Typography>
            <BranchListDropDown
              valueBranch={branchOptions}
              sourceBranchCode={ownBranch}
              onChangeBranch={handleChangeBranch}
              isClear={clearBranchDropDown}
              disable={groupBranch}
              isFilterAuthorizedBranch={true}
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
                <MenuItem value={"1"}>{getStatusText("1")}</MenuItem>
                <MenuItem value={"2"}>{getStatusText("2")}</MenuItem>
                <MenuItem value={"3"}>{getStatusText("3")}</MenuItem>
                <MenuItem value={"4"}>{getStatusText("4")}</MenuItem>
                <MenuItem value={"5"}>{getStatusText("5")}</MenuItem>
                <MenuItem value={"10"}>{getStatusText("10")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container rowSpacing={3} columnSpacing={6} mt={1}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("fromDate")}
              <span style={{ color: "red" }}> *</span>
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
              {t("toDate")} <span style={{ color: "red" }}> *</span>
            </Typography>
            <DatePickerComponent
              onClickDate={onChangeDate.bind(this, setValues, values, "toDate")}
              type={"TO"}
              minDateTo={values.fromDate}
              value={values.toDate}
            />
          </Grid>
          <Grid item xs={4}>
            {/* <SearchBranch /> */}
          </Grid>
        </Grid>
        <Grid container rowSpacing={3} columnSpacing={6} mt={1}>
          <Grid item xs={3} style={{ textAlign: "left" }}>
            <Button
              id="btnPrint"
              variant="contained"
              sx={{ width: "200px" }}
              className={classes.MbtnPrint}
              disabled={
                !(
                  barcodeDiscountPrint &&
                  barcodeDiscountPrint.length > 0 &&
                  !printInDetail
                )
              }
              style={{ display: printPermission ? undefined : "none" }}
              color="secondary"
              onClick={onPrintedBarcode}
              startIcon={<PrintSharp />}
            >
              {t("button.printBarcode")}
            </Button>
          </Grid>
          <Grid item xs={9} style={{ textAlign: "right" }}>
            <Button
              id="btnCreate"
              variant="contained"
              sx={{ width: "220px" }}
              className={classes.MbtnSearch}
              style={{ display: approvePermission ? "none" : undefined }}
              color="secondary"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={handleOpenModal}
            >
              {t("button.createNewDocument")}
            </Button>
            <Button
              id="btnClear"
              variant="contained"
              sx={{ width: "150px", ml: 2 }}
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
              sx={{ width: "150px", ml: 2 }}
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
        <ModalCreateBarcodeDiscount
          isOpen={openModal}
          onClickClose={handleCloseModal}
          setOpenPopup={setOpenPopup}
          setPopupMsg={setPopupMsg}
          action={Action.INSERT}
          onSearchBD={onSearch}
        />
      )}
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
      <ModalConfirmPrintedBarcode
        onClose={handleCloseModalPrint}
        onConfirm={onConfirmModalPrint}
        open={openModalPrint}
        values={valuePrints}
      />
    </>
  );
};

export default BarcodeDiscountSearch;
