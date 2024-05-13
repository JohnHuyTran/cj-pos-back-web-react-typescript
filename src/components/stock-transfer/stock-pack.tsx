import React, { useMemo, useRef, useState } from "react";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridRowData,
  GridRowId,
  GridValueGetterParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import { Box, Button, Grid, Link, TextField, Typography } from "@mui/material";
import { BootstrapDialogTitle } from "../commons/ui/dialog-title";
import DatePickerComponent from "../commons/ui/date-picker-detail";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ControlPoint from "@mui/icons-material/ControlPoint";
import { useStyles } from "../../styles/makeTheme";
import {
  formatFileStockTransfer,
  getBranchName,
  getReasonLabel,
  isOwnBranch,
  numberWithCommas,
} from "../../utils/utils";
import store, { useAppDispatch, useAppSelector } from "../../store/store";
import SnackbarStatus from "../commons/ui/snackbar-status";
import AlertError from "../commons/ui/alert-error";
import LoadingModal from "../commons/ui/loading-modal";
import ConfirmModalExit from "../commons/ui/confirm-exit-model";
import ModalConfirmTransaction from "./modal-confirm-transaction";
import {
  BranchTransferRequest,
  Delivery,
  Item,
} from "../../models/stock-transfer-model";
import {
  getPathReportBT,
  saveBranchTransfer,
  sendBranchTransferToDC,
  sendBranchTransferToPickup,
} from "../../services/stock-transfer";
import moment from "moment";
import { ApiError } from "../../models/api-error-model";
import TextBoxComment from "../commons/ui/textbox-comment";
import Steppers from "./steppers";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import { featchBranchTransferDetailAsync } from "../../store/slices/stock-transfer-branch-request-slice";
import { featchSearchStockTransferAsync } from "../../store/slices/stock-transfer-slice";
import ModalAddItems from "../commons/ui/modal-add-items";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { FindProductRequest } from "../../models/product-model";
import ModalShowFile from "../commons/ui/modal-show-file";
import { parseWithOptions } from "date-fns/fp";
import { BranchInfo } from "../../models/search-branch-model";
import { getUserInfo } from "../../store/sessionStore";
import DatePickerAllComponent from "../commons/ui/date-picker-all";
import { DOCUMENT_TYPE } from "../../utils/enum/stock-transfer-enum";
import { PERMISSION_GROUP } from "../../utils/enum/permission-enum";

interface Props {
  isOpen: boolean;
  onClickClose: () => void;
}

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    minWidth: 70,
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ paddingLeft: "20px" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "barcode",
    headerName: "บาร์โค้ด",
    minWidth: 200,
    flex: 0.7,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "productName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 220,
    flex: 1,
    sortable: false,
    renderCell: (params) => (
      <div>
        <Typography variant="body2">{params.value}</Typography>
        <Typography color="textSecondary" sx={{ fontSize: 12 }}>
          {params.getValue(params.id, "skuCode") || ""}
        </Typography>
      </div>
    ),
  },
  {
    field: "remainStock",
    headerName: "สต๊อกสินค้าคงเหลือ",
    minWidth: 120,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => numberWithCommas(params.value),
  },
  {
    field: "qty",
    headerName: "จำนวนที่สั่ง",
    minWidth: 120,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => numberWithCommas(params.value),
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    minWidth: 110,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "actualQty",
    headerName: "จำนวนโอนจริง",
    minWidth: 120,
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <div>
        <TextField
          variant="outlined"
          name="txnActualQty"
          type="number"
          inputProps={{ style: { textAlign: "right" } }}
          value={params.value}
          onChange={(e) => {
            var qty: any =
              params.getValue(params.id, "qty") &&
              params.getValue(params.id, "qty") !== null &&
              params.getValue(params.id, "qty") != undefined
                ? params.getValue(params.id, "qty")
                : 0;
            var value = e.target.value ? parseInt(e.target.value, 10) : "0";
            var returnQty = Number(params.getValue(params.id, "actualQty"));
            if (returnQty === 0) value = chkReturnQty(value);
            if (value < 0) value = 0;
            params.api.updateRows([{ ...params.row, actualQty: value }]);
          }}
          disabled={params.getValue(params.id, "isDraft") ? false : true}
          autoComplete="off"
        />
      </div>
    ),
  },
  {
    field: "unitFactor",
    headerName: "จัด(ชิ้น)",
    minWidth: 120,
    headerAlign: "center",
    sortable: false,
    align: "right",
    renderCell: (params: GridRenderCellParams) =>
      numberWithCommas(calUnitFactor(params)),
  },
  {
    field: "toteCode",
    headerName: "เลข Tote/ลัง",
    minWidth: 120,
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txbToteCode"
        inputProps={{ style: { textAlign: "right" } }}
        value={params.value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const cursorStart = e.target.selectionStart;
          const cursorEnd = e.target.selectionEnd;
          params.api.updateRows([{ ...params.row, toteCode: e.target.value }]);
          e.target.setSelectionRange(cursorStart, cursorEnd);
        }}
        disabled={params.getValue(params.id, "isDraft") ? false : true}
        autoComplete="off"
      />
    ),
  },
  {
    field: "boNo",
    headerName: "เลขที่ BO",
    minWidth: 200,
    flex: 0.7,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
];
var calUnitFactor = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "actualQty")) *
    Number(params.getValue(params.id, "baseUnit"));
  return diff;
};

