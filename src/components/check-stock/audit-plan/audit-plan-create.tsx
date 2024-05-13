import React, { ReactElement, useEffect, useState } from "react";
import { Box } from "@mui/system";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Dialog,
  DialogContent,
  Fade,
  FormControl,
  Grid,
  Grow,
  Input,
  Link,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Select,
  Typography,
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ImportAppIcon from "@mui/icons-material/ExitToApp";
import SaveIcon from "@mui/icons-material/Save";
import { useStyles } from "../../../styles/makeTheme";
import StepperBar from "./stepper-bar";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import AlertError from "../../commons/ui/alert-error";
import {
  getBranchName,
  objectNullOrEmpty,
  onChangeDate,
  stringNullOrEmpty,
} from "../../../utils/utils";
import {
  Action,
  StockActionStatus,
  STOCK_COUNTER_TYPE,
} from "../../../utils/enum/common-enum";
import ConfirmCloseModel from "../../commons/ui/confirm-exit-model";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import {
  ACTIONS,
  KEYCLOAK_GROUP_AUDIT,
} from "../../../utils/enum/permission-enum";
import { getUserInfo } from "../../../store/sessionStore";
import ModelConfirm from "../../barcode-discount/modal-confirm";
import DatePickerAllComponent from "../../commons/ui/date-picker-all";
import BranchListDropDown from "../../commons/ui/branch-list-dropdown";
import { BranchListOptionType } from "../../../models/branch-model";
import {
  getUserGroup,
  isChannelBranch,
  isGroupAuditParam,
  isGroupBranchParam,
} from "../../../utils/role-permission";
import ModalAddTypeProduct from "../../commons/ui/modal-add-type-products";
import AuditPlanCreateItem from "./audit-plan-create-item";
import ModalConfirmCounting from "./modal-confirm-counting";
import {
  cancelAuditPlan,
  confirmAuditPlan,
  countingAuditPlan,
  importAP,
  saveDraftAuditPlan,
  updateAuditPlan,
} from "../../../services/audit-plan";
import { updateAddTypeAndProductState } from "../../../store/slices/add-type-product-slice";
import { PayloadCounting } from "../../../models/audit-plan";
import {
  clearDataFilter,
  getAuditPlanDetail,
} from "../../../store/slices/audit-plan-detail-slice";
import { setCheckEdit } from "../../../store/slices/sale-limit-time-slice";
import DocumentList from "./modal-documents-list";
import { env } from "../../../adapters/environmentConfigs";
import ModalValidateImport from "../../sale-limit-time/modal-validate-import";
import ModalCreateStockAdjustment from "../stock-adjustment/modal-create-stock-adjustment";
import { updateDataDetail } from "../../../store/slices/stock-adjustment-slice";
import { getStockAdjustmentDetail } from "../../../store/slices/stock-adjustment-detail-slice";
import {
  clearCalculate,
  updateRefresh,
} from "../../../store/slices/stock-adjust-calculate-slice";
import LoadingModal from "../../commons/ui/loading-modal";
import ModalAddProductFromSA from "./modal-add-product-from-SA";
import { getStockCountDetail } from "../../../store/slices/stock-count-detail-slice";
import ModalCreateStockCount from "../stock-count/modal-create-stock-count";

interface Props {
  action: Action | Action.INSERT;
  isOpen: boolean;
  setOpenPopup: (openPopup: boolean) => void;
  onClickClose: () => void;
  setPopupMsg?: any;
  onSearchMain?: () => void;
  onReSearchMain?: (branch: string) => void;
  userPermission?: any[];
  viewMode?: boolean;
  openLink?: boolean;
  notClearWhenClose?: boolean;
}

interface Values {
  id: string;
  countingDate: Date | null | any;
  branch: string;
  documentNumber: string;
  createDate: Date | null | any;
  stockCounter: number;
  recountingBy: number;
}

const _ = require("lodash");

const steps = [
  StockActionStatus.DRAFT,
  StockActionStatus.CONFIRM,
  StockActionStatus.COUNTING,
  StockActionStatus.END,
];

