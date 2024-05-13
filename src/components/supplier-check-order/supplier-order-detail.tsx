import React, { ReactElement, useEffect, useMemo } from "react";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import {
  Button,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  TextField,
} from "@mui/material";
import {
  CheckCircleOutline,
  ControlPoint,
  DeleteForever,
  HighlightOff,
} from "@mui/icons-material";
import { Box } from "@mui/system";
import Steppers from "../commons/ui/steppers";
import SaveIcon from "@mui/icons-material/Save";
import { useStyles } from "../../styles/makeTheme";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiRef,
  GridRowId,
  GridRowData,
  GridValueGetterParams,
  GridCellParams,
  GridEditCellValueParams,
} from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  SavePurchaseRequest,
  FileType,
  CalculatePurchasePIRequest,
} from "../../models/supplier-check-order-model";
import LoadingModal from "../commons/ui/loading-modal";
import { ApiError } from "../../models/api-error-model";
import {
  calculateSupplierPI,
  deleteSupplierPI,
  delFileUrlHuawei,
  getPathReportPI,
  saveSupplierOrder,
} from "../../services/purchase";
import { featchSupplierOrderDetailAsync } from "../../store/slices/supplier-order-detail-slice";
import { featchOrderListSupAsync } from "../../store/slices/supplier-check-order-slice";
import SnackbarStatus from "../commons/ui/snackbar-status";
import ConfirmModelExit from "../commons/ui/confirm-exit-model";
import ModelConfirm from "./modal-confirm";
import theme from "../../styles/theme";
import ModalAddItem from "./modal-add-items";
import ModelDeleteConfirm from "./modal-delete-confirm";
import { updateItemsState } from "../../store/slices/supplier-add-items-slice";
import { featchItemBySupplierListAsync } from "../../store/slices/products/search-item-by-supplier-slice";
import ModalShowFile from "../commons/ui/modal-show-file";
import { formatFileNam } from "../../utils/enum/supplier-order-enum";
import AlertError from "../commons/ui/alert-error";
import { uploadFileState } from "../../store/slices/upload-file-slice";
import AccordionHuaweiFile from "../commons/ui/accordion-huawei-file";
import AccordionUploadFile from "../commons/ui/accordion-upload-file";

interface Props {
  isOpen: boolean;
  onClickClose: () => void;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
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

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 80,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ paddingLeft: "20px" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "barCode",
    headerName: "บาร์โค้ด",
    minWidth: 190,
    // flex: 0.7,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "productName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 210,
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
    field: "unitName",
    headerName: "หน่วย",
    width: 90,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "qty",
    headerName: "จำนวนที่สั่ง",
    width: 100,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => numberWithCommas(params.value),
  },
  {
    field: "actualQty",
    headerName: "จำนวนที่รับ",
    width: 110,
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
          let actualQty = Number(params.getValue(params.id, "actualQty"));
          let value = e.target.value ? parseInt(e.target.value, 10) : "";
          if (actualQty === 0) value = chkActualQty(value);
          if (value < 0) value = 0;
          var qty = Number(params.getValue(params.id, "qty"));
          var piType = Number(params.getValue(params.id, "piType"));
          if (piType === 0 && value > qty) value = qty;
          params.api.updateRows([{ ...params.row, actualQty: value }]);
        }}
        disabled={isDisable(params) ? true : false}
        autoComplete="off"
      />
    ),
  },
  {
    field: "productDifference",
    headerName: "ส่วนต่างการรับ",
    width: 140,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => calProductDiff(params),
  },
  {
    field: "setPrice",
    headerName: "ราคาต่อหน่วย",
    width: 135,
    headerAlign: "center",
    align: "right",
    sortable: false,
  },
  {
    field: "sumPrice",
    headerName: "รวม",
    width: 140,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => params.value,
  },
  {
    field: "delete",
    headerName: " ",
    width: 30,
    minWidth: 0,
    align: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <div>
        {params.getValue(params.id, "piType") === 0 && <div></div>}
        {params.getValue(params.id, "piType") === 1 &&
          params.getValue(params.id, "piStatus") === 1 && <div></div>}
        {params.getValue(params.id, "piType") === 1 &&
          params.getValue(params.id, "piStatus") === 0 && (
            <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
          )}
      </div>
    ),
  },
];

