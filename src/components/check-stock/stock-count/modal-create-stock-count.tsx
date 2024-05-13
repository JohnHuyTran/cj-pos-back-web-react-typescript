import React, { ReactElement, useEffect, useState } from "react";
import { Box } from "@mui/system";
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useStyles } from "../../../styles/makeTheme";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  updateDataDetail,
  updateErrorList,
  updateCheckEdit,
} from "../../../store/slices/stock-count-slice";
import AlertError from "../../commons/ui/alert-error";
import { objectNullOrEmpty, stringNullOrEmpty } from "../../../utils/utils";
import {
  Action,
  StockActionStatus,
  STOCK_COUNTER_TYPE,
  STORE_TYPE,
} from "../../../utils/enum/common-enum";
import ConfirmCloseModel from "../../commons/ui/confirm-exit-model";
import { ACTIONS } from "../../../utils/enum/permission-enum";
import ModelConfirm from "../../barcode-discount/modal-confirm";
import { updateCheckStock } from "../../../store/slices/stock-balance-check-slice";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import StepperBar from "../../commons/ui/stepper-bar";
import { StepItem } from "../../../models/step-item-model";
import ModalStockCountItem from "./modal-stock-count-item";
import { getAuditPlanDetail } from "../../../store/slices/audit-plan-detail-slice";
import ModalCreateAuditPlan from "../audit-plan/audit-plan-create";
import {
  cancelStockCount,
  confirmStockCount,
  getSCDetail,
} from "../../../services/stock-count";
import ModalConfirmSC from "./modal-confirm-SC";
import { getUserInfo } from "../../../store/sessionStore";
import {
  getUserGroup,
  isChannelBranch,
  isGroupAuditParam,
  isGroupBranchParam,
} from "../../../utils/role-permission";
import LoadingModal from "../../commons/ui/loading-modal";
import { getStockAdjustmentDetail } from "../../../store/slices/stock-adjustment-detail-slice";
import { updateRefresh } from "../../../store/slices/stock-adjust-calculate-slice";
import ModalCreateStockAdjustment from "../stock-adjustment/modal-create-stock-adjustment";

interface Props {
  action: Action | Action.INSERT;
  isOpen: boolean;
  setOpenPopup: (openPopup: boolean) => void;
  onClickClose: () => void;
  setPopupMsg?: any;
  onSearchMain?: () => void;
  userPermission?: any[];
  viewMode?: boolean;
  openLink?: boolean;
}

interface loadingModalState {
  open: boolean;
}

const _ = require("lodash");

