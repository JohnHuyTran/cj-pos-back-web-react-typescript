import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { SearchOff } from "@mui/icons-material";

import store, { useAppDispatch, useAppSelector } from "../../../store/store";
import { getUserInfo } from "../../../store/sessionStore";
import { env } from "../../../adapters/environmentConfigs";
import moment from "moment";

//css
import { useStyles } from "../../../styles/makeTheme";

//utils
import {
  isAllowActionPermission,
  isGroupBranch,
  isGroupFinance,
} from "../../../utils/role-permission";
import { getBranchName } from "../../../utils/utils";
import { openEndStatus } from "../../../utils/enum/accounting-enum";

//component
import BranchListDropDown from "../../commons/ui/branch-list-dropdown";
import DatePickerAllComponent from "../../commons/ui/date-picker-all";
import OpenEndList from "./open-end-list";
import AlertError from "components/commons/ui/alert-error";

//model
import { BranchListOptionType } from "models/branch-model";
import { OpenEndSearchRequest } from "models/branch-accounting-model";
import LoadingModal from "components/commons/ui/loading-modal";

//api
import {
  featchSearchOpenEndAsync,
  savePayloadSearch,
  clearOpenEndSearchList,
} from "../../../store/slices/accounting/open-end/open-end-search-slice";

function OpenEndSearch() {
  const { t } = useTranslation(["openEnd", "common"]);
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const page = "1";
  const items = useAppSelector(
    (state) => state.searchOpenEndSlice.openEndSearchList,
  );
  const limit: number = useAppSelector(
    (state) => state.searchOpenEndSlice.openEndSearchList.perPage,
  );
  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [flagSearch, setFlagSearch] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [textError, setTextError] = useState("");
  const [values, setValues] = useState({
    branchCode: "",
    dateFrom: "",
    dateTo: "",
    status: "ALL",
  });

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
  };

  //alert Errormodel
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  //config branch
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const [groupFinance, setFroupFinanace] = React.useState(isGroupFinance);
  const [branchFromCode, setBranchFromCode] = React.useState("");
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
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

  const handleChangeBranchFrom = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setBranchFromCode(branchCode);
      setValues({ ...values, branchCode: JSON.parse(codes) });
    } else {
      setValues({ ...values, branchCode: "" });
    }
  };

  //date picker
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const handleStartDatePicker = (value: any) => {
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };

  const validateCriteria = () => {
    if (startDate === null || endDate === null) {
      setOpenAlert(true);
      setTextError("กรุณากรอกวันที่รับสินค้า");
      return false;
    } else {
      return true;
    }
  };

  const onClickSearchBtn = async () => {
    setOpenLoadingModal(true);

    let validate: boolean = validateCriteria();

    if (validate) {
      let limits;
      if (limit === 0 || limit === undefined) {
        limits = "10";
      } else {
        limits = limit.toString();
      }

      const payloadSearch: OpenEndSearchRequest = {
        branchCode: values.branchCode,
        status: values.status,
        dateFrom: moment(startDate).startOf("day").toISOString(),
        dateTo: moment(endDate).startOf("day").toISOString(),
        limit: limits,
        page: page,
      };

      await dispatch(featchSearchOpenEndAsync(payloadSearch));
      await dispatch(savePayloadSearch(payloadSearch));
      setFlagSearch(true);
    }

    setOpenLoadingModal(false);
  };

  const onClickClearBtn = () => {
    setOpenLoadingModal(true);

    if (isGroupFinance()) {
      setBranchFromCode("");
      setValues({ ...values, status: "APPROVED", branchCode: "" });
    } else {
      setValues({ ...values, status: "ALL" });
    }

    setFlagSearch(false);
    setStartDate(null);
    setEndDate(null);
    setClearBranchDropDown(!clearBranchDropDown);
    dispatch(clearOpenEndSearchList({}));
    setTimeout(() => {
      setOpenLoadingModal(false);
    }, 300);
  };

  useEffect(() => {
    if (groupBranch) {
      setBranchFromCode(ownBranch);
      setValues({ ...values, branchCode: ownBranch });
    }

    if (groupFinance) {
      setValues({ ...values, status: "APPROVED" });
    }
  }, []);

  return (
    <>
      <Box>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("documentSearchBranch")}
            </Typography>
            <BranchListDropDown
              valueBranch={valuebranchFrom}
              onChangeBranch={handleChangeBranchFrom}
              isClear={clearBranchDropDown}
              isFilterAuthorizedBranch={false}
              disable={groupBranch}
              sourceBranchCode={branchFromCode}
            />
          </Grid>

          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("documentSearchStartDate")}
            </Typography>
            <DatePickerAllComponent
              onClickDate={handleStartDatePicker}
              type={"TO"}
              value={startDate}
              maxDate={new Date()}
            />
          </Grid>

          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("documentSearchEndDate")}
            </Typography>
            <DatePickerAllComponent
              onClickDate={handleEndDatePicker}
              value={endDate}
              type={"TO"}
              minDateTo={startDate}
              maxDate={new Date()}
            />
          </Grid>

          <Grid item xs={4} container>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              {t("documentSearchStatus")}
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selStatus"
                name="status"
                value={values.status}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
                disabled={groupFinance}
              >
                <MenuItem value={"ALL"} selected={true}>
                  ทั้งหมด
                </MenuItem>
                {openEndStatus.map((item: any, index: number) => {
                  return <MenuItem value={item.key}>{item.text}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box>
          <Grid container spacing={2} mt={4} mb={2}>
            <Grid item xs={12} sx={{ textAlign: "end" }}>
              <Button
                id="btnClear"
                variant="contained"
                onClick={onClickClearBtn}
                sx={{ width: "12%", ml: 2 }}
                className={classes.MbtnClear}
                color="cancelColor"
              >
                เคลียร์
              </Button>
              <Button
                id="btnSearch"
                variant="contained"
                color="primary"
                onClick={onClickSearchBtn}
                sx={{ width: "12%", ml: 2 }}
                className={classes.MbtnSearch}
              >
                ค้นหา
              </Button>
            </Grid>
          </Grid>
        </Box>

        {flagSearch && items.data.length > 0 && <OpenEndList />}
        {flagSearch && items.data.length === 0 && (
          <Grid container xs={12} justifyContent="center">
            <Box color="#CBD4DB" justifyContent="center">
              <h2>
                ไม่มีข้อมูล <SearchOff fontSize="large" />
              </h2>
            </Box>
          </Grid>
        )}

        <LoadingModal open={openLoadingModal} />
        <AlertError
          open={openAlert}
          onClose={handleCloseAlert}
          textError={textError}
        />
      </Box>
    </>
  );
}

export default OpenEndSearch;