var chkActualQty = (value: any) => {
  let v = String(value);
  if (v.substring(1) === "0") return Number(v.substring(0, 1));
  return value;
};

const numberWithCommas = (num: any) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var calProductDiff = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "actualQty")) -
    Number(params.getValue(params.id, "qty"));

  if (diff > 0)
    return (
      <label style={{ color: "#446EF2", fontWeight: 700 }}>
        {" "}
        +{numberWithCommas(diff)}{" "}
      </label>
    );
  if (diff < 0)
    return (
      <label style={{ color: "#F54949", fontWeight: 700 }}>
        {" "}
        {numberWithCommas(diff)}{" "}
      </label>
    );
  return diff;
};
const isDisable = (params: GridRenderCellParams) => {
  let piStatus = params.getValue(params.id, "piStatus");
  if (piStatus === 0) return false;
  else if (piStatus === 1 || piStatus === 9) return true;
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

function SupplierOrderDetail({ isOpen, onClickClose }: Props): ReactElement {
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(isOpen);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const [flagSave, setFlagSave] = React.useState(false);

  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);

  const handleClose = async () => {
    let exit = false;
    if (comment !== purchaseDetail.comment || billNo !== purchaseDetail.billNo)
      exit = true;

    if (fileUploadList.length > 0) {
      exit = true;
    }

    if (rows.length !== purchaseDetailItems.length) exit = true;
    if (rows.length > 0 && flagSave) exit = true;

    if (!exit) {
      await dispatch(updateItemsState({}));
      await dispatch(uploadFileState([]));
      setOpen(false);
      onClickClose();
    } else if (exit) {
      setConfirmModelExit(true);
    }
  };

  // const [chkSetState, setChkSetState] = React.useState(false);
  const handleUpdateRowState = async () => {
    if (rows.length > 0) {
      const rowsEdit: Map<GridRowId, GridRowData> =
        apiRef.current.getRowModels();
      const itemsList: any = [];
      rowsEdit.forEach((data: GridRowData) => {
        const amountText: any = {
          unitPrice: data.setPrice,
          sumPrice: data.sumPrice,
        };

        const item: any = {
          id: data.index,
          barcode: data.barCode,
          unitName: data.unitName,
          productName: data.productName,
          qty: data.qty,
          actualQty: data.actualQty,
          skuCode: data.skuCode,
          amountText: amountText,
        };

        itemsList.push(item);
      });
      // setChkSetState(true);
      await dispatch(updateItemsState(itemsList));
    }
  };

  function handleNotExitModelConfirm() {
    setConfirmModelExit(false);
  }

  const handleExitModelConfirm = async () => {
    await dispatch(updateItemsState({}));
    await dispatch(uploadFileState([]));
    setConfirmModelExit(false);
    setOpen(false);
    onClickClose();
  };

  useEffect(() => {
    setOpen(isOpen);
    setsSupplierCode(purchaseDetail.supplierCode);
    setBillNo(purchaseDetail.billNo);
    setPiNo(purchaseDetail.piNo);
    setPiType(purchaseDetail.piType);
    setPiStatus(purchaseDetail.piStatus);
    setComment(purchaseDetail.comment);
    setCharacterCount(purchaseDetail.comment.length);
    setFiles(purchaseDetail.files ? purchaseDetail.files : []);

    if (purchaseDetail.piType === 1 && purchaseDetail.piStatus === 0) {
      dispatch(featchItemBySupplierListAsync(purchaseDetail.supplierCode));
    }
    if (purchaseDetail.piStatus === 1 || purchaseDetail.piStatus === 9) {
      setTotalAmount(purchaseDetail.amountText.totalAmount);
      setVat(purchaseDetail.amountText.vat);
      setVatRate(purchaseDetail.amountText.vatRate);
      setGrandTotalAmount(purchaseDetail.amountText.grandTotalAmount);
      setRoundAmount(purchaseDetail.amountText.roundAmount);
    }
  }, [open, fileUploadList]);

  const saveStateRows = async () => {
    if (rows.length > 0) {
      const rowsEdit: Map<GridRowId, GridRowData> =
        apiRef.current.getRowModels();
      const itemsList: any = [];
      rowsEdit.forEach((data: GridRowData) => {
        itemsList.push(data);
      });
      if (itemsList.length > 0) updateStateRows(itemsList);
    }
  };
  const updateStateRows = async (items: any) => {
    await dispatch(updateItemsState(items));
  };

  let purchaseDetailList = useAppSelector(
    (state) => state.supplierOrderDetail.purchaseDetail,
  );
  const purchaseDetail: any = purchaseDetailList.data
    ? purchaseDetailList.data
    : null;
  const purchaseDetailItems = purchaseDetail.entries
    ? purchaseDetail.entries
    : [];
  const payloadAddItem = useAppSelector(
    (state) => state.supplierAddItems.state,
  );

  // console.log('purchaseDetail.files: ', purchaseDetail.files);

  const [deleteItems, setDeleteItems] = React.useState(false);
  if (Object.keys(payloadAddItem).length === 0 && !deleteItems) {
    updateStateRows(purchaseDetailItems);
  }
  const [supplierCode, setsSupplierCode] = React.useState("");
  const [billNo, setBillNo] = React.useState("");
  const [errorBillNo, setErrorBillNo] = React.useState(false);
  const [piNo, setPiNo] = React.useState("");
  const [piType, setPiType] = React.useState(0);
  const [piStatus, setPiStatus] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [vat, setVat] = React.useState(0);
  const [vatRate, setVatRate] = React.useState(0);
  const [grandTotalAmount, setGrandTotalAmount] = React.useState(0);
  const [roundAmount, setRoundAmount] = React.useState(0);
  const [flagCalculate, setFlagCalculate] = React.useState(false);

  const setItemCal = async () => {
    if (rows.length > 0) {
      const itemsList: any = [];
      await rows.forEach((data: GridRowData) => {
        const item: any = {
          barcode: data.barCode,
          actualQty: data.actualQty,
        };
        itemsList.push(item);
      });
      if (itemsList.length > 0) calculateItems(itemsList);
    }
  };

  const [files, setFiles] = React.useState<FileType[]>([
    // { fileKey: 'key.jpg', fileName: 'new-image.jpg', mimeType: 'image/jpeg' },
    // { fileKey: 'SD21120002-000014-Draft.pdf', fileName: 'new-document.pdf', mimeType: 'application/pdf' },
  ]);

  let rows: any = [];
  if (Object.keys(payloadAddItem).length !== 0) {
    rows = payloadAddItem.map((item: any, index: number) => {
      let barcode = item.barCode ? item.barCode : item.barcode;
      let setPrice = item.setPrice ? item.setPrice : 0;
      let sumPrice = item.sumPrice ? item.sumPrice : 0;
      if (item.amountText) {
        setPrice = item.amountText.setPrice
          ? item.amountText.setPrice
          : item.amountText.unitPrice
            ? item.amountText.unitPrice
            : 0;
        sumPrice = item.amountText.sumPrice ? item.amountText.sumPrice : 0;
      }

      return {
        id: `${barcode}-${index + 1}`,
        index: index + 1,
        seqItem: item.seqItem,
        isControlStock: item.isControlStock,
        isAllowDiscount: item.isAllowDiscount,
        skuCode: item.skuCode,
        barCode: barcode,
        productName: item.productName ? item.productName : item.barcodeName,
        unitCode: item.unitCode,
        unitName: item.unitName,
        qty: item.qty ? item.qty : 0,
        qtyAll: item.qtyAll,
        controlPrice: item.controlPrice,
        salePrice: item.salePrice,
        setPrice: setPrice,
        sumPrice: sumPrice,
        actualQty: item.actualQty ? item.actualQty : 0,
        piType: piType,
        piStatus: piStatus,
      };
    });
  }

  if (rows.length === 0) {
    if (totalAmount !== 0) setTotalAmount(0);
    if (vat !== 0) setVat(0);
    if (vatRate !== 0) setVatRate(0);
    if (grandTotalAmount !== 0) setGrandTotalAmount(0);
    if (roundAmount !== 0) setRoundAmount(0);
  }

  if (purchaseDetail.piStatus === 0) {
    if (!flagCalculate && rows.length > 0) {
      setItemCal();
      setFlagCalculate(true);
    }
  }

  const classes = useStyles();
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [characterCount, setCharacterCount] = React.useState(0);
  const maxCommentLength = 255;
  const handleChangeComment = (event: any) => {
    handleUpdateRowState();
    const value = event.target.value;
    const length = event.target.value.length;
    if (length <= maxCommentLength) {
      setCharacterCount(event.target.value.length);
      setComment(value);
    }
  };

  const handleChangeBillNo = (event: any) => {
    handleUpdateRowState();
    const value = event.target.value;
    setBillNo(value);
    setErrorBillNo(false);
  };

  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const { apiRef, columns } = useApiRef();
  const payloadSearch = useAppSelector(
    (state) => state.saveSearchOrderSup.searchCriteria,
  );
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [titleConfirm, setTitleConfirm] = React.useState("");
  const [actionConfirm, setActionConfirm] = React.useState("");
  const [items, setItems] = React.useState<any>([]);
  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);

  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const handleModelConfirm = () => {
    setOpenModelConfirm(false);
  };

  const handlConfirmButton = async () => {
    handleUpdateRowState();
    let fileLength = false;
    let purcheaseFiles = purchaseDetail.files ? purchaseDetail.files : [];
    if (purcheaseFiles.length > 0) {
      fileLength = true;
    } else if (fileUploadList.length > 0) {
      fileLength = true;
    }

    if (!billNo) {
      setErrorBillNo(true);
    } else if (!fileLength) {
      setOpenFailAlert(true);
      setTextFail("กรุณาแนบเอกสาร");
    } else {
      setErrorBillNo(false);

      const itemsList: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        await rows.forEach((data: GridRowData) => {
          const item: any = {
            barcode: data.barCode,
            actualQty: data.actualQty,
          };
          itemsList.push(item);
        });
        await setItems(itemsList);
      }

      let validateActualQty = true;
      validateActualQty = await handleValidateActualQty(itemsList);
      if (validateActualQty) {
        setActionConfirm("approve");
        setTitleConfirm("ยืนยันอนุมัติใบสั่งซื้อ Supplier");
        setOpenModelConfirm(true);
      }
    }
  };

  const handleConfirmStatus = async (issuccess: boolean, errorMsg: string) => {
    setOpenLoadingModal(true);
    // const msg = issuccess ? 'คุณได้อนุมัติข้อมูล เรียบร้อยแล้ว' : errorMsg;
    let msg = "";

    if (issuccess) {
      if (actionConfirm === "approve")
        msg = "คุณได้อนุมัติข้อมูล เรียบร้อยแล้ว";
      else if (actionConfirm === "delete")
        msg = "คุณได้ยกเลิกข้อมูล เรียบร้อยแล้ว";

      setShowSnackBar(true);
      setContentMsg(msg);
      setSnackbarIsStatus(true);

      dispatch(featchOrderListSupAsync(payloadSearch));
      setTimeout(() => {
        setOpen(false);
        onClickClose();
      }, 500);
    } else {
      msg = errorMsg;
      setOpenLoadingModal(false);
      setOpenFailAlert(true);
      setTextFail(msg);
      setSnackbarIsStatus(false);
    }

    // if (issuccess) {
    //   dispatch(featchOrderListSupAsync(payloadSearch));
    //   setTimeout(() => {
    //     setOpen(false);
    //     onClickClose();
    //   }, 500);
    // } else {
    //   setOpenLoadingModal(false);
    // }
  };

  const handleValidateActualQty = async (itemsList: any) => {
    let validatePOActualQty = itemsList.filter((r: any) => r.actualQty > 0); //PO
    let validateActualQty = itemsList.filter((r: any) => r.actualQty === 0); //no PO

    if (piType === 0 && validatePOActualQty.length === 0) {
      setOpenFailAlert(true);
      setTextFail("กรุณาระบุจำนวนสินค้าที่รับ ต้องมีค่ามากกว่า 0");
      return false;
    } else if (piType === 1 && validateActualQty.length > 0) {
      setOpenFailAlert(true);
      setTextFail("กรุณาระบุจำนวนสินค้าที่รับ ต้องมีค่ามากกว่า 0");
      return false;
    }
    return true;
  };

  const handleSaveButton = async () => {
    handleUpdateRowState();
    setOpenLoadingModal(true);

    if (!billNo) {
      setErrorBillNo(true);
    } else {
      setErrorBillNo(false);

      const itemsList: any = [];
      const itemsState: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        await rows.forEach((data: GridRowData) => {
          const item: any = {
            barcode: data.barCode,
            actualQty: data.actualQty,
          };
          itemsList.push(item);
          itemsState.push(data);
        });
      }

      let validateActualQty = true;
      validateActualQty = await handleValidateActualQty(itemsList);
      if (validateActualQty) {
        const payloadSave: SavePurchaseRequest = {
          billNo: billNo,
          comment: comment,
          items: itemsList,
        };

        await saveSupplierOrder(payloadSave, piNo, fileUploadList)
          .then((_value) => {
            setUploadFileFlag(true);
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");

            featchSupplierOrderDetail();
            // dispatch(featchSupplierOrderDetailAsync(piNo));
            // dispatch(updateItemsState({}));

            dispatch(featchOrderListSupAsync(payloadSearch));
            setFlagSave(false);
            dispatch(uploadFileState([]));
          })
          .catch((error: ApiError) => {
            setUploadFileFlag(false);
            setOpenFailAlert(true);
            setTextFail(error.message);
          });
      }
    }

    setFiles(purchaseDetail.files ? purchaseDetail.files : []);
    setOpenLoadingModal(false);
  };

  const featchSupplierOrderDetail = async () => {
    await dispatch(featchSupplierOrderDetailAsync(piNo)).then((value) => {
      const payload: any = value.payload ? value.payload : null;
      if (payload) {
        // purchaseDetailList = payload;
        setBillNo(payload.data.billNo);
      }
    });
  };

  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const handleAddItems = () => {
    handleUpdateRowState();
    setOpenModelAddItems(true);
  };

  const handleModelAddItems = () => {
    setFlagCalculate(false);
    setOpenModelAddItems(false);
  };

  const [openModelDeleteConfirm, setOpenModelDeleteConfirm] =
    React.useState(false);
  const [productNameDel, setProductNameDel] = React.useState("");
  const [skuCodeDel, setSkuCodeDel] = React.useState("");
  const [barCodeDel, setBarCodeDel] = React.useState("");
  const [uploadFileInfo, setUploadFileInfo] = React.useState([]);
  const currentlySelected = async (params: GridCellParams) => {
    const value = params.colDef.field;
    const isRefPO = params.getValue(params.id, "isRefPO");
    //deleteItem
    handleUpdateRowState();

    if (!isRefPO && value === "delete" && piType === 1 && piStatus === 0) {
      setDeleteItems(true);
      setProductNameDel(String(params.getValue(params.id, "productName")));
      setSkuCodeDel(String(params.getValue(params.id, "skuCode")));
      setBarCodeDel(String(params.getValue(params.id, "barCode")));
      setOpenModelDeleteConfirm(true);
    }
  };

  const handleModelDeleteConfirm = () => {
    setFlagCalculate(false);
    setOpenModelDeleteConfirm(false);
  };

  const setUploadfile = (value: any) => {
    setUploadFileInfo(value.file);
  };

  // useEffect(() => {
  //   console.log('UploadFileInfo: ', uploadFileInfo);
  // }, [uploadFileInfo]);
  const handleCalculateItems = async (params: GridEditCellValueParams) => {
    saveStateRows();

    if (params.field === "actualQty") {
      const itemsList: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        await rows.forEach((data: GridRowData) => {
          const item: any = {
            barcode: data.barCode,
            actualQty: data.actualQty,
          };
          itemsList.push(item);
        });
      }

      calculateItems(itemsList);
      if (piStatus === 0) setFlagSave(true);
      // setOpenLoadingModal(false);
    }
  };

  const calculateItems = async (items: any) => {
    const payloadCalculate: CalculatePurchasePIRequest = {
      piNo: purchaseDetail.piNo,
      docNo: purchaseDetail.docNo,
      SupplierCode: purchaseDetail.supplierCode,
      items: items,
    };

    await calculateSupplierPI(payloadCalculate)
      .then((value) => {
        setTotalAmount(value.data.amountText.totalAmount);
        setVat(value.data.amountText.vat);
        setVatRate(value.data.amountText.vatRate);
        setGrandTotalAmount(value.data.amountText.grandTotalAmount);
        setRoundAmount(value.data.amountText.roundAmount);

        let calItem = value.data.items;
        const items: any = [];
        rows.forEach((data: GridRowData) => {
          const calculate = calItem.filter(
            (r: any) => r.barcode === data.barCode,
          );

          const amountText: any = {
            unitPrice: calculate[0].amountText.setPrice,
            sumPrice: calculate[0].amountText.sumPrice,
          };
          const item: any = {
            id: data.index,
            barCode: data.barCode,
            unitName: data.unitName,
            productName: data.productName,
            qty: data.qty,
            actualQty: calculate[0].actualQty,
            skuCode: data.skuCode,
            amountText: amountText,
          };

          items.push(item);
        });
        updateStateRows(items);
      })
      .catch((error: ApiError) => {
        console.log("calculateSupplierPI error:", error);
      });
  };

  const [openModelPreviewDocument, setOpenModelPreviewDocument] =
    React.useState(false);
  const [statusFile, setStatusFile] = React.useState(0);
  function handleModelPreviewDocument() {
    setOpenModelPreviewDocument(false);
  }
  const handleLinkDocument = async () => {
    setOpenLoadingModal(true);
    setStatusFile(1);
    setOpenModelPreviewDocument(true);
    setOpenLoadingModal(false);
  };

  const [openFailAlert, setOpenFailAlert] = React.useState(false);
  const [textFail, setTextFail] = React.useState("");

  const handleCloseFailAlert = () => {
    setOpenFailAlert(false);
    setTextFail("");
  };

  const handleOnChangeUploadFile = (status: boolean) => {
    setUploadFileFlag(status);
    if (status) {
      dispatch(featchSupplierOrderDetailAsync(piNo));
    }
  };

  const docType: string = "PI";
  const onDeleteAttachFileOld = (item: any) => {
    const fileKeyDel = item.fileKey;
    let docNo = purchaseDetail.piNo;
    // console.log('item delete: ', item);
    if (docType && docNo) {
      delFileUrlHuawei(fileKeyDel, docType, docNo)
        .then((value) => {
          setUploadFileFlag(true);
          dispatch(featchSupplierOrderDetailAsync(piNo));
        })
        .catch((error: ApiError) => {
          setUploadFileFlag(false);
        });
    }
  };

  const handleCancleButton = async () => {
    setActionConfirm("delete");
    setTitleConfirm("ยืนยันยกเลิกใบสั่งซื้อ Supplier");
    setOpenModelConfirm(true);
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          <Typography sx={{ fontSize: "1em" }}>
            ใบรับสินค้าจากผู้จำหน่าย
          </Typography>
          {piStatus !== 9 && (
            <Steppers
              status={piStatus}
              stepsList={["บันทึก", "อนุมัติ"]}
            ></Steppers>
          )}
          {piStatus === 9 && (
            <Steppers
              status={piStatus}
              stepsList={["บันทึก", "ยกเลิก"]}
            ></Steppers>
          )}
        </BootstrapDialogTitle>

        <DialogContent>
          <Box mt={4} sx={{ flexGrow: 1 }}>
            <Grid container mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่ใบสั่งซื้อ PO :</Typography>
              </Grid>
              <Grid item lg={4}>
                {piType !== 1 && (
                  <Typography variant="body2">
                    {purchaseDetail.docNo}
                  </Typography>
                )}
                {piType === 1 && <Typography variant="body2">-</Typography>}
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่บิลผู้จำหน่าย :</Typography>
              </Grid>
              <Grid item lg={4}>
                <TextField
                  id="txtParamQuery"
                  name="paramQuery"
                  size="small"
                  value={billNo}
                  placeholder="กรุณากรอก เลขที่บิลผู้จำหน่าย"
                  onChange={handleChangeBillNo}
                  className={classes.MtextFieldDetail}
                  disabled={piStatus !== 0}
                  error={errorBillNo === true}
                  helperText={
                    errorBillNo === true ? "กรุณากรอก เลขที่บิลผู้จำหน่าย" : " "
                  }
                />
              </Grid>
            </Grid>

            <Grid container mb={2} sx={{ mt: -4 }}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร PI :</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{piNo}</Typography>
              </Grid>
              <Grid item lg={6}></Grid>
            </Grid>

            <Grid container mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">ผู้จัดจำหน่าย:</Typography>
              </Grid>
              <Grid item lg={4}>
                <div
                  style={{
                    border: "1px solid #CBD4DB",
                    borderRadius: 5,
                    maxWidth: 250,
                    background: "#EAEBEB",
                    padding: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#263238" }}>
                    {purchaseDetail.supplierName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#AEAEAE", fontSize: 12 }}
                  >
                    {purchaseDetail.supplierTaxNo}
                  </Typography>
                </div>
              </Grid>
              <Grid item lg={2} sx={{ mt: -3 }}>
                <Typography variant="body2">
                  แนบเอกสารจากผู้จำหน่าย :
                </Typography>
              </Grid>
              <Grid item lg={4} sx={{ mt: -3 }}>
                {piStatus === 1 && (
                  <Box sx={{ display: "flex", alignItems: "flex-end", mb: 1 }}>
                    <Button
                      id="btnPrint"
                      color="primary"
                      variant="contained"
                      component="span"
                      className={classes.MbtnBrowse}
                      disabled
                    >
                      แนบไฟล์
                    </Button>

                    <Typography
                      variant="overline"
                      sx={{
                        ml: 1,
                        color: theme.palette.cancelColor.main,
                        lineHeight: "120%",
                      }}
                    >
                      แนบไฟล์ .pdf/.jpg ขนาดไม่เกิน 5 mb
                    </Typography>
                  </Box>
                )}

                {piStatus === 1 && files.length > 0 && (
                  <AccordionHuaweiFile files={files} />
                )}
                {piStatus === 1 && (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleLinkDocument}
                  >
                    เรียกดูเอกสารใบรับสินค้า
                  </Link>
                )}
                {piStatus === 0 && (
                  <AccordionUploadFile
                    files={purchaseDetail.files}
                    docNo={purchaseDetail.piNo}
                    docType={docType}
                    isStatus={uploadFileFlag}
                    onChangeUploadFile={handleOnChangeUploadFile}
                    enabledControl={true}
                    onDeleteAttachFile={onDeleteAttachFileOld}
                  />
                )}
              </Grid>
            </Grid>
          </Box>

          <Box mt={4} mb={2}>
            <Grid
              container
              spacing={2}
              display="flex"
              justifyContent="space-between"
            >
              <Grid item xl={2}>
                {piType == 1 && piStatus !== 1 && (
                  <Button
                    id="btnAddItem"
                    variant="contained"
                    color="info"
                    className={classes.MbtnPrint}
                    onClick={handleAddItems}
                    startIcon={<ControlPoint />}
                    sx={{ width: 200 }}
                  >
                    เพิ่มสินค้า
                  </Button>
                )}
              </Grid>

              <Grid item xl={10} sx={{ textAlign: "end" }}>
                {piStatus === 0 && (
                  <Button
                    id="btnSave"
                    variant="contained"
                    color="warning"
                    className={classes.MbtnSave}
                    onClick={handleSaveButton}
                    startIcon={<SaveIcon />}
                    sx={{ width: 200 }}
                    disabled={rows.length == 0}
                  >
                    บันทึก
                  </Button>
                )}
                {piStatus === 0 && (
                  <Button
                    id="btnApprove"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnApprove}
                    onClick={handlConfirmButton}
                    startIcon={<CheckCircleOutline />}
                    sx={{ width: 200 }}
                    disabled={rows.length == 0}
                  >
                    ยืนยัน
                  </Button>
                )}

                {piStatus === 0 && (
                  <Button
                    id="btnCancle"
                    variant="contained"
                    color="error"
                    className={classes.MbtnSearch}
                    onClick={handleCancleButton}
                    sx={{ ml: 1, width: 100 }}
                  >
                    ยกเลิก
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>

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
                columns={columns}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[10, 20, 50, 100]}
                pagination
                disableColumnMenu
                autoHeight={rows.length >= 8 ? false : true}
                scrollbarSize={10}
                rowHeight={65}
                onCellClick={currentlySelected}
                onCellFocusOut={handleCalculateItems}
              />
            </div>
          </Box>
          <Box mt={3}>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={4}>
                <Typography variant="body2">หมายเหตุ:</Typography>
                <TextField
                  multiline
                  fullWidth
                  rows={5}
                  onChange={handleChangeComment}
                  defaultValue={comment}
                  placeholder="ความยาวไม่เกิน 255 ตัวอักษร"
                  className={classes.MtextFieldRemark}
                  inputProps={{ maxLength: maxCommentLength }}
                  sx={{ maxWidth: 350 }}
                  disabled={piStatus !== 0}
                />

                <div
                  style={{
                    fontSize: "11px",
                    color: "#AEAEAE",
                    width: "100%",
                    maxWidth: 350,
                    textAlign: "right",
                  }}
                >
                  {characterCount}/{maxCommentLength}
                </div>
              </Grid>

              <Grid item lg={4}></Grid>
              <Grid item lg={4}>
                <Grid container spacing={2} justifyContent="flex-end" mb={1}>
                  <Grid item lg={5}></Grid>
                  <Grid item lg={3} alignItems="flex-end">
                    <Typography variant="body2" pt={1}>
                      ยอดรวม
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <TextField
                      id="txtParamQuery"
                      name="paramQuery"
                      size="small"
                      value={totalAmount}
                      className={classes.MtextFieldNumber}
                      fullWidth
                      disabled
                      sx={{ background: "#EAEBEB" }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} justifyContent="flex-end" mb={1}>
                  <Grid item lg={5}></Grid>
                  <Grid item lg={3} alignItems="flex-end">
                    <Typography variant="body2" pt={1}>
                      ภาษี({vatRate}%)
                    </Typography>
                  </Grid>
                  <Grid item lg={4}>
                    <TextField
                      id="txtParamQuery"
                      name="paramQuery"
                      size="small"
                      value={vat}
                      className={classes.MtextFieldNumber}
                      fullWidth
                      disabled
                      sx={{ background: "#EAEBEB" }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} justifyContent="flex-end" mb={1}>
                  <Grid item lg={5}></Grid>
                  <Grid item lg={3} alignItems="flex-end">
                    <Typography variant="body2" pt={1}>
                      <b>ยอดรวมทั้งสิ้น</b>
                    </Typography>
                  </Grid>
                  <Grid item lg={4}>
                    <TextField
                      id="txtParamQuery"
                      name="paramQuery"
                      size="small"
                      value={grandTotalAmount}
                      className={classes.MtextFieldNumberNotStyleDisable}
                      fullWidth
                      disabled
                      sx={{ background: "#E7FFE9" }}
                    />
                  </Grid>
                </Grid>

                {Number(purchaseDetail.isFrontPay) === 1 &&
                  Number(piType) === 1 && (
                    <Grid
                      container
                      spacing={2}
                      justifyContent="flex-end"
                      mb={1}
                    >
                      <Grid item lg={5}></Grid>
                      <Grid item lg={3} alignItems="flex-end">
                        <Typography variant="body2" pt={1}>
                          <b>ยอดจ่ายจริง</b>
                        </Typography>
                      </Grid>
                      <Grid item lg={4}>
                        <TextField
                          id="txtParamQuery"
                          name="paramQuery"
                          size="small"
                          value={roundAmount}
                          className={classes.MtextFieldNumberNotStyleDisable}
                          fullWidth
                          disabled
                          sx={{ background: "#E7FFE9" }}
                        />
                      </Grid>
                    </Grid>
                  )}
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
      <ModelConfirm
        open={openModelConfirm}
        onClose={handleModelConfirm}
        onUpdateAction={handleConfirmStatus}
        piNo={piNo}
        docNo={purchaseDetail.docNo}
        billNo={billNo}
        supplierId={supplierCode}
        comment={comment}
        piType={piType}
        items={items}
        piDetail={false}
        title={titleConfirm}
        action={actionConfirm}
      />

      <ConfirmModelExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />

      <ModalAddItem
        open={openModelAddItems}
        onClose={handleModelAddItems}
        supNo={supplierCode}
      ></ModalAddItem>

      <ModelDeleteConfirm
        open={openModelDeleteConfirm}
        onClose={handleModelDeleteConfirm}
        productName={productNameDel}
        skuCode={skuCodeDel}
        barCode={barCodeDel}
      />

      <ModalShowFile
        open={openModelPreviewDocument}
        onClose={handleModelPreviewDocument}
        url={getPathReportPI(piNo)}
        statusFile={statusFile}
        sdImageFile=""
        fileName={formatFileNam(piNo, piStatus)}
        btnPrintName="พิมพ์เอกสาร"
      />

      <AlertError
        open={openFailAlert}
        onClose={handleCloseFailAlert}
        textError={textFail}
      />

      <LoadingModal open={openLoadingModal} />
    </div>
  );
}

export default SupplierOrderDetail;
