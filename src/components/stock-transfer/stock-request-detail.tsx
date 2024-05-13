import React, { ReactElement, useEffect } from "react";
import moment from "moment";
import { useAppSelector } from "../../store/store";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { Box, Button, DialogTitle, Grid, IconButton } from "@mui/material";
import {
  CheckCircleOutline,
  ControlPoint,
  HighlightOff,
} from "@mui/icons-material";
import SaveIcon from "@mui/icons-material/Save";
import Steppers from "./steppers";
import { useStyles } from "../../styles/makeTheme";
import DatePickerComponent from "../commons/ui/date-picker-detail";
import BranchListDropDown from "../commons/ui/branch-list-dropdown";
import StockRequestSKU from "./stock-request-list-sku";
import { useAppDispatch } from "../../store/store";
import ModalAddItems from "../commons/ui/modal-add-items";
import TransferReasonsListDropDown from "./transfer-reasons-list-dropdown";
import {
  updateAddItemsState,
  updateErrorList,
} from "../../store/slices/add-items-slice";
import {
  Approve1StockTransferRequest,
  Approve2StockTransferRequest,
  SaveStockTransferRequest,
} from "../../models/stock-transfer-model";
import { ApiError } from "../../models/api-error-model";
import {
  approve1StockRequest,
  approve2BySCMStockRequest,
  approve2StockRequest,
  reject1StockRequest,
  reject2StockRequest,
  removeStockRequest,
  saveStockRequest,
  submitStockRequest,
} from "../../services/stock-transfer";
import SnackbarStatus from "../commons/ui/snackbar-status";
import LoadingModal from "../commons/ui/loading-modal";
import AlertError from "../commons/ui/alert-error";
import TextBoxComment from "../commons/ui/textbox-comment";
import { getBranchName, getReasonLabel } from "../../utils/utils";
import ModalConfirmTransaction from "./modal-confirm-transaction";
import { featchSearchStockTransferRtAsync } from "../../store/slices/stock-transfer-rt-slice";
import ConfirmModelExit from "../commons/ui/confirm-exit-model";
import { featchStockRequestDetailAsync } from "../../store/slices/stock-request-detail-slice";

import {
  isAllowActionPermission,
  isGroupBranch,
} from "../../utils/role-permission";
import { env } from "../../adapters/environmentConfigs";
import { getUserInfo } from "../../store/sessionStore";
import { ACTIONS, PERMISSION_GROUP } from "../../utils/enum/permission-enum";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { isPreferredUsername } from "../../utils/role-permission";
import ModelDeleteConfirm from "./modal-delete-confirm";
import { SuperviseBranchRequest } from "../../models/search-branch-model";
import {
  clearSuperviseBranchFilter,
  featchSuperviseBranchListAsync,
} from "../../store/slices/authority/authorized-branch-slice";
import i18n from "../../locales/i18n";
import { mappingErrorParam } from "../../utils/exception/pos-exception";
import { ErrorDetailResponse, Header } from "../../models/api-error-model";

interface State {
  branchCode: string;
}

interface BranchListOptionType {
  name: string;
  code: string;
}

