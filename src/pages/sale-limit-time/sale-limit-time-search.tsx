import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useStyles } from "../../styles/makeTheme";
import React, { useEffect } from "react";
import STCreateModal from "../../components/sale-limit-time/sale-limit-time-create-modal";
import SearchIcon from "@mui/icons-material/Search";
import { onChange, onChangeDate, stringNullOrEmpty } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import DatePickerComponent from "../../components/commons/ui/date-picker-all";
import SaleLimitTimelist from "./sale-limit-time-list";
import SearchBranch from "../../components/commons/ui/search-branch";
import { useAppDispatch, useAppSelector } from "../../store/store";
import SnackbarStatus from "../../components/commons/ui/snackbar-status";
import {
  fetchSaleLimitTimeListAsync,
  clearResponse,
} from "../../store/slices/sale-limit-time-search-slice";
import { getUserInfo } from "../../store/sessionStore";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";
import { paramsConvert } from "../../utils/utils";
import moment from "moment";
import AlertError from "../../components/commons/ui/alert-error";
import {
  fetchBranchProvinceListAsync,
  updatePayloadBranches,
  fetchTotalBranch,
} from "../../store/slices/search-branches-province-slice";
import LoadingModal from "../../components/commons/ui/loading-modal";
import { env } from "../../adapters/environmentConfigs";
import { updateAddTypeAndProductState } from "../../store/slices/add-type-product-slice";
interface State {
  query: string;
  branch: string;
  status: string;
  startDate: any | Date | number | string;
  endDate: any | Date | number | string;
}
interface loadingModalState {
  open: boolean;
}

