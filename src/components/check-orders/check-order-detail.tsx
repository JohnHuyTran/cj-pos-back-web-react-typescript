import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { featchOrderListAsync } from "../../store/slices/check-order-slice";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  Grid,
  Menu,
  MenuItem,
  MenuProps,
  TextField,
  Typography,
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import SaveIcon from "@mui/icons-material/Save";
import IconButton from "@mui/material/IconButton";
import { useStyles } from "../../styles/makeTheme";

import {
  saveOrderShipments,
  getPathReportSD,
  approveOrderShipmentsOC,
  rejectOrderShipmentsOC,
} from "../../services/order-shipment";
import ConfirmOrderShipment from "./check-order-confirm-model";
import ConfirmExitModel from "./confirm-model";
import {
  ShipmentDeliveryStatusCodeEnum,
  getShipmentTypeText,
  formatFileName,
} from "../../utils/enum/check-order-enum";
import ModalShowFile from "../commons/ui/modal-show-file";
import {
  SaveDraftSDRequest,
  CheckOrderDetailProps,
  Entry,
  itemsDetail,
  ToteRequest,
  ShipmentDetailInfo,
} from "../../models/order-model";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import {
  ApiError,
  ErrorDetail,
  ErrorDetailResponse,
  Header,
} from "../../models/api-error-model";
import AlertError from "../commons/ui/alert-error";
import {
  BookmarkAdded,
  CheckCircleOutline,
  HighlightOff,
  Print,
} from "@mui/icons-material";
import LoadingModal from "../commons/ui/loading-modal";
import CheckOrderSDRefDetail from "./check-order-detail-sd";
import { featchOrderSDListAsync } from "../../store/slices/check-order-sd-slice";
import {
  featchOrderDetailAsync,
  setReloadScreen,
} from "../../store/slices/check-order-detail-slice";
import Snackbar from "../commons/ui/snackbar-status";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { styled } from "@mui/material/styles";
import AddToteModel from "../check-orders/add-tote-model";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import ModalAddItems from "../commons/ui/modal-add-items";
import {
  isAllowActionPermission,
  isGroupBranch,
} from "../../utils/role-permission";
import { getUserInfo } from "../../store/sessionStore";
import { ACTIONS, PERMISSION_GROUP } from "../../utils/enum/permission-enum";
import AccordionUploadFile from "../commons/ui/accordion-upload-file";
import AccordionHuaweiFile from "../commons/ui/accordion-huawei-file";
import theme from "../../styles/theme";
import { env } from "../../adapters/environmentConfigs";
import CheckOrderDetailList from "../check-orders/check-order-detail-list";
import CheckOrderDetailListTote from "../check-orders/check-order-detail-list-tote";
import OrderReceiveDetail from "./order-receive-detail";
import { searchToteAsync } from "../../store/slices/search-tote-slice";
import { featchOrderDetailToteAsync } from "../../store/slices/check-order-detail-tote-slice";
import _ from "lodash";
import { isErrorCode } from "../../utils/exception/pos-exception";
import { ToteItem } from "../../models/tote-model";
import moment from "moment";
import TextBoxComentList from "components/commons/ui/texbox-commentList";
import ModalReject from "./modal-reject";
import { useTranslation } from "react-i18next";

interface loadingModalState {
  open: boolean;
}

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
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));

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

interface fileInfoProps {
  file?: any;
  fileName: string;
  base64URL: any;
}