interface Props {
  type: string;
  edit: boolean;
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

function stockRequestDetail({
  type,
  edit,
  isOpen,
  onClickClose,
}: Props): ReactElement {
  const [open, setOpen] = React.useState(isOpen);
  const dispatch = useAppDispatch();
  const classes = useStyles();

  const [groupBranch, setGroupBranch] = React.useState(isGroupBranch);
  const [displayBtnAddItem, setDisplayBtnAddItem] = React.useState(false);
  const [displayBtnSave, setDisplayBtnSave] = React.useState(false);
  const [displayBtnSubmit, setDisplayBtnSubmit] = React.useState(false);
  const [displayBtnApprove, setDisplayBtnApprove] = React.useState(false);
  const [displayBtnReject, setDisplayBtnReject] = React.useState(false);
  const [groupOC, setGroupOC] = React.useState(false);
  const [groupSCM, setGroupSCM] = React.useState(false);
  const [groupBranchSCM, setGroupBranchSCM] = React.useState<boolean>(false);
  const [isAuthorizedBranch, setIsAuthorizedBranch] =
    React.useState<boolean>(false);
  // const [pageSize, setPageSize] = React.useState(limit.toString());

  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const reasonsList = useAppSelector(
    (state) => state.transferReasonsList.reasonsList.data,
  );
  const stockRequestDetail = useAppSelector(
    (state) => state.stockRequestDetail.stockRequestDetail.data,
  );
  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  let rowLength = 0;

  if (type === "Create") {
    if (Object.keys(payloadAddItem).length > 0)
      rowLength = Object.keys(payloadAddItem).length;
  } else {
    if (Object.keys(payloadAddItem).length > 0) {
      rowLength = Object.keys(payloadAddItem).length;
    } else if (stockRequestDetail) {
      const items = stockRequestDetail.items ? stockRequestDetail.items : [];
      if (items.length > 0) rowLength = items.length;
    }
  }

  // let deleteMode = false;
  const [canCleMode, setCanCleMode] = React.useState(false);
  const [preferredUsername, setPreferredUsername] = React.useState(
    isPreferredUsername(),
  );

  useEffect(() => {
    setOpen(isOpen);

    setDisplayBtnSave(isAllowActionPermission(ACTIONS.STOCK_RT_MANAGE));
    setDisplayBtnSubmit(isAllowActionPermission(ACTIONS.STOCK_RT_SEND));
    setDisplayBtnApprove(isAllowActionPermission(ACTIONS.STOCK_RT_APPROVE));
    setDisplayBtnReject(isAllowActionPermission(ACTIONS.STOCK_RT_REJECT));
    const oc = getUserInfo().group === PERMISSION_GROUP.OC;
    const scm = getUserInfo().group === PERMISSION_GROUP.SCM;
    setGroupOC(oc);
    setGroupSCM(scm);
    setGroupBranchSCM(scm);
    setIsAuthorizedBranch(scm);

    if (type === "View" && stockRequestDetail) {
      setDisplayBtnAddItem(true);
      setStatus(stockRequestDetail.status);
      if (stockRequestDetail.status === "WAIT_FOR_APPROVAL_1") {
        if (!oc) {
          setIsDisableOC(false);
        }

        setIsDisableSCM(false);
      } else if (stockRequestDetail.status === "WAIT_FOR_APPROVAL_2") {
        if (!scm) {
          setIsDisableSCM(false);
        }
        setIsDisableOC(false);
      } else {
        setIsDisableSCM(false);
        setIsDisableOC(false);
      }

      setRTNo(stockRequestDetail.rtNo);
      setCreateDate(stockRequestDetail.createdDate);

      let starD: any = stockRequestDetail.startDate;
      let endD: any = stockRequestDetail.endDate;
      setStartDate(new Date(starD));
      setEndDate(new Date(endD));

      const branchFrom = getBranchName(
        branchList,
        stockRequestDetail.branchFrom,
      );
      const branchFromMap: BranchListOptionType = {
        code: stockRequestDetail.branchFrom,
        name: branchFrom ? branchFrom : "",
      };

      setValuebranchFrom(branchFromMap);
      setFromBranch(stockRequestDetail.branchFrom);

      const branchTo = getBranchName(branchList, stockRequestDetail.branchTo);
      const branchToMap: BranchListOptionType = {
        code: stockRequestDetail.branchTo,
        name: branchTo ? branchTo : "",
      };
      setValuebranchTo(branchToMap);
      setToBranch(stockRequestDetail.branchTo);

      setReasons(stockRequestDetail.transferReason);
      const reason = getReasonLabel(
        reasonsList,
        stockRequestDetail.transferReason,
      );
      setReasonText(reason ? reason : "-");

      // auditLog get comment
      const auditLog = stockRequestDetail.auditLogs
        ? stockRequestDetail.auditLogs
        : [];
      const comments = auditLog.filter((r: any) => r.comment !== undefined);
      const commentOC: any[] = [];
      const commentSCM: any[] = [];
      comments.forEach((c: any) => {
        const comment = `${c.comment ? c.comment : ""}`;
        const by = JSON.parse(`${comment}`).by;
        const detail = JSON.parse(`${comment}`).detail;
        if (by === "OC") {
          commentOC.push(detail);
        } else if (by === "SCM") {
          commentSCM.push(detail);
        }
      });

      setCommentOC(commentOC[commentOC.length - 1]);
      setCommentSCM(commentSCM[commentSCM.length - 1]);
    } else {
      setDisplayBtnAddItem(false);
    }

    if (
      (stockRequestDetail?.status === "DRAFT" ||
        stockRequestDetail?.status === "AWAITING_FOR_REQUESTER") &&
      !groupOC &&
      stockRequestDetail?.createdBy === preferredUsername
    ) {
      setCanCleMode(true);
    }

    dispatch(updateErrorList({}));
  }, [open === true]);

  const [status, setStatus] = React.useState("");
  const [rtNo, setRTNo] = React.useState("");
  const [createDate, setCreateDate] = React.useState<Date | null>(new Date());
  const [values, setValues] = React.useState<State>({
    branchCode: "",
  });
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const [flagSave, setFlagSave] = React.useState(false);
  const [flagCreateSave, setFlagCreateSave] = React.useState(false);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const handleChkSaveClose = async () => {
    if (flagSave && edit) {
      setConfirmModelExit(true);
    } else if (
      !flagSave &&
      (status === "DRAFT" || status === "AWAITING_FOR_REQUESTER")
    ) {
      if (type === "View" && rowLength !== Object.keys(payloadAddItem).length) {
        setConfirmModelExit(true);
      } else if (type === "Create" && rowLength > 0 && !flagCreateSave) {
        setConfirmModelExit(true);
      } else {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  const handleClose = async () => {
    await dispatch(updateAddItemsState({}));
    setOpen(false);
    onClickClose();
  };

  function handleNotExitModelConfirm() {
    setConfirmModelExit(false);
  }

  const handleExitModelConfirm = async () => {
    handleClose();
  };

  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const handleStartDatePicker = (value: any) => {
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };

  if (endDate != null && startDate != null) {
    if (endDate < startDate) {
      setEndDate(null);
    }
  }

  const [fromBranch, setFromBranch] = React.useState("");
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

  if (valuebranchFrom?.code) {
    if (!displayBtnAddItem) setDisplayBtnAddItem(true);
    if (fromBranch === "") setFromBranch(valuebranchFrom?.code);
  }

  const [valuebranchTo, setValuebranchTo] =
    React.useState<BranchListOptionType | null>(null);
  const [toBranch, setToBranch] = React.useState("");
  const [clearBranchFromDropDown, setClearBranchFromDropDown] =
    React.useState<boolean>(false);
  const [clearBranchToDropDown, setClearBranchToDropDown] =
    React.useState<boolean>(false);
  const handleChangeFromBranch = (branchCode: string) => {
    if (groupSCM) {
      getSuperviseBranch(branchCode);
    }

    setFlagSave(true);
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branchCode: JSON.parse(codes) });
      setFromBranch(branchCode);

      setDisplayBtnAddItem(true);
      setFromBranch(branchCode);
    } else {
      setValues({ ...values, branchCode: "" });
      setFromBranch("");
    }

    if (!clearBranchToDropDown) setClearBranchToDropDown(true);
    else if (clearBranchToDropDown) setClearBranchToDropDown(false);
    setValuebranchTo(null);
  };

  const handleChangeToBranch = (branchCode: string) => {
    setFlagSave(true);
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branchCode: JSON.parse(codes) });
      setToBranch(branchCode);
    } else {
      setValues({ ...values, branchCode: "" });
      setToBranch("");
    }
  };

  const getSuperviseBranch = async (branchCode: string) => {
    await dispatch(clearSuperviseBranchFilter());
    const payload: SuperviseBranchRequest = {
      role: "dc",
      branchCode: branchCode,
      isDC: true,
    };
    await dispatch(featchSuperviseBranchListAsync(payload));
  };

  const [reasons, setReasons] = React.useState("");
  const [reasonText, setReasonText] = React.useState("");
  const handleChangeReasons = (ReasonsCode: string) => {
    setFlagSave(true);
    setReasons(ReasonsCode);
  };

  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const [flagStock, setFlagStock] = React.useState(false);

  const handleOpenAddItems = () => {
    setFlagStock(false);
    setOpenModelAddItems(true);
  };
  const handleModelAddItems = async () => {
    setFlagStock(true);
    setFlagSave(true);
    setOpenModelAddItems(false);
  };

  let skuList: any = [];
  const handleMapSKU = async (sku: any) => {
    skuList = sku;
  };

  const handleStatusChangeItems = async (items: any) => {
    setFlagSave(true);
  };

  const [commentOC, setCommentOC] = React.useState("");
  const [commentSCM, setCommentSCM] = React.useState("");
  const [isDisableOC, setIsDisableOC] = React.useState(true);
  const [isDisableSCM, setIsDisableSCM] = React.useState(true);

  const handleChangeCommentOC = (value: any) => {
    setFlagSave(true);
    setCommentOC(value);
  };
  const handleChangeCommentSCM = (value: any) => {
    setFlagSave(true);
    setCommentSCM(value);
  };

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  // const [titleError, setTitleError] = React.useState('');
  const [payloadError, setPayloadError] = React.useState<ErrorDetailResponse>();
  const [errorDetail, setErrorDetail] = React.useState<any>();
  const [errorCode, setErrorCode] = React.useState(0);
  const handleCloseAlert = async () => {
    if (errorDetail && errorDetail.error_details.length > 0) {
      await dispatch(updateErrorList(errorDetail));
    }

    setOpenAlert(false);
  };

  const handleSave = async () => {
    setOpenLoadingModal(true);

    let validateActualQty = payloadAddItem.filter((r: any) => r.qty === 0);
    const validateStockQty: any = skuList.filter((item: any) => {
      return Number(item.orderAllQty) > Number(item.stock);
    });

    if (!startDate || !endDate) {
      setOpenAlert(true);
      setTextError("กรุณาเลือกวันที่โอนสินค้า");
    } else if (fromBranch === "" || toBranch === "") {
      setOpenAlert(true);
      setTextError("กรุณาเลือกสาขาโอนสินค้า");
    } else if (reasons === "All" || reasons === undefined || reasons === "") {
      setOpenAlert(true);
      setTextError("กรุณาเลือกสาเหตุการโอน");
    } else if (validateActualQty.length > 0) {
      setOpenAlert(true);
      setTextError("กรุณาระบุจำนวนสินค้าที่รับ ต้องมีค่ามากกว่า 0");
    } else if (validateStockQty.length > 0) {
      setOpenAlert(true);
      setTextError(
        "กรุณาแก้ไขจำนวนที่สั่ง เนื่องจากสต๊อกสินค้าคงเหลือไม่เพียงพอ",
      );
    } else {
      const payloadSave: any = await handleMapPayloadSave();
      await saveStockRequest(payloadSave)
        .then(async (value) => {
          await dispatch(featchStockRequestDetailAsync(value.docNo));

          if (type === "Create") {
            type = "View";
            setFlagCreateSave(true);
          }

          setFlagSave(false);
          setRTNo(value.docNo);
          setStatus("DRAFT");
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
          setErrorDetail([]);
        })
        .catch((error: ApiError) => {
          setErrorCode(error.code);
          setErrorDetail(error);
          const header: Header = {
            field1: false,
            field2: false,
            field3: true,
            field4: false,
          };
          const payload: ErrorDetailResponse = {
            header: header,
            error_details: error.error_details,
          };
          setTextError(error.message);
          setPayloadError(payload);
          setOpenAlert(true);
        });
    }
    setOpenLoadingModal(false);
  };

  const handleMapPayloadSave = async () => {
    const itemGroups: any = [];
    if (skuList.length > 0) {
      await skuList.forEach((data: any) => {
        const item: any = {
          skuCode: data.skuCode,
          remainingQty: data.stock ? data.stock : 0,
        };
        itemGroups.push(item);
      });
    }

    const items: any = [];
    if (Object.keys(payloadAddItem).length > 0) {
      await payloadAddItem.forEach((data: any) => {
        const item: any = {
          barcode: data.barcode,
          orderQty: data.orderQty ? data.orderQty : data.qty ? data.qty : 0,
        };
        items.push(item);
      });
    }

    let rt = "";
    if (rtNo) rt = rtNo;
    const payload: SaveStockTransferRequest = {
      rtNo: rt,
      startDate: moment(startDate).startOf("day").toISOString(),
      endDate: moment(endDate).startOf("day").toISOString(),
      branchFrom: fromBranch,
      branchTo: toBranch,
      transferReason: reasons,
      itemGroups: itemGroups,
      items: items,
    };

    return await payload;
  };

  const handleSubmit = async () => {
    setOpenLoadingModal(true);

    let validateActualQty = payloadAddItem.filter((r: any) => r.qty === 0);
    const validateStockQty: any = skuList.filter((item: any) => {
      return Number(item.orderAllQty) > Number(item.stock);
    });

    if (!startDate || !endDate) {
      setOpenAlert(true);
      setTextError("กรุณาเลือกวันที่โอนสินค้า");
    } else if (fromBranch === "" || toBranch === "") {
      setOpenAlert(true);
      setTextError("กรุณาเลือกสาขาโอนสินค้า");
    } else if (reasons === "All" || reasons === undefined || reasons === "") {
      setOpenAlert(true);
      setTextError("กรุณาเลือกสาเหตุการโอน");
    } else if (validateActualQty.length > 0) {
      setOpenAlert(true);
      setTextError("กรุณาระบุจำนวนสินค้าที่รับ ต้องมีค่ามากกว่า 0");
    } else if (validateStockQty.length > 0) {
      setOpenAlert(true);
      setTextError(
        "กรุณาแก้ไขจำนวนที่สั่ง เนื่องจากสต๊อกสินค้าคงเหลือไม่เพียงพอ",
      );
    } else {
      if (rtNo === "") {
        const payloadSave: any = await handleMapPayloadSave();
        await saveStockRequest(payloadSave)
          .then((value) => {
            setFlagSave(false);
            setRTNo(value.docNo);
            setStatus("DRAFT");

            setTextHeaderConfirm("ยืนยันส่งงาน รายการโอนสินค้า");
            setOpenModelConfirm(true);
          })
          .catch((error: ApiError) => {
            setErrorCode(error.code);
            setErrorDetail(error);
            const header: Header = {
              field1: false,
              field2: false,
              field3: true,
              field4: false,
            };
            const payload: ErrorDetailResponse = {
              header: header,
              error_details: error.error_details,
            };
            setTextError(error.message);
            setPayloadError(payload);
            setOpenAlert(true);
          });
      } else {
        setTextHeaderConfirm("ยืนยันส่งงาน รายการโอนสินค้า");
        setOpenModelConfirm(true);
      }
    }

    setOpenLoadingModal(false);
  };

  const handleApprove = async () => {
    setOpenLoadingModal(true);
    if (status === "WAIT_FOR_APPROVAL_1") {
      setTextHeaderConfirm("ยืนยันส่งรายการโอนสินค้าให้ SCM");
      setOpenModelConfirm(true);
    } else if (status === "WAIT_FOR_APPROVAL_2") {
      if (toBranch === "") {
        setOpenAlert(true);
        setTextError("กรุณาเลือกสาขาโอนสินค้าปลายทาง");
      } else {
        setOpenModelConfirm(true);
        setTextHeaderConfirm("ยืนยันรายการโอนสินค้า");
      }
    }

    setOpenLoadingModal(false);
  };

  const [flagReject, setFlagReject] = React.useState(false);
  const handleReject = async () => {
    setOpenLoadingModal(true);
    if (status === "WAIT_FOR_APPROVAL_1") {
      if (commentOC === "" || commentOC === undefined) {
        setOpenAlert(true);
        setTextError("กรุณากรอกหมายเหตุจากผู้อนุมัติ 1");
      } else {
        setFlagReject(true);
        setTextHeaderConfirm("ยืนยันไม่อนุมัติรายการโอนสินค้า");
        setOpenModelConfirm(true);
      }
    } else if (status === "WAIT_FOR_APPROVAL_2") {
      if (commentSCM === "" || commentSCM === undefined) {
        setOpenAlert(true);
        setTextError("กรุณากรอกหมายเหตุจากผู้อนุมัติ 2");
      } else if (toBranch === "") {
        setOpenAlert(true);
        setTextError("กรุณาเลือกสาขาโอนสินค้าปลายทาง");
      } else {
        setFlagReject(true);
        setTextHeaderConfirm("ยืนยันไม่อนุมัติรายการโอนสินค้า");
        setOpenModelConfirm(true);
      }
    }

    setOpenLoadingModal(false);
  };

  const payloadSearch = useAppSelector(
    (state) => state.searchStockTransferRt.searchStockTransferRt,
  );
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [textHeaderConfirm, setTextHeaderConfirm] = React.useState("");
  const handleCloseModelConfirm = () => {
    setFlagReject(false);
    setOpenModelConfirm(false);
  };
  const handleConfirm = async () => {
    setOpenModelConfirm(false);
    setOpenLoadingModal(true);

    if (edit && (status === "DRAFT" || status === "AWAITING_FOR_REQUESTER")) {
      const itemsList: any = [];
      if (Object.keys(payloadAddItem).length > 0) {
        await payloadAddItem.forEach((data: any) => {
          const item: any = {
            barcode: data.barcode,
            orderQty: data.orderQty ? data.orderQty : data.qty ? data.qty : 0,
          };
          itemsList.push(item);
        });

        const itemGroups: any = [];
        if (skuList.length > 0) {
          await skuList.forEach((data: any) => {
            const item: any = {
              skuCode: data.skuCode,
              remainingQty: data.stock ? data.stock : 0,
            };
            itemGroups.push(item);
          });
        }

        const payloadSubmit: any = {
          startDate: moment(startDate).startOf("day").toISOString(),
          endDate: moment(endDate).startOf("day").toISOString(),
          branchFrom: fromBranch,
          branchTo: toBranch,
          transferReason: reasons,
          itemGroups: itemGroups,
          items: itemsList,
        };

        if (groupSCM) {
          await approve2BySCMStockRequest(rtNo, payloadSubmit)
            .then((value) => {
              setFlagSave(false);
              setShowSnackBar(true);
              setSnackbarIsStatus(true);
              setContentMsg("คุณได้ส่งงานเรียบร้อยแล้ว");

              dispatch(featchSearchStockTransferRtAsync(payloadSearch));

              setTimeout(() => {
                handleClose();
              }, 500);
            })
            .catch((error: ApiError) => {
              setErrorDetail(error);
              const header: Header = {
                field1: false,
                field2: false,
                field3: true,
                field4: false,
              };
              const payload: ErrorDetailResponse = {
                header: header,
                error_details: error.error_details,
              };
              setTextError(error.message);
              setPayloadError(payload);
              setOpenAlert(true);
            });
        } else {
          await submitStockRequest(rtNo, payloadSubmit)
            .then((value) => {
              setFlagSave(false);
              setShowSnackBar(true);
              setSnackbarIsStatus(true);
              setContentMsg("คุณได้ส่งงานเรียบร้อยแล้ว");

              dispatch(featchSearchStockTransferRtAsync(payloadSearch));

              setTimeout(() => {
                handleClose();
              }, 500);
            })
            .catch((error: ApiError) => {
              setErrorDetail(error);
              const header: Header = {
                field1: false,
                field2: false,
                field3: true,
                field4: false,
              };
              const payload: ErrorDetailResponse = {
                header: header,
                error_details: error.error_details,
              };
              setTextError(error.message);
              setPayloadError(payload);
              setOpenAlert(true);
            });
        }
      }
    } else if (status === "WAIT_FOR_APPROVAL_1") {
      const payload1: Approve1StockTransferRequest = {
        comment: {
          by: "OC",
          detail: commentOC,
        },
      };

      if (flagReject) {
        setFlagReject(false);
        await reject1StockRequest(rtNo, payload1)
          .then((value) => {
            setFlagSave(false);
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("คุณได้ปฎิเสธข้อมูลเรียบร้อยแล้ว");
            dispatch(featchSearchStockTransferRtAsync(payloadSearch));

            setTimeout(() => {
              handleClose();
            }, 500);
          })
          .catch((error) => {
            // setShowSnackBar(true);
            // setContentMsg(error.message);
            setTextError(error.message);
            setOpenAlert(true);
          });
      } else {
        await approve1StockRequest(rtNo, payload1)
          .then((value) => {
            setFlagSave(false);
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("คุณได้อนุมัติข้อมูลเรียบร้อยแล้ว");
            dispatch(featchSearchStockTransferRtAsync(payloadSearch));

            setTimeout(() => {
              handleClose();
            }, 500);
          })
          .catch((error) => {
            // setShowSnackBar(true);
            // setContentMsg(error.message);
            setTextError(error.message);
            setOpenAlert(true);
          });
      }
    } else if (status === "WAIT_FOR_APPROVAL_2") {
      const payload2: Approve2StockTransferRequest = {
        branchTo: toBranch,
        comment: {
          by: "SCM",
          detail: commentSCM,
        },
      };

      if (flagReject) {
        setFlagReject(false);
        await reject2StockRequest(rtNo, payload2)
          .then((value) => {
            setFlagSave(false);
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("คุณได้ปฎิเสธข้อมูลเรียบร้อยแล้ว");
            dispatch(featchSearchStockTransferRtAsync(payloadSearch));

            setTimeout(() => {
              handleClose();
            }, 500);
          })
          .catch((error) => {
            // setShowSnackBar(true);
            // setContentMsg(error.message);
            setTextError(error.message);
            setOpenAlert(true);
          });
      } else {
        handleApprove2(payload2);
      }
    }

    setOpenLoadingModal(false);
  };

  const handleApprove2 = async (payload2: any) => {
    await approve2StockRequest(rtNo, payload2)
      .then((value) => {
        setFlagSave(false);
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้อนุมัติข้อมูลเรียบร้อยแล้ว");
        dispatch(featchSearchStockTransferRtAsync(payloadSearch));

        setTimeout(() => {
          handleClose();
        }, 500);
      })
      .catch((error: ApiError) => {
        setErrorDetail(error);
        const header: Header = {
          field1: false,
          field2: false,
          field3: true,
          field4: false,
        };
        const payload: ErrorDetailResponse = {
          header: header,
          error_details: error.error_details,
        };
        setTextError(error.message);
        setPayloadError(payload);
        setOpenAlert(true);
      });
  };

  const topFunction = () => {
    document.getElementById("top-item")?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };

  const [openModelDeleteConfirm, setOpenModelDeleteConfirm] =
    React.useState(false);

  const handleCancle = () => {
    setOpenModelDeleteConfirm(true);
  };

  const handleModelDeleteConfirm = async (confirm: boolean) => {
    if (confirm === true) {
      await removeStockRequest(rtNo)
        .then((value) => {
          dispatch(featchSearchStockTransferRtAsync(payloadSearch));
          setOpenModelDeleteConfirm(false);
          handleClose();
        })
        .catch((error) => {});
    } else {
      setOpenModelDeleteConfirm(false);
    }
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleChkSaveClose}
        >
          <Typography sx={{ fontSize: "1em" }}>
            {type === "Create" && "สร้างรายการโอนสินค้า"}
            {type !== "Create" &&
              (status === "DRAFT" || status === "AWAITING_FOR_REQUESTER") &&
              "รายการโอนสินค้า"}
            {type !== "Create" &&
              status !== "DRAFT" &&
              status !== "AWAITING_FOR_REQUESTER" &&
              "ตรวจสอบรายการโอนสินค้า"}
          </Typography>
          {status !== "" && <Steppers status={status} type="RT"></Steppers>}
          {status === "" && <Steppers status="DRAFT" type="RT"></Steppers>}
        </BootstrapDialogTitle>

        <DialogContent>
          <Grid container spacing={2} mb={2} id="top-item">
            <Grid item xs={2}>
              เลขที่เอกสาร RT :
            </Grid>
            <Grid item xs={4}>
              {rtNo !== "" && rtNo}
              {rtNo === "" && "-"}
            </Grid>
            <Grid item xs={2}>
              วันที่สร้างรายการ :
            </Grid>
            <Grid item xs={4}>
              {moment(createDate).add(543, "y").format("DD/MM/YYYY")}
            </Grid>
          </Grid>

          {edit && (
            <div>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={2}>
                  วันที่โอน* :
                </Grid>
                <Grid item xs={3}>
                  <DatePickerComponent
                    onClickDate={handleStartDatePicker}
                    value={startDate}
                  />
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                  วันที่สิ้นสุด* :
                </Grid>
                <Grid item xs={3}>
                  <DatePickerComponent
                    onClickDate={handleEndDatePicker}
                    value={endDate}
                    type={"TO"}
                    minDateTo={startDate}
                  />
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={2}>
                  สาขาต้นทาง* :
                </Grid>
                <Grid item xs={3}>
                  <BranchListDropDown
                    valueBranch={valuebranchFrom}
                    sourceBranchCode={toBranch}
                    onChangeBranch={handleChangeFromBranch}
                    isClear={clearBranchFromDropDown}
                    isFilterAuthorizedBranch={isAuthorizedBranch}
                    disable={groupBranch}
                    filterOutDC={groupBranchSCM}
                  />
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                  สาขาปลายทาง* :
                </Grid>
                <Grid item xs={3}>
                  <BranchListDropDown
                    valueBranch={valuebranchTo}
                    sourceBranchCode={fromBranch}
                    onChangeBranch={handleChangeToBranch}
                    isClear={clearBranchToDropDown}
                    isFilterAuthorizedBranch={isAuthorizedBranch}
                    // filterOutDC={groupBranch}
                    filterOutDC={groupSCM ? groupSCM : groupBranch}
                    superviseBranch={groupSCM}
                  />
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={2}>
                  สาเหตุการโอน* :
                </Grid>
                <Grid item xs={3}>
                  <TransferReasonsListDropDown
                    reasonsValue={reasons}
                    onChangeReasons={handleChangeReasons}
                    isClear={false}
                    isDetail={true}
                  />
                </Grid>
                <Grid item xs={7}></Grid>
              </Grid>
            </div>
          )}

          {!edit && (
            <div>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={2}>
                  วันที่โอน :
                </Grid>
                <Grid item xs={3}>
                  {moment(startDate).add(543, "y").format("DD/MM/YYYY")}
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                  วันที่สิ้นสุด :
                </Grid>
                <Grid item xs={3}>
                  {moment(endDate).add(543, "y").format("DD/MM/YYYY")}
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={2}>
                  สาขาต้นทาง :
                </Grid>
                <Grid item xs={3}>
                  {fromBranch}-{valuebranchFrom?.name}
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                  สาขาปลายทาง :
                </Grid>
                <Grid item xs={3}>
                  {status !== "WAIT_FOR_APPROVAL_2" &&
                    `${toBranch}-${valuebranchTo?.name}`}
                  {groupSCM && status === "WAIT_FOR_APPROVAL_2" && (
                    <BranchListDropDown
                      valueBranch={valuebranchTo}
                      sourceBranchCode={fromBranch}
                      onChangeBranch={handleChangeToBranch}
                      isClear={clearBranchToDropDown}
                      isFilterAuthorizedBranch={isAuthorizedBranch}
                      filterOutDC={groupBranch}
                    />
                  )}

                  {!groupSCM &&
                    status === "WAIT_FOR_APPROVAL_2" &&
                    `${toBranch}-${valuebranchTo?.name}`}
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={2}>
                  สาเหตุการโอน :
                </Grid>
                <Grid item xs={3}>
                  {reasonText}
                </Grid>
                <Grid item xs={7}></Grid>
              </Grid>
            </div>
          )}

          {edit &&
            !groupOC &&
            (status === "" ||
              status === "DRAFT" ||
              status === "AWAITING_FOR_REQUESTER") && (
              <Grid container spacing={2} mt={4} mb={2}>
                <Grid item xs={5}>
                  <Button
                    id="btnAddItem"
                    variant="contained"
                    color="info"
                    className={classes.MbtnPrint}
                    onClick={handleOpenAddItems}
                    startIcon={<ControlPoint />}
                    // sx={{ width: 200, display: `${!displayBtnAddItem ? 'none' : ''}` }}
                    sx={{ width: 200 }}
                    disabled={!displayBtnAddItem}
                  >
                    เพิ่มสินค้า
                  </Button>
                </Grid>
                <Grid item xs={7} sx={{ textAlign: "end" }}>
                  <Button
                    id="btnSave"
                    variant="contained"
                    color="warning"
                    className={classes.MbtnSave}
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    sx={{
                      width: 140,
                      display: `${displayBtnSave ? "none" : ""}`,
                    }}
                    disabled={rowLength == 0}
                  >
                    บันทึก
                  </Button>

                  <Button
                    id="btnCreateTransfer"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnSave}
                    onClick={handleSubmit}
                    startIcon={<CheckCircleOutline />}
                    sx={{
                      width: 140,
                      display: `${displayBtnSubmit ? "none" : ""}`,
                    }}
                    disabled={rowLength == 0}
                  >
                    ส่งงาน
                  </Button>

                  <Button
                    id="btnCreateTransfer"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnSave}
                    onClick={handleSubmit}
                    startIcon={<CheckCircleOutline />}
                    sx={{ width: 140, display: `${!groupSCM ? "none" : ""}` }}
                    disabled={rowLength == 0}
                  >
                    ส่งงาน
                  </Button>

                  <Button
                    id="btnCancle"
                    variant="contained"
                    color="error"
                    className={classes.MbtnSave}
                    onClick={handleCancle}
                    sx={{ width: 140 }}
                    disabled={!canCleMode}
                  >
                    ยกเลิก
                  </Button>
                </Grid>
              </Grid>
            )}

          <Grid container spacing={2} mt={4} mb={2}>
            <Grid item xs={5}></Grid>
            <Grid item xs={7} sx={{ textAlign: "end" }}>
              {groupOC && status === "WAIT_FOR_APPROVAL_1" && (
                <div>
                  <Button
                    id="btnSave"
                    variant="contained"
                    color="error"
                    className={classes.MbtnSave}
                    onClick={handleReject}
                    startIcon={<SaveIcon />}
                    sx={{
                      width: 140,
                      display: `${displayBtnReject ? "none" : ""}`,
                    }}
                  >
                    ปฎิเสธ
                  </Button>
                  <Button
                    id="btnCreateTransfer"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnSave}
                    onClick={handleApprove}
                    startIcon={<CheckCircleOutline />}
                    sx={{
                      width: 140,
                      display: `${displayBtnApprove ? "none" : ""}`,
                    }}
                  >
                    อนุมัติ
                  </Button>
                </div>
              )}

              {groupSCM && status === "WAIT_FOR_APPROVAL_2" && (
                <div>
                  <Button
                    id="btnSave"
                    variant="contained"
                    color="error"
                    className={classes.MbtnSave}
                    onClick={handleReject}
                    startIcon={<SaveIcon />}
                    sx={{
                      width: 140,
                      display: `${displayBtnReject ? "none" : ""}`,
                    }}
                  >
                    ปฎิเสธ
                  </Button>
                  <Button
                    id="btnCreateTransfer"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnSave}
                    onClick={handleApprove}
                    startIcon={<CheckCircleOutline />}
                    sx={{
                      width: 140,
                      display: `${displayBtnApprove ? "none" : ""}`,
                    }}
                  >
                    อนุมัติ
                  </Button>
                </div>
              )}
            </Grid>
          </Grid>
          <Box mb={12}>
            <StockRequestSKU
              type={type}
              edit={edit}
              onMapSKU={handleMapSKU}
              changeItems={handleStatusChangeItems}
              update={flagSave}
              stock={flagStock}
              branch={fromBranch}
              status={status}
            />
          </Box>
          {status !== "" && status !== "DRAFT" && (
            <Grid container spacing={2} mb={2}>
              <Grid item xs={3}>
                <TextBoxComment
                  fieldName="หมายเหตุจากผู้อนุมัติ 1 :"
                  defaultValue={commentOC}
                  maxLength={100}
                  onChangeComment={handleChangeCommentOC}
                  isDisable={!isDisableOC}
                />
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={3}>
                <TextBoxComment
                  fieldName="หมายเหตุจากผู้อนุมัติ 2 :"
                  defaultValue={commentSCM}
                  maxLength={100}
                  onChangeComment={handleChangeCommentSCM}
                  isDisable={!isDisableSCM}
                />
              </Grid>
            </Grid>
          )}
          <Box mt={3}>
            <Grid container spacing={2} mb={1}>
              <Grid item xs={10}></Grid>
              <Grid item xs={2} textAlign="center">
                <IconButton onClick={topFunction}>
                  <ArrowForwardIosIcon
                    sx={{
                      fontSize: "41px",
                      padding: "6px",
                      backgroundColor: "#C8E8FF",
                      transform: "rotate(270deg)",
                      color: "#fff",
                      borderRadius: "50%",
                    }}
                  />
                </IconButton>

                <Box fontSize="13px">กลับขึ้นด้านบน</Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <ModalAddItems
        open={openModelAddItems}
        onClose={handleModelAddItems}
        requestBody={{
          skuCodes: [],
          skuTypes: [2],
          isSellable: true,
        }}
      ></ModalAddItems>
      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />

      <ModalConfirmTransaction
        open={openModelConfirm}
        onClose={handleCloseModelConfirm}
        handleConfirm={handleConfirm}
        header={textHeaderConfirm}
        title="เลขที่เอกสาร RT"
        value={rtNo}
      />

      <LoadingModal open={openLoadingModal} />
      {/* <AlertError open={openAlert} onClose={handleCloseAlert} textError={textError} /> */}
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
        // title={titleError}
        payload={payloadError}
      />

      <ConfirmModelExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />

      <ModelDeleteConfirm
        open={openModelDeleteConfirm}
        onClose={handleModelDeleteConfirm}
        rtNo={rtNo}
      />
    </div>
  );
}

export default stockRequestDetail;
