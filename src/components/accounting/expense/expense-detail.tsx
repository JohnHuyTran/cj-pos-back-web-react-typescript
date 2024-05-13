import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import store, { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import AccordionUploadFile from "../../commons/ui/accordion-upload-file";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";

import SaveIcon from "@mui/icons-material/Save";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ControlPoint from "@mui/icons-material/ControlPoint";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpenseDetailSummary from "./expense-detail-summary";
import ModalAddExpense from "./modal-add-expense-format";
import ModelDescriptionExpense from "./modal-description-expense";

import { Cancel } from "@mui/icons-material";
import {
  DataItem,
  ExpenseInfo,
  ExpensePeriod,
  ExpenseSaveRequest,
  ItemItem,
  SumItems,
  SumItemsItem,
  Comment,
  payLoadAdd,
} from "../../../models/branch-accounting-model";
import {
  addNewItem,
  featchExpenseDetailAsync,
  haveUpdateData,
  initialItems,
  updateSummaryRows,
} from "../../../store/slices/accounting/accounting-slice";
import {
  getBranchName,
  isFilterFieldInExpense,
  isFilterOutFieldForPayload,
  isFilterOutFieldInAdd,
  numberWithCommas,
  stringNumberNullOrEmpty,
} from "../../../utils/utils";
import {
  convertUtcToBkkDate,
  convertUtcToBkkWithZ,
} from "../../../utils/date-utill";
import { getInit, getUserInfo, setInit } from "../../../store/sessionStore";
import { env } from "../../../adapters/environmentConfigs";
import {
  EXPENSE_TYPE,
  getExpenseStatus,
  STATUS,
} from "../../../utils/enum/accounting-enum";
import LoadingModal from "../../commons/ui/loading-modal";
import AlertError from "../../commons/ui/alert-error";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import {
  expenseApproveByAccount,
  expenseApproveByAccountManager,
  expenseApproveByBranch,
  expenseApproveByOC,
  expenseRejectByAccount,
  expenseRejectByAccountManager,
  expenseRejectByOC,
  expenseSave,
} from "../../../services/accounting";
import { ApiError } from "../../../models/api-error-model";
import moment from "moment";
import ModelConfirmDetail from "./confirm/modal-confirm-detail";
import ModelConfirmAccounting from "./confirm/modal-confirm-accounting";
import AccordionUploadSingleFile from "../../commons/ui/accordion-upload-single-file";
import ModalConfirmExpense from "./modal-confirm-expense";
import { isGroupBranch, isGroupOC } from "../../../utils/role-permission";
import { featchBranchAccountingListAsync } from "../../../store/slices/accounting/accounting-search-slice";
import Steppers from "./steppers";
import { FileType } from "../../../models/common-model";
import ConfirmModalExit from "../../commons/ui/confirm-exit-model";
import { uploadFileState } from "../../../store/slices/upload-file-slice";
import TextBoxComentList from "components/commons/ui/texbox-commentList";

interface Props {
  isOpen: boolean;
  onClickClose: () => void;
  type?: string;
  edit: boolean;
  periodProps?: ExpensePeriod;
}
function ExpenseDetail({
  isOpen,
  onClickClose,
  type,
  edit,
  periodProps,
}: Props) {
  const [open, setOpen] = React.useState(isOpen);
  const classes = useStyles();
  const _ = require("lodash");
  const dispatch = useAppDispatch();
  const { v4: uuidv4 } = require("uuid");
  const [docNo, setDocNo] = React.useState();
  const [editAction, setEditAction] = React.useState(edit);
  const [expenseTypeName, setExpenseTypeName] =
    React.useState("รายละเอียดเอกสาร");
  const [expenseType, setExpenseType] = React.useState("รายละเอียดเอกสาร");
  const [period, setPeriod] = React.useState<ExpensePeriod>({
    period: 0,
    startDate: "",
    endDate: "",
  });
  const [periodLabel, setPeriodLabel] = React.useState("");
  const [status, setStatus] = React.useState(STATUS.DRAFT);
  const [attachFiles, setAttachFiles] = React.useState([]);
  const [editAttachFiles, setEditAttachFiles] = React.useState<FileType[]>([]);
  const [approvalAttachFiles, setApprovalAttachFiles] = React.useState<
    FileType[]
  >([]);
  const [comment, setComment] = React.useState("");
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [branchCode, setBranchCode] = React.useState("");
  const [branchName, setBranchName] = React.useState("");
  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);
  const [openModalAddExpense, setOpenModalAddExpense] = React.useState(false);
  const [openModalDescriptionExpense, setOpenModalDescriptionExpense] =
    React.useState(false);
  const payloadSearch = useAppSelector(
    (state) => state.saveExpenseSearchRequest.searchExpense,
  );
  const expenseMasterList = useAppSelector(
    (state) => state.masterExpenseListSlice.masterExpenseList.data,
  );
  const expenseAccountDetail = useAppSelector(
    (state) => state.expenseAccountDetailSlice.expenseAccountDetail,
  );
  const expenseData: any = expenseAccountDetail.data
    ? expenseAccountDetail.data
    : null;
  const summary: SumItems = expenseData ? expenseData.sumItems : null;
  const _items: DataItem[] = expenseData ? expenseData.items : [];
  const [items, setItems] = React.useState<any>(_items ? _items : []);
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const [isShowBtnApprove, setIsShowBtnApprove] = React.useState(false);
  const [isShowBtnReject, setIsShowBtnReject] = React.useState(false);
  const [payloadModalConfirmDetail, setPayloadModalConfirmDetail] =
    React.useState<any>();
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  function handleNotExitModelConfirm() {
    setConfirmModelExit(false);
  }

  function handleExitModelConfirm() {
    setConfirmModelExit(false);
    setOpen(false);
    onCloseModal();
  }
  const onCloseModal = async () => {
    await dispatch(uploadFileState([]));
    onClickClose();
  };
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleCloseModal = () => {
    const isUpdate = store.getState().expenseAccountDetailSlice.haveUpdateData;
    const isUploadFile = fileUploadList && fileUploadList.length > 0;
    if (isUpdate || isUploadFile) {
      setConfirmModelExit(true);
    } else {
      onCloseModal();
    }
  };
  const handleOnChangeUploadFileSave = (status: boolean) => {
    setUploadFileFlag(status);
  };
  const handleOnChangeUploadFileEdit = (status: boolean) => {
    setUploadFileFlag(status);
  };
  const handleOnChangeUploadFileOC = (status: boolean) => {
    setUploadFileFlag(status);
  };

  const OnCloseAddExpense = () => {
    setOpenModalAddExpense(false);
  };
  const [payloadAdd, setPayloadAdd] = React.useState<any>();
  const handleAddExpenseTransactionBtn = async () => {
    sessionStorage.setItem("ADD_NEW_ITEM", "Y");
    setPayloadAdd([]);
    setOpenModalAddExpense(true);
    await dispatch(addNewItem(null));
  };
  const handleSaveBtn = async () => {
    const items = store.getState().expenseAccountDetailSlice.itemRows;
    const summarys = store.getState().expenseAccountDetailSlice.summaryRows;
    let dataItem: DataItem[] = [];
    if (items && items.length > 0) {
      items.forEach((e: any) => {
        const arr = Object.entries(e);

        let items: ItemItem[] = [];
        arr
          .filter((e: any) => !isFilterOutFieldInAdd(e[0]))
          .map((element: any, index: number) => {
            let _isOtherExpense =
              getMasterExpenInto(element[0])?.isOtherExpense || false;

            const item: ItemItem = {
              expenseNo: element[0],
              amount: element[1],
              isOtherExpense: _isOtherExpense,
            };
            items.push(item);
          });
        const data: DataItem = {
          expenseDate: moment(e["dateTime"]).startOf("day").toISOString(),
          // expenseDate: moment(new Date()).startOf('day').subtract(543, 'year').toISOString(),
          items: items,
        };
        dataItem.push(data);
      });
    } else {
      dataItem = _items;
    }

    const arr = Object.entries(summarys[0]);
    let sumItems: SumItemsItem[] = [];
    arr
      .filter((e: any) => !isFilterOutFieldForPayload(e[0]))
      .map((e: any, index: number) => {
        let _isOtherExpense = getMasterExpenInto(e[0])?.isOtherExpense || false;
        const item: SumItemsItem = {
          expenseNo: e[0],
          withdrawAmount: e[1],
          isOtherExpense: _isOtherExpense,
        };
        sumItems.push(item);
      });

    const sumItem: SumItems = {
      items: sumItems,
    };
    let payload: ExpenseSaveRequest = {
      branchCode: branchCode,
      type: expenseType,
      expensePeriod: period,
      sumItems: sumItem.items,
      items: dataItem,
      docNo: docNo,
    };
    if (status === STATUS.WAITTING_EDIT_ATTACH_FILE) {
      payload = {
        ...payload,
        editAttachFiles: editAttachFiles,
      };
    }

    await expenseSave(payload, fileUploadList)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("บันทึก เรียบร้อยแล้ว");
        setDocNo(value.docNo);

        await dispatch(featchExpenseDetailAsync(value.docNo));
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setAttachFiles(fileUploadList);
        await dispatch(uploadFileState([]));
        await dispatch(haveUpdateData(false));

        setTimeout(() => {
          setOpen(false);
          // onClickClose();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      });
  };

  const onApproveByBranch = async (comment: string) => {
    setOpenLoadingModal(true);
    const approveDate = moment(
      new Date(period.endDate).setDate(new Date(period.endDate).getDate() + 5),
    );

    let payload: ExpenseSaveRequest = {
      comment: comment,
      docNo: docNo,
      // today: moment(approveDate).startOf('day').toISOString(),
      attachFiles: attachFiles,
    };
    if (
      (status === STATUS.DRAFT || status === STATUS.SEND_BACK_EDIT) &&
      fileUploadList &&
      fileUploadList.length > 0
    ) {
      payload = { ...payload, attachFiles: [] };
    }

    if (status === STATUS.WAITTING_EDIT_ATTACH_FILE) {
      payload = { ...payload, editAttachFiles: editAttachFiles };
    }

    await expenseApproveByBranch(payload, fileUploadList)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onCloseModal();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      })
      .finally(() => setOpenLoadingModal(false));
  };

  const onApproveByAreaMangerOC = async () => {
    setOpenLoadingModal(true);
    let payload: ExpenseSaveRequest = {
      docNo: docNo,
    };
    if (status === STATUS.WAITTING_APPROVAL2) {
      payload = { ...payload, approvalAttachFiles: approvalAttachFiles };
    }

    await expenseApproveByOC(payload, fileUploadList)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onCloseModal();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      })
      .finally(() => setOpenLoadingModal(false));
  };
  const onRejectByAreaMangerOC = async (comment: string) => {
    setOpenLoadingModal(true);
    const payload: ExpenseSaveRequest = {
      docNo: docNo,
      comment: comment,
    };
    await expenseRejectByOC(payload)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onCloseModal();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      })
      .finally(() => setOpenLoadingModal(false));
  };

  const onApproveByAccount = async () => {
    setOpenLoadingModal(true);
    const _arr = store.getState().expenseAccountDetailSlice.addSummaryItem;
    let sumItems: SumItemsItem[] = [];
    if (_arr) {
      const arr = Object.entries(_arr);
      arr
        .filter((e: any) => !isFilterOutFieldForPayload(e[0]))
        .map((e: any, index: number) => {
          const _isOtherExpense =
            getMasterExpenInto(e[0])?.isOtherExpense || false;
          const item: SumItemsItem = {
            expenseNo: e[0],
            approvedAmount: e[1],
            isOtherExpense: _isOtherExpense,
          };
          sumItems.push(item);
        });
    } else {
      const _summary = summary.items;
      _summary.map((e: SumItemsItem) => {
        const _isOtherExpense =
          getMasterExpenInto(e.expenseNo)?.isOtherExpense || false;
        const item: SumItemsItem = {
          expenseNo: e.expenseNo,
          approvedAmount: e.approvedAmount
            ? e.approvedAmount
            : e.withdrawAmount,
          isOtherExpense: _isOtherExpense,
        };
        sumItems.push(item);
      });
    }

    const payload: ExpenseSaveRequest = {
      docNo: docNo,
      sumItems: sumItems,
    };
    await expenseApproveByAccount(payload)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onCloseModal();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      })
      .finally(() => setOpenLoadingModal(false));
  };
  const onRejectByAccount = async (returnto: string, comment: string) => {
    setOpenLoadingModal(true);
    const payload: ExpenseSaveRequest = {
      docNo: docNo,
      comment: comment,
      route: returnto,
    };
    await expenseRejectByAccount(payload)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onCloseModal();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      })
      .finally(() => setOpenLoadingModal(false));
  };

  const onApproveByAccountManager = async (
    expenDate: Date,
    approveDate: Date,
  ) => {
    setOpenLoadingModal(true);
    const _arr = store.getState().expenseAccountDetailSlice.addSummaryItem;

    let sumItems: SumItemsItem[] = [];
    if (_arr) {
      const arr = Object.entries(_arr);
      arr
        .filter((e: any) => !isFilterOutFieldForPayload(e[0]))
        .map((e: any, index: number) => {
          const _isOtherExpense =
            getMasterExpenInto(e[0])?.isOtherExpense || false;
          const item: SumItemsItem = {
            expenseNo: e[0],
            approvedAmount: e[1],
            isOtherExpense: _isOtherExpense,
          };
          sumItems.push(item);
        });
    } else {
      const _summary = summary.items;
      _summary.map((e: SumItemsItem) => {
        const _isOtherExpense =
          getMasterExpenInto(e.expenseNo)?.isOtherExpense || false;
        const item: SumItemsItem = {
          expenseNo: e.expenseNo,
          approvedAmount: e.approvedAmount,
          isOtherExpense: _isOtherExpense,
        };
        sumItems.push(item);
      });
    }

    const payload: ExpenseSaveRequest = {
      expenseDate: moment(expenDate).startOf("day").toISOString(),
      approvedDate: moment(approveDate).startOf("day").toISOString(),
      sumItems: sumItems,
      docNo: docNo,
    };
    await expenseApproveByAccountManager(payload)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onCloseModal();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      })
      .finally(() => setOpenLoadingModal(false));
  };

  const onRejectByAccountManager = async (comment: string) => {
    setOpenLoadingModal(true);
    const payload: ExpenseSaveRequest = {
      docNo: docNo,
      comment: comment,
    };
    await expenseRejectByAccountManager(payload)
      .then(async (value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
        await dispatch(featchBranchAccountingListAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onCloseModal();
        }, 500);
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      })
      .finally(() => setOpenLoadingModal(false));
  };
  const [isOpenModelConfirmExpense, setIsOpenModelConfirmExpense] =
    React.useState<boolean>(false);
  const [isApprove, setIsApprove] = React.useState<boolean>(false);
  const [showForward, setShowForward] = React.useState<boolean>(false); // show dropdown resend
  const [showReason, setShowReason] = React.useState<boolean>(false); // show comment
  const [validateReason, setValidateReason] = React.useState<boolean>(false);
  const [isAllowForwardOC, setIsAllowForwardOC] = React.useState<boolean>(true);
  const [sumWithdrawAmount, setSumWithdrawAmount] = React.useState("");
  const handleApproveBtn = () => {
    setInit("N");
    setIsApprove(true);
    setSumWithdrawAmount(
      `${numberWithCommas(summary.sumWithdrawAmount?.toFixed(2))} บาท`,
    );
    // setSumWithdrawAmount(`${<NumberFormat(summary.sumWithdrawAmount).} บาท`);
    if (status === STATUS.DRAFT) {
      const isFileValidate: boolean = validateFileInfo();
      const isvalidateDate = validateDateIsBeforPeriod();
      const isUpdate =
        store.getState().expenseAccountDetailSlice.haveUpdateData;
      if (isUpdate) {
        setTextError("ข้อมูลที่แก้ไขยังไม่ได้ทำการบันทึก");
        setOpenAlert(true);
      }
      if (isFileValidate && isvalidateDate && !isUpdate) {
        setIsOpenModelConfirmExpense(true);
        setShowReason(true);
      }
    } else if (status === STATUS.SEND_BACK_EDIT) {
      const isFileValidate: boolean = validateFileInfo();
      const isvalidateDate = validateDateIsBeforPeriod();
      const isUpdate =
        store.getState().expenseAccountDetailSlice.haveUpdateData;
      if (isUpdate) {
        setTextError("ข้อมูลที่แก้ไขยังไม่ได้ทำการบันทึก");
        setOpenAlert(true);
      }
      if (isFileValidate && isvalidateDate && !isUpdate) {
        setIsOpenModelConfirmExpense(true);
        setShowReason(true);
      }
    } else if (status === STATUS.WAITTING_EDIT_ATTACH_FILE) {
      const isFileValidate: boolean = validateFileInfo();
      const isvalidateDate = validateDateIsBeforPeriod();
      if (isFileValidate && isvalidateDate) {
        setIsOpenModelConfirmExpense(true);
        setShowReason(true);
      }
    } else if (status === STATUS.WAITTING_APPROVAL1) {
      setShowReason(false);
      setIsOpenModelConfirmExpense(true);
    } else if (status === STATUS.WAITTING_APPROVAL2) {
      const isOver = validateApproveLimit();

      if (isOver) {
        const isFileValidate: boolean = validateFileInfo();
        if (isFileValidate) {
          setShowReason(false);
          setIsOpenModelConfirmExpense(true);
        }
      } else {
        setShowReason(false);
        setIsOpenModelConfirmExpense(true);
      }
    } else if (status === STATUS.WAITTING_ACCOUNTING) {
      let sumApprovalAmount: number = 0;
      const _arr = store.getState().expenseAccountDetailSlice.addSummaryItem;
      if (_arr) {
        const arr = Object.entries(_arr);
        arr
          .filter((e: any) => !isFilterOutFieldInAdd(e[0]))
          .map((e: any, index: number) => {
            sumApprovalAmount += Number(e[1]);
          });
      } else {
        sumApprovalAmount =
          summary.sumApprovalAmount || summary.sumWithdrawAmount || 0;
      }

      const sumWithdrawAmount = summary.sumWithdrawAmount || 0;
      const item1: payLoadAdd = {
        id: 1,
        key: "sumWithdrawAmount",
        value: sumWithdrawAmount,
        title: "ยอดเบิกทั้งหมด",
      };

      const item2: payLoadAdd = {
        id: 2,
        key: "sumApprovalAmount",
        value: sumApprovalAmount || 0,
        title: "ยอดเงินอนุมัติ",
      };
      const item3: payLoadAdd = {
        id: 3,
        key: "diff",
        value: sumApprovalAmount - sumWithdrawAmount,
        title: "ผลต่าง",
      };
      let listPayload: payLoadAdd[] = [item1, item2, item3];
      setPayloadModalConfirmDetail(listPayload);

      setOpenModelAccountConfirm(true);
    } else if (status === STATUS.WAITTING_APPROVAL3) {
      const _arr = store.getState().expenseAccountDetailSlice.addSummaryItem;
      let listPayload: payLoadAdd[] = [];

      if (_arr && _arr.length > 0) {
        let sumOther: number = 0;
        const arr = Object.entries(_arr);
        arr
          .filter((e: any) => !isFilterOutFieldInAdd(e[0]))
          .map((e: any, index: number) => {
            const master = getMasterExpenInto(e[0]);
            if (!master?.isOtherExpense) {
              const item: payLoadAdd = {
                id: index,
                key: e[0],
                value: e[1],
                title:
                  master?.accountNameTh !== undefined
                    ? master?.accountNameTh
                    : e[0],
                isOtherExpense: master?.isOtherExpense,
              };
              listPayload.push(item);
            } else {
              sumOther += e[1];
            }
          });
        const item: payLoadAdd = {
          id: listPayload.length + 1,
          key: "SUMOTHER",
          value: sumOther,
          title: "อื่นๆ",
          isOtherExpense: false,
        };
        listPayload.push(item);
      } else {
        let sumOther: number = 0;
        const _sumItems = summary.items;
        _sumItems
          .filter(
            (entrie: SumItemsItem) => !isFilterOutFieldInAdd(entrie.expenseNo),
          )
          .map((entrie: SumItemsItem, index: number) => {
            const master = getMasterExpenInto(entrie.expenseNo);
            if (!master?.isOtherExpense) {
              const item: payLoadAdd = {
                id: index,
                key: entrie.expenseNo,
                value: Number(entrie.approvedAmount) || 0,
                title:
                  master?.accountNameTh !== undefined
                    ? master?.accountNameTh
                    : entrie.expenseNo,
                isOtherExpense: master?.isOtherExpense,
              };
              listPayload.push(item);
            } else {
              sumOther += Number(entrie.approvedAmount) || 0;
            }
          });
        const item: payLoadAdd = {
          id: listPayload.length + 1,
          key: "SUMOTHER",
          value: sumOther,
          title: "อื่นๆ",
          isOtherExpense: false,
        };
        listPayload.push(item);
      }
      setPayloadModalConfirmDetail(listPayload);
      setOpenModelConfirm(true);
    }
  };

  const handleRejectBtn = () => {
    setInit("N");
    setIsApprove(false);
    setSumWithdrawAmount(`${numberWithCommas(summary.sumWithdrawAmount)} บาท`);
    if (
      status === STATUS.WAITTING_APPROVAL1 ||
      status === STATUS.WAITTING_APPROVAL2
    ) {
      setIsOpenModelConfirmExpense(true);
      setShowReason(true);
      setValidateReason(true);
    } else if (status === STATUS.WAITTING_ACCOUNTING) {
      setShowReason(true);
      setValidateReason(true);
      setShowForward(true);
      setIsOpenModelConfirmExpense(true);
      let isAllowShowOC = false;
      if (_items && _items.length > 0) {
        items.map((item: DataItem, index: number) => {
          const list: ItemItem[] = item.items;
          list.map((data: ItemItem) => {
            const master = getMasterExpenInto(data.expenseNo);
            const limit1 = master?.approvalLimit1 || 0;
            if (data.amount > limit1) {
              isAllowShowOC = true;
            }
          });
        });
      }
      setIsAllowForwardOC(isAllowShowOC);
    } else if (status === STATUS.WAITTING_APPROVAL3) {
      setValidateReason(true);
      setShowReason(true);
      // setShowForward(true);
      setIsOpenModelConfirmExpense(true);
    }
  };

  const onCallbackFunction = (value: any) => {
    setSumWithdrawAmount(`${numberWithCommas(summary.sumWithdrawAmount)} บาท`);
    if (isApprove) {
      if (
        status === STATUS.DRAFT ||
        status === STATUS.SEND_BACK_EDIT ||
        status === STATUS.WAITTING_EDIT_ATTACH_FILE
      ) {
        onApproveByBranch(value.reason);
      } else if (
        status === STATUS.WAITTING_APPROVAL1 ||
        status === STATUS.WAITTING_APPROVAL2
      ) {
        onApproveByAreaMangerOC();
      } else if (status === STATUS.WAITTING_ACCOUNTING) {
        onApproveByAccount();
      } else if (status === STATUS.WAITTING_APPROVAL3) {
        onApproveByAccountManager(value.period.startDate, value.period.endDate);
      }
    } else {
      if (
        status === STATUS.WAITTING_APPROVAL1 ||
        status === STATUS.WAITTING_APPROVAL2
      ) {
        onRejectByAreaMangerOC(value.reason);
      } else if (status === STATUS.WAITTING_ACCOUNTING) {
        onRejectByAccount(value.forward, value.reason);
      } else if (status === STATUS.WAITTING_APPROVAL3) {
        onRejectByAccountManager(value.reason);
      }
    }
  };

  const validateFileInfo = () => {
    const isvalid = fileUploadList.length > 0 ? true : false;
    const existingfileList =
      status === STATUS.DRAFT || status === STATUS.SEND_BACK_EDIT
        ? attachFiles
        : status === STATUS.WAITTING_EDIT_ATTACH_FILE
          ? editAttachFiles
          : status === STATUS.WAITTING_APPROVAL2
            ? approvalAttachFiles
            : [];
    if (!isvalid && existingfileList.length <= 0) {
      setOpenAlert(true);
      setTextError("กรุณาแนบเอกสาร");
      return false;
    }
    return true;
  };

  const validateDateIsBeforPeriod = () => {
    const date = new Date();
    if (date < new Date(period.endDate)) {
      setOpenAlert(true);
      setTextError("ยังไม่ถึงรอบทำการเบิก กรุณาตรวจสอบอีกครั้ง");
      return false;
    }
    return true;
  };

  const validateApproveLimit = () => {
    const items = store.getState().expenseAccountDetailSlice.intialRows;
    let isRequire = false;
    items.forEach((e: any) => {
      const arr = Object.entries(e);
      arr
        .filter((e: any) => !isFilterOutFieldInAdd(e[0]))
        .map((element: any, index: number) => {
          const master = getMasterExpenInto(element[0]);
          const limit = Number(master?.approvalLimit2);
          if (Number(element[1] > limit)) {
            isRequire = true;
            return;
          }
        });
      if (isRequire) {
        return;
      }
    });
    return isRequire;
  };

  const getMasterExpenInto = (key: any) =>
    expenseMasterList.find(
      (e: ExpenseInfo) => e.expenseNo === key && e.typeCode === expenseType,
    );
  const isOtherExpenseField = (key: any) => {
    const master = getMasterExpenInto(key);
    return master?.isOtherExpense;
  };
  const getOtherExpenseName = (key: any) => {
    return getMasterExpenInto(key)?.accountNameTh;
  };

  const componetButtonDraft = (
    <>
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
            data-testid="testid-btnAddItem"
            id="btnAddItem"
            variant="contained"
            color="info"
            className={classes.MbtnPrint}
            onClick={handleAddExpenseTransactionBtn}
            startIcon={<ControlPoint />}
            sx={{ width: 200 }}
            disabled={
              status === STATUS.WAITTING_EDIT_ATTACH_FILE ? true : false
            }
          >
            เพิ่มรายการจ่าย
          </Button>
        </Grid>
        <Grid item>
          <Button
            data-testid="testid-btnSave"
            id="btnSave"
            variant="contained"
            color="warning"
            className={classes.MbtnSave}
            onClick={handleSaveBtn}
            startIcon={<SaveIcon />}
            sx={{ width: 140 }}
            disabled={
              status === STATUS.WAITTING_EDIT_ATTACH_FILE ? true : false
            }
          >
            บันทึก
          </Button>

          <Button
            data-testid="testid-btnSendToDC"
            id="btnSendToDC"
            variant="contained"
            color="primary"
            className={classes.MbtnSendDC}
            onClick={handleApproveBtn}
            startIcon={<CheckCircleOutline />}
            sx={{ width: 140 }}
            disabled={docNo ? false : true}
          >
            ขออนุมัติ
          </Button>
        </Grid>
      </Grid>
    </>
  );

  const componetButtonApprove = (
    <>
      <Grid
        item
        container
        xs={12}
        sx={{ mt: 3 }}
        justifyContent="space-between"
        direction="row"
        alignItems="flex-end"
      >
        <Grid item xl={5}></Grid>
        <Grid item>
          <Button
            data-testid="testid-btnApprove"
            id="btnApprove"
            variant="contained"
            color="primary"
            className={classes.MbtnSendDC}
            onClick={handleApproveBtn}
            startIcon={<CheckCircleOutline />}
            sx={{ width: 140, display: isShowBtnApprove ? "" : "none" }}
          >
            ขออนุมัติ
          </Button>

          <Button
            data-testid="testid-btnSendToDC"
            id="btnSendToDC"
            variant="contained"
            color="error"
            className={classes.MbtnSendDC}
            onClick={handleRejectBtn}
            startIcon={<Cancel />}
            sx={{ width: 140, display: isShowBtnReject ? "" : "none" }}
          >
            ไม่อนุมัติ
          </Button>
        </Grid>
      </Grid>
    </>
  );

  let infosWithDraw: any;
  let infosApprove: any;
  let infoDiff: any;
  let totalWithDraw: number = 0;
  let totalApprove: number = 0;
  let totalDiff: any;
  let totalOtherWithDraw: number = 0;
  let totalOtherApprove: number = 0;
  let totalOtherDiff: number = 0;
  const entries: SumItemsItem[] = summary && summary.items ? summary.items : [];
  let rows: any[] = [];
  if (getInit()) {
    if (entries && entries.length > 0) {
      entries
        .filter(
          (entrie: SumItemsItem) => !isFilterOutFieldInAdd(entrie.expenseNo),
        )
        .map((entrie: SumItemsItem, i: number) => {
          infosWithDraw = {
            ...infosWithDraw,
            id: 1,
            description: "ยอดเงินเบิก",
            [entrie.expenseNo]: entrie?.withdrawAmount,
          };
          // if (!isFilterOutFieldInAdd(entrie.expenseNo)) {
          totalWithDraw += Number(entrie?.withdrawAmount);
          // }

          if (status === STATUS.WAITTING_ACCOUNTING) {
            const _approvedAmount =
              entrie?.approvedAmount || entrie?.withdrawAmount || 0;
            infosApprove = {
              ...infosApprove,
              id: 2,
              description: "ยอดเงินอนุมัติ",
              [entrie.expenseNo]: _approvedAmount,
            };
            // if (!isFilterOutFieldInAdd(entrie.expenseNo)) {
            totalApprove += Number(_approvedAmount);
            // }
            const diff =
              Number(_approvedAmount) - (Number(entrie?.withdrawAmount) || 0);
            infoDiff = {
              ...infoDiff,
              id: 3,
              description: "ผลต่าง",
              [entrie.expenseNo]: diff > 0 ? `+${diff}` : diff,
            };
            const master = getMasterExpenInto(entrie.expenseNo);
            const _isOtherExpense = master ? master.isOtherExpense : false;
            if (_isOtherExpense) {
              totalOtherWithDraw += entrie?.withdrawAmount || 0;
              totalOtherApprove += _approvedAmount;
            }
          } else if (
            status === STATUS.WAITTING_APPROVAL1 ||
            status === STATUS.WAITTING_APPROVAL2
          ) {
            infosApprove = {
              ...infosApprove,
              id: 2,
              description: "ยอดเงินอนุมัติ",
              [entrie.expenseNo]: "",
            };
            // if (!isFilterOutFieldInAdd(entrie.expenseNo)) {
            totalApprove += Number(entrie?.approvedAmount) || 0;
            // }
            infoDiff = {
              ...infoDiff,
              id: 3,
              description: "ผลต่าง",
              [entrie.expenseNo]:
                (Number(entrie?.approvedAmount) || 0) -
                (Number(entrie?.withdrawAmount) || 0),
            };
            const master = getMasterExpenInto(entrie.expenseNo);
            const _isOtherExpense = master ? master.isOtherExpense : false;
            if (_isOtherExpense) {
              totalOtherWithDraw +=
                entrie?.withdrawAmount === undefined
                  ? 0
                  : entrie?.withdrawAmount;
              totalOtherApprove +=
                entrie?.withdrawAmount === undefined
                  ? 0
                  : entrie?.withdrawAmount;
            }
          } else {
            infosApprove = {
              ...infosApprove,
              id: 2,
              description: "ยอดเงินอนุมัติ",
              [entrie.expenseNo]: Number(entrie?.approvedAmount) || 0,
            };
            totalApprove += Number(entrie?.approvedAmount) || 0;
            const diff =
              (Number(entrie?.approvedAmount) || 0) -
              (Number(entrie?.withdrawAmount) || 0);
            infoDiff = {
              ...infoDiff,
              id: 3,
              description: "ผลต่าง",
              [entrie.expenseNo]: diff > 0 ? `+${diff}` : diff,
            };
            const master = getMasterExpenInto(entrie.expenseNo);
            const _isOtherExpense = master ? master.isOtherExpense : false;
            if (_isOtherExpense) {
              totalOtherWithDraw +=
                entrie?.withdrawAmount === undefined
                  ? 0
                  : entrie?.withdrawAmount;
              totalOtherApprove +=
                entrie?.approvedAmount === undefined
                  ? 0
                  : entrie?.approvedAmount;
            }
          }
        });
      totalDiff = Number(totalApprove) - Number(totalWithDraw);
      totalOtherDiff = Number(totalOtherApprove) - Number(totalOtherWithDraw);

      if (
        status === STATUS.DRAFT ||
        status === STATUS.SEND_BACK_EDIT ||
        status === STATUS.WAITTING_EDIT_ATTACH_FILE
      ) {
        rows = [
          {
            ...infosWithDraw,
            total: totalWithDraw,
            SUMOTHER: totalOtherWithDraw,
          },
        ];
      } else if (
        status === STATUS.WAITTING_APPROVAL1 ||
        status === STATUS.WAITTING_APPROVAL2
      ) {
        rows = [
          {
            ...infosWithDraw,
            total: totalWithDraw,
            SUMOTHER: totalOtherWithDraw,
          },
          { ...infosApprove, SUMOTHER: "", total: "" },
        ];
      } else if (status === STATUS.WAITTING_ACCOUNTING) {
        rows = [
          {
            ...infosWithDraw,
            total: totalWithDraw,
            SUMOTHER: totalOtherWithDraw,
          },
          { ...infosApprove, total: totalApprove, SUMOTHER: totalOtherApprove },
          {
            ...infoDiff,
            total: totalDiff > 0 ? `+${totalDiff}` : totalDiff,
            SUMOTHER:
              totalOtherDiff > 0 ? `+${totalOtherDiff}` : totalOtherDiff || 0,
            isShowDiff: true,
          },
        ];
      } else {
        rows = [
          {
            ...infosWithDraw,
            total: totalWithDraw,
            SUMOTHER: totalOtherWithDraw,
          },
          {
            ...infosApprove,
            total: isNaN(totalApprove) ? 0 : totalApprove,
            SUMOTHER: totalOtherApprove,
          },
          {
            ...infoDiff,
            total: totalDiff > 0 ? `+${totalDiff}` : totalDiff || 0,
            SUMOTHER:
              totalOtherDiff > 0 ? `+${totalOtherDiff}` : totalOtherDiff || 0,
            isShowDiff: true,
          },
        ];
      }

      // rows = [
      //   showWithDraw && { ...infosWithDraw, total: totalWithDraw },
      //   showApprove && { ...infosApprove, total: isNaN(totalApprove) ? 0 : totalApprove },
      //   showDiff && { ...infoDiff, total: isNaN(totalDiff) ? 0 : totalDiff },
      // ];
      dispatch(updateSummaryRows(rows));
    }

    if (_items && _items.length > 0) {
      const itemRows = items.map((item: DataItem, index: number) => {
        const list: ItemItem[] = item.items;
        let newItem: any;
        let _otherSum: number = 0;
        let _otherDetail: string = "";
        let _isOverApprovalLimit1 = false;
        let _isOverApprovalLimit2 = false;
        list.map((data: ItemItem) => {
          newItem = {
            ...newItem,
            [data.expenseNo]: data.amount,
          };
          const master = getMasterExpenInto(data.expenseNo);
          const amount = Number(data.amount) || 0;
          if (
            !isFilterFieldInExpense(data.expenseNo) &&
            master?.isOtherExpense
          ) {
            _otherSum += amount;

            if (!stringNumberNullOrEmpty(data.amount)) {
              _otherDetail += `${getOtherExpenseName(data.expenseNo)},`;
            }
            if (amount > master.approvalLimit1) {
              _isOverApprovalLimit1 = true;
            }
            if (amount > master.approvalLimit2) {
              _isOverApprovalLimit2 = true;
            }
          }
        });
        return {
          id: uuidv4(),
          date: convertUtcToBkkDate(
            moment(item.expenseDate).startOf("day").toISOString(),
          ),
          dateTime: item.expenseDate,
          total: item.totalAmount,
          SUMOTHER: _otherSum,
          otherDetail: _otherDetail.substring(0, _otherDetail.length - 1),
          isOverApprovalLimit1: _isOverApprovalLimit1,
          isOverApprovalLimit2: _isOverApprovalLimit2,
          ...newItem,
        };
      });
      dispatch(initialItems(itemRows));
    }
  }

  useEffect(() => {
    setEditAction(edit);
    if (edit) {
      setDocNo(expenseData.docNo);
      setBranchCode(expenseData.branchCode);
      setBranchName(
        `${expenseData.branchCode}-${getBranchName(
          branchList,
          expenseData.branchCode,
        )}`,
      );
      const startDate = convertUtcToBkkDate(
        expenseData.expensePeriod.startDate,
      );
      const endDate = convertUtcToBkkDate(expenseData.expensePeriod.endDate);
      setPeriodLabel(`${startDate}-${endDate}`);
      setPeriod(expenseData.expensePeriod);
      setStatus(expenseData.status);
      setExpenseTypeName(
        expenseData.type === EXPENSE_TYPE.COFFEE
          ? "รายละเอียดเอกสารค่าใช้จ่ายร้านกาแฟ"
          : expenseData.type === EXPENSE_TYPE.STOREFRONT
            ? "รายละเอียดเอกสารค่าใช้จ่ายหน้าร้าน"
            : "รายละเอียดเอกสาร",
      );
      setExpenseType(expenseData.type);
      setAttachFiles(
        expenseData.attachFiles && expenseData.attachFiles.length > 0
          ? expenseData.attachFiles
          : [],
      );
      setEditAttachFiles(
        expenseData.editAttachFiles && expenseData.editAttachFiles.length > 0
          ? expenseData.editAttachFiles
          : [],
      );
      setApprovalAttachFiles(
        expenseData.approvalAttachFiles &&
          expenseData.approvalAttachFiles.length > 0
          ? expenseData.approvalAttachFiles
          : [],
      );
      const expenseStatusInfo = getExpenseStatus(expenseData.status);
      setIsShowBtnApprove(
        expenseStatusInfo?.groupAllow === getUserInfo().group,
      );
      setIsShowBtnReject(expenseStatusInfo?.groupAllow === getUserInfo().group);
    } else {
      const ownBranch = getUserInfo().branch
        ? getUserInfo().branch
        : env.branch.code;
      setBranchCode(ownBranch);
      setBranchName(`${ownBranch}-${getBranchName(branchList, ownBranch)}`);
      const startDate = convertUtcToBkkDate(
        periodProps && periodProps.startDate ? periodProps.startDate : "",
      );
      const endDate = convertUtcToBkkDate(
        periodProps && periodProps.endDate ? periodProps.endDate : "",
      );
      setPeriodLabel(`${startDate}-${endDate}`);
      setPeriod(
        periodProps
          ? periodProps
          : {
              period: 0,
              startDate: "",
              endDate: "",
            },
      );
      setEditAction(edit);
      setExpenseType(type ? type : "");
      setExpenseTypeName(
        type === EXPENSE_TYPE.COFFEE
          ? "รายละเอียดเอกสารค่าใช้จ่ายร้านกาแฟ"
          : type === EXPENSE_TYPE.STOREFRONT
            ? "รายละเอียดเอกสารค่าใช้จ่ายหน้าร้าน"
            : "รายละเอียดเอกสาร",
      );
      setComment(" ");
    }
  }, [open]);

  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [openModelAccountConfirm, setOpenModelAccountConfirm] =
    React.useState(false);

  const handleCloseModelConfirm = () => {
    setOpenModelConfirm(false);
  };

  const handleCloseModelAccountConfirm = () => {
    setOpenModelAccountConfirm(false);
  };

  const topFunction = () => {
    document.getElementById("top-item")?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };
  const handleOnDeleteEditAttachFile = (item: any) => {
    const fileKeyDel = item.fileKey;
    let _files = editAttachFiles;
    let newFiles: FileType[] = [];
    _files.map((i: FileType) => {
      if (i.fileKey !== fileKeyDel) {
        newFiles.push(i);
      }
    });
    setEditAttachFiles(newFiles);
  };

  const handleOnDeleteApproveAttachFile = (item: any) => {
    const fileKeyDel = item.fileKey;
    let _files = approvalAttachFiles;
    let newFiles: FileType[] = [];
    _files.map((i: FileType) => {
      if (i.fileKey !== fileKeyDel) {
        newFiles.push(i);
      }
    });
    setApprovalAttachFiles(newFiles);
  };
  return (
    <React.Fragment>
      <Dialog open={isOpen} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleCloseModal}
        >
          <Typography sx={{ fontSize: 24, fontWeight: 400 }}>
            {expenseTypeName}
          </Typography>
          <Steppers status={status} />
        </BootstrapDialogTitle>
        <DialogContent sx={{ minHeight: "70vh" }}>
          <Grid container spacing={2} mb={2} id="top-item">
            <Grid item xs={1}>
              <Typography variant="body2">เลขที่เอกสาร</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">{docNo}</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2">สาขา:</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">{branchName} </Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2">งวด:</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">{periodLabel}</Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={2} id="top-item">
            <Grid item xs={1}>
              <Typography variant="body2">
                แนบเอกสารจากสาขา{" "}
                <IconButton
                  size="small"
                  onClick={() => setOpenModalDescriptionExpense(true)}
                  id="id-infoIcon"
                  data-testid="testid-infoIcon"
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
                :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              {/* <AccordionUploadFile
                files={expenseData && expenseData.attachFiles ? expenseData.attachFiles : []}
                docNo={'docNo'}
                docType='BA'
                isStatus={uploadFileFlag}
                onChangeUploadFile={handleOnChangeUploadFileSave}
                enabledControl={status === STATUS.DRAFT}
                idControl={'AttachFileSave'}
              /> */}
              <AccordionUploadSingleFile
                files={attachFiles}
                disabledControl={
                  !(
                    (status === STATUS.DRAFT ||
                      status === STATUS.SEND_BACK_EDIT) &&
                    isGroupBranch()
                  )
                }
              />
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2">แนบเอกสารแก้ไข:</Typography>
            </Grid>
            <Grid item xs={3}>
              <AccordionUploadFile
                files={editAttachFiles}
                docNo={"docNo"}
                docType="BA"
                isStatus={uploadFileFlag}
                onChangeUploadFile={handleOnChangeUploadFileEdit}
                enabledControl={
                  status === STATUS.WAITTING_EDIT_ATTACH_FILE && isGroupBranch()
                }
                idControl={"AttachFileEdit"}
                onDeleteAttachFile={handleOnDeleteEditAttachFile}
              />
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2">แนบเอกสารOC:</Typography>
            </Grid>
            <Grid item xs={3}>
              <AccordionUploadFile
                files={approvalAttachFiles}
                docNo={"docNo"}
                docType="BA"
                isStatus={uploadFileFlag}
                onChangeUploadFile={handleOnChangeUploadFileOC}
                enabledControl={
                  status === STATUS.WAITTING_APPROVAL2 && isGroupOC()
                }
                idControl={"AttachFileByOC"}
                onDeleteAttachFile={handleOnDeleteApproveAttachFile}
              />
            </Grid>
          </Grid>
          {isGroupBranch() &&
            (status === STATUS.DRAFT ||
              status === STATUS.SEND_BACK_EDIT ||
              status === STATUS.WAITTING_EDIT_ATTACH_FILE) && (
              <Box>{componetButtonDraft}</Box>
            )}

          {!isGroupBranch() &&
            !(
              status === STATUS.DRAFT ||
              status === STATUS.SEND_BACK_EDIT ||
              status === STATUS.WAITTING_EDIT_ATTACH_FILE
            ) && <Box>{componetButtonApprove}</Box>}
          <Box mb={3} mt={3}>
            <ExpenseDetailSummary
              type={expenseType}
              periodProps={period}
              edit={editAction}
            />
          </Box>
          <Box mt={1}>
            {/* <Box>
              <Typography variant='body2'>หมายเหตุ:</Typography>
            </Box> */}
            <Grid container spacing={2} mb={2} justifyContent="space-between">
              <Grid item>
                {/* <Card
                  variant='outlined'
                  style={{
                    width: '500px',
                    height: '150px',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    paddingTop: '10px',
                    
                    paddingBottom: '10px',
                    overflow: 'scroll',
                  }}>
                  {expenseData &&
                    expenseData.comments &&
                    expenseData.comments.length > 0 &&
                    expenseData.comments.map((e: Comment) => {
                      return (
                        <>
                          <Typography variant='body2'>
                            <span style={{ fontWeight: 'bold' }}>{e.username} : </span>
                            <span style={{ color: '#AEAEAE' }}>
                              {getExpenseStatus(e.status)?.text || e.status} : {convertUtcToBkkDate(e.commentDate)}{' '}
                              {moment(e.commentDate).format('HH:mm ')}
                            </span>
                          </Typography>
                          <Typography variant='body2'> {e.comment}</Typography>
                        </>
                      );
                    })}
                </Card> */}
                <TextBoxComentList
                  filedLabel={"หมายเหตุ:"}
                  payload={
                    expenseData && expenseData.comments
                      ? expenseData.comments
                      : []
                  }
                />
              </Grid>
              <Grid item xs={2} textAlign="center">
                <IconButton onClick={topFunction} data-testid="testid-btnTop">
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
      <ModalAddExpense
        open={openModalAddExpense}
        onClose={OnCloseAddExpense}
        edit={false}
        payload={payloadAdd}
        type={expenseType}
        periodProps={period}
      />
      <ModelDescriptionExpense
        open={openModalDescriptionExpense}
        onClickClose={() => setOpenModalDescriptionExpense(false)}
        type={expenseType}
      />
      <LoadingModal open={openLoadingModal} />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
        payload={null}
      />
      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />

      <ModelConfirmDetail
        open={openModelConfirm}
        onClose={handleCloseModelConfirm}
        onConfirm={onCallbackFunction}
        payload={payloadModalConfirmDetail}
        periodProps={period}
      />

      <ModelConfirmAccounting
        open={openModelAccountConfirm}
        onClose={handleCloseModelAccountConfirm}
        onConfirm={onCallbackFunction}
        payload={payloadModalConfirmDetail}
        docNo={docNo}
        periodProps={period}
      />

      <ModalConfirmExpense
        open={isOpenModelConfirmExpense}
        details={{
          docNo: docNo ? docNo : "",
          type: expenseTypeName,
          period: periodLabel,
          sumWithdrawAmount: sumWithdrawAmount,
        }}
        onCallBackFunction={onCallbackFunction}
        approve={isApprove}
        showForward={showForward}
        showReason={showReason}
        validateReason={validateReason}
        onClose={() => setIsOpenModelConfirmExpense(false)}
        isAllowForwardOC={isAllowForwardOC}
      />
      <ConfirmModalExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />
    </React.Fragment>
  );
}

export default ExpenseDetail;
