import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import _ from "lodash";
import moment from "moment";
import { BranchListOptionType } from "../../../models/branch-model";
import DatePickerComponent from "../../../components/commons/ui/date-picker";
import BranchListDropDown from "../../../components/commons/ui/branch-list-dropdown";
import { getBranchName, stringNullOrEmpty } from "../../../utils/utils";
import React, { ReactElement, useEffect, useState } from "react";
import { useStyles } from "../../../styles/makeTheme";
import { getUserInfo } from "../../../store/sessionStore";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import { isGroupBranch } from "../../../utils/role-permission";
import { RequisitionSummaryRequest } from "../../../models/transfer-out-model";
import { getRequistionSummary } from "../../../services/transfer-out";
import { env } from "../../../adapters/environmentConfigs";
import AlertError from "../../../components/commons/ui/alert-error";

interface State {
  branch: string;
  fromDate: any | Date | number | string;
  toDate: any | Date | number | string;
}

interface Props {
  isOpen: boolean;
  onClickClose: () => void;
  branchSelected: string;
}

export default function RequisitionSummary({
  isOpen,
  onClickClose,
  branchSelected,
}: Props): ReactElement {
  const classes = useStyles();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation(["common"]);
  const [branch, setBranch] = React.useState<any | null>(null);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const ownBranch = getUserInfo().branch
    ? getBranchName(branchList, getUserInfo().branch)
      ? getUserInfo().branch
      : env.branch.code
    : env.branch.code;
  const branchSelectName = !stringNullOrEmpty(branchSelected)
    ? branchSelected + "-" + getBranchName(branchList, branchSelected)
    : "";
  const branchName = getBranchName(branchList, ownBranch);
  const branchName1 = getBranchName(branchList, branchSelected);
  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const [branchMap, setBranchMap] = React.useState<BranchListOptionType>({
    code: ownBranch,
    name: branchName ? branchName : "",
  });
  const [branchMap1, setBranchMap1] = React.useState<BranchListOptionType>({
    code: branchSelected,
    name: branchName1 ? branchName1 : "",
  });
  const [branchOptions, setBranchOptions] =
    React.useState<BranchListOptionType | null>(groupBranch ? branchMap : null);
  const [branchOptions1, setBranchOptions1] =
    React.useState<BranchListOptionType | null>(
      !stringNullOrEmpty(branchSelected) ? branchMap1 : null,
    );
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);

  const [values, setValues] = React.useState<State>({
    fromDate: new Date().setDate(new Date().getDate() - 6),
    toDate: new Date(),
    branch: "",
  });
  const [checkValue, setCheckValue] = React.useState({
    fromDateError: false,
    toDateError: false,
    branchError: false,
  });

  const validateDate = () => {
    const diffTime = Math.abs(values.toDate - values.fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let isValid = true;
    if (diffDays > 7) {
      isValid = false;
    }
    return isValid;
  };

  const validateSearch = () => {
    let isValid = true;
    if (
      stringNullOrEmpty(values.fromDate) ||
      stringNullOrEmpty(values.toDate)
    ) {
      isValid = false;
      setOpenAlert(true);
      setTextError("กรุณากรอกวันที่");
    }
    if (stringNullOrEmpty(values.branch)) {
      isValid = false;
      setCheckValue({ ...checkValue, branchError: true });
    }
    return isValid;
  };

  useEffect(() => {
    if (stringNullOrEmpty(values.fromDate)) {
      setCheckValue({ ...checkValue, fromDateError: true });
      return;
    }
    if (!validateDate()) {
      setCheckValue({ ...checkValue, fromDateError: true, toDateError: true });
    } else
      setCheckValue({
        ...checkValue,
        fromDateError: false,
        toDateError: false,
      });
  }, [values.fromDate]);

  useEffect(() => {
    if (stringNullOrEmpty(values.toDate)) {
      setCheckValue({ ...checkValue, toDateError: true });
      return;
    }
    if (!validateDate()) {
      setCheckValue({ ...checkValue, fromDateError: true, toDateError: true });
    } else
      setCheckValue({
        ...checkValue,
        fromDateError: false,
        toDateError: false,
      });
  }, [values.toDate]);

  useEffect(() => {
    if (groupBranch) {
      setBranchMap({ code: ownBranch, name: branchName ? branchName : "" });
      setBranchOptions(branchMap);
      setValues({ ...values, branch: ownBranch });
    }
    if (!stringNullOrEmpty(branchSelected)) {
      setBranchMap1({ code: ownBranch, name: branchName ? branchName : "" });
      setBranchOptions1(branchMap1);
      setValues({ ...values, branch: branchSelected });
    }
  }, [branchList]);

  const handleCloseModal = () => {
    setOpen(false);
    onClickClose();
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleChangefromDate = (value: any) => {
    setValues({ ...values, fromDate: value });
  };

  const handleChangetoDate = (value: any) => {
    setValues({ ...values, toDate: value });
  };

  const handleChangeBranch = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branch: JSON.parse(codes) });
    } else {
      setValues({ ...values, branch: "" });
    }
  };

  const downloadXLSFile = async () => {
    try {
      if (!validateSearch()) {
        return;
      }
      if (!validateDate()) {
        return;
      } else {
        if (
          values.branch !== null ||
          ownBranch !== "" ||
          branchSelected !== ""
        ) {
          let payload: RequisitionSummaryRequest = {
            fromDate: moment(values.fromDate).toISOString().split("T")[0],
            toDate: moment(values.toDate).toISOString().split("T")[0],
            branchCode: values.branch,
          };
          if (!stringNullOrEmpty(branchSelected))
            payload.branchCode = branchSelected;
          const res = await getRequistionSummary(payload);
          if (res && res.data) {
            const outputFilename =
              `TO_BaoCafe` +
              `${payload.branchCode}` +
              `_${moment(values.fromDate)
                .toISOString()
                .split("T")[0]
                .split("-")
                .join("")
                .substring(2)}-${moment(values.toDate)
                .toISOString()
                .split("T")[0]
                .split("-")
                .join("")
                .substring(2)}` +
              `.xlsx`;
            const blob = new Blob([res.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,",
            });
            const href = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = href;
            link.setAttribute("download", outputFilename);
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            setCheckValue({
              fromDateError: false,
              toDateError: false,
              branchError: false,
            });
          }
        }
      }
    } catch (error) {}
  };

  return (
    <div>
      <Dialog maxWidth="md" fullWidth open={true}>
        <b style={{ fontSize: "18px", textAlign: "center", marginTop: "26px" }}>
          สรุปรายการเบิก{" "}
        </b>
        <Box sx={{ flex: 1, ml: 2 }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme: any) => theme.palette.grey[400],
            }}
            data-testid="iconCloseModal"
          >
            <CancelOutlinedIcon
              fontSize="large"
              stroke={"white"}
              strokeWidth={1}
            />
          </IconButton>
        </Box>
        <DialogContent sx={{ padding: "40px 24px 32px 28px" }}>
          <Grid container rowSpacing={3} columnSpacing={6} mt={1}>
            <Grid item xs={6}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                วันที่ขอใช้วัตถุดิบ ตั้งแต่ *
              </Typography>
              <DatePickerComponent
                error={checkValue.fromDateError}
                onClickDate={handleChangefromDate}
                value={values.fromDate}
              />
              {checkValue.fromDateError && (
                <Box textAlign="right" color="#F54949">
                  กรุณาเลือกช่วงวันที่ไม่เกิน 7 วัน
                </Box>
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                ถึง *
              </Typography>
              <DatePickerComponent
                error={checkValue.toDateError}
                onClickDate={handleChangetoDate}
                type={"TO"}
                minDateTo={values.fromDate}
                value={values.toDate}
              />
              {checkValue.toDateError && (
                <Box textAlign="right" color="#F54949">
                  กรุณาเลือกช่วงวันที่ไม่เกิน 7 วัน
                </Box>
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                สาขา *
              </Typography>
              <BranchListDropDown
                valueBranch={branchSelected ? branchOptions1 : branchOptions}
                sourceBranchCode={ownBranch || branchSelectName}
                onChangeBranch={handleChangeBranch}
                isClear={clearBranchDropDown}
                disable={groupBranch}
                isFilterAuthorizedBranch={true}
              />
              {checkValue.branchError && (
                <Box textAlign="right" color="#F54949">
                  กรุณาระบุสาขา
                </Box>
              )}
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={4}></Grid>
            <Grid item xs={4}></Grid>
            <Grid
              item
              xs={4}
              sx={{
                textAlign: "right",
                height: "43px",
                padding: "0 !important",
                marginTop: "30px",
              }}
            >
              <Button
                style={{ width: "250px" }}
                variant="contained"
                color="info"
                className={classes.MbtnSearch}
                size="large"
                onClick={downloadXLSFile}
                startIcon={<FileDownloadOutlinedIcon />}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />
    </div>
  );
}
