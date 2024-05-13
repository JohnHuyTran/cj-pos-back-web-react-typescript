import React, { ReactElement, useEffect, useState } from "react";
import { Box } from "@mui/system";
import { Button, Dialog, DialogContent, Grid, Typography } from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import SaveIcon from "@mui/icons-material/Save";
import { useStyles } from "../../styles/makeTheme";
import { BootstrapDialogTitle } from "../commons/ui/dialog-title";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  save,
  updateDataDetail,
  updateErrorList,
  updateCheckEdit,
  updateApproveReject,
} from "../../store/slices/transfer-out-destroy-discount-slice";
import { uploadAttachFile } from "../../services/barcode-discount";
import AlertError from "../commons/ui/alert-error";
import {
  getBranchName,
  objectNullOrEmpty,
  stringNullOrEmpty,
} from "../../utils/utils";
import { Action, TO_TYPE, TOStatus } from "../../utils/enum/common-enum";
import ConfirmCloseModel from "../commons/ui/confirm-exit-model";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { ACTIONS } from "../../utils/enum/permission-enum";
import { uploadFileState } from "../../store/slices/upload-file-slice";
import AccordionUploadFile from "../commons/ui/accordion-upload-file";
import { getUserInfo } from "../../store/sessionStore";
import ModelConfirm from "../barcode-discount/modal-confirm";
import ModalCheckStock from "../barcode-discount/modal-check-stock";
import {
  approveTransferOut,
  cancelTransferOut,
  endTransferOut,
  rejectTransferOut,
  saveDraftTransferOut,
  sendForApprovalTransferOut,
} from "../../services/transfer-out";
import { updateCheckStock } from "../../store/slices/stock-balance-check-slice";
import { checkStockBalance } from "../../services/common";
import AttachFileAfter from "./attach-file-after";
import ModalAddProductToDestroyDiscount from "./modal-add-product-to-destroy-discount";
import { uploadFileAfterState } from "../../store/slices/to-destroy-discount-attach-after-slice";
import ModalToDestroyDiscountItem from "./modal-to-destroy-discount-item";
import { updateAddDestroyProductState } from "../../store/slices/add-to-destroy-product-slice";
import StepperBar from "./stepper-bar";
import ModalShowBeforeAfterFile from "../commons/ui/modal-show-before-after-file";

interface Props {
  action: Action | Action.INSERT;
  isOpen: boolean;
  setOpenPopup: (openPopup: boolean) => void;
  onClickClose: () => void;
  setPopupMsg?: any;
  onSearchMain?: () => void;
  userPermission?: any[];
}

const _ = require("lodash");

