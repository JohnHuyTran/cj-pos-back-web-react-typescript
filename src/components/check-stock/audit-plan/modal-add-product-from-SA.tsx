import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { Box } from "@material-ui/core";
import {
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { DateFormat } from "../../../utils/enum/common-enum";
import Button from "@mui/material/Button";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import DatePickerComponent from "../../commons/ui/date-picker";
import {
  onChange,
  onChangeDate,
  stringNullOrEmpty,
} from "../../../utils/utils";
import moment from "moment";
import LoadingModal from "../../commons/ui/loading-modal";
import {
  StockAdjustment,
  StockAdjustmentSearchRequest,
  StockAdjustmentSearchResponse,
} from "../../../models/stock-adjustment-model";
import { updateAddTypeAndProductState } from "../../../store/slices/add-type-product-slice";
import { getProductByDocNoSA } from "../../../services/audit-plan";
import AlertError from "../../commons/ui/alert-error";
import { getStockAdjustHasTempStockSearch } from "../../../store/slices/stock-adjust-has-temp-stock-search";
import { clearDataFilter } from "../../../store/slices/stock-adjust-has-temp-stock-search";

export interface Props {
  open: boolean;
  onClose: () => void;
  branch: string;
}

interface State {
  documentNumber: string;
  branch: string;
  status: string;
  fromDate: any | Date | number | string;
  toDate: any | Date | number | string;
}

const _ = require("lodash");

export const ModalAddProductFromSA = (props: Props) => {
  const dispatch = useAppDispatch();
  const { open, onClose, branch } = props;
  const classes = useStyles();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<boolean>(false);
  const [dataTable, setDataTable] = React.useState<any[]>([]);
  const [checkAll, setCheckAll] = React.useState<boolean>(false);
  const [alertTextError, setAlertTextError] = React.useState(
    "กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน",
  );
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const stockAdjustHasTempStockSearchSlice = useAppSelector(
    (state) => state.stockAdjustHasTempStockSearchSlice,
  );
  const saSearchResponse: StockAdjustmentSearchResponse =
    stockAdjustHasTempStockSearchSlice.toSearchResponse;
  const currentPage = useAppSelector(
    (state) => state.stockAdjustHasTempStockSearchSlice.toSearchResponse.page,
  );
  const limit = useAppSelector(
    (state) =>
      state.stockAdjustHasTempStockSearchSlice.toSearchResponse.perPage,
  );
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );

  const [values, setValues] = React.useState<State>({
    documentNumber: "",
    branch: branch,
    status: "ALL",
    fromDate: new Date(),
    toDate: new Date(),
  });

  useEffect(() => {
    const lstStockAdjustment = saSearchResponse.data;
    if (lstStockAdjustment != null && lstStockAdjustment.length > 0) {
      let rows = lstStockAdjustment.map(
        (data: StockAdjustment, index: number) => {
          return {
            checked: false,
            id: data.id,
            index: (currentPage - 1) * 10 + index + 1,
            documentNumber: data.documentNumber,
            createdDate: convertUtcToBkkDate(
              data.createdDate,
              DateFormat.DATE_FORMAT,
            ),
            createdBy: data.createdBy,
          };
        },
      );
      setDataTable(rows);
    }
  }, [saSearchResponse]);

  useEffect(() => {
    if (!open) {
      onClear();
    }
  }, [open]);

  const onCheckCell = async (params: GridRenderCellParams, event: any) => {
    let dataTableHandle = _.cloneDeep(dataTable);
    for (let item of dataTableHandle) {
      if (item.id === params.row.id) {
        item.checked = event.target.checked;
      }
    }
    setDataTable(dataTableHandle);
    let lstUnCheck = dataTableHandle.filter((it: any) => !it.checked);
    if (lstUnCheck != null && lstUnCheck.length > 0) setCheckAll(false);
    else setCheckAll(true);
  };

  const onCheckAll = async (event: any) => {
    setCheckAll(event.target.checked);
    let dataTableHandle = _.cloneDeep(dataTable);
    for (let item of dataTableHandle) {
      item.checked = event.target.checked;
    }
    setDataTable(dataTableHandle);
  };
  const validateSearch = () => {
    let isValid = true;
    if (
      stringNullOrEmpty(values.fromDate) ||
      stringNullOrEmpty(values.toDate)
    ) {
      isValid = false;
      setOpenAlert(true);
      setTextError("กรุณากรอกข้อมูลค้นหา");
    }
    return isValid;
  };
  const onClear = async () => {
    setValues({
      documentNumber: "",
      branch: branch,
      status: "ALL",
      fromDate: new Date(),
      toDate: new Date(),
    });
    setDataTable([]);
    setCheckAll(false);
    dispatch(clearDataFilter());
  };
  const onSearch = async () => {
    setCheckAll(false);
    if (!validateSearch()) {
      return;
    }
    const payload: StockAdjustmentSearchRequest = {
      perPage: "10",
      page: "1",
      docNo: values.documentNumber.trim(),
      branch: values.branch,
      status: values.status,
      creationDateFrom: moment(values.fromDate).startOf("day").toISOString(),
      creationDateTo: moment(values.toDate).endOf("day").toISOString(),
    };

    setOpenLoadingModal(true);
    await dispatch(getStockAdjustHasTempStockSearch(payload));
    setOpenLoadingModal(false);
  };

  const handlePageChange = async (newPage: number) => {
    if (saSearchResponse.total < 10) return;
    setCheckAll(false);
    setOpenLoadingModal(true);
    let page: string = (newPage + 1).toString();
    const payloadNewPage: StockAdjustmentSearchRequest = {
      perPage: limit.toString(),
      page: page,
      docNo: values.documentNumber.trim(),
      branch: values.branch,
      status: values.status,
      creationDateFrom: moment(values.fromDate).startOf("day").toISOString(),
      creationDateTo: moment(values.toDate).endOf("day").toISOString(),
    };

    await dispatch(getStockAdjustHasTempStockSearch(payloadNewPage));
    setOpenLoadingModal(false);
  };

  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "นับทวน",
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderHeader: (params) => (
        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
            <FormControlLabel
              className={classes.MFormControlLabel}
              value="top"
              control={
                <Checkbox checked={checkAll} onClick={onCheckAll.bind(this)} />
              }
              label={""}
              disabled={!dataTable.length}
              labelPlacement="top"
            />
          </FormGroup>
        </FormControl>
      ),
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(params.value)}
          disabled={Boolean(params.getValue(params.id, "disabledChecked"))}
          onClick={onCheckCell.bind(this, params)}
        />
      ),
    },
    {
      field: "index",
      headerName: "ลำดับ",
      headerAlign: "center",
      disableColumnMenu: false,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ margin: "0 auto" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "documentNumber",
      headerName: "เลขที่เอกสาร",
      flex: 1.5,
      headerAlign: "center",
      align: "left",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "createdDate",
      headerName: "วันที่สร้างรายการ",
      flex: 0.8,
      headerAlign: "center",
      align: "left",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "createdBy",
      headerName: "ผู้สร้างรายการ",
      flex: 1,
      headerAlign: "center",
      align: "left",
      disableColumnMenu: false,
      sortable: false,
    },
  ];

  const handleAddItems = async () => {
    try {
      const payload = dataTable
        .filter((el: any) => el.checked)
        .map((item: any) => item.documentNumber)
        .join(",");
      const rs = await getProductByDocNoSA(payload);
      if (rs.code == 20000 && rs.data && rs.data.length) {
        let newList = rs.data.map((item: any) => {
          return {
            skuName: item.name,
            skuCode: item.sku,
            selectedType: 2,
            productFromSA: true,
          };
        });
        let listVerify = _.unionBy(payloadAddTypeProduct, newList, "skuCode");
        dispatch(updateAddTypeAndProductState(listVerify));
      }
      onClose();
    } catch (e) {
      setOpenModalError(true);
      setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    }
  };

  return (
    <div>
      <Dialog open={open} maxWidth={"lg"} fullWidth>
        <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
          <Typography sx={{ fontSize: "1em" }}>
            <b>เพิ่มสินค้าจากเอกสาร SA</b>
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container rowSpacing={3} columnSpacing={6} mb={3}>
            <Grid item xs={4} mt={"28px"}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                ค้นหาเอกสาร
              </Typography>
              <TextField
                id="documentNumber"
                name="documentNumber"
                size="small"
                value={values.documentNumber}
                onChange={onChange.bind(this, setValues, values)}
                className={classes.MtextField}
                fullWidth
                placeholder={"เลขที่เอกสาร SA"}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                วันที่ทำรายการ <br /> ตั้งแต่{" "}
                <span style={{ color: "#F54949" }}>*</span>
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
            <Grid item xs={4} mt={"28px"}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                ถึง <span style={{ color: "#F54949" }}>*</span>
              </Typography>
              <DatePickerComponent
                onClickDate={onChangeDate.bind(
                  this,
                  setValues,
                  values,
                  "toDate",
                )}
                type={"TO"}
                minDateTo={values.fromDate}
                value={values.toDate}
              />
            </Grid>
          </Grid>
          <Box display={"flex"} mt={5} mb={3}>
            <Button
              id="btnAddItem"
              variant="contained"
              color="info"
              className={classes.MbtnSearch}
              startIcon={<AddCircleOutlineOutlinedIcon />}
              disabled={dataTable.filter((el: any) => el.checked).length == 0}
              onClick={handleAddItems}
              sx={{ width: 126 }}
            >
              เพิ่มสินค้า
            </Button>
            <Box marginLeft={"auto"}>
              <Button
                id="btnClear"
                variant="contained"
                color="cancelColor"
                className={classes.MbtnSearch}
                onClick={onClear}
                sx={{ width: 126, mr: "17px" }}
              >
                เคลียร์
              </Button>
              <Button
                id="btnSearch"
                variant="contained"
                color="primary"
                className={classes.MbtnSearch}
                onClick={onSearch}
                sx={{ width: 126 }}
              >
                ค้นหา
              </Button>
            </Box>
          </Box>
          <div
            style={{ width: "100%", height: "35vh", overflow: "hidden" }}
            className={classes.MdataGridPaginationTop}
          >
            <DataGrid
              rows={dataTable}
              columns={columns}
              pageSize={10}
              hideFooterSelectedRowCount={true}
              pagination
              page={currentPage - 1}
              disableColumnMenu
              scrollbarSize={10}
              onPageChange={handlePageChange}
              rowCount={saSearchResponse.total}
              paginationMode="server"
              rowHeight={45}
              components={{
                NoRowsOverlay: () => (
                  <Typography
                    position="relative"
                    textAlign="center"
                    top="112px"
                    color="#AEAEAE"
                  >
                    ไม่มีข้อมูล
                  </Typography>
                ),
              }}
              loading={openLoadingModal}
            />
          </div>
        </DialogContent>
      </Dialog>
      <LoadingModal open={openLoadingModal} />
      <AlertError
        open={openModalError}
        onClose={() => setOpenModalError(false)}
        textError={alertTextError}
      />
    </div>
  );
};

export default ModalAddProductFromSA;
