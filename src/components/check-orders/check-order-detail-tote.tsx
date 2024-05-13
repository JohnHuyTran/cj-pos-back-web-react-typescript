import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/store";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Menu,
  MenuProps,
  TextField,
  Typography,
} from "@mui/material";
import { HighlightOff, Print, CheckCircleOutline } from "@mui/icons-material";
import SaveIcon from "@mui/icons-material/Save";
import {
  getShipmentTypeText,
  ShipmentDeliveryStatusCodeEnum,
} from "../../utils/enum/check-order-enum";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import {
  DataGrid,
  GridColDef,
  GridEditCellValueParams,
  GridRenderCellParams,
  GridRowData,
  GridRowId,
  GridValueGetterParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Entry,
  itemsDetail,
  SaveDraftSDRequest,
} from "../../models/order-model";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { useStyles } from "../../styles/makeTheme";
import { featchOrderDetailAsync } from "../../store/slices/check-order-detail-slice";
import LoadingModal from "../commons/ui/loading-modal";
import ModalShowFile from "../commons/ui/modal-show-file";
import {
  getPathReportSD,
  saveOrderShipments,
} from "../../services/order-shipment";
import { formatFileName } from "../../utils/enum/check-order-enum";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ModalAddItemsTote from "../commons/ui/modal-add-items-tote";
import { styled } from "@mui/material/styles";
import { updateItemsToteState } from "../../store/slices/items-tote-slice";
import CheckOrderDetailItems from "../check-orders/check-order-detail-items";
import AlertError from "../commons/ui/alert-error";
import { featchOrderListAsync } from "../../store/slices/check-order-slice";
import {
  ApiError,
  ErrorDetail,
  ErrorDetailResponse,
  Header,
} from "../../models/api-error-model";
import ConfirmOrderShipment from "./check-order-confirm-model";
import Snackbar from "../commons/ui/snackbar-status";
import ConfirmExitModel from "./confirm-model";
import { ToteItem } from "../../models/tote-model";
import { isErrorCode } from "../../utils/exception/pos-exception";
import { useTranslation } from "react-i18next";

export interface CheckOrderDetailToteProps {
  defaultOpen: boolean;
  onClickClose: any;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

interface loadingModalState {
  open: boolean;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 3 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme: any) => theme.palette.grey[400],
          }}
        >
          <HighlightOff fontSize="large" />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    // marginTop: theme.spacing(1),
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));

const columns: GridColDef[] = [
  {
    field: "rowOrder",
    headerName: "ลำดับ",
    width: 80,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcode",
    headerName: "บาร์โค้ด",
    minWidth: 135,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "productName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 160,
    flex: 1,
    sortable: false,
    renderCell: (params) => (
      <div>
        <Typography variant="body2">{params.value}</Typography>
        <Typography variant="body2" color="textSecondary">
          {params.getValue(params.id, "skuCode") || ""}
        </Typography>
      </div>
    ),
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    width: 90,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "qtyRef",
    headerName: "จำนวนอ้างอิง",
    width: 130,
    headerAlign: "center",
    align: "right",
    sortable: false,
  },
  {
    field: "actualQty",
    headerName: "จำนวนรับจริง",
    width: 135,
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txnQuantityActual"
        type="number"
        inputProps={{ style: { textAlign: "right" } }}
        value={params.value}
        onChange={(e) => {
          var value = e.target.value ? parseInt(e.target.value, 10) : "";
          if (value < 0) value = 0;

          params.api.updateRows([{ ...params.row, actualQty: value }]);
        }}
        onBlur={(e) => {
          // isAllowActualQty(params, parseInt(e.target.value, 10));
          params.api.updateRows([{ ...params.row, actualQty: e.target.value }]);
        }}
        disabled={isDisable(params) ? true : false}
        autoComplete="off"
      />
    ),
  },
  {
    field: "qtyDiff",
    headerName: "ส่วนต่างการรับ",
    width: 140,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => calProductDiff(params),
  },
  {
    field: "comment",
    headerName: "หมายเหตุ",
    headerAlign: "center",
    minWidth: 120,
    // flex: 0.5,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txnComment"
        value={params.value}
        onChange={(e) =>
          params.api.updateRows([{ ...params.row, comment: e.target.value }])
        }
        disabled={isDisable(params) ? true : false}
        autoComplete="off"
      />
    ),
  },
];

