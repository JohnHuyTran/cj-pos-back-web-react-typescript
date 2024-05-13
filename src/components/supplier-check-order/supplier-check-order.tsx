import moment from "moment";
import { Grid } from "@mui/material";
import { TextField } from "@mui/material";
import { FormControl } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Select } from "@mui/material";
import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import React from "react";
import { PurchaseInvoiceSearchCriteriaRequest } from "../../models/supplier-check-order-model";
import DatePickerComponent from "../commons/ui/date-picker";
import { useStyles } from "../../styles/makeTheme";
import { Button } from "@mui/material";
import AlertError from "../commons/ui/alert-error";
import { featchOrderListSupAsync } from "../../store/slices/supplier-check-order-slice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import SupplierOrderList from "./supplier-order-list";
import LoadingModal from "../commons/ui/loading-modal";
import { saveSearchCriteriaSup } from "../../store/slices/save-search-order-supplier-slice";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ModalSupplierSelection from "./modal-supplier-selection";
import { SearchOff } from "@mui/icons-material";

interface State {
  paramQuery: string;
  piStatus: string;
  piType: string;
  dateFrom: string;
  dateTo: string;
}

interface loadingModalState {
  open: boolean;
}

export default function SupplierCheckOrderSearch() {
  // const limit = "10";
  const page = "1";
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const items = useAppSelector((state) => state.supplierCheckOrderSlice);
  const limit = useAppSelector(
    (state) => state.supplierCheckOrderSlice.orderList.perPage,
  );

  const [values, setValues] = React.useState<State>({
    paramQuery: "",
    piStatus: "0",
    piType: "ALL",
    dateFrom: "",
    dateTo: "",
  });
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
  };

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

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

  //alert Errormodel
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const onClickValidateForm = () => {
    if (
      values.paramQuery === "" &&
      values.piStatus === "ALL" &&
      values.piType === "ALL" &&
      startDate === null &&
      endDate === null
    ) {
      setOpenAlert(true);
      setTextError("กรุณากรอกวันที่รับสินค้า");
    } else if (
      values.paramQuery === "" &&
      values.piStatus === "ALL" &&
      values.piType === "ALL"
    ) {
      if (startDate === null || endDate === null) {
        setOpenAlert(true);
        setTextError("กรุณากรอกวันที่รับสินค้า");
      } else {
        onClickSearchBtn();
      }
    } else {
      if (startDate === null || endDate === null) {
        setOpenAlert(true);
        setTextError("กรุณากรอกวันที่รับสินค้า");
      } else {
        onClickSearchBtn();
      }
    }
  };

  const removeSpace = (value: string) => {
    return value.replace(/\s/g, "");
  };

  const onClickSearchBtn = async () => {
    let limits;
    if (limit === 0) {
      limits = "10";
    } else {
      limits = limit.toString();
    }

    let newParamQuery = removeSpace(values.paramQuery);

    const payload: PurchaseInvoiceSearchCriteriaRequest = {
      limit: limits,
      page: page,
      paramQuery: newParamQuery,
      piStatus: values.piStatus,
      piType: values.piType,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),
      clearSearch: false,
    };

    handleOpenLoading("open", true);
    await dispatch(featchOrderListSupAsync(payload));
    await dispatch(saveSearchCriteriaSup(payload));
    setFlagSearch(true);
    handleOpenLoading("open", false);
  };

  const onClickClearBtn = async () => {
    handleOpenLoading("open", true);
    setFlagSearch(false);
    setStartDate(null);
    setEndDate(null);
    setValues({
      paramQuery: "",
      piStatus: "ALL",
      piType: "ALL",
      dateFrom: "",
      dateTo: "",
    });

    const payload: PurchaseInvoiceSearchCriteriaRequest = {
      limit: limit.toString(),
      page: page,
      paramQuery: values.paramQuery,
      piStatus: values.piStatus,
      piType: values.piType,
      dateFrom: moment(startDate).startOf("day").toISOString(),
      dateTo: moment(endDate).endOf("day").toISOString(),

      clearSearch: true,
    };

    dispatch(featchOrderListSupAsync(payload));
    setTimeout(() => {
      handleOpenLoading("open", false);
    }, 300);
  };

  let orderListData;
  const orderListDatas = items.orderList.data ? items.orderList.data : [];
  const [flagSearch, setFlagSearch] = React.useState(false);
  if (flagSearch) {
    if (orderListDatas.length > 0) {
      orderListData = <SupplierOrderList />;
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

  return (
    <>
      <Box>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              ค้นหาเอกสาร
            </Typography>
            <TextField
              id="txtParamQuery"
              name="paramQuery"
              size="small"
              value={values.paramQuery}
              onChange={handleChange}
              className={classes.MtextField}
              fullWidth
              placeholder="เลขที่ใบสั่งซื้อ PO, PI, PN/รหัสผู้จำหน่าย/ชื่อผู้จำหน่าย"
            />
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              สถานะ
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selPiStatus"
                name="piStatus"
                value={values.piStatus}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"}>ทั้งหมด</MenuItem>
                <MenuItem value={"0"}>บันทึก</MenuItem>
                <MenuItem value={"1"}>อนุมัติ</MenuItem>
                <MenuItem value={"9"}>ยกเลิก</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
              เอกสารใบสั่งซื้อ
            </Typography>
            <FormControl fullWidth className={classes.Mselect}>
              <Select
                id="selPiType"
                name="piType"
                value={values.piType}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"ALL"}>ทั้งหมด</MenuItem>
                <MenuItem value={"0"}>มี PO</MenuItem>
                <MenuItem value={"1"}>ไม่มี PO</MenuItem>
              </Select>
            </FormControl>
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
          <Grid item xs={4} container alignItems="flex-end">
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
              id="btnCreateSupplierModal"
              variant="contained"
              onClick={handleOpenModal}
              sx={{ minWidth: "15%" }}
              className={classes.MbtnClear}
              startIcon={<AddCircleOutlineOutlinedIcon />}
              color="secondary"
            >
              สร้างใบรับสินค้า
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
      {/* {items.orderList && <DCOrderList />} */}
      {orderListData}
      <LoadingModal open={openLoadingModal.open} />

      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />

      <ModalSupplierSelection
        openModal={openModal}
        handleCloseModal={handleCloseModal}
      />
    </>
  );
}