export default function ModalCreateAuditPlan({
  isOpen,
  onClickClose,
  setOpenPopup,
  setPopupMsg,
  onSearchMain,
  onReSearchMain,
  action,
  viewMode,
  openLink,
  notClearWhenClose,
}: Props): ReactElement {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(isOpen);
  const [openSA, setOpenSA] = React.useState<boolean>(false);
  const [openModalCancel, setOpenModalCancel] = React.useState<boolean>(false);
  const [openModalConfirm, setOpenModalConfirm] =
    React.useState<boolean>(false);
  const [openModelAddItems, setOpenModelAddItems] =
    React.useState<boolean>(false);
  const [openModalAddItemFromSA, setOpenModalAddItemFromSA] =
    React.useState<boolean>(false);
  const [openPopupModal, setOpenPopupModal] = React.useState<boolean>(false);
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const [openModalClose, setOpenModalClose] = React.useState<boolean>(false);
  const [textPopup, setTextPopup] = React.useState<string>("");
  const [status, setStatus] = React.useState<any>("");
  const [errorCounting, setErrorCounting] = React.useState<boolean>(false);
  const [openModalConfirmCounting, setOpenModalConfirmCounting] =
    React.useState<boolean>(false);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : ""
      : "",
  );
  const branchName = getBranchName(branchList, ownBranch);
  const [groupBranch, setGroupBranch] = React.useState(isChannelBranch);
  const [clearBranchDropDown, setClearBranchDropDown] =
    React.useState<boolean>(false);
  const [branchMap, setBranchMap] = React.useState<BranchListOptionType>({
    code: ownBranch,
    name: branchName ? branchName : "",
  });
  const userGroups = getUserInfo().groups ? getUserInfo().groups : [];
  const _group = getUserGroup(userGroups);
  const [currentName, setCurrentName] = React.useState<string>("");
  const [disableCounting, setDisableCounting] = React.useState<boolean>(false);
  const [branchOptions, setBranchOptions] =
    React.useState<BranchListOptionType | null>(groupBranch ? branchMap : null);
  const checkEdit = useAppSelector((state) => state.saleLimitTime.checkEdit);
  const [values, setValues] = React.useState<Values>({
    id: "",
    countingDate: null,
    branch: groupBranch ? ownBranch : "",
    documentNumber: "",
    createDate: new Date(),
    stockCounter: isGroupAuditParam(_group) ? 0 : STOCK_COUNTER_TYPE.BRANCH,
    recountingBy: 0,
  });
  const [recounting, setRecounting] = React.useState<boolean>(false);
  const [errorBranch, setErrorBranch] = React.useState<boolean>(false);
  const [reSave, setReSave] = React.useState(false);
  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<boolean>(false);
  const [openSADetail, setOpenSADetail] = React.useState<boolean>(false);
  const [openSCDetail, setOpenSCDetail] = React.useState<boolean>(false);

  //permission
  const userInfo = getUserInfo();
  const managePermission =
    userInfo.acl["service.posback-stock"] != null &&
    userInfo.acl["service.posback-stock"].length > 0
      ? userInfo.acl["service.posback-stock"].includes("stock.ap.manage")
      : false;
  const countingPermission =
    userInfo.acl["service.posback-stock"] != null &&
    userInfo.acl["service.posback-stock"].length > 0
      ? userInfo.acl["service.posback-stock"].includes("stock.sc.manage")
      : false;
  const [userPermission, setUserPermission] = useState<any[]>(
    userInfo.acl["service.posback-stock"] != null &&
      userInfo.acl["service.posback-stock"].length > 0
      ? userInfo.acl["service.posback-stock"]
      : [],
  );
  const manageSAPermission =
    userInfo.acl["service.posback-stock"] != null &&
    userInfo.acl["service.posback-stock"].length > 0
      ? userInfo.acl["service.posback-stock"].includes(ACTIONS.STOCK_SA_MANAGE)
      : false;
  const isBranchPermission = env.branch.channel === "branch";
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );
  const stockCountDetail = useAppSelector(
    (state) => state.stockCountDetailSlice.stockCountDetail,
  );
  const [alertTextError, setAlertTextError] = React.useState(
    "กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน",
  );
  const dataDetail = useAppSelector(
    (state) => state.auditPlanDetailSlice.auditPlanDetail.data,
  );
  //modal vaildate
  const [openModalValidate, setOpenModalValidate] =
    React.useState<boolean>(false);
  const [msgModalValidate, setMsgModalValidate] = React.useState<string>("");
  const [urlModalValidate, setUrlModalValidate] = React.useState<string>("");
  useEffect(() => {
    if (Action.UPDATE === action && !objectNullOrEmpty(dataDetail)) {
      setStatus(dataDetail.status);
      setCurrentName(dataDetail.createdBy);
      setBranchOptions({
        code: dataDetail.branchCode,
        name: dataDetail.branchName,
      });
      setValues({
        ...values,
        id: dataDetail.id,
        branch: dataDetail.branchCode,
        documentNumber: dataDetail.documentNumber,
        createDate: dataDetail.createdDate,
        countingDate: dataDetail.countingDate ? dataDetail.countingDate : null,
        stockCounter: dataDetail.stockCounter ? dataDetail.stockCounter : 0,
        recountingBy: dataDetail.recountingBy ? dataDetail.recountingBy : 0,
      });
      setRecounting(dataDetail.recounting ? dataDetail.recounting : false);
      if (
        dataDetail.appliedProduct.appliedProducts &&
        dataDetail.appliedProduct.appliedCategories &&
        dataDetail.status == StockActionStatus.DRAFT
      ) {
        let listProducts = dataDetail.appliedProduct.appliedProducts.map(
          (item: any) => {
            return {
              barcode: item.barcode ? item.barcode : "",
              skuCode: item.skuCode,
              unitName: item.unitName,
              barcodeName: item.name,
              productTypeCode: item.categoryTypeCode,
              productFromSA: dataDetail.recounting
                ? dataDetail.recounting
                : false,
              selectedType: 2,
              skuName: item.skuName,
              productByType: dataDetail.appliedProduct.appliedCategories.some(
                (el1: any) => el1.code == item.categoryTypeCode,
              ),
            };
          },
        );
        let listCategories = dataDetail.appliedProduct.appliedCategories.map(
          (item: any) => {
            return {
              productTypeCode: item.code,
              productTypeName: item.name,
              selectedType: 1,
            };
          },
        );
        dispatch(
          updateAddTypeAndProductState(listProducts.concat(listCategories)),
        );
      } else {
        const products = dataDetail.product
          ? dataDetail.product.map((item: any) => {
              return {
                skuName: item.name,
                skuCode: item.sku,
                selectedType: 2,
                productFromSA: dataDetail.recounting
                  ? dataDetail.recounting
                  : false,
              };
            })
          : [];
        dispatch(updateAddTypeAndProductState(products));
      }
      dispatch(setCheckEdit(false));
    }
  }, [dataDetail]);

  useEffect(() => {
    setRecounting(
      !!payloadAddTypeProduct.filter((el: any) => el.productFromSA).length,
    );
  }, [payloadAddTypeProduct]);

  useEffect(() => {
    if (moment(values.countingDate).endOf("day").isBefore(moment(new Date()))) {
      setDisableCounting(true);
    } else {
      setDisableCounting(false);
    }
  }, [values.countingDate]);

  useEffect(() => {
    setReSave(true);
  }, [values.countingDate, values.branch]);

  const handleChangeBranch = (branchCode: string) => {
    setErrorBranch(false);
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branch: JSON.parse(codes) });
    } else {
      setValues({ ...values, branch: "" });
    }
  };

  const handleChangeCountingDate = (value: any) => {
    setValues({
      ...values,
      countingDate: value,
    });
    setErrorCounting(false);
  };

  const handleCloseModalConfirmCounting = () => {
    setOpenModalConfirmCounting(false);
  };

  const onCounting = async (store: number, APId: string, docNo: string) => {
    try {
      const products = _.uniqBy(
        payloadAddTypeProduct.filter((el: any) => el.selectedType === 2),
        "skuCode",
      ).map((item: any) => {
        return {
          name: item.skuName,
          sku: item.skuCode,
        };
      });
      const auditPlanning = recounting
        ? {
            id: APId,
            product: products,
            documentNumber: docNo,
            branchCode: values.branch,
            branchName: getBranchName(branchList, values.branch),
            stockCounter: values.stockCounter,
            recounting: true,
            recountingBy: values.recountingBy,
          }
        : {
            id: APId,
            product: products,
            documentNumber: docNo,
            branchCode: values.branch,
            branchName: getBranchName(branchList, values.branch),
            stockCounter: values.stockCounter,
            recounting: false,
          };
      const payload: PayloadCounting = {
        auditPlanning: auditPlanning,
        storeType: store,
      };
      const rs = await countingAuditPlan(payload);
      if (rs.code == 20000) {
        dispatch(setCheckEdit(false));
        setStatus(StockActionStatus.COUNTING);
        await dispatch(getStockCountDetail(rs.data.id));
        if (stockCountDetail.data.length > 0 || stockCountDetail.data) {
          setOpenSCDetail(true);
        }
        await dispatch(getAuditPlanDetail(APId));
      } else {
        setOpenModalError(true);
        setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
      }
    } catch (error) {}
  };

  const handleCounting = async (store: number) => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    if (status == "") {
      await handleCreateAP(true, true, store);
    } else if (status == StockActionStatus.DRAFT) {
      await onConfirm(values.id, true, true);
      await onCounting(store, values.id, values.documentNumber);
    } else {
      await onCounting(store, values.id, values.documentNumber);
    }
  };

  const handleChangeStockCounter = (e: any) => {
    setValues({
      ...values,
      stockCounter: e.target.value,
    });
  };
  const handleChangeRecounting = (e: any) => {
    setValues({
      ...values,
      recountingBy: e.target.value,
    });
  };

  const handleCloseModalAddItems = async () => {
    setOpenModelAddItems(false);
  };

  const handleOpenCancel = async () => {
    const rs = await dispatch(getAuditPlanDetail(values.id));
    const payload: any = rs.payload;
    if (payload && payload.data) {
      if (payload.data.relatedScDocuments || payload.data.relatedSaDocuments) {
        setOpenModalError(true);
        setAlertTextError("กรุณายกเลิกเอกสารที่เกี่ยวข้องก่อนดำเนินการ");
      } else {
        setOpenModalCancel(true);
      }
    } else {
      setOpenModalError(true);
      setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    }
  };

  const handleCloseModalCancel = () => {
    setOpenModalCancel(false);
  };

  const handleClosePopup = () => {
    setOpenPopupModal(false);
  };

  const handleCloseModalError = () => {
    setOpenModalError(false);
  };

  const handleClose = async () => {
    if (!notClearWhenClose) {
      dispatch(updateAddTypeAndProductState([]));
      dispatch(clearDataFilter());
    }
    setOpen(false);
    onClickClose();
  };

  const handleCloseModalCreate = () => {
    if ((status === "" && Object.keys(payloadAddItem).length) || checkEdit) {
      setOpenModalClose(true);
    } else if (status === StockActionStatus.DRAFT && checkEdit) {
      setOpenModalClose(true);
    } else {
      handleClose();
    }
  };

  const handleCreateAP = async (
    hasConfirm: boolean,
    hasCounting: boolean,
    store: number,
  ) => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    if (!values.countingDate) {
      setErrorCounting(true);
      return;
    }
    try {
      const products = _.uniqBy(
        payloadAddTypeProduct.filter((el: any) => el.selectedType === 2),
        "skuCode",
      ).map((item: any) => {
        return {
          name: item.skuName,
          sku: item.skuCode,
        };
      });
      let listAppliedCategories = payloadAddTypeProduct
        .filter((el: any) => el.selectedType === 1)
        .filter((item: any) =>
          payloadAddTypeProduct
            .filter((el1: any) => el1.selectedType === 2 && el1.productByType)
            .some((el2: any) => el2.productTypeCode == item.productTypeCode),
        );
      const appliedProduct = {
        appliedProducts: payloadAddTypeProduct
          .filter((el: any) => el.selectedType === 2)
          .map((item: any) => {
            return {
              name: item.barcodeName,
              skuCode: item.skuCode,
              barcode: item.barcode,
              unitName: item.unitName,
              skuName: item.skuName,
              categoryTypeCode: item.productTypeCode,
            };
          }),
        appliedCategories: listAppliedCategories.map((item: any) => {
          return {
            name: item.productTypeName,
            code: item.productTypeCode,
          };
        }),
      };
      const body = recounting
        ? {
            branchCode: values.branch,
            branchName: getBranchName(branchList, values.branch),
            countingDate: moment(values.countingDate)
              .endOf("day")
              .toISOString(true),
            stockCounter: values.stockCounter,
            recountingBy: values.recountingBy,
            recounting: recounting,
            product: products,
            appliedProduct: appliedProduct,
          }
        : {
            branchCode: values.branch,
            branchName: getBranchName(branchList, values.branch),
            countingDate: moment(values.countingDate)
              .endOf("day")
              .toISOString(true),
            stockCounter: values.stockCounter,
            product: products,
            appliedProduct: appliedProduct,
          };
      if (!!values.id) {
        const rs = await updateAuditPlan(values.id, body);
        if (rs.code == 20000) {
          dispatch(setCheckEdit(false));
          if (!hasConfirm && !hasCounting) {
            setOpenPopupModal(true);
            setTextPopup("คุณได้ทำการบันทึกข้อมูลเรียบร้อยแล้ว");
          }
          await setValues({
            ...values,
            id: rs.data.id,
            documentNumber: rs.data.documentNumber,
          });
          setCurrentName(rs.data.createdBy);
          setStatus(StockActionStatus.DRAFT);
        } else {
          setOpenModalError(true);
        }
      } else {
        const rs = await saveDraftAuditPlan(body);
        if (rs.code === 20000) {
          dispatch(setCheckEdit(false));
          if (!hasConfirm && !hasCounting) {
            setOpenPopupModal(true);
            setTextPopup("คุณได้ทำการบันทึกข้อมูลเรียบร้อยแล้ว");
          }
          await setValues({
            ...values,
            id: rs.data.id,
            documentNumber: rs.data.documentNumber,
          });
          setCurrentName(rs.data.createdBy);
          setStatus(StockActionStatus.DRAFT);
          if (hasConfirm && !hasCounting) {
            await onConfirm(rs.data.id, false, false);
          }
          if (hasConfirm && hasCounting) {
            await onConfirm(rs.data.id, true, false);
            await onCounting(store, rs.data.id, rs.data.documentNumber);
          }
        } else {
          setOpenModalError(true);
        }
      }
      setReSave(false);
    } catch (error) {
      setOpenModalError(true);
      setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    }
  };

  const handleConfirm = async () => {
    if (status == "") {
      await handleCreateAP(true, false, 0);
    } else {
      setOpenModalConfirm(true);
    }
  };

  const handleOpenModalCounting = () => {
    setOpenModalConfirmCounting(true);
  };

  const onConfirm = async (
    APId: string,
    hasCounting: boolean,
    saveAgain: boolean,
  ) => {
    try {
      if ((reSave || checkEdit) && saveAgain) {
        await handleCreateAP(false, false, 0);
      }
      const rs = await confirmAuditPlan(APId);
      if (rs.code == 20000) {
        setStatus(StockActionStatus.CONFIRM);
        dispatch(setCheckEdit(false));
        if (!hasCounting) {
          setOpenPopup(true);
          setPopupMsg("คุณได้ทำการสร้างแผนตรวจนับสต๊อกเรียบร้อยแล้ว");
          if (onReSearchMain) onReSearchMain(values.branch);
          handleClose();
        }
      }
    } catch (error) {
      setOpenModalError(true);
      setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    }
  };

  const handleCloseModalConfirm = async (confirm: boolean) => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    setOpenModalConfirm(false);
    if (confirm) {
      await onConfirm(values.id, false, true);
    }
  };

  const handleDeleteDraft = async () => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    if (!stringNullOrEmpty(status)) {
      try {
        const rs = await cancelAuditPlan(values.id);
        if (rs.code === 20000) {
          setOpenPopup(true);
          setPopupMsg("คุณได้ยกเลิกสร้างแผนตรวจนับสต๊อกเรียบร้อยแล้ว");
          dispatch(setCheckEdit(false));
          if (onReSearchMain) onReSearchMain(values.branch);
          handleClose();
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
      setPopupMsg("คุณได้ยกเลิกสร้างแผนตรวจนับสต๊อกเรียบร้อยแล้ว");
      handleClose();
    }
  };

  const handleImportFile = async (e: any) => {
    try {
      if (e.target.files[0]) {
        const formData = new FormData();
        formData.append("barcode", e.target.files[0]);
        const rs = await importAP(formData);
        if (!!rs.data) {
          if (rs.code == 20000) {
            let newList = rs.data.appliedProducts.map((item: any) => {
              return {
                selectedType: 2,
                ...item,
              };
            });
            dispatch(updateAddTypeAndProductState(newList));
            setUrlModalValidate("");
            setOpenModalValidate(false);
          }
          if (rs.code == 40002) {
            setUrlModalValidate(rs.data.link);
            setOpenModalValidate(true);
          }
        } else {
          setMsgModalValidate(rs.message);
          setUrlModalValidate("");
          setOpenModalValidate(true);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const showBtnConfirm = () => {
    let showBtn: string;
    if (
      steps.indexOf(status) >= 1 ||
      isGroupBranchParam(_group) ||
      (isGroupAuditParam(_group) &&
        values.stockCounter == STOCK_COUNTER_TYPE.AUDIT &&
        !recounting) ||
      (isGroupAuditParam(_group) &&
        values.recountingBy == STOCK_COUNTER_TYPE.AUDIT &&
        recounting)
    ) {
      showBtn = "counting";
    } else {
      showBtn = "confirm";
    }
    if (!groupBranch) showBtn = "confirm";
    return showBtn;
  };

  const getDisplayCountingBtn = () => {
    let displayCounting = undefined;
    if (
      !countingPermission ||
      viewMode ||
      status == StockActionStatus.CANCEL ||
      status == StockActionStatus.END ||
      !groupBranch
    ) {
      return "none";
    } else {
      if (recounting) {
        if (
          (values.recountingBy == STOCK_COUNTER_TYPE.BRANCH &&
            !isGroupAuditParam(_group)) ||
          (values.recountingBy == STOCK_COUNTER_TYPE.AUDIT &&
            isGroupAuditParam(_group))
        ) {
          displayCounting = undefined;
        } else {
          displayCounting = "none";
        }
      } else {
        if (
          (groupBranch &&
            values.stockCounter == STOCK_COUNTER_TYPE.BRANCH &&
            !isGroupAuditParam(_group)) ||
          (groupBranch &&
            values.stockCounter == STOCK_COUNTER_TYPE.AUDIT &&
            isGroupAuditParam(_group))
        ) {
          displayCounting = undefined;
        } else {
          displayCounting = "none";
        }
      }
    }
    return displayCounting;
  };

  const dataDetailSA = useAppSelector(
    (state) => state.stockAdjustmentSlice.dataDetail,
  );
  const handleOpenSA = async () => {
    await dispatch(getAuditPlanDetail(dataDetail.id));
    // await dispatch(getStockAdjustmentDetail('62e7a965852639eb91f139d1'));
    const dataDetailSAUpdate = {
      ...dataDetailSA,
      APId: dataDetail.id,
      APDocumentNumber: dataDetail.documentNumber,
      branchCode: dataDetail.branchCode,
      branchName: dataDetail.branchName,
      stockCounter: dataDetail.stockCounter,
    };
    await dispatch(updateDataDetail(dataDetailSAUpdate));
    await dispatch(clearCalculate());
    setOpenSA(true);
  };

  const handleUpdateAgainDetailAP = () => {
    dispatch(getAuditPlanDetail(dataDetail.id));
  };
  const stockAdjustDetail = useAppSelector(
    (state) => state.stockAdjustmentDetailSlice.stockAdjustDetail,
  );
  const handleOpenSADetail = async () => {
    if (viewMode) return;
    setOpenLoadingModal(true);
    try {
      await dispatch(
        getStockAdjustmentDetail(dataDetail.relatedSaDocuments[0].id),
      );
      if (stockAdjustDetail) {
        setOpenSADetail(true);
        await dispatch(updateRefresh(true));
      }
    } catch (error) {
      console.log(error);
    }
    setOpenLoadingModal(false);
  };
  const options = isGroupAuditParam(_group)
    ? ["เพิ่มสินค้าทั่วไป", "เพิ่มสินค้าจากเอกสาร SA"]
    : ["เพิ่มสินค้าทั่วไป"];
  const [openListbtn, setOpenListbtn] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleMenuItemClick = (index: number) => {
    if (index == 0) {
      setOpenModelAddItems(true);
    } else if (index == 1) {
      if (!values.branch) {
        setErrorBranch(true);
      } else {
        setOpenModalAddItemFromSA(true);
      }
    }
    setSelectedIndex(index);
    setOpenListbtn(false);
  };

  const handleToggle = () => {
    setOpenListbtn(!openListbtn);
  };
  const handleCloseAddBtn = (event: Event) => {
    setOpenListbtn(false);
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleCloseModalCreate}
        >
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียดสร้างแผนตรวจนับสต๊อก
          </Typography>
          <StepperBar activeStep={status} setActiveStep={setStatus} />
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container mt={1} mb={-1}>
            {/*line 1*/}
            <Grid item container xs={4} mb={5}>
              <Grid item xs={3}>
                เลขที่เอกสาร :
              </Grid>
              <Grid item xs={8}>
                {!!values.documentNumber ? values.documentNumber : "-"}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5}>
              <Grid item xs={3}>
                วันที่สร้างรายการ :
              </Grid>
              <Grid item xs={8}>
                {moment(values.createDate).add(543, "y").format("DD/MM/YYYY")}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5} pl={2}>
              <Grid item xs={3}>
                กำหนดตรวจนับภายในวันที่ :
              </Grid>
              <Grid item xs={8}>
                <DatePickerAllComponent
                  onClickDate={handleChangeCountingDate}
                  type={"TO"}
                  minDateTo={new Date()}
                  value={values.countingDate}
                  disabled={
                    steps.indexOf(status) > 0 ||
                    (action == Action.UPDATE &&
                      _group !=
                        getUserGroup([
                          `/service.posback/${dataDetail.createdByGroup}`,
                        ])) ||
                    status == StockActionStatus.CANCEL
                  }
                  isError={errorCounting}
                  placeHolder={"กรุณาเลือก"}
                />
                {errorCounting && (
                  <Typography color={"red"}>กรุณาระบุวันที่ตรวจนับ</Typography>
                )}
              </Grid>
            </Grid>
            {/*line 2*/}
            <Grid item container xs={4} mb={5}>
              <Grid item xs={3}>
                สาขาที่สร้าง <br />
                รายการ :
              </Grid>
              <Grid item xs={8}>
                <BranchListDropDown
                  valueBranch={branchOptions}
                  sourceBranchCode={ownBranch}
                  onChangeBranch={handleChangeBranch}
                  isClear={clearBranchDropDown}
                  disable={groupBranch || viewMode || steps.indexOf(status) > 0}
                  isFilterAuthorizedBranch={true}
                  placeHolder={"กรุณาเลือก"}
                  error={errorBranch}
                />
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5}>
              <Grid item xs={3}>
                ผู้นับสต๊อก :
              </Grid>
              <Grid item xs={8}>
                <Box textAlign={"center"}>
                  <FormControl
                    sx={{ width: "100%", textAlign: "left" }}
                    className={classes.Mselect}
                  >
                    <Select
                      id="status"
                      name="status"
                      value={values.stockCounter}
                      disabled={
                        (action == Action.INSERT &&
                          !userGroups.includes(KEYCLOAK_GROUP_AUDIT)) ||
                        steps.indexOf(status) > 0 ||
                        (action == Action.UPDATE &&
                          !userGroups.includes(KEYCLOAK_GROUP_AUDIT) &&
                          currentName == "posaudit") ||
                        (action == Action.UPDATE &&
                          !userGroups.includes(KEYCLOAK_GROUP_AUDIT) &&
                          currentName != "posaudit") ||
                        (action == Action.UPDATE &&
                          !isGroupAuditParam(dataDetail.createdByGroup)) ||
                        status == StockActionStatus.CANCEL
                      }
                      onChange={handleChangeStockCounter}
                      inputProps={{ "aria-label": "Without label" }}
                      renderValue={
                        values.stockCounter !== 0
                          ? undefined
                          : () => (
                              <Typography color={"#AEAEAE"}>
                                กรุณาเลือก
                              </Typography>
                            )
                      }
                    >
                      <MenuItem value={STOCK_COUNTER_TYPE.BRANCH}>
                        สาขา{" "}
                      </MenuItem>
                      <MenuItem value={STOCK_COUNTER_TYPE.AUDIT}>
                        Audit
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
            {recounting && (
              <Grid item container xs={4} mb={5} pl={2}>
                <Grid item xs={3}>
                  ผู้ทวน :
                </Grid>
                <Grid item xs={8}>
                  <Box textAlign={"center"}>
                    <FormControl
                      sx={{ width: "100%", textAlign: "left" }}
                      className={classes.Mselect}
                    >
                      <Select
                        id="status"
                        name="status"
                        value={values.recountingBy}
                        disabled={
                          (action == Action.INSERT &&
                            !userGroups.includes(KEYCLOAK_GROUP_AUDIT)) ||
                          steps.indexOf(status) > 0 ||
                          (action == Action.UPDATE &&
                            !userGroups.includes(KEYCLOAK_GROUP_AUDIT) &&
                            currentName == "posaudit") ||
                          (action == Action.UPDATE &&
                            !userGroups.includes(KEYCLOAK_GROUP_AUDIT) &&
                            currentName != "posaudit") ||
                          (action == Action.UPDATE &&
                            !isGroupAuditParam(dataDetail.createdByGroup)) ||
                          status == StockActionStatus.CANCEL
                        }
                        onChange={handleChangeRecounting}
                        inputProps={{ "aria-label": "Without label" }}
                        renderValue={
                          values.recountingBy !== 0
                            ? undefined
                            : () => (
                                <Typography color={"#AEAEAE"}>
                                  กรุณาเลือก
                                </Typography>
                              )
                        }
                      >
                        <MenuItem value={STOCK_COUNTER_TYPE.BRANCH}>
                          สาขา{" "}
                        </MenuItem>
                        <MenuItem value={STOCK_COUNTER_TYPE.AUDIT}>
                          Audit
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            )}
            <Grid item container xs={4} mb={5} pl={recounting ? 0 : 2}>
              {steps.indexOf(status) > 1 && dataDetail.relatedScDocuments && (
                <>
                  <Grid item xs={3}>
                    เอกสาร SC :
                  </Grid>
                  <Grid item xs={8}>
                    <DocumentList
                      openLink={openLink}
                      handleUpdateAgain={handleUpdateAgainDetailAP}
                      relatedDocuments={dataDetail.relatedScDocuments}
                      type={"SC"}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            {/*line 3*/}
            <Grid item container xs={4} mb={5}>
              {steps.indexOf(status) > 1 &&
                dataDetail.relatedSaDocuments &&
                dataDetail.relatedSaDocuments.length > 0 && (
                  <>
                    <Grid item xs={3}>
                      เอกสาร SA :
                    </Grid>
                    <Grid item xs={8}>
                      <Link
                        color={"secondary"}
                        component={"button"}
                        variant={"subtitle1"}
                        underline={"always"}
                        onClick={handleOpenSADetail}
                      >
                        {dataDetail.relatedSaDocuments[0].documentNumber}
                      </Link>
                    </Grid>
                  </>
                )}
            </Grid>
            {/*line 3*/}
            {steps.indexOf(status) > 1 &&
              dataDetail.relatedSlDocuments &&
              !!dataDetail.relatedSlDocuments.documentNumber && (
                <Grid container item xs={4} mb={5} mt={-1}>
                  <Grid item xs={3}>
                    เอกสาร SL :
                  </Grid>
                  <Grid item xs={8}>
                    {dataDetail.relatedSlDocuments.documentNumber}
                  </Grid>
                </Grid>
              )}
          </Grid>
          <Box>
            <Box sx={{ display: "flex", marginBottom: "18px" }}>
              <Box>
                <ButtonGroup
                  variant="contained"
                  ref={anchorRef}
                  aria-label="split button"
                >
                  <Button
                    id="btnAddItem"
                    variant="contained"
                    color="info"
                    className={classes.MbtnSearch}
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    sx={{ width: 126 }}
                    onClick={handleToggle}
                    disabled={
                      steps.indexOf(status) > 0 ||
                      (action == Action.UPDATE &&
                        _group !=
                          getUserGroup([
                            `/service.posback/${dataDetail.createdByGroup}`,
                          ]))
                    }
                    style={{
                      display:
                        steps.indexOf(status) > 0 ||
                        !managePermission ||
                        viewMode ||
                        status == StockActionStatus.CANCEL
                          ? "none"
                          : undefined,
                    }}
                  >
                    เพิ่มสินค้า
                  </Button>
                </ButtonGroup>
                <Popper
                  style={{ zIndex: 1, width: 170 }}
                  open={openListbtn}
                  anchorEl={anchorRef.current}
                  transition
                  disablePortal
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps}>
                      <Paper>
                        <ClickAwayListener onClickAway={handleCloseAddBtn}>
                          <MenuList id="split-button-menu" autoFocusItem>
                            {options.map((option, index) => (
                              <MenuItem
                                sx={{ fontSize: "14px", color: "#446EF2" }}
                                key={option}
                                disabled={
                                  (index == 0 &&
                                    payloadAddTypeProduct.length &&
                                    recounting) ||
                                  (index == 1 &&
                                    payloadAddTypeProduct.length &&
                                    !recounting)
                                }
                                selected={index === selectedIndex}
                                onClick={() => handleMenuItemClick(index)}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Fade>
                  )}
                </Popper>
                <label htmlFor="import-st-button-file">
                  {Object.keys(payloadAddTypeProduct).length === 0 && (
                    <Input
                      id="import-st-button-file"
                      type="file"
                      onChange={handleImportFile}
                      style={{ display: "none" }}
                    />
                  )}
                  <Button
                    id="btnImport"
                    variant="contained"
                    color="primary"
                    className={classes.MbtnSearch}
                    startIcon={
                      <ImportAppIcon sx={{ transform: "rotate(90deg)" }} />
                    }
                    sx={{ width: 126, margin: "auto 0px 11.5px 17px" }}
                    component="span"
                    style={{
                      display:
                        steps.indexOf(status) > 0 ||
                        !managePermission ||
                        viewMode ||
                        status == StockActionStatus.CANCEL
                          ? "none"
                          : undefined,
                    }}
                    disabled={!!Object.keys(payloadAddTypeProduct).length}
                  >
                    Import
                  </Button>
                </label>
                <Button
                  id="btnCreateSA"
                  variant="contained"
                  color="info"
                  className={classes.MbtnSearch}
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  onClick={handleOpenSA}
                  sx={{
                    width: 150,
                    height: "36.5px",
                    margin: "auto 17px 11.5px 17px",
                  }}
                  disabled={
                    !(
                      dataDetail.relatedScDocuments &&
                      dataDetail.relatedScDocuments.length > 0 &&
                      dataDetail.relatedScDocuments.filter(
                        (it: any) => it.status === StockActionStatus.CONFIRM,
                      ).length > 0
                    )
                  }
                  style={{
                    display:
                      !manageSAPermission ||
                      viewMode ||
                      status == StockActionStatus.CANCEL ||
                      (isGroupAuditParam(_group) &&
                        STOCK_COUNTER_TYPE.BRANCH === values.stockCounter) ||
                      (dataDetail.relatedSaDocuments &&
                        dataDetail.relatedSaDocuments.length > 0) ||
                      !groupBranch
                        ? "none"
                        : undefined,
                  }}
                >
                  <Typography variant={"body2"} fontSize={12} pt={0.3}>
                    สร้างรายการ ปรับสต๊อก (SA)
                  </Typography>
                </Button>
              </Box>
              <Box sx={{ marginLeft: "auto" }}>
                <Button
                  id="btnSaveDraft"
                  variant="contained"
                  color="warning"
                  startIcon={<SaveIcon />}
                  disabled={
                    steps.indexOf(status) > 0 ||
                    (payloadAddTypeProduct &&
                      payloadAddTypeProduct.length === 0) ||
                    disableCounting ||
                    values.branch == "" ||
                    values.stockCounter == 0 ||
                    (action == Action.UPDATE &&
                      _group !=
                        getUserGroup([
                          `/service.posback/${dataDetail.createdByGroup}`,
                        ])) ||
                    (recounting && values.recountingBy == 0)
                  }
                  style={{
                    display:
                      steps.indexOf(status) > 0 ||
                      !managePermission ||
                      viewMode ||
                      status == StockActionStatus.CANCEL
                        ? "none"
                        : undefined,
                  }}
                  onClick={() => handleCreateAP(false, false, 0)}
                  className={classes.MbtnSearch}
                >
                  บันทึก
                </Button>
                {showBtnConfirm() == "confirm" && (
                  <Button
                    id="btnConfirm"
                    variant="contained"
                    color="primary"
                    sx={{ margin: "0 17px" }}
                    disabled={
                      (payloadAddTypeProduct &&
                        !payloadAddTypeProduct.length) ||
                      !managePermission ||
                      (steps.indexOf(status) > 1 && !isBranchPermission) ||
                      (recounting && values.recountingBy == 0) ||
                      values.stockCounter == 0 ||
                      values.branch == "" ||
                      disableCounting
                    }
                    style={{
                      display:
                        steps.indexOf(status) >= 1 ||
                        !managePermission ||
                        viewMode ||
                        status == StockActionStatus.CANCEL ||
                        (action == Action.UPDATE &&
                          _group !=
                            getUserGroup([
                              `/service.posback/${dataDetail.createdByGroup}`,
                            ]))
                          ? "none"
                          : undefined,
                    }}
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={handleConfirm}
                    className={classes.MbtnSearch}
                  >
                    ยืนยัน
                  </Button>
                )}
                {showBtnConfirm() == "counting" && (
                  <Button
                    id="btnCounting"
                    variant="contained"
                    color="primary"
                    sx={{ margin: "0 17px" }}
                    disabled={
                      (payloadAddTypeProduct &&
                        !payloadAddTypeProduct.length) ||
                      !managePermission ||
                      disableCounting ||
                      (recounting && values.recountingBy == 0) ||
                      values.stockCounter == 0
                    }
                    style={{
                      display: getDisplayCountingBtn(),
                    }}
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={handleOpenModalCounting}
                    className={classes.MbtnSearch}
                  >
                    เริ่มตรวจนับ
                  </Button>
                )}

                <Button
                  id="btnCancel"
                  variant="contained"
                  color="error"
                  disabled={steps.indexOf(status) < 0 || !managePermission}
                  startIcon={<HighlightOffIcon />}
                  onClick={handleOpenCancel}
                  style={{
                    display:
                      !managePermission ||
                      viewMode ||
                      status == StockActionStatus.CANCEL ||
                      status == StockActionStatus.END ||
                      (_group !=
                        getUserGroup([
                          `/service.posback/${dataDetail.createdByGroup}`,
                        ]) &&
                        steps.indexOf(status) >= 0 &&
                        action == Action.UPDATE)
                        ? "none"
                        : undefined,
                  }}
                  className={classes.MbtnSearch}
                >
                  ยกเลิก
                </Button>
              </Box>
            </Box>
            <Box mt={2}>
              <AuditPlanCreateItem
                status={status}
                viewMode={
                  viewMode ||
                  (action == Action.UPDATE &&
                    _group !=
                      getUserGroup([
                        `/service.posback/${dataDetail.createdByGroup}`,
                      ]))
                }
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ModalValidateImport
        isOpen={openModalValidate}
        title="ไม่สามารถ import file ได้ "
      >
        <Box sx={{ textAlign: "center" }}>
          {!!urlModalValidate ? (
            <Typography sx={{ color: "#F54949", marginBottom: "34px" }}>
              <a href={urlModalValidate} target="_blank">
                บางรายการไม่สามารถ import file ได้{" "}
              </a>
            </Typography>
          ) : (
            <Typography sx={{ color: "#F54949", marginBottom: "34px" }}>
              {msgModalValidate}
            </Typography>
          )}
          <Button
            id="btnClose"
            variant="contained"
            color="error"
            onClick={() => {
              setOpenModalValidate(false);
            }}
          >
            ตกลง
          </Button>
        </Box>
      </ModalValidateImport>

      {openSA && (
        <ModalCreateStockAdjustment
          isOpen={openSA}
          openFromAP={true}
          onClickClose={async () => {
            setOpenSA(false);
          }}
          action={Action.INSERT}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          userPermission={userPermission}
          onSearchMain={handleUpdateAgainDetailAP}
        />
      )}

      {openSADetail && (
        <ModalCreateStockAdjustment
          isOpen={openSADetail}
          openFromAP={true}
          onClickClose={() => setOpenSADetail(false)}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          userPermission={userPermission}
          onSearchMain={handleUpdateAgainDetailAP}
        />
      )}

      {openSCDetail && (
        <ModalCreateStockCount
          isOpen={openSCDetail}
          onClickClose={() => setOpenSCDetail(false)}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          userPermission={
            getUserInfo().acl["service.posback-stock"] != null &&
            getUserInfo().acl["service.posback-stock"].length > 0
              ? getUserInfo().acl["service.posback-stock"]
              : []
          }
          onSearchMain={handleUpdateAgainDetailAP}
        />
      )}

      <ModelConfirm
        open={openModalConfirm}
        onClose={() => handleCloseModalConfirm(false)}
        onConfirm={() => handleCloseModalConfirm(true)}
        barCode={values.documentNumber}
        headerTitle={"ยืนยันสร้างแผนตรวจนับสต๊อก"}
        documentField={"เลขที่เอกสาร"}
      />

      <ModalAddTypeProduct
        open={openModelAddItems}
        onClose={handleCloseModalAddItems}
        title="เพิ่มรายการสินค้า"
        showSearch={true}
        textBtn="เพิ่มสินค้า"
        requestBody={{
          isControlStock: true,
        }}
        isControlStockType={true}
      />

      <ModalAddProductFromSA
        open={openModalAddItemFromSA}
        onClose={() => setOpenModalAddItemFromSA(false)}
        branch={values.branch}
      />

      <ModalConfirmCounting
        open={openModalConfirmCounting}
        onClose={handleCloseModalConfirmCounting}
        onConfirm={handleCounting}
      />

      <ModelConfirm
        open={openModalCancel}
        onClose={handleCloseModalCancel}
        onConfirm={handleDeleteDraft}
        barCode={values.documentNumber}
        headerTitle={"ยืนยันยกเลิกสร้างแผนตรวจนับสต๊อก"}
        documentField={"เลขที่เอกสาร"}
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
      <ConfirmCloseModel
        open={openModalClose}
        onClose={() => setOpenModalClose(false)}
        onConfirm={handleClose}
      />
      <LoadingModal open={openLoadingModal} />
    </div>
  );
}
