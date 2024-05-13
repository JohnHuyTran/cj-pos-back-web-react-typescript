import React, { ReactElement, useEffect, useMemo } from "react";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import {
  Button,
  DialogTitle,
  Grid,
  IconButton,
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
  CalculatePurchasePIRequest,
  FileType,
  SavePurchasePIRequest,
} from "../../models/supplier-check-order-model";
import LoadingModal from "../commons/ui/loading-modal";
import { ApiError } from "../../models/api-error-model";
import {
  calculateSupplierPI,
  deleteSupplierPI,
  delFileUrlHuawei,
  saveSupplierPI,
} from "../../services/purchase";
import SnackbarStatus from "../commons/ui/snackbar-status";
import ConfirmModelExit from "../commons/ui/confirm-exit-model";
import ModelConfirm from "./modal-confirm";
import ModelDeleteConfirm from "./modal-delete-confirm";
import ModalAddItem from "./modal-add-items";
import { updateItemsState } from "../../store/slices/supplier-add-items-slice";
import { featchItemBySupplierListAsync } from "../../store/slices/products/search-item-by-supplier-slice";
import AlertError from "../commons/ui/alert-error";
import { uploadFileState } from "../../store/slices/upload-file-slice";
import { featchSupplierOrderDetailAsync } from "../../store/slices/supplier-order-detail-slice";
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
    width: 65,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcode",
    headerName: "บาร์โค้ด",
    minWidth: 200,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "productName",
    headerName: "สินค้า",
    headerAlign: "center",
    // minWidth: 250,
    flex: 2,
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
    width: 110,
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
          var isRefPO = Number(params.getValue(params.id, "isRefPO"));
          if (isRefPO && value > qty) value = qty;
          params.api.updateRows([{ ...params.row, actualQty: value }]);
        }}
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
    width: 120,
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
        {params.getValue(params.id, "isRefPO") && <div></div>}
        {!params.getValue(params.id, "isRefPO") && (
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
  const [open, setOpen] = React.useState(isOpen);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const { apiRef, columns } = useApiRef();
  const dispatch = useAppDispatch();
  const payloadSupplier = useAppSelector(
    (state) => state.supplierSelectionSlice.state,
  );
  const supplier = payloadSupplier.supplier;
  const po = payloadSupplier.poSelection;
  const payloadAddItem = useAppSelector(
    (state) => state.supplierAddItems.state,
  );
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);
  const [flagSave, setFlagSave] = React.useState(false);
  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);
  const handleClose = async () => {
    let exit = false;
    if (comment !== commentOrigin || billNo !== billNoOrigin) exit = true;

    if (fileUploadList.length > 0) {
      exit = true;
    }

    if (rows.length > 0 && flagSave) exit = true;

    if (!exit) {
      await dispatch(updateItemsState({}));
      setOpen(false);
      onClickClose();
    } else if (exit) {
      setConfirmModelExit(true);
    }
  };

  function handleNotExitModelConfirm() {
    setConfirmModelExit(false);
  }

  function handleExitModelConfirm() {
    setConfirmModelExit(false);
    setOpen(false);
    onClickClose();
  }

  useEffect(() => {
    setOpen(isOpen);

    if (po) {
      setDocNo(po.docNo);
      setPiType(0);
    } else {
      dispatch(featchItemBySupplierListAsync(payloadSupplier.supplier.code));
    }

    setSupplierCode(payloadSupplier.supplier.code);
    setSupplierName(payloadSupplier.supplier.name);
    setSupplierTaxNo(payloadSupplier.supplier.taxNo);
    setSupplierIsFrontPay(payloadSupplier.supplier.isFrontPay);
  }, [open]);

  let rows: any = [];
  const handleAddRow = (items: any) => {
    if (Object.keys(items).length !== 0) {
      rows = items.map((item: any, index: number) => {
        let barcode = item.barCode ? item.barCode : item.barcode;
        let setPrice = item.setPrice ? item.setPrice : item.unitPrice;
        return {
          id: `${barcode}-${index + 1}`,
          index: index + 1,
          seqItem: item.seqItem,
          isControlStock: item.isControlStock,
          isAllowDiscount: item.isAllowDiscount,
          skuCode: item.skuCode,
          barcode: barcode,
          productName: item.productName ? item.productName : item.barcodeName,
          unitCode: item.unitCode,
          unitName: item.unitName,
          qty: item.qty ? item.qty : 0,
          qtyAll: item.qtyAll,
          controlPrice: item.controlPrice,
          salePrice: item.salePrice,
          setPrice: setPrice ? setPrice : 0,
          sumPrice: item.sumPrice ? item.sumPrice : 0,
          actualQty: item.actualQty ? item.actualQty : 0,
          isRefPO: supplier.isRefPO,
        };
      });
    }
  };

  const [flagCalculate, setFlagCalculate] = React.useState(false);
  const setItemCal = async () => {
    if (rows.length > 0) {
      const itemsList: any = [];
      await rows.forEach((data: GridRowData) => {
        const item: any = {
          barcode: data.barcode,
          actualQty: data.actualQty,
        };
        itemsList.push(item);
      });
      if (itemsList.length > 0) calculateItems(itemsList);
    }
  };

  if (payloadAddItem) {
    handleAddRow(payloadAddItem);
    if (!flagCalculate) {
      setItemCal();
      setFlagCalculate(true);
    }
  }

  const [billNo, setBillNo] = React.useState("");
  const [billNoOrigin, setBillNoOrigin] = React.useState("");
  const [errorBillNo, setErrorBillNo] = React.useState(false);
  const [piNo, setPiNo] = React.useState("");
  const [supplierCode, setSupplierCode] = React.useState("");
  const [supplierName, setSupplierName] = React.useState("");
  const [supplierTaxNo, setSupplierTaxNo] = React.useState("");
  const [supplierIsFrontPay, setSupplierIsFrontPay] = React.useState(false);
  const [piType, setPiType] = React.useState(1);
  const [piStatus, setPiStatus] = React.useState(0);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [vat, setVat] = React.useState(0);
  const [vatRate, setVatRate] = React.useState(0);
  const [grandTotalAmount, setGrandTotalAmount] = React.useState(0);
  const [roundAmount, setRoundAmount] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [commentOrigin, setCommentOrigin] = React.useState("");
  const [docNo, setDocNo] = React.useState("");
  const classes = useStyles();
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [characterCount, setCharacterCount] = React.useState(0);
  const maxCommentLength = 255;
  const purchaseDetailList = useAppSelector(
    (state) => state.supplierOrderDetail.purchaseDetail,
  );
  const purchaseDetail: any = purchaseDetailList.data
    ? purchaseDetailList.data
    : null;
  // const purchaseDetailItems = purchaseDetail.entries ? purchaseDetail.entries : [];
  const [files, setFiles] = React.useState<FileType[]>([]);
  const [flagSetFiles, setFlagSetFiles] = React.useState(false);

  let flag = false;
  if (purchaseDetail.piNo && !flagSetFiles && flag) {
    setFlagSetFiles(true);
    flag = true;
  }
  // console.log('purchaseDetail.files 111: ', purchaseDetail.files);
  // if (purchaseDetail.piNo !== '' && flagSetFiles) {
  //   setFiles(purchaseDetail.files ? purchaseDetail.files : []);
  //   setFlagSetFiles(false);
  // }
  // console.log('purchaseDetail.files 222: ', files);
  const handleChangeComment = (event: any) => {
    saveStateRows();
    const value = event.target.value;
    const length = event.target.value.length;
    if (length <= maxCommentLength) {
      setCharacterCount(event.target.value.length);
      setComment(value);
    }
  };

  const handleChangeBillNo = async (event: any) => {
    saveStateRows();
    const value = event.target.value;
    setBillNo(value);
    setErrorBillNo(false);
  };

  if (rows.length === 0) {
    if (totalAmount !== 0) setTotalAmount(0);
    if (vat !== 0) setVat(0);
    if (vatRate !== 0) setVatRate(0);
    if (grandTotalAmount !== 0) setGrandTotalAmount(0);
    if (roundAmount !== 0) setRoundAmount(0);
  }

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

  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [titleConfirm, setTitleConfirm] = React.useState("");
  const [actionConfirm, setActionConfirm] = React.useState("");
  const [openModelDeleteConfirm, setOpenModelDeleteConfirm] =
    React.useState(false);
  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const [items, setItems] = React.useState<any>([]);

  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const handleModelConfirm = () => {
    setOpenModelConfirm(false);
  };
  const handlConfirmButton = async () => {
    setOpenLoadingModal(true);

    let purcheaseFiles = purchaseDetail.files ? purchaseDetail.files : [];
    let fileLength = false;
    if (purcheaseFiles.length > 0) {
      fileLength = true;
    } else if (fileUploadList.length > 0) {
      fileLength = true;
    }

    if (!billNo) {
      setErrorBillNo(true);
    } else if (!fileLength) {
      console.log("=== 0");
      setOpenFailAlert(true);
      setTextFail("กรุณาแนบเอกสาร");
    } else {
      setErrorBillNo(false);

      const itemsList: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        await rows.forEach((data: GridRowData) => {
          const item: any = {
            barcode: data.barcode,
            actualQty: data.actualQty,
          };
          itemsList.push(item);
        });
        await setItems(itemsList);
      }

      let validateActualQty = true;
      validateActualQty = await handleValidateActualQty(itemsList);
      if (validateActualQty) {
        const payloadSave: SavePurchasePIRequest = {
          piNo: piNo,
          SupplierCode: supplierCode,
          billNo: billNo,
          docNo: docNo ? docNo : "",
          flagPO: piType,
          comment: comment,
          items: itemsList,
        };
        setFlagSetFiles(true);
        if (piNo === "") {
          await saveSupplierPI(payloadSave, fileUploadList)
            .then((value) => {
              setUploadFileFlag(true);
              setFlagSetFiles(true);
              setPiNo(value.piNo);
              setBillNoOrigin(billNo);
              setCommentOrigin(comment);
              setOpenModelConfirm(true);
              dispatch(featchSupplierOrderDetailAsync(value.piNo));
              dispatch(uploadFileState([]));
            })
            .catch((error: ApiError) => {
              setOpenFailAlert(true);
              setUploadFileFlag(false);
              setTextFail(error.message);
            });
        }
        setActionConfirm("approve");
        setTitleConfirm("ยืนยันอนุมัติใบสั่งซื้อ Supplier");
        setOpenModelConfirm(true);
      }
    }
    setOpenLoadingModal(false);
  };

  const [productNameDel, setProductNameDel] = React.useState("");
  const [skuCodeDel, setSkuCodeDel] = React.useState("");
  const [barCodeDel, setBarCodeDel] = React.useState("");
  const currentlySelected = (params: GridCellParams) => {
    saveStateRows();
    const value = params.colDef.field;
    const isRefPO = params.getValue(params.id, "isRefPO");
    //deleteItem
    if (!isRefPO && value === "delete") {
      setProductNameDel(String(params.getValue(params.id, "productName")));
      setSkuCodeDel(String(params.getValue(params.id, "skuCode")));
      setBarCodeDel(String(params.getValue(params.id, "barcode")));
      setOpenModelDeleteConfirm(true);
    }
  };

  const handleModelDeleteConfirm = () => {
    setFlagCalculate(false);
    setOpenModelDeleteConfirm(false);
  };

  const handleAddItems = () => {
    setOpenModelAddItems(true);
  };

  const handleModelAddItems = async () => {
    setFlagSave(true);
    setFlagCalculate(false);
    setOpenModelAddItems(false);
  };

  const handleCalculateItems = async (params: GridEditCellValueParams) => {
    saveStateRows();
    if (params.field === "actualQty") {
      const itemsList: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        await rows.forEach((data: GridRowData) => {
          const item: any = {
            barcode: data.barcode,
            actualQty: data.actualQty,
          };
          itemsList.push(item);
        });
      }

      calculateItems(itemsList);
      setFlagSave(true);
      // setOpenLoadingModal(false);
    }
  };

  const calculateItems = async (items: any) => {
    let docNo = "";
    if (po) docNo = po.docNo;
    const payloadCalculate: CalculatePurchasePIRequest = {
      piNo: piNo,
      docNo: docNo,
      SupplierCode: payloadSupplier.supplier.code,
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
            (r: any) => r.barcode === data.barcode,
          );
          // const sumPrice = (Math.round(Number(calculate[0].sumPrice) * 100) / 100).toFixed(2);
          const sumPrice = calculate[0].amountText.sumPrice;
          const item: any = {
            id: data.index,
            barcode: data.barcode,
            unitName: data.unitName,
            productName: data.productName,
            qty: data.qty,
            actualQty: calculate[0].actualQty,
            skuCode: data.skuCode,
            unitPrice: calculate[0].amountText.setPrice,
            sumPrice: sumPrice,
          };
          items.push(item);
        });
        updateStateRows(items);
      })
      .catch((error: ApiError) => {
        console.log("calculateSupplierPI error:", error);
      });
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

      setTimeout(() => {
        setOpen(false);
        onClickClose();
      }, 500);

      await dispatch(updateItemsState({}));
    } else {
      msg = errorMsg;
      setOpenFailAlert(true);
      setTextFail(msg);
      setOpenLoadingModal(false);
      setSnackbarIsStatus(false);
    }
  };

  const handleValidateActualQty = async (itemsList: any) => {
    let validatePOActualQty = itemsList.filter((r: any) => r.actualQty > 0); //PO
    let validateActualQty = itemsList.filter((r: any) => r.actualQty === 0); //no PO

    if (po && validatePOActualQty.length === 0) {
      setOpenFailAlert(true);
      setTextFail("กรุณาระบุจำนวนสินค้าที่รับ ต้องมีค่ามากกว่า 0");
      return false;
    } else if (!po && validateActualQty.length > 0) {
      setOpenFailAlert(true);
      setTextFail("กรุณาระบุจำนวนสินค้าที่รับ ต้องมีค่ามากกว่า 0");
      return false;
    }
    return true;
  };

  const handleSaveButton = async () => {
    setFlagSetFiles(true);
    setOpenLoadingModal(true);

    if (!billNo) {
      setErrorBillNo(true);
    } else {
      setErrorBillNo(false);

      const itemEditList: any = [];
      const itemsList: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        await rows.forEach((data: GridRowData) => {
          const item: any = {
            barcode: data.barcode,
            actualQty: data.actualQty,
          };

          itemsList.push(item);
          itemEditList.push(data);
        });
        await dispatch(updateItemsState(itemEditList));
      }

      let validateActualQty = true;
      validateActualQty = await handleValidateActualQty(itemsList);
      if (validateActualQty) {
        const payloadSave: SavePurchasePIRequest = {
          piNo: piNo,
          SupplierCode: supplierCode,
          billNo: billNo,
          docNo: docNo ? docNo : "",
          flagPO: piType,
          comment: comment,
          items: itemsList,
        };

        await saveSupplierPI(payloadSave, fileUploadList)
          .then((value) => {
            setUploadFileFlag(true);
            setFlagSetFiles(true);
            setPiNo(value.piNo);
            setBillNoOrigin(billNo);
            setCommentOrigin(comment);
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
            setFlagSave(false);
            dispatch(featchSupplierOrderDetailAsync(value.piNo));
            dispatch(uploadFileState([]));
          })
          .catch((error: ApiError) => {
            setOpenFailAlert(true);
            setTextFail(error.message);
            setUploadFileFlag(false);
          });
      }
    }

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
          return setUploadFileFlag(true);
        })
        .catch((error: ApiError) => {
          return setUploadFileFlag(false);
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
          <Steppers
            status={piStatus}
            stepsList={["บันทึก", "อนุมัติ"]}
          ></Steppers>
        </BootstrapDialogTitle>

        <DialogContent>
          <Box mt={4}>
            <Grid container spacing={2} mb={0}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่ใบสั่งซื้อ PO :</Typography>
              </Grid>
              <Grid item lg={4}>
                {piType !== 1 && (
                  <Typography variant="body2">{docNo}</Typography>
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
                  error={errorBillNo === true}
                  helperText={
                    errorBillNo === true ? "กรุณากรอก เลขที่บิลผู้จำหน่าย" : " "
                  }
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={0}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร PI :</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{piNo}</Typography>
              </Grid>
              {/* <Grid item lg={2}>
                <Typography variant="body2">แนบเอกสารจากผู้จำหน่าย :</Typography>
              </Grid> */}
              {/* <Grid item lg={4}>
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
              </Grid> */}
            </Grid>
            <Grid container spacing={2}>
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
                    {supplierName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#AEAEAE", fontSize: 12 }}
                  >
                    {supplierTaxNo}
                  </Typography>
                </div>
              </Grid>
              <Grid item lg={2} sx={{ mt: -3 }}>
                <Typography variant="body2">
                  แนบเอกสารจากผู้จำหน่าย :
                </Typography>
              </Grid>
              <Grid item lg={4} sx={{ mt: -3 }}>
                {piNo && (
                  <AccordionUploadFile
                    files={purchaseDetail.files ? purchaseDetail.files : []}
                    docNo={purchaseDetail.piNo}
                    docType="PI"
                    isStatus={uploadFileFlag}
                    onChangeUploadFile={handleOnChangeUploadFile}
                    enabledControl={true}
                    onDeleteAttachFile={onDeleteAttachFileOld}
                  />
                )}
                {piNo === "" && (
                  <AccordionUploadFile
                    files={[]}
                    docNo={purchaseDetail.piNo}
                    docType={docType}
                    isStatus={uploadFileFlag}
                    onChangeUploadFile={handleOnChangeUploadFile}
                    enabledControl={true}
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
                {!po && (
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

                {piStatus === 0 && (
                  <Button
                    id="btnCancle"
                    variant="contained"
                    color="error"
                    className={classes.MbtnSearch}
                    onClick={handleCancleButton}
                    sx={{
                      ml: 1,
                      width: 100,
                      display: `${purchaseDetail.piNo ? "" : "none"}`,
                    }}
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
                // onCellBlur={handleCalculateItems}
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
                  // disabled={piStatus !== 0}
                />

                <div
                  style={{
                    fontSize: "11px",
                    color: "#AEAEAE",
                    width: "100%",
                    maxWidth: 350,
                    textAlign: "right",
                    // marginTop: "-1.5em",
                  }}
                >
                  {characterCount}/{maxCommentLength}
                </div>
              </Grid>

              <Grid item lg={4}></Grid>
              <Grid item lg={4}>
                <Grid
                  container
                  spacing={2}
                  justifyContent="flex-end"
                  mt={2}
                  mb={1}
                >
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

                {(supplierIsFrontPay ||
                  Number(purchaseDetail.isFrontPay) === 1) &&
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
        docNo={docNo}
        billNo={billNo}
        supplierId={supplierCode}
        comment={comment}
        piType={piType}
        items={items}
        piDetail={true}
        title={titleConfirm}
        action={actionConfirm}
      />

      <ModelDeleteConfirm
        open={openModelDeleteConfirm}
        onClose={handleModelDeleteConfirm}
        productName={productNameDel}
        skuCode={skuCodeDel}
        barCode={barCodeDel}
      />

      <ModalAddItem
        open={openModelAddItems}
        onClose={handleModelAddItems}
        supNo={supplierCode}
      ></ModalAddItem>
      <ConfirmModelExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />

      <LoadingModal open={openLoadingModal} />

      <AlertError
        open={openFailAlert}
        onClose={handleCloseFailAlert}
        textError={textFail}
      />
    </div>
  );
}

export default SupplierOrderDetail;