var calProductDiff = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "actualQty")) -
    Number(params.getValue(params.id, "qtyRef"));

  if (diff > 0)
    return (
      <label style={{ color: "#446EF2", fontWeight: 700 }}> +{diff} </label>
    );
  if (diff < 0)
    return (
      <label style={{ color: "#F54949", fontWeight: 700 }}> {diff} </label>
    );
  return diff;
};

function useApiRef() {
  const apiRef = useGridApiRef();
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "",
        width: 0,
        minWidth: 0,
        sortable: false,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        },
      }),
    [columns],
  );

  return { apiRef, columns: _columns };
}

const isDisable = (params: GridRenderCellParams) => {
  return params.row.sdStatus;
};

function CheckOrderDetailTote({
  defaultOpen,
  onClickClose,
}: CheckOrderDetailToteProps) {
  const { apiRef, columns } = useApiRef();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { t } = useTranslation(["orderReceive", "common"]);
  const itemsTote = useAppSelector((state) => state.itemsToteSlice.state);
  const payloadSearchOrder = useAppSelector(
    (state) => state.saveSearchOrder.searchCriteria,
  );
  const orderDetails = useAppSelector(
    (state) => state.checkOrderToteSlice.orderDetail,
  );
  const orderDetailTote: any = orderDetails.data ? orderDetails.data : null;

  const [openTote, setOpenTote] = React.useState(defaultOpen);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [statusFile, setStatusFile] = React.useState(0);
  const [statusClosed, setStatusClosed] = useState<boolean>(false);
  const [statusWaitApprove1, setStatusWaitApprove1] = React.useState(false);
  const [statusDraft, setStatusDraft] = React.useState(false);
  const [showSdTypeTote, setShowSdTypeTote] = React.useState(false);
  const [openModelPreviewDocument, setOpenModelPreviewDocument] =
    React.useState(false);
  const [openFailAlert, setOpenFailAlert] = React.useState(false);
  const [textFail, setTextFail] = React.useState("");
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarStatus, setSnackbarStatus] = React.useState(false);
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [action, setAction] = useState<string>("");
  const [statusOC, setStatusOC] = React.useState(false);
  const [itemsDiffState, setItemsDiffState] = useState<Entry[]>([]);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const [payloadError, setPayloadError] =
    React.useState<ErrorDetailResponse | null>();
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  //   console.log('itemsTote: ', itemsTote);

  const handleClose = async () => {
    dispatch(updateItemsToteState({}));
    setOpenTote(false);
    onClickClose();
  };

  const [sumDCPercent, setSumDCPercent] = React.useState(0);
  const handleCalculateDCPercent = async (
    sumActualQty: number,
    sumQuantityRef: number,
  ) => {
    let sumPercent: number = (sumActualQty * 100) / sumQuantityRef;
    sumPercent = Math.trunc(sumPercent); //remove decimal

    setSumDCPercent(sumPercent);
  };

  const updateState = async (items: any) => {
    await dispatch(updateItemsToteState(items));
  };

  useEffect(() => {
    // const branch = getUserInfo().group === PERMISSION_GROUP.BRANCH;
    // const oc = getUserInfo().group === PERMISSION_GROUP.OC;
    // setDisplayBranchGroup(branch);
    // setStatusOC(oc);

    setStatusDraft(
      orderDetailTote.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT,
    );
    setStatusClosed(
      orderDetailTote.sdStatus ===
        ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB,
    );
    setStatusWaitApprove1(
      orderDetailTote.sdStatus ===
        ShipmentDeliveryStatusCodeEnum.STATUS_WAITAPPROVEL_1,
    );
    setShowSdTypeTote(orderDetailTote.sdType === 0);

    // handleCalculateDCPercent(sumActualQtyItems, sumQuantityRefItems);
  }, [openTote, orderDetailTote]);

  let entries: itemsDetail[] = orderDetailTote.items
    ? orderDetailTote.items
    : [];

  if (entries.length > 0 && Object.keys(itemsTote).length === 0) {
    updateState(entries);
  }
  let rowsEntriesTote: any = [];
  if (Object.keys(itemsTote).length !== 0) {
    rowsEntriesTote = itemsTote.map((item: any, index: number) => {
      let qtyRef: number = 0;
      let actualQty: number = 0;

      if (item.id !== null && item.id !== undefined) {
        qtyRef = Number(item.qtyRef) ? Number(item.qtyRef) : 0;
        actualQty = Number(item.qty)
          ? Number(item.qty)
          : Number(item.actualQty)
            ? Number(item.actualQty)
            : 0;
      } else {
        qtyRef = Number(item.qty);
        actualQty = Number(item.actualQty);
      }

      return {
        rowOrder: index + 1,
        id: `${item.barcode}_${index}`,
        deliveryOrderNo: item.deliveryOrderNo,
        isTote: item.isTote ? item.isTote : false,
        sdStatus:
          orderDetailTote.sdStatus ===
          ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT
            ? false
            : true,
        skuCode: item.skuCode,
        barcode: item.barcode,
        productName: item.productName,
        unitName: item.unitName,
        qtyRef: qtyRef,
        actualQty: actualQty,
        qtyDiff: item.qtyDiff,
        comment: item.comment,
      };
    });
  }
  const updateShipmentOrder = () => {
    dispatch(featchOrderListAsync(payloadSearchOrder));
    dispatch(featchOrderDetailAsync(orderDetailTote.sdNo));
  };

  const mapUpdateState = async () => {
    const itemsList: any = [];

    if (rowsEntriesTote.length > 0) {
      const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
      await rows.forEach((data: GridRowData) => {
        itemsList.push(data);
      });
    }

    if (itemsList.length > 0) {
      updateState(itemsList);
    }
  };

  const handleEditItems = async (params: GridEditCellValueParams) => {
    if (params.field === "actualQty" || params.field === "comment") {
      mapUpdateState();
    }
  };

  const handleSaveButton = async () => {
    handleOpenLoading("open", true);

    let qtyIsValid: boolean = true;
    const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();

    const itemsList: any = [];
    const itemsListUpdate: any = [];
    rows.forEach((data: GridRowData) => {
      const item: any = {
        barcode: data.barcode,
        deliveryOrderNo: data.deliveryOrderNo,
        actualQty: Number(data.actualQty),
        comment: data.comment,
        isTote: data.isTote,
      };

      if (
        data.isTote === true &&
        !(data.actualQty * 1 >= 0 && data.actualQty * 1 <= 1)
      ) {
        qtyIsValid = false;
      }
      itemsList.push(item);
      itemsListUpdate.push(data);
    });

    if (!qtyIsValid) {
      setOpenFailAlert(!qtyIsValid);
      setTextFail("จำนวนรับจริงของTote ต้องเป็น 0 หรือ 1 เท่านั้น");
    }

    if (qtyIsValid) {
      const payload: SaveDraftSDRequest = {
        shipmentNo: orderDetailTote.docRefNo,
        items: itemsList,
      };

      await saveOrderShipments(payload, orderDetailTote.sdNo)
        .then((_value) => {
          setShowSnackBar(true);
          setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
          setSnackbarStatus(true);
          updateShipmentOrder();
        })
        .catch((error: ApiError) => {
          setShowSnackBar(true);
          setContentMsg(error.message);
          setSnackbarStatus(false);
          updateShipmentOrder();
        });

      updateState(itemsListUpdate);
    }

    handleOpenLoading("open", false);
  };

  const [sumActualQty, setSumActualQty] = React.useState(0);
  const [sumQuantityRef, setSumQuantityRef] = React.useState(0);
  const handleApproveBtn = async () => {
    mapUpdateState().then(() => {
      setItemsDiffState([]);
      setOpenModelConfirm(true);
      setAction(ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE);
      const rowsEdit: Map<GridRowId, GridRowData> =
        apiRef.current.getRowModels();
      const itemsList: any = [];

      let sumActualQtyItems: number = 0;
      let sumQuantityRefItems: number = 0;
      rowsEdit.forEach((data: GridRowData) => {
        let diffCount: number = data.actualQty - data.qtyRef;
        sumActualQtyItems = Number(sumActualQtyItems) + Number(data.actualQty); //รวมจำนวนรับจริง
        sumQuantityRefItems = Number(sumQuantityRefItems) + Number(data.qtyRef); //รวมจำนวนอ้าง

        const itemDiff: Entry = {
          barcode: data.barcode,
          deliveryOrderNo: data.deliveryOrderNo,
          actualQty: data.actualQty,
          comment: data.comment,
          seqItem: 0,
          itemNo: "",
          shipmentSAPRef: "",
          skuCode: "",
          skuType: "",
          productName: data.productName,
          unitCode: "",
          unitName: "",
          unitFactor: 0,
          qty: 0,
          qtyAll: 0,
          qtyAllBefore: 0,
          qtyDiff: diffCount,
          price: 0,
          isControlStock: 0,
          toteCode: "",
          expireDate: "",
          isTote: data.isTote,
        };
        setItemsDiffState((itemsDiffState) => [...itemsDiffState, itemDiff]);
        itemsList.push(data);
      });

      setSumActualQty(sumActualQtyItems);
      setSumQuantityRef(sumQuantityRefItems);
      // handleCalculateDCPercent(sumActualQtyItems, sumQuantityRefItems); //คำนวณDC(%)
    });
  };

  const handlePrintBtn = async () => {
    handleOpenLoading("open", true);
    setStatusFile(1);
    setOpenModelPreviewDocument(true);
    handleOpenLoading("open", false);
  };

  function handleModelPreviewDocument() {
    setOpenModelPreviewDocument(false);
  }

  const [openModelAddTote, setOpenModelAddTote] = React.useState(false);
  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorEl);

  const handleClickAddItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
  };

  const handleOpenAddItem = () => {
    setOpenModelAddItems(true);
    setAnchorEl(null);
  };

  const handleModelAddItems = async () => {
    setOpenModelAddItems(false);
  };

  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
    setContentMsg("");
    setSnackbarStatus(false);
  };

  const handleShowSnackBar = async (issuccess: boolean, error: ApiError) => {
    handleOpenLoading("open", true);
    if (issuccess) {
      setShowSnackBar(true);
      setContentMsg("คุณได้ทำรายการเรียบร้อยแล้ว");
      setSnackbarStatus(issuccess);
    } else {
      let errorList: ErrorDetail[] = [];
      setOpenFailAlert(true);
      setTextFail(error.message);
      setPayloadError(null);
      if (error.error_details) {
        const datas: ToteItem[] = error.error_details;
        datas.forEach((item: ToteItem) => {
          if (isErrorCode(item.code)) {
            const _err: ErrorDetail = {
              toteCode: item.toteCode,
              description: item.message,
            };
            errorList.push(_err);
          }
        });
        const header: Header = {
          field1: false,
          field2: true,
          field3: true,
          field4: false,
        };
        const payload: ErrorDetailResponse = {
          header: header,
          error_details: errorList,
        };
        setTextFail("ไม่สามารถปรับสถานะ Tote ดังต่อไปนี้ได้");
        setPayloadError(payload);
      }
    }
    if (issuccess) {
      updateShipmentOrder();
      setTimeout(() => {
        setOpenTote(false);
        onClickClose();
      }, 1000);
    }
    handleOpenLoading("open", false);
  };

  const handleCloseFailAlert = () => {
    setOpenFailAlert(false);
    setTextFail("");
  };

  function handleCloseModelConfirm() {
    setOpenModelConfirm(false);
  }

  function handleNotExitModelConfirm() {
    setConfirmModelExit(false);
  }
  function handleExitModelConfirm() {
    setConfirmModelExit(false);
    setOpenTote(false);
    onClickClose();
  }

  return (
    <div>
      <Dialog open={openTote} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียดตรวจสอบการรับ-โอนสินค้า
          </Typography>
        </BootstrapDialogTitle>

        <DialogContent>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderDetailTote.docRefNo ? orderDetailTote.docRefNo : "-"}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">เลข Tote:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderDetailTote.toteCode}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร SD:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{orderDetailTote.sdNo}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">สถานะ:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {t(`status.${orderDetailTote.sdStatus}`)}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {convertUtcToBkkDate(orderDetailTote.receivedDate)}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">ประเภท:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {getShipmentTypeText(orderDetailTote.sdType)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* DisplayBtn */}
          <Box sx={{ marginTop: 4 }}>
            <Grid
              container
              spacing={2}
              display="flex"
              justifyContent="space-between"
            >
              <Grid item xl={4}>
                {!statusWaitApprove1 && (
                  <Button
                    id="btnPrint"
                    variant="contained"
                    color="secondary"
                    onClick={handlePrintBtn}
                    startIcon={<Print />}
                    className={classes.MbtnPrint}
                    style={{ textTransform: "none" }}
                    sx={{ display: `${statusClosed ? "none" : ""}` }}
                  >
                    พิมพ์ใบผลต่าง
                  </Button>
                )}

                {statusDraft && (
                  <Button
                    id="btnAddItem"
                    variant="contained"
                    color="secondary"
                    onClick={handleClickAddItem}
                    className={classes.MbtnAdd}
                    // sx={{ display: `${!displayBranchGroup ? 'none' : ''}` }}
                    // disabled={newAddItemListArray.length === 0}
                    startIcon={<AddCircleOutlineIcon />}
                    endIcon={<KeyboardArrowDownIcon />}
                  >
                    เพิ่มสินค้า
                  </Button>
                )}

                <StyledMenu
                  id="demo-customized-menu"
                  MenuListProps={{
                    "aria-labelledby": "demo-customized-button",
                  }}
                  anchorEl={anchorEl}
                  open={openDropdown}
                  onClose={handleCloseDropdown}
                >
                  <MenuItem
                    sx={{ color: "#446EF2" }}
                    onClick={handleOpenAddItem}
                  >
                    เพิ่มสินค้า
                  </MenuItem>
                </StyledMenu>
              </Grid>

              <Grid item>
                {statusDraft && (
                  <div>
                    <Button
                      id="btnSave"
                      variant="contained"
                      color="warning"
                      className={classes.MbtnSave}
                      onClick={handleSaveButton}
                      startIcon={<SaveIcon />}
                      style={{ width: 200 }}
                      //   sx={{ display: `${!displayBranchGroup ? 'none' : ''}` }}
                    >
                      บันทึก
                    </Button>

                    <Button
                      id="btnApprove"
                      variant="contained"
                      color="primary"
                      className={classes.MbtnApprove}
                      onClick={handleApproveBtn}
                      startIcon={<CheckCircleOutline />}
                      style={{ width: 200 }}
                      //   sx={{ display: `${!displayBranchGroup ? 'none' : ''}` }}
                    >
                      ยืนยัน
                    </Button>
                  </div>
                )}

                {/* {showApproveBtn && (
                  <Button
                    id="btnClose"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnClose}
                    onClick={handleCloseJobBtn}
                    startIcon={<BookmarkAdded />}
                    sx={{ display: `${!displayBranchGroup ? 'none' : ''}` }}
                  >
                    ปิดงาน
                  </Button>
                )} */}

                {/* {statusOC && statusWaitApprove1 && (
                  <Button
                    id="btnApprove"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnApprove}
                    onClick={handleApproveOCBtn}
                    startIcon={<CheckCircleOutline />}
                    style={{ width: 200 }}
                  >
                    อนุมัติ
                  </Button>
                )} */}
              </Grid>
            </Grid>
          </Box>

          <Box mt={2} bgcolor="background.paper">
            <div
              style={{
                width: "100%",
                height: rowsEntriesTote.length >= 8 ? "70vh" : "auto",
              }}
              className={classes.MdataGridDetail}
            >
              <DataGrid
                rows={rowsEntriesTote}
                columns={columns}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[10, 20, 50, 100]}
                pagination
                disableColumnMenu
                autoHeight={rowsEntriesTote.length >= 8 ? false : true}
                scrollbarSize={10}
                onCellFocusOut={handleEditItems}
                // onCellOut={handleEditItems}
                // onCellKeyDown={handleEditItems}
                // onCellBlur={handleEditItems}
              />
            </div>
          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmOrderShipment
        open={openModelConfirm}
        onClose={handleCloseModelConfirm}
        onUpdateShipmentStatus={handleShowSnackBar}
        shipmentNo={orderDetailTote.docRefNo}
        sdNo={orderDetailTote.sdNo}
        action={action}
        items={itemsDiffState}
        percentDiffType={false}
        percentDiffValue="0"
        // sumDCPercent={sumDCPercent}
        sumActualQty={sumActualQty}
        sumQuantityRef={sumQuantityRef}
        docType={orderDetailTote.docType}
      />

      <ConfirmExitModel
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />

      <ModalShowFile
        open={openModelPreviewDocument}
        onClose={handleModelPreviewDocument}
        url={getPathReportSD(orderDetailTote.sdNo)}
        statusFile={statusFile}
        sdImageFile={
          orderDetailTote.sdImageFile ? orderDetailTote.sdImageFile : ""
        }
        fileName={
          orderDetailTote.sdImageFilename
            ? orderDetailTote.sdImageFilename
            : formatFileName(
                orderDetailTote.sdNo,
                t(`status.${orderDetailTote.sdStatus}`),
              )
        }
        btnPrintName="พิมพ์ใบผลต่าง"
      />

      <ModalAddItemsTote
        open={openModelAddItems}
        onClose={handleModelAddItems}
        requestBody={{
          skuCodes: [],
          skuTypes: [2],
          isSellable: true,
        }}
      ></ModalAddItemsTote>
      <AlertError
        open={openFailAlert}
        onClose={handleCloseFailAlert}
        textError={textFail}
        payload={payloadError}
      />

      <Snackbar
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarStatus}
        contentMsg={contentMsg}
      />

      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}

export default CheckOrderDetailTote;