function useApiRef() {
  const apiRef = useGridApiRef();
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "",
        width: 0,
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

const chkReturnQty = (value: any) => {
  let v = String(value);
  if (v.substring(1) === "0") return Number(v.substring(0, 1));
  return value;
};
function StockPackChecked({ isOpen, onClickClose }: Props) {
  const classes = useStyles();
  const _ = require("lodash");
  const { apiRef, columns } = useApiRef();
  const dispatch = useAppDispatch();
  const branchTransferRslList = useAppSelector(
    (state) => state.branchTransferDetailSlice.branchTransferRs,
  );
  const reasonsList = useAppSelector(
    (state) => state.transferReasonsList.reasonsList.data,
  );
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const payloadSearch = useAppSelector(
    (state) => state.saveSearchStock.searchStockTransfer,
  );

  const branchTransferInfo: any = branchTransferRslList.data
    ? branchTransferRslList.data
    : null;
  const [branchTransferItems, setBranchTransferItems] = React.useState<Item[]>(
    branchTransferInfo.items ? branchTransferInfo.items : [],
  );
  const [openModelConfirmTransaction, setOpenModelConfirmTransaction] =
    React.useState(false);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const [cols, setCols] = React.useState(columns);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [open, setOpen] = React.useState(isOpen);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [sourceBranch, setSourceBranch] = React.useState("");
  const [destinationBranch, setDestinationBranch] = React.useState("");
  const [btNo, setBtNo] = React.useState("");
  const [btStatus, setBtStatus] = React.useState<string>("CREATED");
  const [reasons, setReasons] = React.useState("");
  const [isDraft, setIsDraft] = React.useState(false);
  const [isDC, setIsDC] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const handleChangeComment = (value: any) => {
    storeItem();
    setComment(value);
  };

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const [openModelPreviewDocument, setOpenModelPreviewDocument] =
    React.useState(false);
  const [pathReport, setPathReport] = React.useState<string>("");
  const [suffixDocType, setSuffixDocType] = React.useState<string>("");
  const [docLayoutLandscape, setDocLayoutLandscape] = React.useState(false);
  const [isClickBtnApprove, setIsClickBtnApprove] = React.useState(false);
  React.useEffect(() => {
    const fromBranch = getBranchName(branchList, branchTransferInfo.branchFrom);
    setSourceBranch(fromBranch ? fromBranch : "");

    const toBranch = getBranchName(branchList, branchTransferInfo.branchTo);
    setDestinationBranch(toBranch ? toBranch : "");

    const reason = getReasonLabel(
      reasonsList,
      branchTransferInfo.transferReason,
    );
    setReasons(reason ? reason : "");
    setBtNo(branchTransferInfo.btNo);
    setBtStatus(branchTransferInfo.status);
    if (!isClickBtnApprove) {
      setComment(branchTransferInfo.comment);
    }

    setIsDraft(branchTransferInfo.status === "CREATED" ? true : false);
    setIsDC(getUserInfo().group === PERMISSION_GROUP.DC);

    let newColumns = [...cols];
    if (branchTransferInfo.status != "CREATED") {
      newColumns[9]["hide"] = false;
    } else {
      newColumns[9]["hide"] = true;
    }
    setStartDate(new Date(branchTransferInfo.startDate));
    setEndDate(new Date(branchTransferInfo.endDate));
    storeItemAddItem(payloadAddItem);
  }, [open, payloadAddItem, branchTransferInfo]);

  if (endDate != null && startDate != null) {
    const _startDate = moment(startDate).startOf("day").toISOString();
    const _endDate = moment(endDate).startOf("day").toISOString();
    if (_endDate < _startDate) {
      setEndDate(null);
    }
  }

  function handleNotExitModelConfirm() {
    setConfirmModelExit(false);
  }

  function handleExitModelConfirm() {
    setConfirmModelExit(false);
    setOpen(false);
    onClickClose();
  }

  const handleOnCloseModalConfirm = () => {
    setOpenModelConfirmTransaction(false);
  };

  const mappingPayload = () => {
    let items: Item[] = [];
    const rowsEdit: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
    rowsEdit.forEach((data: GridRowData) => {
      const item: Item = {
        seqItem: data.seqItem,
        barcode: data.barcode,
        actualQty: data.actualQty,
        toteCode: data.toteCode,
      };
      items.push(item);
    });

    const payload: BranchTransferRequest = {
      comment: comment,
      items: items,
      btNo: btNo,
    };
    return payload;
  };

  let rows = branchTransferItems.map((item: Item, index: number) => {
    return {
      id: `${item.barcode}-${index + 1}`,
      index: index + 1,
      seqItem: item.seqItem,
      barcode: item.barcode,
      productName: item.productName,
      skuCode: item.skuCode,
      baseUnit: item.barFactor ? item.barFactor : 0,
      unitName: item.unitName,
      remainStock: 0,
      qty: item.orderQty ? item.orderQty : 0,
      actualQty: item.actualQty ? item.actualQty : 0,
      toteCode: item.toteCode,
      isDraft: isDraft,
      boNo: item.boNo,
    };
  });

  const validateItem = () => {
    setComment(comment);
    const rowsEdit: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
    let itemNotValid: boolean = false;
    rowsEdit.forEach((data: GridRowData) => {
      if (!data.toteCode && data.actualQty > 0) {
        itemNotValid = true;
        setTextError("กรุณาระบุเลขที่ Tote/ลัง");
        setComment(comment);
        return;
      }
      if (data.toteCode && data.actualQty <= 0) {
        itemNotValid = true;
        setTextError("จำนวนโอนจริงเป็น 0 ไม่ต้องระบุเลขที่ Tote/ลัง ");
        setComment(comment);
        return;
      }
    });

    const list = _.uniqBy(branchTransferItems, "skuCode");
    list.forEach((l: any) => {
      let sumActual: any = branchTransferItems
        .filter((item: Item) => item.skuCode === l.skuCode)
        .reduce(
          (total, item: Item) =>
            total + Number(calBaseUnit(item.actualQty, item.barFactor)),
          0,
        );

      let sumQty: any = branchTransferItems
        .filter((item: Item) => item.skuCode === l.skuCode)
        .reduce(
          (total, item: Item) =>
            total + Number(calBaseUnit(item.orderQty, item.barFactor)),
          0,
        );
      if (sumActual < sumQty && !comment) {
        itemNotValid = true;
        setTextError("กรุณาระบุสาเหตุการเปลี่ยนจำนวน");
        setComment(comment);
        return;
      }
    });
    if (itemNotValid) {
      setOpenAlert(true);
      return false;
    } else {
      setOpenAlert(false);
      return true;
    }
  };

  function calBaseUnit(qty: any, baseUnit: any): Number {
    return Number(qty ? qty : 0) * Number(baseUnit ? baseUnit : 0);
  }

  const [bodyRequest, setBodyRequest] = useState<FindProductRequest>();
  const getSkuList = () => {
    const list = _.uniqBy(branchTransferItems, "skuCode");
    const skucodeList: string[] = [];
    list.map((i: any) => {
      skucodeList.push(i.skuCode);
    });
    const payload: FindProductRequest = {
      skuCodes: skucodeList,
    };
    setBodyRequest(payload);
  };

  const storeItem = () => {
    setComment(comment);
    const rowsEdit: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
    const items: Item[] = [];
    rowsEdit.forEach((data: GridRowData) => {
      const newData: Item = {
        seqItem: data.seqItem,
        barcode: data.barcode,
        productName: data.productName,
        skuCode: data.skuCode,
        barFactor: data.barFactor,
        unitName: data.unitName,
        // remainStock: data.remainStock,
        orderQty: data.qty,
        actualQty: data.actualQty,
        toteCode: data.toteCode,
        // isDraft: isDraft,
        boNo: data.boNo,
      };
      items.push(newData);
    });
    setBranchTransferItems(items);
  };

  const storeItemAddItem = (_newItem: any) => {
    const items: Item[] = [];
    let _items = [...branchTransferItems];
    if (Object.keys(_newItem).length !== 0) {
      _newItem.map((data: any, index: number) => {
        let indexDup = 0;
        const dupItem: any = branchTransferItems.find(
          (item: Item, index: number) => {
            indexDup = index;
            return item.barcode === data.barcode;
          },
        );
        if (dupItem) {
          const newData: Item = {
            seqItem: dupItem.seqItem,
            barcode: dupItem.barcode,
            productName: dupItem.productName,
            skuCode: dupItem.skuCode,
            barFactor: dupItem.barFactor,
            unitName: dupItem.unitName,
            // remainStock: dupItem.remainStock,
            orderQty: dupItem.qty,
            actualQty: dupItem.actualQty + data.qty,
            toteCode: dupItem.toteCode,
            // isDraft: isDraft,
            boNo: dupItem.boNo,
          };
          _.remove(_items, function (item: Item) {
            return item.barcode === data.barcode;
          });
          _items = [..._items, newData];
        } else {
          const newData: Item = {
            seqItem: 0,
            barcode: data.barcode,
            productName: data.barcodeName,
            skuCode: data.skuCode,
            barFactor: data.barFactor,
            unitName: data.unitName,
            // remainStock: 0,
            orderQty: 0,
            actualQty: data.qty,
            toteCode: "",
            // isDraft: isDraft,
          };
          _items = [..._items, newData];
        }
      });
    }
    setBranchTransferItems(_items);
  };

  const handleClose = async () => {
    await storeItem();
    let showPopup = false;
    if (comment !== branchTransferInfo.comment) {
      showPopup = true;
    }
    // const rowSelect = apiRef.current.getSelectedRows();
    // if (rowSelect.size > 0) {
    //   showPopup = true;
    // }
    const ent: Item[] = branchTransferInfo.items;
    const rowsEdit: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
    if (rowsEdit.size != ent.length) {
      showPopup = true;
    } else {
      rowsEdit.forEach((data: GridRowData) => {
        const item = ent.find((item: Item) => {
          return item.barcode === data.barcode;
        });
        if (!item) {
          showPopup = true;
          return;
        }
        if (
          data.actualQty !== (item.actualQty ? item.actualQty : 0) ||
          data.toteCode != item.toteCode
        ) {
          showPopup = true;
          return;
        }
      });
    }

    if (!showPopup) {
      setOpen(false);
      onClickClose();
    } else {
      setConfirmModelExit(true);
    }
  };

  const handleSaveBtn = async () => {
    setOpenLoadingModal(true);
    await storeItem();
    await dispatch(updateAddItemsState({}));
    const isvalidItem = validateItem();
    if (isvalidItem) {
      const payload: BranchTransferRequest = await mappingPayload();
      await saveBranchTransfer(payload)
        .then(async (value) => {
          setBtNo(value.docNo);
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
          await dispatch(featchBranchTransferDetailAsync(value.docNo));
          await dispatch(featchSearchStockTransferAsync(payloadSearch));

          const _branchTransferRslList =
            store.getState().branchTransferDetailSlice.branchTransferRs;
          const _branchTransferInfo: any = _branchTransferRslList.data
            ? _branchTransferRslList.data
            : null;
          setBranchTransferItems(_branchTransferInfo.items);
          // await storeItem();
        })
        .catch((error: ApiError) => {
          setShowSnackBar(true);
          setSnackbarIsStatus(false);
          setContentMsg(error.message);
        });
    }
    setOpenLoadingModal(false);
  };
  const handleConfirmBtn = async () => {
    setIsClickBtnApprove(true);
    await storeItem();
    await dispatch(updateAddItemsState({}));
    const isvalidItem = validateItem();
    if (isvalidItem) {
      if (!btNo) {
        const payload: BranchTransferRequest = await mappingPayload();
        await saveBranchTransfer(payload)
          .then(async (value) => {
            setBtNo(value.btNo);
            setOpenModelConfirmTransaction(true);
          })
          .catch((error: ApiError) => {
            setShowSnackBar(true);
            setSnackbarIsStatus(false);
            setContentMsg(error.message);
          });
      } else {
        setOpenModelConfirmTransaction(true);
      }
    }
  };

  const sendTransactionToDC = async () => {
    const payload: BranchTransferRequest = await mappingPayload();
    await sendBranchTransferToDC(payload)
      .then(async (value) => {
        handleOnCloseModalConfirm();
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณส่งรายการให้ DC เรียบร้อยแล้ว");
        await dispatch(featchSearchStockTransferAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onClickClose();
        }, 500);
      })
      .catch((error: ApiError) => {
        handleOnCloseModalConfirm();
        setShowSnackBar(true);
        setSnackbarIsStatus(false);
        setContentMsg(error.message);
      });
    handleOnCloseModalConfirm();
    setOpenLoadingModal(false);
  };

  const sendToPickup = async () => {
    setOpenLoadingModal(true);
    if (startDate === null || endDate === null) {
      setOpenAlert(true);
      setTextError("กรุณาระบุรอบรถเข้าต้นทาง");
    } else {
      const _dalivery: Delivery = {
        fromDate: moment(startDate).startOf("day").toISOString(),
        toDate: moment(endDate).startOf("day").toISOString(),
      };
      const payload: BranchTransferRequest = {
        btNo: btNo,
        delivery: _dalivery,
      };
      await sendBranchTransferToPickup(payload)
        .then(async (value) => {
          handleOnCloseModalConfirm();
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("คุณบันทึกรอบรถเข้าต้นทางเรียบร้อยแล้ว");
          await dispatch(featchBranchTransferDetailAsync(btNo));
          await dispatch(featchSearchStockTransferAsync(payloadSearch));
          // setTimeout(() => {
          //   setOpen(false);
          //   onClickClose();
          // }, 500);
        })
        .catch((error: ApiError) => {
          handleOnCloseModalConfirm();
          setShowSnackBar(true);
          setSnackbarIsStatus(false);
          setContentMsg(error.message);
        });
    }

    // handleOnCloseModalConfirm();
    setOpenLoadingModal(false);
  };

  const currentlySelected = () => {
    storeItem();
  };

  const onCellFocusOut = async (params: GridCellParams) => {
    storeItem();
  };

  const handleOpenAddItems = async () => {
    await storeItem();
    await dispatch(updateAddItemsState({}));
    await getSkuList();
    setOpenModelAddItems(true);
  };

  const handleModelAddItems = async () => {
    setOpenModelAddItems(false);
  };

  const handleLinkDocument = (docType: string) => {
    const path = getPathReportBT(docType ? docType : DOCUMENT_TYPE.BT, btNo);
    setSuffixDocType(docType !== DOCUMENT_TYPE.BT ? docType : "");
    setPathReport(path ? path : "");
    setDocLayoutLandscape(docType === DOCUMENT_TYPE.RECALL ? true : false);
    setOpenModelPreviewDocument(true);
  };

  const handleStartDatePicker = (value: any) => {
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };

  function handleModelPreviewDocument() {
    setOpenModelPreviewDocument(false);
  }

  return (
    <React.Fragment>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          <Typography sx={{ fontSize: 24, fontWeight: 400 }}>
            ตรวจสอบรายการใบโอน
          </Typography>
          <Steppers status={branchTransferInfo.status} type="BT"></Steppers>
        </BootstrapDialogTitle>
        <DialogContent>
          <Box mt={4} sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} mb={2}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร BT</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {branchTransferInfo.btNo}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร RT</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {branchTransferInfo.rtNo}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
            </Grid>
            <Grid container spacing={2} mb={2}>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่โอน :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {convertUtcToBkkDate(branchTransferInfo.startDate)}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่สิ้นสุด :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {convertUtcToBkkDate(branchTransferInfo.endDate)}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
            </Grid>

            <Grid container spacing={2} mb={2}>
              <Grid item lg={2}>
                <Typography variant="body2"> สาขาต้นทาง :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">{sourceBranch} </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
              <Grid item lg={2}>
                <Typography variant="body2">สาขาปลายทาง :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">{destinationBranch} </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
            </Grid>

            {isDraft && (
              <Grid container spacing={2} mb={2}>
                <Grid item lg={2}>
                  <Typography variant="body2"> สาเหตุการโอน :</Typography>
                </Grid>
                <Grid item lg={3}>
                  <Typography variant="body2">{reasons} </Typography>
                </Grid>
                <Grid item lg={1}></Grid>
                <Grid item lg={2}></Grid>
                <Grid item lg={3}>
                  <>
                    <Box>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={(e) => {
                          handleLinkDocument(DOCUMENT_TYPE.BT);
                        }}
                      >
                        เรียกดูเอกสารใบโอน BT
                      </Link>
                    </Box>
                  </>
                </Grid>
                <Grid item lg={1}></Grid>
              </Grid>
            )}

            {/* {!isDraft && !isDC && ( */}
            {!isDraft && (
              <Grid container spacing={2} mb={2}>
                <Grid item lg={2}>
                  <Typography variant="body2"> สาเหตุการโอน :</Typography>
                </Grid>
                <Grid item lg={3}>
                  <Typography variant="body2">{reasons} </Typography>
                </Grid>
                <Grid item lg={1}></Grid>
                <Grid item lg={2}></Grid>
                <Grid item lg={3}>
                  <>
                    <Box>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={(e) => {
                          handleLinkDocument(DOCUMENT_TYPE.BT);
                        }}
                      >
                        เรียกดูเอกสารใบโอน BT
                      </Link>
                    </Box>
                    <Box>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={(e) => {
                          handleLinkDocument(DOCUMENT_TYPE.BO);
                        }}
                      >
                        เรียกดูเอกสารใบ BO
                      </Link>
                    </Box>
                    <Box>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={(e) => {
                          handleLinkDocument(DOCUMENT_TYPE.BOX);
                        }}
                      >
                        เรียกดูเอกสารใบปะลัง
                      </Link>
                    </Box>
                  </>
                </Grid>
                <Grid item lg={1}></Grid>
              </Grid>
            )}
          </Box>
          {isDraft && (
            <Grid
              item
              container
              xs={12}
              sx={{ mt: 3 }}
              justifyContent="space-between"
              direction="row"
              alignItems="flex-end"
            >
              <Grid item xl={5}>
                <Button
                  id="btnAddItem"
                  variant="contained"
                  color="info"
                  className={classes.MbtnPrint}
                  onClick={handleOpenAddItems}
                  startIcon={<ControlPoint />}
                  sx={{ width: 200 }}
                >
                  เพิ่มสินค้า
                </Button>
              </Grid>
              <Grid item>
                <Button
                  id="btnSave"
                  variant="contained"
                  color="warning"
                  className={classes.MbtnSave}
                  onClick={handleSaveBtn}
                  startIcon={<SaveIcon />}
                  sx={{ width: 200 }}
                >
                  บันทึก
                </Button>

                <Button
                  id="btnApprove"
                  variant="contained"
                  color="primary"
                  className={classes.MbtnApprove}
                  onClick={handleConfirmBtn}
                  startIcon={<CheckCircleOutline />}
                  sx={{ width: 200 }}
                >
                  ส่งงานให้ DC
                </Button>
              </Grid>
            </Grid>
          )}

          {isDC && btStatus === "READY_TO_TRANSFER" && (
            <Grid
              item
              container
              xs={12}
              sx={{ mt: 3 }}
              justifyContent="space-between"
              direction="row"
              alignItems="flex-end"
            >
              <Grid item xl={8}>
                <Grid container>
                  <Grid item>
                    <Typography
                      gutterBottom
                      variant="subtitle1"
                      component="div"
                    >
                      รอบรถเข้าต้นทางตั้งแต่
                    </Typography>
                    <DatePickerAllComponent
                      onClickDate={handleStartDatePicker}
                      value={startDate}
                      type={"TO"}
                      minDateTo={new Date(branchTransferInfo.startDate)}
                    />
                  </Grid>
                  <Grid item xs={1}></Grid>
                  <Grid item>
                    <Typography
                      gutterBottom
                      variant="subtitle1"
                      component="div"
                    >
                      ถึง
                    </Typography>
                    <DatePickerAllComponent
                      onClickDate={handleEndDatePicker}
                      value={endDate}
                      type={"TO"}
                      minDateTo={startDate}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Button
                  id="btnSave"
                  variant="contained"
                  color="warning"
                  className={classes.MbtnSave}
                  onClick={sendToPickup}
                  startIcon={<SaveIcon />}
                  sx={{ width: 200 }}
                >
                  บันทึก
                </Button>
              </Grid>
            </Grid>
          )}
          {isDC && btStatus === "WAIT_FOR_PICKUP" && (
            <>
              <Grid container spacing={2} mb={2}>
                <Grid item lg={2}>
                  <Typography variant="body2"> รอบรถเข้าต้นทาง :</Typography>
                </Grid>
                <Grid item lg={3}>
                  <Typography variant="body2">
                    {convertUtcToBkkDate(branchTransferInfo.delivery.fromDate)}{" "}
                  </Typography>
                </Grid>
                <Grid item lg={1}></Grid>
                <Grid item lg={2}>
                  <Typography variant="body2">ถึง :</Typography>
                </Grid>
                <Grid item lg={3}>
                  <Typography variant="body2">
                    {convertUtcToBkkDate(branchTransferInfo.delivery.toDate)}{" "}
                  </Typography>
                </Grid>
                <Grid item lg={1}></Grid>
              </Grid>

              <Grid container spacing={2} mb={2}>
                <Grid item lg={2}></Grid>
                <Grid item lg={3}></Grid>
                <Grid item lg={1}></Grid>
                <Grid item lg={2}></Grid>
                <Grid item lg={3}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                      handleLinkDocument(DOCUMENT_TYPE.RECALL);
                    }}
                  >
                    เรียกดูเอกสารใบเรียกเก็บ
                  </Link>
                </Grid>
                <Grid item lg={1}></Grid>
              </Grid>
            </>
          )}
          <Box mt={2} bgcolor="background.paper">
            <div
              style={{
                width: "100%",
                height: rows.length >= 8 ? "70vh" : "auto",
              }}
              className={classes.MdataGridDetail}
            >
              <DataGrid
                rows={rows}
                columns={cols}
                // disableSelectionOnClick
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[10, 20, 50, 100]}
                pagination
                disableColumnMenu
                autoHeight={rows.length >= 8 ? false : true}
                scrollbarSize={10}
                rowHeight={65}
                onCellClick={currentlySelected}
                // onCellFocusOut={onCellFocusOut}
              />
            </div>
          </Box>
          <Box mt={3}>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={4}>
                <TextBoxComment
                  fieldName="สาเหตุการเปลี่ยนจำนวน:"
                  defaultValue={comment}
                  maxLength={100}
                  onChangeComment={handleChangeComment}
                  isDisable={!isDraft}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />

      <ConfirmModalExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />

      <ModalConfirmTransaction
        open={openModelConfirmTransaction}
        onClose={handleOnCloseModalConfirm}
        handleConfirm={sendTransactionToDC}
        header="ยืนยันส่งรายการให้ DC"
        title="เลขที่เอกสาร BT"
        value={btNo}
      />

      <ModalAddItems
        open={openModelAddItems}
        onClose={handleModelAddItems}
        requestBody={bodyRequest ? bodyRequest : { skuCodes: [] }}
      ></ModalAddItems>
      <LoadingModal open={openLoadingModal} />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />

      <ModalShowFile
        open={openModelPreviewDocument}
        onClose={handleModelPreviewDocument}
        url={pathReport}
        statusFile={1}
        sdImageFile={""}
        fileName={formatFileStockTransfer(btNo, btStatus, suffixDocType)}
        btnPrintName="พิมพ์เอกสาร"
        landscape={docLayoutLandscape}
      />
    </React.Fragment>
  );
}

export default StockPackChecked;