export default function ModalCreateToDestroyDiscount({
  isOpen,
  onClickClose,
  setOpenPopup,
  action,
  setPopupMsg,
  onSearchMain,
  userPermission,
}: Props): ReactElement {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  let errorListProduct: any = [];
  const [open, setOpen] = React.useState(isOpen);
  const [openModalCancel, setOpenModalCancel] = React.useState<boolean>(false);
  const [openModalConfirmSendForApproval, setOpenModalConfirmSendForApproval] =
    React.useState<boolean>(false);
  const [openModalConfirmApprove, setOpenModalConfirmApprove] =
    React.useState<boolean>(false);
  const [openModalReject, setOpenModalReject] = React.useState<boolean>(false);
  const [openModalConfirmEnd, setOpenModalConfirmEnd] =
    React.useState<boolean>(false);
  const [openModelAddItems, setOpenModelAddItems] =
    React.useState<boolean>(false);
  const [openPopupModal, setOpenPopupModal] = React.useState<boolean>(false);
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const [openCheckStock, setOpenCheckStock] = React.useState<boolean>(false);
  const [openModalClose, setOpenModalClose] = React.useState<boolean>(false);
  const [textPopup, setTextPopup] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");
  const [errors, setErrors] = React.useState<any>([]);

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const payloadTransferOut = useAppSelector(
    (state) => state.transferOutDestroyDiscountSlice.createDraft,
  );
  const dataDetail = useAppSelector(
    (state) => state.transferOutDestroyDiscountSlice.dataDetail,
  );
  const approveReject = useAppSelector(
    (state) => state.transferOutDestroyDiscountSlice.approveReject,
  );
  const checkEdit = useAppSelector(
    (state) => state.transferOutDestroyDiscountSlice.checkEdit,
  );
  //get detail from search
  const transferOutDetail = useAppSelector(
    (state) => state.transferOutDetailSlice.transferOutDetail.data,
  );
  //permission
  const [approvePermission, setApprovePermission] = useState<boolean>(
    userPermission != null && userPermission.length > 0
      ? userPermission.includes(ACTIONS.CAMPAIGN_TO_APPROVE)
      : false,
  );
  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);
  const [uploadFileAfterFlag, setUploadFileAfterFlag] = React.useState(false);
  const [attachFileBeforeOlds, setAttachFileBeforeOlds] = React.useState<any>(
    [],
  );
  const [attachFileAfterOlds, setAttachFileAfterOlds] = React.useState<any>([]);
  const [attachFileBeforeError, setAttachFileBeforeError] = React.useState("");
  const [attachFileAfterError, setAttachFileAfterError] = React.useState("");
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);
  const fileUploadAfterList = useAppSelector(
    (state) => state.toDestroyDiscountAttachAfterSlice.state,
  );
  const [alertTextError, setAlertTextError] = React.useState(
    "กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน",
  );
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [currentBranch, setCurrentBranch] = React.useState(
    branchList && branchList.length > 0 && getUserInfo().branch
      ? getUserInfo().branch +
          " - " +
          getBranchName(branchList, getUserInfo().branch)
      : "",
  );
  const [branchCodeCheckStock, setBranchCodeCheckStock] = React.useState(
    getUserInfo().branch ? getUserInfo().branch : "",
  );
  const [openShowFile, setOpenShowFile] = React.useState<boolean>(false);
  const [lstAttachFileBeforeShow, setLstAttachFileBeforeShow] =
    React.useState<any>([]);
  const [lstAttachFileAfterShow, setLstAttachFileAfterShow] =
    React.useState<any>([]);
  const [currentFileOpenKey, setCurrentFileOpenKey] = React.useState<any>("");

  const handleOpenAddItems = () => {
    setOpenModelAddItems(true);
  };

  const handleCloseModelAddItems = async () => {
    dispatch(updateErrorList([]));
    setOpenModelAddItems(false);
  };

  const handleOpenCancel = () => {
    setOpenModalCancel(true);
  };

  const handleCloseModalCancel = () => {
    setOpenModalCancel(false);
  };

  const handleCloseModalConfirmSendForApproval = (confirm: boolean) => {
    setOpenModalConfirmSendForApproval(false);
    if (confirm) {
      handleSendForApproval(dataDetail.id);
    }
  };

  const handleCloseModalConfirmApprove = (confirm: boolean) => {
    setOpenModalConfirmApprove(false);
    if (confirm) {
      handleApprove();
    }
  };

  const handleOpenModalReject = () => {
    setOpenModalReject(true);
  };

  const handleClosePopup = () => {
    setOpenPopupModal(false);
  };

  const handleCloseModalError = () => {
    setOpenModalError(false);
  };

  const handleClose = async () => {
    dispatch(updateErrorList([]));
    dispatch(updateCheckStock([]));
    dispatch(updateAddDestroyProductState([]));
    dispatch(
      updateDataDetail({
        id: "",
        documentNumber: "",
        status: "",
        approvedDate: null,
        createdDate: moment(new Date()).toISOString(),
        transferOutReason: "",
        store: "2",
      }),
    );
    dispatch(updateCheckEdit(false));
    setOpen(false);
    onClickClose();
  };

  const handleCloseModalCreate = () => {
    if (
      (dataDetail.status === "" && Object.keys(payloadAddItem).length) ||
      checkEdit
    ) {
      setOpenModalClose(true);
    } else if (dataDetail.status === TOStatus.DRAFT && checkEdit) {
      setOpenModalClose(true);
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    setStatus(dataDetail.status);
  }, [dataDetail.status]);

  useEffect(() => {
    //set value detail from search
    if (Action.UPDATE === action && !objectNullOrEmpty(transferOutDetail)) {
      //set current branch
      let currentBranch = stringNullOrEmpty(transferOutDetail.branch)
        ? ""
        : transferOutDetail.branch;
      currentBranch += stringNullOrEmpty(transferOutDetail.branchName)
        ? ""
        : " - " + transferOutDetail.branchName;
      setCurrentBranch(currentBranch);
      if (!stringNullOrEmpty(transferOutDetail.branch)) {
        setBranchCodeCheckStock(transferOutDetail.branch);
      }
      //set value for data detail
      dispatch(
        updateDataDetail({
          id: transferOutDetail.id,
          documentNumber: transferOutDetail.documentNumber,
          status: transferOutDetail.status,
          createdDate: transferOutDetail.createdDate,
          approvedDate: transferOutDetail.approvedDate,
          transferOutReason: transferOutDetail.transferOutReason,
          store: transferOutDetail.store,
        }),
      );
      //set value for approve/reject
      dispatch(
        updateApproveReject({
          ...approveReject,
          approvalNote: transferOutDetail.rejectReason,
        }),
      );
      //set value for attach files
      if (
        transferOutDetail.beforeAttachFiles &&
        transferOutDetail.beforeAttachFiles.length > 0
      ) {
        let lstAttachFileBefore: any = [];
        for (let item of transferOutDetail.beforeAttachFiles) {
          lstAttachFileBefore.push({
            file: null,
            fileKey: item.key,
            fileName: item.name,
            status: "old",
            mimeType: item.mimeType,
            branchCode: item.branchCode,
          });
        }
        setAttachFileBeforeOlds(lstAttachFileBefore);
      }
      if (
        transferOutDetail.afterAttachFiles &&
        transferOutDetail.afterAttachFiles.length > 0
      ) {
        let lstAttachFileAfter: any = [];
        for (let item of transferOutDetail.afterAttachFiles) {
          lstAttachFileAfter.push({
            file: null,
            fileKey: item.key,
            fileName: item.name,
            status: "old",
            mimeType: item.mimeType,
            branchCode: item.branchCode,
          });
        }
        setAttachFileAfterOlds(lstAttachFileAfter);
      }
      //set value for products
      if (transferOutDetail.products && transferOutDetail.products.length > 0) {
        let lstProductDetail: any = [];
        for (let item of transferOutDetail.products) {
          lstProductDetail.push({
            barcode: item.barcode,
            barcodeName: item.productName,
            unit: item.unitName,
            unitCode: item.unitFactor,
            barFactor: item.barFactor,
            unitPrice: item.price || 0,
            numberOfDiscounted: item.numberOfDiscounted || 0,
            numberOfRequested: item.numberOfRequested || 0,
            numberOfApproved:
              TOStatus.WAIT_FOR_APPROVAL == transferOutDetail.status &&
              approvePermission
                ? item.numberOfRequested || 0
                : item.numberOfApproved || 0,
            skuCode: item.sku,
            remark: item.remark,
          });
        }
        dispatch(updateAddDestroyProductState(lstProductDetail));
      }
    }
  }, [transferOutDetail]);

  const validate = (checkApprove: boolean, sendRequest: boolean) => {
    let isValid = true;
    //validate data detail
    if (
      sendRequest &&
      TOStatus.DRAFT == status &&
      fileUploadList.length === 0 &&
      attachFileBeforeOlds.length === 0
    ) {
      setAttachFileBeforeError("AttachFileBefore__กรุณาแนบไฟล์เอกสาร");
      isValid = false;
    }

    //validate product
    const data = [...payloadTransferOut.products];
    if (data.length > 0) {
      let dt: any = [];
      for (let preData of data) {
        const item = {
          id: preData.barcode,
          errorNumberOfRequested: "",
          errorNumberOfApproved: "",
        };

        if (checkApprove) {
          if (stringNullOrEmpty(preData.numberOfApproved)) {
            isValid = false;
            item.errorNumberOfApproved = "โปรดระบุจำนวนเงินที่ทำลาย";
          } else {
            if (preData.numberOfApproved < 0) {
              isValid = false;
              item.errorNumberOfApproved =
                "จำนวนการทำลายต้องมากกว่าหรือเท่ากับ 0";
            } else if (preData.numberOfApproved > preData.numberOfRequested) {
              isValid = false;
              item.errorNumberOfApproved =
                "จำนวนทำลายจริงต้องไม่เกินจำนวนขอส่วนลด";
            }
          }
        } else {
          if (
            stringNullOrEmpty(preData.numberOfRequested) ||
            preData.numberOfRequested < 0
          ) {
            isValid = false;
            item.errorNumberOfRequested = "ระบุจำนวนการทำลายที่แท้จริง";
          } else if (preData.numberOfRequested > preData.numberOfDiscounted) {
            isValid = false;
            item.errorNumberOfRequested =
              "จำนวนทำลายจริงต้องไม่น้อยกว่าจำนวนขอส่วนลด";
          }
        }
        if (!isValid) {
          dt.push(item);
        }
      }
      errorListProduct = dt;
    }
    if (!isValid) {
      dispatch(updateErrorList(errorListProduct));
      setOpenModalError(true);
    }
    return isValid;
  };

  const handleOnChangeUploadFileBefore = (status: boolean) => {
    setUploadFileFlag(status);
    setAttachFileBeforeError("");
  };

  const handleOnChangeUploadFileAfter = (status: boolean) => {
    setUploadFileAfterFlag(status);
    setAttachFileAfterError("");
  };

  const onDeleteAttachFileBeforeOld = (item: any) => {
    let attachFileData = _.cloneDeep(attachFileBeforeOlds);
    let attachFileDataFilter = attachFileData.filter(
      (it: any) => it.fileKey !== item.fileKey,
    );
    setAttachFileBeforeOlds(attachFileDataFilter);
  };

  const onDeleteAttachFileAfterOld = (item: any) => {
    let attachFileData = _.cloneDeep(attachFileAfterOlds);
    let attachFileDataFilter = attachFileData.filter(
      (it: any) => it.fileKey !== item.fileKey,
    );
    setAttachFileAfterOlds(attachFileDataFilter);
  };

  const handleUploadAttachFile = async (uploadFileList: any) => {
    try {
      const formData = new FormData();
      for (const it of uploadFileList) {
        formData.append("attachFile", it);
      }
      const rs = await uploadAttachFile(formData);
      if (rs) {
        return rs;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleAllAttachFile = async (
    uploadFileList: any,
    attachFileOldList: any,
  ) => {
    let allAttachFile = [];
    if (uploadFileList && uploadFileList.length > 0) {
      const rsUploadAttachFile = await handleUploadAttachFile(uploadFileList);
      if (rsUploadAttachFile.data && rsUploadAttachFile.data.length > 0) {
        allAttachFile.push(...rsUploadAttachFile.data);
      } else {
        setAlertTextError(
          rsUploadAttachFile.message
            ? rsUploadAttachFile.message
            : "อัปโหลดไฟล์แนบไม่สำเร็จ",
        );
        setOpenModalError(true);
        return;
      }
    }
    if (attachFileOldList && attachFileOldList.length > 0) {
      for (const oldFile of attachFileOldList) {
        let attachFileExist = allAttachFile.find(
          (itAll: any) => itAll.name === oldFile.fileName,
        );
        if (objectNullOrEmpty(attachFileExist)) {
          allAttachFile.push({
            key: oldFile.fileKey,
            name: oldFile.fileName,
            mimeType: oldFile.mimeType,
            branchCode: oldFile.branchCode,
          });
        }
      }
    }
    return allAttachFile;
  };

  const handleCreateDraft = async (sendRequest: boolean) => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    if (validate(false, sendRequest)) {
      const rsCheckStock = await handleCheckStock();
      if (rsCheckStock) {
        await dispatch(save({ ...payloadTransferOut }));
        try {
          const allAttachFileBefore = await handleAllAttachFile(
            fileUploadList,
            attachFileBeforeOlds,
          );
          const body = !!dataDetail.id
            ? {
                ...payloadTransferOut,
                id: dataDetail.id,
                documentNumber: dataDetail.documentNumber,
                beforeAttachFiles: allAttachFileBefore,
                type: TO_TYPE.TO_WITH_DISCOUNT,
              }
            : {
                ...payloadTransferOut,
                beforeAttachFiles: allAttachFileBefore,
                type: TO_TYPE.TO_WITH_DISCOUNT,
              };
          const rs = await saveDraftTransferOut(body);
          if (rs.code === 201) {
            if (!sendRequest) {
              dispatch(updateCheckEdit(false));
              setOpenPopupModal(true);
              setTextPopup("คุณได้ทำการบันทึกข้อมูลเรียบร้อยแล้ว");
              if (onSearchMain) onSearchMain();
            }
            if (rs && rs.data) {
              if (
                rs.data.beforeAttachFiles &&
                rs.data.beforeAttachFiles.length > 0
              ) {
                let beforeAttachFiles: any = [];
                for (let item of rs.data.beforeAttachFiles) {
                  beforeAttachFiles.push({
                    file: null,
                    fileKey: item.key,
                    fileName: item.name,
                    status: "old",
                    mimeType: item.mimeType,
                    branchCode: item.branchCode,
                  });
                }
                await setUploadFileFlag(true);
                await setAttachFileBeforeOlds(beforeAttachFiles);
                await dispatch(uploadFileState([]));
              }
              if (
                rs.data.afterAttachFiles &&
                rs.data.afterAttachFiles.length > 0
              ) {
                let afterAttachFiles: any = [];
                for (let item of rs.data.afterAttachFiles) {
                  afterAttachFiles.push({
                    file: null,
                    fileKey: item.key,
                    fileName: item.name,
                    status: "old",
                    mimeType: item.mimeType,
                    branchCode: item.branchCode,
                  });
                }
                await setUploadFileAfterFlag(true);
                await setAttachFileAfterOlds(afterAttachFiles);
                await dispatch(uploadFileAfterState([]));
              }
            }
            dispatch(
              updateDataDetail({
                ...dataDetail,
                id: rs.data.id,
                documentNumber: rs.data.documentNumber,
                status: TOStatus.DRAFT,
              }),
            );
            if (sendRequest) {
              //validate attach file
              if (
                fileUploadList.length === 0 &&
                attachFileBeforeOlds.length === 0
              ) {
                setAttachFileBeforeError(
                  "AttachFileBefore__กรุณาแนบไฟล์เอกสาร",
                );
                return;
              }
              setOpenModalConfirmSendForApproval(true);
            }
          } else {
            setOpenModalError(true);
          }
        } catch (error) {
          setOpenModalError(true);
        }
      }
    }
  };

  const handleSendRequest = () => {
    handleCreateDraft(true);
  };

  const handleSendForApproval = async (id: string) => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    try {
      const rs = await sendForApprovalTransferOut(id);
      if (rs.code === 20000) {
        dispatch(
          updateDataDetail({
            ...dataDetail,
            status: TOStatus.WAIT_FOR_APPROVAL,
          }),
        );
        setOpenPopup(true);
        setPopupMsg("คุณได้ทำการส่งขออนุมัติเบิกทำลายเรียบร้อยแล้ว");
        handleClose();
        if (onSearchMain) onSearchMain();
      } else {
        setOpenModalError(true);
      }
    } catch (error) {
      setOpenModalError(true);
    }
  };

  const handleOpenModalConfirmApprove = () => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    if (validate(true, false)) {
      setOpenModalConfirmApprove(true);
    } else {
      dispatch(updateErrorList(errorListProduct));
      setOpenModalError(true);
    }
  };

  const handleApprove = async () => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    try {
      const allAttachFile = await handleAllAttachFile(
        fileUploadList,
        attachFileBeforeOlds,
      );
      const payload = {
        products: payloadTransferOut.products,
        beforeAttachFiles: allAttachFile,
      };
      const rs = await approveTransferOut(dataDetail.id, payload);
      if (rs.code === 20000) {
        dispatch(
          updateDataDetail({
            ...dataDetail,
            status: TOStatus.APPROVED,
          }),
        );
        setOpenPopup(true);
        setPopupMsg("คุณได้ทำการอนุมัติเบิกทำลายเรียบร้อยแล้ว");
        handleClose();
        if (onSearchMain) onSearchMain();
      } else if (rs.code === 50003) {
        dispatch(updateCheckStock(rs.data));
        setOpenCheckStock(true);
      } else {
        setOpenModalError(true);
      }
    } catch (error) {
      setOpenModalError(true);
    }
  };

  const handleDeleteDraft = async () => {
    setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    if (!stringNullOrEmpty(status)) {
      try {
        const rs = await cancelTransferOut(dataDetail.id);
        if (rs.status === 200) {
          setOpenPopup(true);
          setPopupMsg("คุณได้ยกเลิกเบิกทำลายเรียบร้อยแล้ว");
          handleClose();
          if (onSearchMain) onSearchMain();
        } else {
          setOpenModalError(true);
          setOpenModalCancel(false);
        }
      } catch (error) {
        setOpenModalError(true);
        setOpenModalCancel(false);
      }
    } else {
      setOpenPopup(true);
      setPopupMsg("คุณได้ยกเลิกเบิกทำลายเรียบร้อยแล้ว");
      handleClose();
    }
  };

  const handleCheckStock = async () => {
    try {
      const products = payloadTransferOut.products.map((item: any) => {
        return {
          barcode: item.barcode,
          numberOfDiscounted: item.numberOfRequested,
        };
      });
      const payload = {
        branchCode: branchCodeCheckStock,
        products: products,
        backStore: true,
      };
      const rs = await checkStockBalance(payload);
      if (rs.data && rs.data.length > 0) {
        await dispatch(updateCheckStock(rs.data));
        setOpenCheckStock(true);
      } else {
        dispatch(updateCheckStock([]));
      }
      return rs.data ? !rs.data.length : true;
    } catch (error) {
      setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
      setOpenModalError(true);
    }
  };

  const handleCloseModalConfirmReject = async (confirm: boolean) => {
    setOpenModalReject(false);
    if (confirm) {
      handleReject();
    }
  };

  const handleReject = async () => {
    try {
      const allAttachFileBefore = await handleAllAttachFile(
        fileUploadList,
        attachFileBeforeOlds,
      );
      const payload = {
        beforeAttachFiles: allAttachFileBefore,
        products: payloadTransferOut.products,
      };
      let res = await rejectTransferOut(dataDetail.id, payload);
      if (res && res.code === 20000) {
        dispatch(
          updateDataDetail({
            ...dataDetail,
            status: Number(TOStatus.REJECTED),
          }),
        );
        setOpenPopup(true);
        setPopupMsg("คุณได้ทำการไม่อนุมัติเบิกทำลายเรียบร้อยแล้ว");
        handleClose();
        if (onSearchMain) onSearchMain();
      } else {
        setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
        setOpenModalError(true);
      }
    } catch (error) {
      setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
      setOpenModalError(true);
    }
  };

  const handleOpenModalConfirmEnd = () => {
    //validate attach file
    if (fileUploadAfterList.length === 0 && attachFileAfterOlds.length === 0) {
      setAttachFileAfterError("AttachFileAfter__กรุณาแนบไฟล์เอกสาร");
      return;
    }
    setOpenModalConfirmEnd(true);
  };

  const handleCloseModalConfirmEnd = async (confirm: boolean) => {
    setOpenModalConfirmEnd(false);
    if (confirm) {
      handleEnd();
    }
  };

  const handleEnd = async () => {
    try {
      const allAttachFileAfter = await handleAllAttachFile(
        fileUploadAfterList,
        attachFileAfterOlds,
      );
      let res = await endTransferOut(dataDetail.id, allAttachFileAfter);
      if (res && res.code === 20000) {
        dispatch(
          updateDataDetail({
            ...dataDetail,
            status: Number(TOStatus.CLOSED),
          }),
        );
        setOpenPopup(true);
        setPopupMsg("คุณได้ทำการปิดงานเบิกทำลายเรียบร้อยแล้ว");
        handleClose();
        if (onSearchMain) onSearchMain();
      } else {
        setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
        setOpenModalError(true);
      }
    } catch (error) {
      setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
      setOpenModalError(true);
    }
  };

  const genDisabledApproveButton = () => {
    return (
      dataDetail &&
      moment(dataDetail.createdDate).isBefore(moment(new Date()), "day")
    );
  };

  const onShowBeforeAfterFile = (fileKey: string | undefined) => {
    let allBeforeFile: any[] = _.cloneDeep(attachFileBeforeOlds);
    let allAfterFile: any[] = _.cloneDeep(attachFileAfterOlds);
    setLstAttachFileBeforeShow(allBeforeFile);
    setLstAttachFileAfterShow(allAfterFile);
    setCurrentFileOpenKey(fileKey);
    setOpenShowFile(true);
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleCloseModalCreate}
        >
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียดเอกสารทำลาย (ส่วนลด)
          </Typography>
          <StepperBar activeStep={status} setActiveStep={setStatus} />
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container mt={1} mb={-1}>
            {/*line 1*/}
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                สาขา :
              </Grid>
              <Grid item xs={8}>
                {currentBranch}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5} pl={3}>
              <Grid item xs={5}>
                เลขที่เอกสารทำลาย :
              </Grid>
              <Grid item xs={7}>
                {!!dataDetail.documentNumber ? dataDetail.documentNumber : "-"}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5} pl={3}>
              <Grid item xs={4}>
                วันที่ทำรายการ :
              </Grid>
              <Grid item xs={8}>
                {moment(dataDetail.createdDate)
                  .add(543, "y")
                  .format("DD/MM/YYYY")}
              </Grid>
            </Grid>
            {/*line 2*/}
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                วันที่อนุมัติ :
              </Grid>
              <Grid item xs={8}>
                {dataDetail.approvedDate
                  ? moment(dataDetail.approvedDate)
                      .add(543, "y")
                      .format("DD/MM/YYYY")
                  : "-"}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5} pl={3}>
              <Grid item xs={4}>
                สต๊อก :
              </Grid>
              <Grid item xs={8}>
                หลังร้าน
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5} pl={3}>
              <Grid item xs={4}></Grid>
              <Grid item xs={8}></Grid>
            </Grid>
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                รูปก่อนทำลาย<span style={{ color: "#F54949" }}>*</span> :
              </Grid>
              <Grid item xs={8} pl={2}>
                <AccordionUploadFile
                  files={attachFileBeforeOlds}
                  docNo={dataDetail ? dataDetail.documentNumber : ""}
                  docType="TO"
                  isStatus={uploadFileFlag}
                  onChangeUploadFile={handleOnChangeUploadFileBefore}
                  onDeleteAttachFile={onDeleteAttachFileBeforeOld}
                  idControl={"AttachFileBefore"}
                  enabledControl={
                    TOStatus.DRAFT === status ||
                    (TOStatus.WAIT_FOR_APPROVAL === status && approvePermission)
                  }
                  warningMessage={attachFileBeforeError}
                  deletePermission={TOStatus.DRAFT === status}
                  onShowOtherType={(fileKey) => onShowBeforeAfterFile(fileKey)}
                />
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5} pl={3}>
              <Grid item xs={4}>
                รูปหลังทำลาย<span style={{ color: "#F54949" }}>*</span> :
              </Grid>
              <Grid item xs={8}>
                <AttachFileAfter
                  files={attachFileAfterOlds}
                  docNo={dataDetail ? dataDetail.documentNumber : ""}
                  docType="TO"
                  isStatus={uploadFileAfterFlag}
                  onChangeUploadFile={handleOnChangeUploadFileAfter}
                  onDeleteAttachFile={onDeleteAttachFileAfterOld}
                  idControl={"AttachFileAfter"}
                  enabledControl={
                    TOStatus.APPROVED === status && !approvePermission
                  }
                  warningMessage={attachFileAfterError}
                  deletePermission={TOStatus.DRAFT === status}
                  onShowOtherType={(fileKey) => onShowBeforeAfterFile(fileKey)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Box>
            <Box sx={{ display: "flex", marginBottom: "18px" }}>
              <Box>
                <Button
                  id="btnAddItem"
                  variant="contained"
                  color="info"
                  className={classes.MbtnSearch}
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  onClick={handleOpenAddItems}
                  sx={{ width: 126 }}
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != TOStatus.DRAFT) ||
                      approvePermission
                        ? "none"
                        : undefined,
                  }}
                  disabled={
                    (!stringNullOrEmpty(status) && status != TOStatus.DRAFT) ||
                    (dataDetail &&
                      moment(dataDetail.createdDate).isBefore(
                        moment(new Date()),
                        "day",
                      ))
                  }
                >
                  เพิ่มสินค้า
                </Button>
              </Box>
              <Box sx={{ marginLeft: "auto" }}>
                <Button
                  id="btnSaveDraft"
                  variant="contained"
                  color="warning"
                  startIcon={<SaveIcon />}
                  disabled={
                    (!stringNullOrEmpty(status) && status != TOStatus.DRAFT) ||
                    (payloadTransferOut.products &&
                      payloadTransferOut.products.length === 0) ||
                    (status == TOStatus.DRAFT &&
                      dataDetail &&
                      moment(dataDetail.createdDate).isBefore(
                        moment(new Date()),
                        "day",
                      ))
                  }
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != TOStatus.DRAFT) ||
                      approvePermission
                        ? "none"
                        : undefined,
                  }}
                  onClick={() => handleCreateDraft(false)}
                  className={classes.MbtnSearch}
                >
                  บันทึก
                </Button>
                <Button
                  id="btnSendForApproval"
                  variant="contained"
                  color="primary"
                  sx={{ margin: "0 17px" }}
                  disabled={
                    (!stringNullOrEmpty(status) && status != TOStatus.DRAFT) ||
                    (payloadTransferOut.products &&
                      payloadTransferOut.products.length === 0) ||
                    (status == TOStatus.DRAFT &&
                      dataDetail &&
                      moment(dataDetail.createdDate).isBefore(
                        moment(new Date()),
                        "day",
                      ))
                  }
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != TOStatus.DRAFT) ||
                      approvePermission
                        ? "none"
                        : undefined,
                  }}
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleSendRequest}
                  className={classes.MbtnSearch}
                >
                  ขออนุมัติ
                </Button>
                <Button
                  id="btnCancel"
                  variant="contained"
                  color="error"
                  disabled={
                    stringNullOrEmpty(status) ||
                    (!stringNullOrEmpty(status) && status != TOStatus.DRAFT)
                  }
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != TOStatus.DRAFT) ||
                      approvePermission
                        ? "none"
                        : undefined,
                  }}
                  startIcon={<HighlightOffIcon />}
                  onClick={handleOpenCancel}
                  className={classes.MbtnSearch}
                >
                  ยกเลิก
                </Button>
                <Button
                  id="btnApprove"
                  sx={{ margin: "0 17px" }}
                  style={{
                    display:
                      status == TOStatus.WAIT_FOR_APPROVAL && approvePermission
                        ? undefined
                        : "none",
                  }}
                  variant="contained"
                  color="primary"
                  disabled={genDisabledApproveButton()}
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleOpenModalConfirmApprove}
                  className={classes.MbtnSearch}
                >
                  อนุมัติ
                </Button>
                <Button
                  id="btnReject"
                  variant="contained"
                  style={{
                    display:
                      status == TOStatus.WAIT_FOR_APPROVAL && approvePermission
                        ? undefined
                        : "none",
                  }}
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={handleOpenModalReject}
                  className={classes.MbtnSearch}
                >
                  ไม่อนุมัติ
                </Button>
                <Button
                  id="btnEnd"
                  variant="contained"
                  style={{
                    display:
                      status != TOStatus.APPROVED || approvePermission
                        ? "none"
                        : undefined,
                  }}
                  color="info"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleOpenModalConfirmEnd}
                  className={classes.MbtnSearch}
                >
                  ปิดงาน
                </Button>
              </Box>
            </Box>
            <Box>
              <ModalToDestroyDiscountItem
                id=""
                action={action}
                userPermission={userPermission}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ModalShowBeforeAfterFile
        open={openShowFile}
        onClose={() => setOpenShowFile(false)}
        attachFileBefore={lstAttachFileBeforeShow}
        attachFileAfter={lstAttachFileAfterShow}
        currentFileOpenKey={currentFileOpenKey}
      />

      <ModalAddProductToDestroyDiscount
        open={openModelAddItems}
        onClose={handleCloseModelAddItems}
      />
      <ModelConfirm
        open={openModalCancel}
        onClose={handleCloseModalCancel}
        onConfirm={handleDeleteDraft}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันยกเลิกเบิกทำลาย"}
        documentField={"เลขที่เอกสารเบิก"}
      />
      <SnackbarStatus
        open={openPopupModal}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={textPopup}
      />
      <AlertError
        open={openModalError}
        onClose={handleCloseModalError}
        textError={alertTextError}
      />
      <ModalCheckStock
        open={openCheckStock}
        onClose={() => {
          setOpenCheckStock(false);
        }}
        headerTitle={"เบิกสินค้ามากกว่าที่มีในคลัง โปรดตรวจสอบ"}
      />
      <ConfirmCloseModel
        open={openModalClose}
        onClose={() => setOpenModalClose(false)}
        onConfirm={handleClose}
      />
      <ModelConfirm
        open={openModalConfirmSendForApproval}
        onClose={() => handleCloseModalConfirmSendForApproval(false)}
        onConfirm={() => handleCloseModalConfirmSendForApproval(true)}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันส่งขอเบิกทำลาย"}
        documentField={"เลขที่เอกสารเบิก"}
      />
      <ModelConfirm
        open={openModalConfirmApprove}
        onClose={() => handleCloseModalConfirmApprove(false)}
        onConfirm={() => handleCloseModalConfirmApprove(true)}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันอนุมัติเบิกทำลาย"}
        documentField={"เลขที่เอกสารเบิก"}
      />
      <ModelConfirm
        open={openModalReject}
        onClose={() => handleCloseModalConfirmReject(false)}
        onConfirm={() => handleCloseModalConfirmReject(true)}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันไม่อนุมัติเบิกทำลาย"}
        documentField={"เลขที่เอกสารเบิก"}
      />
      <ModelConfirm
        open={openModalConfirmEnd}
        onClose={() => handleCloseModalConfirmEnd(false)}
        onConfirm={() => handleCloseModalConfirmEnd(true)}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันปิดงานเบิกทำลาย"}
        documentField={"เลขที่เอกสารเบิก"}
      />
    </div>
  );
}
