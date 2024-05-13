import React from "react";
import { Grid, TextField, Typography } from "@mui/material";
import { Box } from "@mui/material";
import { useStyles } from "../../styles/makeTheme";
import { Button } from "@mui/material";
import TaxInvoiceSearchList from "./tax-invoice-search-list";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { TaxInvoiceRequest } from "../../models/tax-invoice-model";
import {
  featchTaxInvoiceListAsync,
  savePayloadSearchList,
  saveTaxInvoiceList,
  saveTaxInvoiceListIsFailed,
} from "../../store/slices/tax-invoice-search-list-slice";
import LoadingModal from "../commons/ui/loading-modal";
import { ACTIONS } from "../../utils/enum/permission-enum";
import { isAllowActionPermission } from "../../utils/role-permission";
import AlertError from "../commons/ui/alert-error";

import { Search } from "@mui/icons-material";
import RequestTaxInvoice from "./request-tax-invoice";
import { requestTaxInvoice } from "../../services/sale";
import { ApiError } from "../../models/api-error-model";

interface State {
  docNo: string;
  citizenId: string;
  actionType: string;
}
interface loadingModalState {
  open: boolean;
}

export default function TaxInvoiceSearch() {
  const classes = useStyles();
  const page = "1";
  const dispatch = useAppDispatch();
  const [hideSearchBtn, setHideSearchBtn] = React.useState(true);
  const [hideRequesthBtn, setHideRequestBtn] = React.useState(true);
  const [values, setValues] = React.useState<TaxInvoiceRequest>({
    docNo: "",
    citizenId: "",
    actionType: "",
  });
  const [actionType, setActionType] = React.useState("");
  const [flagSearch, setFlagSearch] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const [openFailAlert, setOpenFailAlert] = React.useState(false);
  const [textFail, setTextFail] = React.useState("");
  const [billNo, setBillNo] = React.useState("");
  const [openRequestTax, setOpenRequestTax] = React.useState(false);
  const handleCloseFailAlert = () => {
    setOpenFailAlert(false);
    setTextFail("");
  };

  const items = useAppSelector(
    (state) => state.taxInvoiceSearchList.taxInvoiceList,
  );
  const limit = useAppSelector(
    (state) => state.taxInvoiceSearchList.taxInvoiceList.perPage,
  );
  const taxInvoiceList = items.data ? items.data : [];

  const handleChange = (event: any) => {
    const name = event.target.name;
    if (name === "citizenId") {
      let value = event.target.value.replace(/[^0-9]/g, "");
      value = value.length > 13 ? value.substring(0, 13) : value;
      setValues({ ...values, [event.target.name]: value });
    } else {
      const value = event.target.value;
      setValues({ ...values, [event.target.name]: value.trim() });
    }
  };

  const onClickClearBtn = async () => {
    setValues({
      docNo: "",
      citizenId: "",
      actionType: "",
    });
    const payload: TaxInvoiceRequest = {
      limit: limit ? limit.toString() : "10",
      page: page,
      docNo: values.docNo,
      citizenId: values.citizenId,
      actionType: values.actionType,
    };
    await dispatch(savePayloadSearchList(payload));
    setFlagSearch(false);
  };

  const validateForm = () => {
    let errText = "";
    let isNoError = true;
    if (!values.docNo && !values.citizenId) {
      errText = "กรุณาระบุเลขเอกสารหรือเลขที่บัตรประชาชน";
      isNoError = false;
    }
    if (values.docNo && values.docNo.length < 6) {
      errText = "กรุณาระบุเลขเอกสารอย่างน้อย 6 หลัก";
      isNoError = false;
    }

    if (values.citizenId && values.citizenId.length != 13) {
      errText = errText
        ? `${errText}\n กรุณาระบุเลขที่บัตรประชาชน 13 หลัก `
        : "กรุณาระบุเลขที่บัตรประชาชน 13 หลัก";
      isNoError = false;
    }

    setTextFail(errText);
    return isNoError;
  };

  const onClickSearchBtn = async () => {
    handleOpenLoading("open", true);
    setActionType("search");
    if (validateForm()) {
      let limits;
      if (limit === 0 || limit === undefined) {
        limits = "10";
      } else {
        limits = limit.toString();
      }
      const payload: TaxInvoiceRequest = {
        limit: limits,
        page: page,
        docNo: values.docNo,
        citizenId: values.citizenId,
      };
      await dispatch(featchTaxInvoiceListAsync(payload));
      await dispatch(savePayloadSearchList(payload));
      setFlagSearch(true);
    } else {
      setOpenFailAlert(true);
    }

    handleOpenLoading("open", false);
  };

  const handleChangeBillNo = (value: string) => {
    setBillNo(value);
  };

  const onClickRequestBtn = () => {
    setOpenRequestTax(true);
  };

  const onCloseRequestBtn = () => {
    setOpenRequestTax(false);
  };

  const callRequestTaxInvoice = async () => {
    onCloseRequestBtn();
    setValues({
      docNo: "",
      citizenId: "",
    });
    handleOpenLoading("open", true);
    setActionType("request");
    setFlagSearch(true);
    const payload: TaxInvoiceRequest = {
      docNo: billNo,
    };

    await requestTaxInvoice(payload)
      .then(async (value) => {
        console.log("value: ", value);
        await dispatch(saveTaxInvoiceList(value));
        await dispatch(savePayloadSearchList(payload));
      })
      .catch(async (error: ApiError) => {
        await dispatch(saveTaxInvoiceListIsFailed(error));
      });

    handleOpenLoading("open", false);
  };

  React.useEffect(() => {
    setHideSearchBtn(isAllowActionPermission(ACTIONS.SALE_TAX_INVOICE_VIEW));
    setHideRequestBtn(
      isAllowActionPermission(ACTIONS.SALE_TAX_INVOICE_REQUEST),
    );
  }, []);

  return (
    <>
      <Box>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
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
              placeholder="เลขที่ใบเสร็จ/ใบกำกับ"
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              เลขที่บัตรประชาชน
            </Typography>
            <TextField
              id="txtCitizenId"
              name="citizenId"
              size="small"
              value={values.citizenId}
              onChange={handleChange}
              className={classes.MtextField}
              fullWidth
              placeholder=""
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={4} container alignItems="flex-end"></Grid>
        </Grid>
      </Box>
      <Box mb={3}>
        <Grid container spacing={2} mt={4} mb={2}>
          <Grid item xs={3} sx={{ textAlign: "start" }}>
            {" "}
            <Button
              id="btnSearch"
              variant="contained"
              onClick={onClickRequestBtn}
              className={classes.MbtnClear}
              sx={{ display: `${hideRequesthBtn ? "none" : ""}` }}
              fullWidth={true}
              color="cancelColor"
            >
              ค้นหาใบเสร็จเกิน 3 เดือนจาก สนง.ใหญ่
            </Button>
          </Grid>
          <Grid item xs={9} sx={{ textAlign: "end" }}>
            {" "}
            <Button
              id="btnClear"
              variant="contained"
              onClick={onClickClearBtn}
              sx={{ width: 150, ml: 2 }}
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
              sx={{
                width: 150,
                ml: 2,
                display: `${hideSearchBtn ? "none" : ""}`,
              }}
              className={classes.MbtnSearch}
            >
              ค้นหา
            </Button>
          </Grid>
        </Grid>
      </Box>

      {flagSearch && taxInvoiceList.length > 0 && (
        <TaxInvoiceSearchList actionType={actionType} />
      )}
      {flagSearch && taxInvoiceList.length <= 0 && (
        <Grid item container xs={12} justifyContent="center">
          <Box color="#CBD4DB">
            <br></br>
            <h2>ไม่มีข้อมูล</h2>
          </Box>
        </Grid>
      )}

      <LoadingModal open={openLoadingModal.open} />
      <AlertError
        open={openFailAlert}
        onClose={handleCloseFailAlert}
        textError={textFail}
      />
      <RequestTaxInvoice
        isOpen={openRequestTax}
        onChangeTaxNo={handleChangeBillNo}
        onClose={onCloseRequestBtn}
        onRequest={callRequestTaxInvoice}
      />
    </>
  );
}