const SaleLimitTimeSearch = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [openCreateModal, setOpenCreateModal] = React.useState(false);
  const { t } = useTranslation(["saleLimitTime", "common"]);
  const [lstStatus, setLstStatus] = React.useState([]);
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const responveST = useAppSelector(
    (state) => state.searchSaleLimitTime.responseST,
  );
  const branchList = useAppSelector(
    (state) => state.searchBranchProvince.branchList,
  );
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({ open: false });
  const payloadBranches = useAppSelector(
    (state) => state.searchBranchProvince.payloadBranches,
  );
  let checkAdmin = env.branch.channel === "hq";
  const isChannelCreate = userInfo.acl["service.posback-campaign"]
    ? userInfo.acl["service.posback-campaign"].includes("campaign.st.create")
    : false;
  const [payloadBranchesST, setPayloadBranchesST] = React.useState<any>(null);
  const [values, setValues] = React.useState<State>({
    query: "",
    branch: checkAdmin ? "" : userInfo.branch,
    status: checkAdmin ? "all" : "2",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);
  const [flagSearch, setFlagSearch] = React.useState(false);

  useEffect(() => {
    setLstStatus(t("lstStatus", { returnObjects: true }));
    if (!checkAdmin && userInfo.branch) {
      const payload = {
        limit: "10",
        code: userInfo.branch,
      };
      const params = paramsConvert(payload);
      dispatch(fetchBranchProvinceListAsync(params));
      dispatch(fetchTotalBranch());
    }
    if (checkAdmin) {
      const payloadBranch = {
        isAllBranches: true,
        appliedBranches: {
          branchList: [],
          province: [],
        },
        saved: true,
      };
      dispatch(fetchTotalBranch());
      dispatch(updatePayloadBranches(payloadBranch));
    }
  }, []);
  useEffect(() => {
    const existBranchUser = branchList.data.every(
      (item: any) => item.code == userInfo.branch,
    );
    if (!checkAdmin && userInfo.branch && existBranchUser) {
      const payloadBranch = {
        isAllBranches: false,
        appliedBranches: {
          branchList: branchList.data || [],
          province: [],
        },
        saved: true,
      };

      dispatch(updatePayloadBranches(payloadBranch));
    }
  }, [branchList]);

  // useEffect(() => {
  //   if (responveST && responveST.data && responveST.data.length > 0) {
  //     handleSearchST(payloadST.page, payloadST.perPage);
  //   }
  // }, [payloadST]);
  const handleChangePagination = (page: any, perPage: any) => {
    handleSearchST(page, perPage);
  };

  const getStatusText = (key: string) => {
    if (lstStatus === null || lstStatus.length === 0) {
      return "";
    }
    let item: any = lstStatus.find((item: any) => item.value === key);
    return item.label;
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const handleOpenCreateModal = () => {
    setPayloadBranchesST(payloadBranches);
    dispatch(
      updatePayloadBranches({
        isAllBranches: true,
        appliedBranches: {
          province: [],
          branchList: [],
        },
        saved: false,
      }),
    );
    dispatch(updateAddTypeAndProductState([]));
    setOpenCreateModal(true);
  };
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    dispatch(updatePayloadBranches(payloadBranchesST));
  };
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const handleSearchST = async (
    paramsPage?: string,
    paramsPerPage?: string,
  ) => {
    handleOpenLoading("open", true);
    setFlagSearch(true);
    if (
      stringNullOrEmpty(values.startDate) ||
      stringNullOrEmpty(values.endDate)
    ) {
      setOpenAlert(true);
      setTextError("กรุณาระบุวันที่");
    } else if (
      Date.parse(moment(values.endDate).format("DD/MM/YYYY")) <
      Date.parse(moment(values.startDate).format("DD/MM/YYYY"))
    ) {
      setOpenAlert(true);
      setTextError("เวลาเริ่มต้นต้องมากกว่าเวลาปัจจุบัน");
    } else {
      if (checkAdmin) {
        const aProvinces = payloadBranches.appliedBranches.province
          .map((item: any) => item.code)
          .join();
        const aBranches = payloadBranches.appliedBranches.branchList
          .map((item: any) => item.code)
          .join();
        const params = {
          page: paramsPage || "1",
          perPage: paramsPerPage || "10",
          ...(!!values.query && { query: values.query }),
          ...(!!values.status &&
            values.status != "all" && { status: values.status }),
          ...(!!aBranches &&
            !payloadBranches.isAllBranches && { branches: aBranches }),
          ...(!!aProvinces &&
            !payloadBranches.isAllBranches && { provinces: aProvinces }),
          startDate: moment(values.startDate).startOf("day").toISOString(),
          endDate: moment(values.endDate).endOf("day").toISOString(),
        };
        const query = paramsConvert(params);
        await dispatch(fetchSaleLimitTimeListAsync(query));
      } else {
        const params = {
          page: paramsPage || "1",
          perPage: paramsPerPage || "10",
          ...(!!values.query && { query: values.query }),
          ...(!!values.status && { status: values.status }),
          branches: values.branch,
          startDate: moment(values.startDate).startOf("day").toISOString(),
          endDate: moment(values.endDate).endOf("day").toISOString(),
        };
        const query = paramsConvert(params);
        await dispatch(fetchSaleLimitTimeListAsync(query));
      }
    }
    handleOpenLoading("close", false);
  };
  const handleSetBranch = (close: any) => {
    if (close) {
      dispatch(updatePayloadBranches(payloadBranchesST));
    } else {
      setPayloadBranchesST(payloadBranches);
    }
  };
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleClearSearch = () => {
    setValues({
      query: "",
      branch: checkAdmin ? "" : userInfo.branch,
      status: checkAdmin ? "all" : "2",
      startDate: new Date(),
      endDate: new Date(),
    });
    checkAdmin &&
      dispatch(
        updatePayloadBranches({
          isAllBranches: true,
          appliedBranches: {
            province: [],
            branchList: [],
          },
          saved: false,
        }),
      );
    dispatch(clearResponse());
    setFlagSearch(false);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }} mb={3}>
        <Grid container rowSpacing={3} columnSpacing={6} mt={0.1}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ค้นหาเอกสาร
            </Typography>
            <TextField
              id="query"
              name="query"
              size="small"
              value={values.query}
              onChange={onChange.bind(this, setValues, values)}
              InputProps={{
                endAdornment: (
                  <SearchIcon color="primary" sx={{ marginRight: "12px" }} />
                ),
                inputProps: {
                  style: { textAlignLast: "start" },
                },
              }}
              className={classes.MtextField}
              fullWidth
              placeholder="เอกสาร ST / รายละเอียด"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สาขา
            </Typography>
            <SearchBranch disabled={!checkAdmin} />
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
                disabled={!checkAdmin}
              >
                <MenuItem value={"all"} selected={true}>
                  {t("all")}
                </MenuItem>
                <MenuItem value={"1"}>{getStatusText("1")}</MenuItem>
                <MenuItem value={"2"}>{getStatusText("2")}</MenuItem>
                <MenuItem value={"4"}>{getStatusText("4")}</MenuItem>
                <MenuItem value={"3"}>{getStatusText("3")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              วันที่เริ่มงดขายสินค้า ตั้งแต่{" "}
              <span style={{ color: "red" }}> *</span>
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
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ถึง<span style={{ color: "red" }}> *</span>
            </Typography>
            <DatePickerComponent
              onClickDate={onChangeDate.bind(
                this,
                setValues,
                values,
                "endDate",
              )}
              value={values.endDate}
              minDateTo={values.startDate}
              type={"TO"}
            />
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ textAlign: "right", marginBottom: "20px" }}>
        {isChannelCreate && (
          <Button
            id="btnCreate"
            variant="contained"
            sx={{ width: "172px", marginRight: "20px" }}
            className={classes.MbtnSearch}
            color="secondary"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={handleOpenCreateModal}
          >
            {"สร้างเอกสารใหม่"}
          </Button>
        )}
        <Button
          variant="contained"
          color="cancelColor"
          className={classes.MbtnSearch}
          sx={{ marginRight: "20px", width: "126px" }}
          onClick={handleClearSearch}
        >
          เคลียร์
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={classes.MbtnSearch}
          sx={{ width: "126px" }}
          onClick={() => {
            handleSearchST();
          }}
        >
          ค้นหา
        </Button>
      </Box>
      {flagSearch &&
        (responveST && responveST.data && responveST.data.length > 0 ? (
          <SaleLimitTimelist
            handleSetBranch={handleSetBranch}
            onSearch={handleSearchST}
            checkAdmin={checkAdmin}
            handleChangePagination={(page, perPage) => {
              handleChangePagination(page, perPage);
            }}
          />
        ) : (
          <Grid item container xs={12} justifyContent="center">
            <Box color="#CBD4DB">
              <h2>{t("noData")}</h2>
            </Box>
          </Grid>
        ))}

      {openCreateModal && (
        <STCreateModal
          type={"Create"}
          isAdmin={checkAdmin}
          setOpenPopup={setOpenPopup}
          setPopupMsg={setPopupMsg}
          isOpen={openCreateModal}
          onClickClose={handleCloseCreateModal}
          onSearch={handleSearchST}
        />
      )}
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

export default SaleLimitTimeSearch;