export default function CheckOrderDetail({
  sdNo,
  docRefNo,
  docType,
  defaultOpen,
  onClickClose,
}: CheckOrderDetailProps) {
  const classes = useStyles();
  const { t } = useTranslation(["orderReceive", "common"]);
  const sdRef = useAppSelector((state) => state.checkOrderSDList.orderList);
  const payloadSearchOrder = useAppSelector(
    (state) => state.saveSearchOrder.searchCriteria,
  );
  const dispatch = useAppDispatch();
  const orderDetails = useAppSelector(
    (state) => state.checkOrderDetail.orderDetail,
  );
  const orderDetail: any = orderDetails.data ? orderDetails.data : null;
  const [open, setOpen] = React.useState(defaultOpen);
  const [showSaveBtn, setShowSaveBtn] = React.useState(false);
  const [showApproveBtn, setShowApproveBtn] = React.useState(false);
  const [statusWaitApprove1, setStatusWaitApprove1] = React.useState(false);
  const [showCloseJobBtn, setShowCloseJobBtn] = React.useState(false);
  const [closeJobTote, setCloseJobTote] = React.useState(false);
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [action, setAction] = useState<string>("");
  const [itemsDiffState, setItemsDiffState] = useState<Entry[]>([]);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const [openModelPreviewDocument, setOpenModelPreviewDocument] =
    React.useState(false);
  const [shipmentStatusText, setShipmentStatusText] = useState<
    string | undefined
  >("");
  const [shipmentTypeText, setShipmentTypeText] = useState<string | undefined>(
    "",
  );
  const [shipmentDateFormat, setShipmentDateFormat] = useState<
    string | undefined
  >("");
  const [snackBarFailMsg, setSnackBarFailMsg] = React.useState("");
  const [openFailAlert, setOpenFailAlert] = React.useState(false);
  const [textFail, setTextFail] = React.useState("");
  const [toteNo, setToteNo] = React.useState("");
  const [showSdTypeTote, setShowSdTypeTote] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const [pageSize, setPageSize] = React.useState<number>(10);
  const [statusFile, setStatusFile] = React.useState(0);
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarStatus, setSnackbarStatus] = React.useState(false);

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);

  const [displayBranchGroup, setDisplayBranchGroup] = React.useState(false);
  const [statusOC, setStatusOC] = React.useState(false);
  const DCPercent = env.dc.percent;
  const [isAllowExportBtn, setIsAllowExportBtn] = React.useState(true);
  const [payloadError, setPayloadError] =
    React.useState<ErrorDetailResponse | null>();
  const orderComment = orderDetail.docRefRemark;
  let findIndexStr = false;
  if (orderComment) {
    findIndexStr = orderComment.startsWith("SD", 0);
  }

  useEffect(() => {
    const branch = getUserInfo().group === PERMISSION_GROUP.BRANCH;
    const oc = getUserInfo().group === PERMISSION_GROUP.OC;
    setDisplayBranchGroup(branch);
    setStatusOC(oc);
    setIsAllowExportBtn(isAllowActionPermission(ACTIONS.ORDER_SD_EXPORT));
    if (orderDetail) {
      setShowSaveBtn(
        orderDetail.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT ||
          orderDetail.sdStatus ===
            ShipmentDeliveryStatusCodeEnum.STATUS_REJECT_APPROVAL_1,
      );
      setStatusWaitApprove1(
        orderDetail.sdStatus ===
          ShipmentDeliveryStatusCodeEnum.STATUS_WAITAPPROVEL_1,
      );
      setShowApproveBtn(
        orderDetail.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE,
      );
      setShowCloseJobBtn(
        orderDetail.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB,
      );
      setShowSdTypeTote(orderDetail.sdType === 0);
      setCloseJobTote(
        orderDetail.sdStatus ===
          ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB &&
          orderDetail.sdType === 0,
      );

      // setOpen(defaultOpen);
      setShipmentStatusText(t(`status.${orderDetail.sdStatus}`));
      setShipmentTypeText(getShipmentTypeText(orderDetail.sdType));
      if (orderDetail.receivedDate)
        setShipmentDateFormat(convertUtcToBkkDate(orderDetail.receivedDate));
      if (orderDetail.docRefRemark !== "") {
        dispatch(featchOrderSDListAsync(orderDetail.docRefRemark));
      }
    }

    // }, [open, openModelConfirm]);
  }, [open, orderDetail]);

  const updateState = async (items: any) => {
    await dispatch(updateAddItemsState(items));
  };

  const [openTote, setOpenTote] = React.useState(false);
  const [openOrderReceiveModal, setOpenOrderReceiveModal] =
    React.useState(false);
  const [toteCode, setToteCode] = React.useState("");

  const handleOpenModalTote = async (value: string, isAddItem: boolean) => {
    // rowsEntries = [];
    if (isAddItem === false) {
      try {
        await dispatch(featchOrderDetailAsync(value));
        await dispatch(setReloadScreen(true));
        await dispatch(updateAddItemsState({}));
      } catch (error) {
        console.log(error);
      }

      // await dispatch(featchOrderDetailToteAsync(value)).then(() => {});
      // await setOpenTote(true);
    } else if (isAddItem === true) {
      setToteCode(value);
      handleOpenLoading("open", true);
      const payload: ToteRequest = {
        docRefNo: docRefNo,
        toteCode: value,
      };
      // await dispatch(updateAddItemsState({}));
      await dispatch(searchToteAsync(payload));
      await setOpenOrderReceiveModal(true);
      handleOpenLoading("open", false);
    }
  };

  function handleCloseOrderReceiveModal() {
    setOpenOrderReceiveModal(false);
    onClickClose();
  }

  // let rowsEntries: any = [];
  let sumDCPercent: number = 0;
  const handleCalculateDCPercent = async () => {
    // if (docType === 'LD' && orderDetail.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_WAITAPPROVEL_1) {
    let sumActualQtyItems: number = 0;
    let sumQuantityRefItems: number = 0;

    if (Object.keys(payloadAddItem).length > 0) {
      payloadAddItem.forEach((item: itemsDetail) => {
        sumActualQtyItems = Number(sumActualQtyItems) + Number(item.actualQty); //รวมจำนวนรับจริง
        sumQuantityRefItems = Number(sumQuantityRefItems) + Number(item.qtyRef); //รวมจำนวนอ้าง
      });

      let sumPercent: number = (sumActualQtyItems * 100) / sumQuantityRefItems;
      sumPercent = Math.trunc(sumPercent); //remove decimal

      if (sumPercent >= 0) {
        sumDCPercent = sumPercent;
      }
    }
  };

  if (openTote === false) {
    if (
      docType === "LD" &&
      orderDetail.sdStatus ===
        ShipmentDeliveryStatusCodeEnum.STATUS_WAITAPPROVEL_1
    ) {
      if (sumDCPercent === 0) {
        handleCalculateDCPercent();
      }
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

  function handleCloseModelConfirm() {
    setOpenModelConfirm(false);
  }

  function handleModelPreviewDocument() {
    setOpenModelPreviewDocument(false);
  }

  const updateShipmentOrder = () => {
    dispatch(featchOrderListAsync(payloadSearchOrder));
  };

  const mapUpdateState = async () => {
    const itemsList: any = [];

    // if (rowsEntries.length > 0) {
    if (payloadAddItem.length > 0) {
      // const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
      // await rows.forEach((data: GridRowData) => {
      await payloadAddItem.forEach((data: any) => {
        itemsList.push(data);
      });

      if (itemsList.length > 0) {
        updateState(itemsList);
      }
    }
  };

  const handleSaveButton = async () => {
    handleOpenLoading("open", true);

    let qtyIsValid: boolean = true;
    // const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();

    const itemsList: any = [];
    const itemsListUpdate: any = [];
    // rows.forEach((data: GridRowData) => {

    payloadAddItem.forEach((data: any) => {
      const item: any = {
        barcode: data.barcode,
        deliveryOrderNo: data.deliveryOrderNo,
        actualQty: Number(data.actualQty)
          ? Number(data.actualQty)
          : Number(data.qty)
            ? Number(data.qty)
            : 0,
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
        shipmentNo: docRefNo,
        items: itemsList,
      };

      await saveOrderShipments(payload, orderDetail.sdNo)
        .then((_value) => {
          featchOrderDetail(orderDetail.sdNo);

          updateAddItemsState({});
          setShowSnackBar(true);
          setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
          setSnackbarStatus(true);
        })
        .catch((error: ApiError) => {
          updateState(itemsListUpdate);
          // setShowSnackBar(true);
          // setContentMsg(error.message);
          // setSnackbarStatus(false);
          setOpenFailAlert(true);
          setTextFail(error.message);
        });
    }

    handleOpenLoading("open", false);
  };

  const featchOrderDetail = async (sdNo: string) => {
    await dispatch(featchOrderDetailAsync(sdNo)).then((v) => {
      if (v.payload) {
        const p: any = v.payload ? v.payload : null;

        if (p) {
          const itemsNewMap = p.data.items.map((item: any, index: number) => {
            return {
              rowOrder: index + 1,
              id: index,
              deliveryOrderNo: item.deliveryOrderNo,
              isTote: item.isTote ? item.isTote : false,
              sdStatus:
                orderDetail.sdStatus ===
                  ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT ||
                orderDetail.sdStatus ===
                  ShipmentDeliveryStatusCodeEnum.STATUS_REJECT_APPROVAL_1
                  ? false
                  : true,
              skuCode: item.skuCode,
              barcode: item.barcode,
              productName: item.productName,
              unitName: item.unitName,
              qtyRef: item.qty,
              actualQty: item.actualQty,
              qtyDiff: item.qtyDiff,
              comment: item.comment,
              hhQty: item.hhQty,
            };
          });
          updateState(itemsNewMap);
        }
      }
    });
  };

  const [sumActualQty, setSumActualQty] = React.useState(0);
  const [sumQuantityRef, setSumQuantityRef] = React.useState(0);
  const handleApproveBtn = async () => {
    mapUpdateState().then(() => {
      setItemsDiffState([]);

      setAction(ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE);
      // const rowsEdit: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
      const itemsList: any = [];

      let qtyIsValid: boolean = true;

      let sumActualQtyItems: number = 0;
      let sumQuantityRefItems: number = 0;
      // rowsEdit.forEach((data: GridRowData) => {

      payloadAddItem.forEach((data: any) => {
        // let qtyRef = data.qtyRef ? data.qtyRef : data.qty ? data.qty : 0;
        let qtyRef = data.qtyRef ? data.qtyRef : 0;
        let actualQty = data.actualQty
          ? data.actualQty
          : data.qty
            ? data.qty
            : 0;

        let diffCount: number = Number(actualQty) - Number(qtyRef);
        sumActualQtyItems = Number(sumActualQtyItems) + Number(data.actualQty); //รวมจำนวนรับจริง
        sumQuantityRefItems = Number(sumQuantityRefItems) + Number(data.qtyRef); //รวมจำนวนอ้าง

        const itemDiff: Entry = {
          barcode: data.barcode,
          deliveryOrderNo: data.deliveryOrderNo,
          actualQty: actualQty,
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
          qtyRef: qtyRef,
          price: 0,
          isControlStock: 0,
          toteCode: "",
          expireDate: "",
          isTote: data.isTote,
        };

        if (
          data.isTote === true &&
          !(Number(data.actualQty) * 1 >= 0 && Number(data.actualQty) * 1 <= 1)
        ) {
          qtyIsValid = false;
        }

        setItemsDiffState((itemsDiffState) => [...itemsDiffState, itemDiff]);
        itemsList.push(data);
      });

      setSumActualQty(sumActualQtyItems);
      setSumQuantityRef(sumQuantityRefItems);
      // handleCalculateDCPercent(sumActualQtyItems, sumQuantityRefItems); //คำนวณDC(%)

      if (!qtyIsValid) {
        setOpenFailAlert(!qtyIsValid);
        setTextFail("จำนวนรับจริงของTote ต้องเป็น 0 หรือ 1 เท่านั้น");
      }

      if (qtyIsValid) {
        setOpenModelConfirm(true);
      }
    });
  };

  const handleApproveOCBtn = async () => {
    await approveOrderShipmentsOC(orderDetail.sdNo)
      .then((_value) => {
        setShowSnackBar(true);
        setContentMsg("คุณได้อนุมัติเรียบร้อยแล้ว");
        setSnackbarStatus(true);
        updateShipmentOrder();
        updateAddItemsState({});
        onClickClose();
      })
      .catch((error: ApiError) => {
        setOpenFailAlert(true);
        setTextFail(error.message);

        let errorList: ErrorDetail[] = [];
        setPayloadError(null);
        if (error.data) {
          const datas: ToteItem[] = error.data;
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
      });
  };

  const validateFileInfo = () => {
    const isvalid = fileUploadList.length > 0 ? true : false;
    if (!isvalid) {
      setOpenFailAlert(true);
      setTextFail("กรุณาแนบเอกสาร");
      return false;
    }
    return true;
  };

  const handleCloseJobBtn = () => {
    const isFileValidate: boolean = validateFileInfo();
    if (isFileValidate) {
      setOpenModelConfirm(true);
      setAction(ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB);
    }
  };

  const handlePrintBtn = async () => {
    handleOpenLoading("open", true);
    setStatusFile(1);
    setOpenModelPreviewDocument(true);
    handleOpenLoading("open", false);
  };

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    function Alert(props, ref) {
      return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    },
  );

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

      updateShipmentOrder();
      setTimeout(() => {
        setOpen(false);
        onClickClose();
      }, 1000);
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
        setTextFail("ไม่สามารถใช้ เลข Tote ดังต่อไปนี้ได้");
        setPayloadError(payload);
      }
    }

    // if (issuccess) {
    //   const msg = 'คุณได้ทำรายการเรียบร้อยแล้ว';
    //   setShowSnackBar(true);
    //   setContentMsg(msg);
    //   setSnackbarStatus(issuccess);

    //   updateShipmentOrder();
    //   setTimeout(() => {
    //     setOpen(false);
    //     onClickClose();
    //   }, 1000);
    // } else {
    //   setOpenFailAlert(true);
    //   setTextFail(errorMsg);
    // }
    handleOpenLoading("open", false);
  };

  const handleCloseFailAlert = () => {
    setOpenFailAlert(false);
    setTextFail("");
  };

  const [opensSD, setOpensSD] = React.useState(false);
  function isClosSDModal() {
    setOpenModelConfirm(false);
    setOpensSD(false);
  }

  const clickSelectedSDRef = async () => {
    handleOpenLoading("open", true);
    setTimeout(() => {
      handleOpenLoading("open", false);

      if (sdRef.data !== null && sdRef.data !== []) {
        setOpensSD(true);
      } else {
        setOpenFailAlert(true);
        setTextFail(
          `ไม่พบข้อมูล อ้างอิง SD โอนลอย: ${orderDetail.docRefRemark}`,
        );
      }
    }, 200);
  };

  const handleClose = () => {
    if (
      orderDetail.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE
    ) {
      if (fileUploadList.length > 0) {
        setConfirmModelExit(true);
      } else {
        dispatch(updateAddItemsState({}));
        setOpen(false);
        onClickClose();
      }
    } else {
      dispatch(updateAddItemsState({}));
      setOpen(false);
      onClickClose();
    }
  };

  const [openModelAddTote, setOpenModelAddTote] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openDropdown = Boolean(anchorEl);

  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);

  const handleClickAddItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseDropdown = () => {
    setAnchorEl(null);
  };

  const handleOpenTote = () => {
    setOpenModelAddTote(true);
    setAnchorEl(null);
  };

  const handleOpenAddItem = () => {
    setOpenModelAddItems(true);
    setAnchorEl(null);
  };

  const handleCloseModelAddTote = () => {
    setOpenModelAddTote(false);
  };

  const handleUpdateToteNo = (toteNo: string) => {
    setToteNo(toteNo);
  };

  const handleModelAddItems = async () => {
    setOpenModelAddItems(false);
  };

  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);
  const handleOnChangeUploadFile = (status: boolean) => {
    setUploadFileFlag(status);
  };

  const onDeleteAttachFileOld = (item: any) => {
    const fileKeyDel = item.fileKey;
  };

  const [openReject, setOpenReject] = React.useState(false);

  const handleRejectBtn = () => {
    setOpenReject(true);
  };

  const onCallBackReject = async (comment: string) => {
    handleOpenLoading("open", true);
    setOpenReject(false);
    const payload: any = {
      comment: comment,
      sdNo: sdNo,
    };
    await rejectOrderShipmentsOC(payload)
      .then((value) => {
        setShowSnackBar(true);
        setContentMsg("ส่งคำขอ เรียบร้อยแล้ว");
        setSnackbarStatus(true);
        updateShipmentOrder();
        updateAddItemsState({});
      })
      .catch((error: ApiError) => {
        setOpenFailAlert(true);
        setTextFail(error.message);
      })
      .finally(() => {
        handleOpenLoading("open", false);
      });
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียดใบตรวจสอบการรับ-โอนสินค้า
          </Typography>
        </BootstrapDialogTitle>

        <DialogContent>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{docRefNo}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">เลข Tote:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderDetail.toteCode ? orderDetail.toteCode : "-"}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร SD:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{orderDetail.sdNo}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">สถานะ:</Typography>
              </Grid>
              <Grid item lg={4}>
                {/* <Typography variant="body2">{shipmentStatusText}</Typography> */}
                <Typography variant="body2">
                  {t(`status.${orderDetail.sdStatus}`)}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{shipmentDateFormat}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">ประเภท:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {getShipmentTypeText(orderDetail.sdType)}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">ทะเบียนรถ:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{orderDetail.truckID}</Typography>
              </Grid>
              <Grid item lg={2}>
                {orderDetail.sdStatus ===
                  ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE && (
                  <Typography variant="body2">ใบผลต่างหลังเซ็นต์:</Typography>
                )}

                {orderDetail.sdImageFile !== "" &&
                  orderDetail.sdImageFile !== "temp" &&
                  orderDetail.sdStatus ===
                    ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB && (
                    <Typography variant="body2">ใบผลต่างหลังเซ็นต์:</Typography>
                  )}
              </Grid>
              <Grid item lg={4}>
                {orderDetail.sdStatus ===
                  ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE &&
                  !statusOC && (
                    <AccordionUploadFile
                      files={[]}
                      docNo=""
                      docType=""
                      isStatus={uploadFileFlag}
                      onChangeUploadFile={handleOnChangeUploadFile}
                      enabledControl={true}
                      onDeleteAttachFile={onDeleteAttachFileOld}
                    />
                  )}

                {orderDetail.sdStatus ===
                  ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB &&
                  orderDetail.files !== null && (
                    <AccordionHuaweiFile files={orderDetail.files} />
                  )}
              </Grid>
            </Grid>

            {orderDetail.docRefRemark !== "" && (
              <Grid container spacing={2} mb={1}>
                <Grid item lg={2}>
                  <Typography variant="body2">เอกสารอ้างอิง :</Typography>
                </Grid>
                <Grid item lg={4}>
                  {findIndexStr && (
                    <Typography variant="body2">
                      <u
                        onClick={clickSelectedSDRef}
                        style={{ cursor: "pointer" }}
                      >
                        {orderDetail.docRefRemark}
                      </u>
                    </Typography>
                  )}
                  <div>
                    {!findIndexStr && (
                      <Typography variant="body2">
                        {orderDetail.docRefRemark}
                      </Typography>
                    )}
                  </div>
                </Grid>
                <Grid item lg={6}></Grid>
              </Grid>
            )}
          </Box>

          {/* DisplayBtn */}
          <Box sx={{ marginTop: 4 }}>
            <Grid
              container
              spacing={2}
              display="flex"
              justifyContent="space-between"
            >
              {/* <Grid item xl={2}> */}
              <Grid item xl={4}>
                {statusWaitApprove1 && orderDetail.sdType !== 1 && (
                  <>
                    <Typography
                      variant="body1"
                      align="center"
                      sx={{
                        color: "#FF0000",
                      }}
                    >
                      {sumDCPercent < DCPercent &&
                        `*จำนวนรับจริง ${sumDCPercent}% น้อยกว่าค่าที่กำหนด ${DCPercent}%*`}
                      {sumDCPercent > DCPercent &&
                        `*จำนวนรับจริง ${sumDCPercent}% มากกว่าค่าที่กำหนด ${DCPercent}%*`}
                    </Typography>
                  </>
                )}

                {!statusWaitApprove1 && (
                  <Button
                    id="btnPrint"
                    variant="contained"
                    color="secondary"
                    onClick={handlePrintBtn}
                    startIcon={<Print />}
                    className={classes.MbtnPrint}
                    style={{ textTransform: "none" }}
                    sx={{
                      display: `${
                        showCloseJobBtn || isAllowExportBtn ? "none" : ""
                      }`,
                    }}
                  >
                    พิมพ์ใบผลต่าง
                  </Button>
                )}

                {showSaveBtn && (
                  <Button
                    id="btnAddItem"
                    variant="contained"
                    color="secondary"
                    onClick={handleClickAddItem}
                    className={classes.MbtnAdd}
                    sx={{ display: `${!displayBranchGroup ? "none" : ""}` }}
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
                  {showSdTypeTote && (
                    <MenuItem
                      sx={{ color: "#446EF2" }}
                      onClick={handleOpenTote}
                    >
                      เพิ่ม Tote
                    </MenuItem>
                  )}
                  <MenuItem
                    sx={{ color: "#446EF2" }}
                    onClick={handleOpenAddItem}
                  >
                    เพิ่มสินค้า
                  </MenuItem>
                </StyledMenu>
              </Grid>

              <Grid item>
                {showSaveBtn && (
                  <div>
                    <Button
                      id="btnSave"
                      variant="contained"
                      color="warning"
                      className={classes.MbtnSave}
                      onClick={handleSaveButton}
                      startIcon={<SaveIcon />}
                      style={{ width: 200 }}
                      sx={{ display: `${!displayBranchGroup ? "none" : ""}` }}
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
                      sx={{ display: `${!displayBranchGroup ? "none" : ""}` }}
                    >
                      ยืนยัน
                    </Button>
                  </div>
                )}

                {showApproveBtn && (
                  <Button
                    id="btnClose"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnClose}
                    onClick={handleCloseJobBtn}
                    startIcon={<BookmarkAdded />}
                    sx={{ display: `${!displayBranchGroup ? "none" : ""}` }}
                  >
                    ปิดงาน
                  </Button>
                )}

                {statusOC && statusWaitApprove1 && (
                  <>
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
                    <Button
                      id="btnApprove"
                      variant="contained"
                      color="error"
                      className={classes.MbtnApprove}
                      onClick={handleRejectBtn}
                      startIcon={<HighlightOffIcon />}
                      style={{ width: 200 }}
                    >
                      ไม่อนุมัติ
                    </Button>
                  </>
                )}
              </Grid>
            </Grid>
          </Box>

          <Box mt={2} bgcolor="background.paper">
            {!closeJobTote && <CheckOrderDetailList />}

            {closeJobTote && (
              <div>
                <CheckOrderDetailListTote
                  onOpenToteDetail={handleOpenModalTote}
                />
              </div>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextBoxComentList
              filedLabel={"หมายเหตุไม่อนุมัติ:"}
              payload={[]}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {opensSD && (
        <CheckOrderSDRefDetail
          sdNo={sdNo}
          sdRefNo={orderDetail.docRefRemark}
          shipmentNo={docRefNo}
          defaultOpen={opensSD}
          onClickClose={isClosSDModal}
        />
      )}

      {openOrderReceiveModal && (
        <OrderReceiveDetail
          defaultOpen={openOrderReceiveModal}
          onClickClose={handleCloseOrderReceiveModal}
          isTote={true}
          toteCodeNew={toteCode}
        />
      )}

      <ConfirmOrderShipment
        open={openModelConfirm}
        onClose={handleCloseModelConfirm}
        onUpdateShipmentStatus={handleShowSnackBar}
        shipmentNo={docRefNo}
        sdNo={orderDetail.sdNo}
        action={action}
        items={itemsDiffState}
        percentDiffType={false}
        percentDiffValue="0"
        // sumDCPercent={sumDCPercent}
        sumActualQty={sumActualQty}
        sumQuantityRef={sumQuantityRef}
        docType={docType}
        sdType={orderDetail.sdType}
      />

      <ConfirmExitModel
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />

      <ModalShowFile
        open={openModelPreviewDocument}
        onClose={handleModelPreviewDocument}
        url={getPathReportSD(orderDetail.sdNo)}
        statusFile={statusFile}
        sdImageFile={orderDetail.sdImageFile ? orderDetail.sdImageFile : ""}
        fileName={
          orderDetail.sdImageFilename
            ? orderDetail.sdImageFilename
            : formatFileName(
                orderDetail.sdNo,
                t(`status.${orderDetail.sdStatus}`),
              )
        }
        btnPrintName="พิมพ์ใบผลต่าง"
      />

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

      <AddToteModel
        open={openModelAddTote}
        onClose={handleCloseModelAddTote}
        updateToteNo={handleUpdateToteNo}
      />
      <ModalAddItems
        open={openModelAddItems}
        onClose={handleModelAddItems}
        requestBody={{
          skuCodes: [],
          skuTypes: [2],
          isSellable: true,
        }}
      ></ModalAddItems>
      <ModalReject
        docNo={"LD123"}
        open={openReject}
        onClose={() => {
          setOpenReject(false);
        }}
        onCallBack={onCallBackReject}
      />
    </div>
  );
}