export default function ModalCreateStockCount({
  isOpen,
  onClickClose,
  setOpenPopup,
  action,
  setPopupMsg,
  onSearchMain,
  userPermission,
  viewMode,
  openLink,
}: Props): ReactElement {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  let errorListProduct: any = [];
  const [open, setOpen] = React.useState(isOpen);
  const [openModalCancel, setOpenModalCancel] = React.useState<boolean>(false);
  const [openModalConfirmConfirm, setOpenModalConfirmConfirm] =
    React.useState<boolean>(false);
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const [openModalErrorExit, setOpenModalErrorExit] =
    React.useState<boolean>(false);
  const [openModalClose, setOpenModalClose] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<string>("");
  const payloadStockCount = useAppSelector(
    (state) => state.stockCountSlice.createDraft,
  );
  const dataDetail = useAppSelector(
    (state) => state.stockCountSlice.dataDetail,
  );
  const checkEdit = useAppSelector((state) => state.stockCountSlice.checkEdit);
  const stockCountDetail = useAppSelector(
    (state) => state.stockCountDetailSlice.stockCountDetail.data,
  );
  const userGroups = getUserInfo().groups ? getUserInfo().groups : [];
  const _group = getUserGroup(userGroups);
  //permission
  const [groupBranch, setGroupBranch] = React.useState(isChannelBranch);
  const [managePermission, setManagePermission] = useState<boolean>(
    userPermission != null && userPermission.length > 0
      ? userPermission.includes(ACTIONS.STOCK_SC_MANAGE)
      : false,
  );
  const [alertTextError, setAlertTextError] = React.useState(
    "กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน",
  );
  const handleOpenCancel = () => {
    setOpenModalCancel(true);
  };

  const handleCloseModalCancel = () => {
    setOpenModalCancel(false);
  };

  const handleOpenModalConfirm = async () => {
    try {
      const resuilt = await getSCDetail(dataDetail.id);
      if (resuilt) {
        if (!validate()) {
          setOpenModalError(true);
          setAlertTextError("กรุณาระบุจำนวนนับ");
          return;
        } else {
          setOpenModalConfirmConfirm(true);
        }
      } else {
        setOpenModalErrorExit(true);
      }
    } catch (error) {
      const er: any = error;
      if (er.code == 50000) {
        setOpenModalErrorExit(true);
      } else {
        setOpenModalError(true);
      }
    }
  };

  const handleCloseModalConfirm = (confirm: boolean) => {
    setOpenModalConfirmConfirm(false);
    if (confirm) {
      handleConfirm();
    }
  };

  const handleCloseModalError = () => {
    setOpenModalError(false);
  };

  const handleCloseModalErrorExit = () => {
    setOpenModalErrorExit(false);
    handleClose();
    if (onSearchMain) onSearchMain();
  };

  const handleClose = async () => {
    dispatch(updateErrorList([]));
    dispatch(updateCheckStock([]));
    dispatch(updateAddItemsState({}));
    dispatch(
      updateDataDetail({
        id: "",
        documentNumber: "",
        status: "",
        createdDate: moment(new Date()).toISOString(),
        createdBy: "",
        branch: "",
        storeType: "",
        countingTime: "",
        APDocumentNumber: "",
        stockCounter: 0,
        recounting: false,
        recountingBy: 0,
        APId: "",
      }),
    );
    dispatch(updateCheckEdit(false));
    setOpen(false);
    onClickClose();
  };

  const handleCloseModalCreate = () => {
    if (checkEdit) {
      setOpenModalClose(true);
    } else if (dataDetail.status === StockActionStatus.DRAFT && checkEdit) {
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
    if (Action.UPDATE === action && !objectNullOrEmpty(stockCountDetail)) {
      //set value for data detail
      dispatch(
        updateDataDetail({
          id: stockCountDetail.id,
          documentNumber: stockCountDetail.documentNumber,
          status: stockCountDetail.status,
          createdDate: stockCountDetail.createdDate,
          createdBy: stockCountDetail.createdBy,
          countingTime: stockCountDetail.countingTime,
          APDocumentNumber: stockCountDetail.APDocumentNumber,
          APId: stockCountDetail.APId,
          storeType: stockCountDetail.storeType,
          branch:
            stockCountDetail.branchCode + " - " + stockCountDetail.branchName,
          stockCounter: stockCountDetail.stockCounter,
          recounting: !!stockCountDetail.recounting,
          recountingBy: stockCountDetail.recountingBy
            ? stockCountDetail.recountingBy
            : 0,
          relatedSaDocuments: stockCountDetail.relatedSaDocuments,
        }),
      );
      //set value for products
      if (stockCountDetail.product && stockCountDetail.product.length > 0) {
        let lstProductDetail: any = [];
        for (let item of stockCountDetail.product) {
          lstProductDetail.push({
            barcode: item.barcode,
            barcodeName: item.productName,
            unitName: item.unitName,
            unitCode: item.unitFactor,
            baseUnit: item.barFactor,
            unitPrice: item.price || 0,
            qty: item.quantity || null,
            skuCode: item.sku,
            canNotCount: item.canNotCount,
            skuName: item.skuName,
          });
        }
        dispatch(updateAddItemsState(lstProductDetail));
      }
    }
  }, [stockCountDetail]);

  const validate = () => {
    let isValid = true;
    //validate product
    const data = [...payloadStockCount.products];
    if (data.length > 0) {
      let dt: any = [];
      for (let preData of data) {
        const item = {
          id: preData.barcode,
          errorQuantity: "",
        };
        if (
          !preData.quantity &&
          !preData.canNotCount &&
          preData.quantity != 0
        ) {
          isValid = false;
          item.errorQuantity = "จำนวนคำขอต้องมากกว่า 0";
        }
        if (!isValid) {
          dt.push(item);
        }
      }
      errorListProduct = dt;
    }
    if (!isValid) {
      dispatch(updateErrorList(errorListProduct));
      // setOpenModalError(true);
    }
    return isValid;
  };

  const handleConfirm = async () => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    handleOpenLoading("open", true);
    try {
      const resuilt = await getSCDetail(dataDetail.id);
      if (resuilt) {
        const payload = {
          id: dataDetail.id,
          product: payloadStockCount.products,
        };
        const rs = await confirmStockCount(payload);
        if (rs.code === 20000) {
          dispatch(
            updateDataDetail({
              ...dataDetail,
              status: StockActionStatus.CONFIRM,
            }),
          );
          setOpenPopup(true);
          setPopupMsg("คุณได้ยืนยันตรวจนับสต๊อก (SC) เรียบร้อยแล้ว");
          handleClose();
          if (onSearchMain) onSearchMain();
        } else if (rs.code == 40016) {
          setOpenModalError(true);
          setAlertTextError(
            "ไม่สามารถดำเนินการได้\nเนื่องจากเอกสาร AP ถูกยกเลิก",
          );
        } else {
          setOpenModalError(true);
        }
      } else {
        setOpenModalErrorExit(true);
        if (onSearchMain) onSearchMain();
      }
    } catch (error) {
      const er: any = error;
      if (er.code == 50000) {
        setOpenModalErrorExit(true);
      } else {
        setOpenModalError(true);
      }
    }
    handleOpenLoading("open", false);
  };

  const handleCancel = async () => {
    setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    if (!stringNullOrEmpty(status)) {
      try {
        const rs = await cancelStockCount(dataDetail.id);
        if (rs.status === 200) {
          setOpenPopup(true);
          setPopupMsg("คุณได้ยกเลิกตรวจนับสต๊อกเรียบร้อยแล้ว");
          handleClose();
          if (onSearchMain) onSearchMain();
        } else {
          setOpenModalError(true);
          setOpenModalCancel(false);
        }
      } catch (error) {
        const er: any = error;
        if (er.code == 40002) {
          setOpenModalError(true);
          setAlertTextError("กรุณายกเลิกเอกสารที่เกี่ยวข้องก่อนดำเนินการ");
        } else {
          setOpenModalError(true);
        }
        setOpenModalCancel(false);
      }
    } else {
      setOpenPopup(true);
      setPopupMsg("คุณได้ยกเลิกตรวจนับสต๊อกเรียบร้อยแล้ว");
      handleClose();
    }
  };

  const steps: StepItem[] = [
    {
      value: StockActionStatus.DRAFT,
      label: "บันทึก",
    },
    {
      value: StockActionStatus.CONFIRM,
      label: "ยืนยัน",
    },
  ];

  const genStoreType = (value: number) => {
    let valueDisplay = "";
    switch (value) {
      case STORE_TYPE.FRONT:
        valueDisplay = "001-หน้าร้าน";
        break;
      case STORE_TYPE.BACK:
        valueDisplay = "002-หลังร้าน";
        break;
    }
    return valueDisplay;
  };

  const [openDetailAP, setOpenDetailAP] = React.useState(false);
  const [openDetailSA, setOpenDetailSA] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({ open: false });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const auditPlanDetail = useAppSelector(
    (state) => state.auditPlanDetailSlice.auditPlanDetail.data,
  );
  const handleOpenAP = async () => {
    if (!openLink) return;
    handleOpenLoading("open", true);
    try {
      await dispatch(getAuditPlanDetail(dataDetail.APId));
      if (!objectNullOrEmpty(auditPlanDetail)) {
        setOpenDetailAP(true);
      }
    } catch (error) {
      console.log(error);
    }
    handleOpenLoading("open", false);
  };
  const stockAdjustDetail = useAppSelector(
    (state) => state.stockAdjustmentDetailSlice.stockAdjustDetail,
  );
  const handleOpenSA = async () => {
    if (!openLink) return;
    handleOpenLoading("open", true);
    try {
      await dispatch(
        getStockAdjustmentDetail(dataDetail.relatedSaDocuments.id),
      );
      if (!objectNullOrEmpty(stockAdjustDetail)) {
        setOpenDetailSA(true);
        await dispatch(updateRefresh(true));
      }
    } catch (error) {
      console.log(error);
    }
    handleOpenLoading("open", false);
  };

  const handleOpenAddZero = () => {
    if (stockCountDetail.product && stockCountDetail.product.length > 0) {
      let newList = stockCountDetail.product.map((item: any) => {
        const sameItem = payloadStockCount.products.find(
          (el: any) => el.barcode == item.barcode,
        );
        return {
          barcode: item.barcode,
          barcodeName: item.productName,
          unitName: item.unitName,
          unitCode: item.unitFactor,
          baseUnit: item.barFactor,
          unitPrice: item.price || 0,
          skuCode: item.sku,
          canNotCount: sameItem.canNotCount,
          skuName: item.skuName,
          qty:
            !sameItem.quantity && !sameItem.canNotCount ? 0 : sameItem.quantity,
        };
      });
      dispatch(updateErrorList([]));
      dispatch(updateAddItemsState(newList));
    }
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleCloseModalCreate}
        >
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียดตรวจนับสต๊อก (SC)
          </Typography>
          <StepperBar
            style={{ width: "20%", margin: "auto", marginTop: "-1em" }}
            steps={steps}
            activeStep={status}
          />
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container mt={1} mb={-1}>
            {/*line 1*/}
            <Grid item container xs={4} mb={3}>
              <Grid item xs={4}>
                เลขที่เอกสาร :
              </Grid>
              <Grid item xs={8}>
                {!!dataDetail.documentNumber ? dataDetail.documentNumber : "-"}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={3}>
              <Grid item xs={4}>
                วันที่สร้างรายการ :
              </Grid>
              <Grid item xs={8}>
                {moment(dataDetail.createdDate)
                  .add(543, "y")
                  .format("DD/MM/YYYY")}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={3}>
              <Grid item xs={4}>
                <Typography>สาขาที่สร้าง</Typography>
                <Typography>รายการ :</Typography>
              </Grid>
              <Grid item xs={8}>
                {dataDetail.branch}
              </Grid>
            </Grid>
            {/*line 2*/}
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                คลัง :
              </Grid>
              <Grid item xs={8}>
                {genStoreType(dataDetail.storeType)}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                นับครั้งที่ :
              </Grid>
              <Grid item xs={8}>
                {dataDetail.countingTime}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                เอกสาร AP :
              </Grid>
              <Grid item xs={8}>
                <Link
                  color={"secondary"}
                  component={"button"}
                  variant={"subtitle1"}
                  underline={"always"}
                  onClick={handleOpenAP}
                >
                  {dataDetail.APDocumentNumber}
                </Link>
              </Grid>
            </Grid>
            {dataDetail.status == StockActionStatus.CONFIRM &&
              dataDetail.relatedSaDocuments &&
              !!dataDetail.relatedSaDocuments.documentNumber && (
                <Grid item container xs={4} mb={5}>
                  <Grid item xs={4}>
                    เอกสาร SA :
                  </Grid>
                  <Grid item xs={8}>
                    <Link
                      color={"secondary"}
                      component={"button"}
                      variant={"subtitle1"}
                      underline={"always"}
                      onClick={handleOpenSA}
                    >
                      {dataDetail.relatedSaDocuments.documentNumber}
                    </Link>
                  </Grid>
                </Grid>
              )}
          </Grid>
          <Box>
            <Box sx={{ display: "flex", marginBottom: "18px" }}>
              <Button
                id="btnAddZero"
                variant="contained"
                color="info"
                className={classes.MbtnSearch}
                onClick={handleOpenAddZero}
                sx={{ width: 172 }}
                style={{
                  display:
                    (!stringNullOrEmpty(status) &&
                      status != StockActionStatus.DRAFT) ||
                    !isGroupAuditParam(_group) ||
                    dataDetail.stockCounter == STOCK_COUNTER_TYPE.BRANCH ||
                    viewMode ||
                    (isGroupAuditParam(_group) &&
                      dataDetail.recounting &&
                      dataDetail.recountingBy == STOCK_COUNTER_TYPE.BRANCH) ||
                    auditPlanDetail.status == StockActionStatus.END ||
                    moment(auditPlanDetail.countingDate)
                      .endOf("day")
                      .isBefore(moment(new Date())) ||
                    !groupBranch
                      ? "none"
                      : undefined,
                }}
              >
                คลิกใส่ 0 สินค้าที่ไม่พบ
              </Button>

              <Box sx={{ marginLeft: "auto" }}>
                <Button
                  id="btnConfirm"
                  variant="contained"
                  color="primary"
                  sx={{ margin: "0 17px" }}
                  disabled={
                    (!stringNullOrEmpty(status) &&
                      status != StockActionStatus.DRAFT) ||
                    (payloadStockCount.products &&
                      payloadStockCount.products.length === 0)
                  }
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != StockActionStatus.DRAFT) ||
                      !managePermission ||
                      viewMode ||
                      !groupBranch ||
                      (isGroupAuditParam(_group) &&
                        dataDetail.stockCounter == STOCK_COUNTER_TYPE.BRANCH &&
                        !dataDetail.recounting) ||
                      (isGroupBranchParam(_group) &&
                        dataDetail.stockCounter == STOCK_COUNTER_TYPE.AUDIT &&
                        !dataDetail.recounting) ||
                      (isGroupAuditParam(_group) &&
                        dataDetail.recountingBy == STOCK_COUNTER_TYPE.BRANCH &&
                        dataDetail.recounting) ||
                      (isGroupBranchParam(_group) &&
                        dataDetail.recountingBy == STOCK_COUNTER_TYPE.AUDIT &&
                        dataDetail.recounting) ||
                      auditPlanDetail.status == StockActionStatus.END ||
                      moment(auditPlanDetail.countingDate)
                        .endOf("day")
                        .isBefore(moment(new Date()))
                        ? "none"
                        : undefined,
                  }}
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleOpenModalConfirm}
                  className={classes.MbtnSearch}
                >
                  ยืนยัน
                </Button>
                <Button
                  id="btnCancel"
                  variant="contained"
                  color="error"
                  disabled={stringNullOrEmpty(status)}
                  style={{
                    display:
                      !managePermission ||
                      viewMode ||
                      !groupBranch ||
                      (isGroupAuditParam(_group) &&
                        dataDetail.stockCounter == STOCK_COUNTER_TYPE.BRANCH &&
                        !dataDetail.recounting) ||
                      (isGroupBranchParam(_group) &&
                        dataDetail.stockCounter == STOCK_COUNTER_TYPE.AUDIT &&
                        !dataDetail.recounting) ||
                      (isGroupAuditParam(_group) &&
                        dataDetail.recountingBy == STOCK_COUNTER_TYPE.BRANCH &&
                        dataDetail.recounting) ||
                      (isGroupBranchParam(_group) &&
                        dataDetail.recountingBy == STOCK_COUNTER_TYPE.AUDIT &&
                        dataDetail.recounting) ||
                      auditPlanDetail.status == StockActionStatus.END ||
                      moment(auditPlanDetail.countingDate)
                        .endOf("day")
                        .isBefore(moment(new Date()))
                        ? "none"
                        : undefined,
                  }}
                  startIcon={<HighlightOffIcon />}
                  onClick={handleOpenCancel}
                  className={classes.MbtnSearch}
                >
                  ยกเลิก
                </Button>
              </Box>
            </Box>
            <Box>
              <ModalStockCountItem
                action={action}
                userPermission={userPermission}
                viewMode={viewMode}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {openDetailAP && (
        <ModalCreateAuditPlan
          isOpen={openDetailAP}
          onClickClose={() => {
            setOpenDetailAP(false);
          }}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          userPermission={userPermission}
          viewMode
        />
      )}

      {openDetailSA && (
        <ModalCreateStockAdjustment
          isOpen={openDetailSA}
          openFromAP={false}
          onClickClose={() => setOpenDetailSA(false)}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          userPermission={userPermission}
          viewMode={true}
        />
      )}
      <ModelConfirm
        open={openModalCancel}
        onClose={handleCloseModalCancel}
        onConfirm={handleCancel}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันยกเลิกตรวจนับสต๊อก"}
        documentField={"เลขที่เอกสาร SC"}
      />
      <ModalConfirmSC
        open={openModalConfirmConfirm}
        onClose={() => handleCloseModalConfirm(false)}
        onConfirm={handleConfirm}
      />
      <AlertError
        open={openModalError}
        onClose={handleCloseModalError}
        textError={alertTextError}
      />
      <AlertError
        open={openModalErrorExit}
        onClose={handleCloseModalErrorExit}
        textError={"ไม่สามารถดำเนินการได้\nเนื่องจากเอกสาร AP ถูกยกเลิก"}
      />
      <ConfirmCloseModel
        open={openModalClose}
        onClose={() => setOpenModalClose(false)}
        onConfirm={handleClose}
      />
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}
