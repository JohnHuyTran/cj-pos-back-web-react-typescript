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
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  updateDataDetail,
  updateErrorList,
  updateCheckEdit,
} from "../../../store/slices/stock-adjustment-slice";
import AlertError from "../../commons/ui/alert-error";
import { objectNullOrEmpty, stringNullOrEmpty } from "../../../utils/utils";
import {
  Action,
  STOCK_COUNTER_TYPE,
  StockActionStatus,
} from "../../../utils/enum/common-enum";
import ConfirmCloseModel from "../../commons/ui/confirm-exit-model";
import ModelConfirm from "../../barcode-discount/modal-confirm";
import { updateCheckStock } from "../../../store/slices/stock-balance-check-slice";
import StepperBar from "../../commons/ui/stepper-bar";
import { StepItem } from "../../../models/step-item-model";
import {
  clearDataFilter,
  getAuditPlanDetail,
} from "../../../store/slices/audit-plan-detail-slice";
import ModalCreateAuditPlan from "../audit-plan/audit-plan-create";
import ModalStockAdjustmentItem from "./modal-stock-adjustment-item";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ModalAddStockCount from "./modal-add-stock-count";
import SaveIcon from "@mui/icons-material/Save";
import {
  cancelStockAdjust,
  confirmStockAdjust,
  getCalculateSkuStats,
  saveDraftStockAdjust,
} from "../../../services/stock-adjustment";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import IconButton from "@mui/material/IconButton";
import { HighlightOff, Replay } from "@mui/icons-material";
import DialogTitle from "@mui/material/DialogTitle";
import {
  ACTIONS,
  KEYCLOAK_GROUP_AUDIT,
} from "../../../utils/enum/permission-enum";
import ModelConfirmStockAdjust from "./modal-confirm-stock-adjust";
import {
  clearCalculate,
  updateRefresh,
} from "../../../store/slices/stock-adjust-calculate-slice";
import { saveDraftAuditPlan } from "../../../services/audit-plan";
import DocumentList from "../audit-plan/modal-documents-list";
import LoadingModal from "../../commons/ui/loading-modal";
import { getUserInfo } from "../../../store/sessionStore";
import {
  getUserGroup,
  isGroupBranchParam,
} from "../../../utils/role-permission";

interface Props {
  action: Action | Action.INSERT;
  isOpen: boolean;
  openFromAP: boolean;
  setOpenPopup: (openPopup: boolean) => void;
  onClickClose: () => void;
  setPopupMsg?: any;
  onSearchMain?: () => void;
  userPermission?: any[];
  viewMode?: boolean;
}

interface loadingModalState {
  open: boolean;
}

const _ = require("lodash");

export default function ModalCreateStockAdjustment(props: Props): ReactElement {
  const {
    isOpen,
    openFromAP,
    onClickClose,
    setOpenPopup,
    action,
    setPopupMsg,
    onSearchMain,
    userPermission,
    viewMode,
  } = props;
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(isOpen);
  const [openSnackBar, setOpenSnackBar] = React.useState<boolean>(false);
  const [textSnackBar, setTextSnackBar] = React.useState<string>("");
  const [openModalCancel, setOpenModalCancel] = React.useState<boolean>(false);
  const [openModalConfirmConfirm, setOpenModalConfirmConfirm] =
    React.useState<boolean>(false);
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const [openModalClose, setOpenModalClose] = React.useState<boolean>(false);
  const [openAddSC, setOpenAddSC] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");
  const [alertTextError, setAlertTextError] = React.useState(
    "เกิดข้อผิดพลาดระหว่างการดำเนินการ",
  );

  const dataDetail = useAppSelector(
    (state) => state.stockAdjustmentSlice.dataDetail,
  );
  const checkEdit = useAppSelector(
    (state) => state.stockAdjustmentSlice.checkEdit,
  );
  const stockAdjustDetail = useAppSelector(
    (state) => state.stockAdjustmentDetailSlice.stockAdjustDetail.data,
  );
  const dataDetailAP = useAppSelector(
    (state) => state.auditPlanDetailSlice.auditPlanDetail.data,
  );
  const [relatedSCs, setRelatedSCs] = useState<any[]>([]);
  const [managePermission, setManagePermission] = useState<boolean>(
    userPermission != null && userPermission.length > 0
      ? userPermission.includes(ACTIONS.STOCK_SA_MANAGE)
      : false,
  );
  const userInfo = getUserInfo();
  const _group = getUserGroup(userInfo.groups);
  const [auditPermission, setAuditPermission] = useState<boolean>(
    userInfo && userInfo.groups && userInfo.groups.length > 0
      ? userInfo.groups.includes(KEYCLOAK_GROUP_AUDIT)
      : false,
  );
  const [displayFollowRole, setDisplayFollowRole] =
    React.useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({ open: false });

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleOpenCancel = () => {
    setOpenModalCancel(true);
  };

  const handleCloseModalCancel = () => {
    setOpenModalCancel(false);
  };

  const handleOpenModalConfirm = async () => {
    await dispatch(getAuditPlanDetail(dataDetail.APId));
    //handle save recheck in SA
    await handleCreateDraft(relatedSCs, true);
    let rsStats = await getCalculateSkuStats(dataDetail.id);
    if (rsStats && rsStats.data) {
      await dispatch(
        updateDataDetail({
          ...dataDetail,
          skuDifferenceEqual: rsStats.data.numberOfEqualDifference,
          skuDifferenceNegative: rsStats.data.numberOfNegativeDifference,
          skuDifferencePositive: rsStats.data.numberOfPositiveDifference,
        }),
      );
    }
    setOpenModalConfirmConfirm(true);
  };

  const handleCloseModalConfirm = (confirm: boolean) => {
    setOpenModalConfirmConfirm(false);
    if (confirm) {
      setOpenModalConfirmConfirm(false);
      //confirm SA
      handleConfirm();
    }
  };

  const handleCloseModalError = () => {
    setOpenModalError(false);
  };

  const handleClose = async () => {
    if (!openFromAP) {
      //clear state detail AP
      dispatch(clearDataFilter());
    }
    //clear calculate
    dispatch(clearCalculate());

    dispatch(updateErrorList([]));
    dispatch(updateCheckStock([]));
    dispatch(
      updateDataDetail({
        id: "",
        documentNumber: "",
        status: "",
        createdDate: moment(new Date()).toISOString(),
        createdBy: "",
        branchCode: "",
        branchName: "",
        APId: "",
        APDocumentNumber: "",
        relatedSCs: [],
        notCountableSkus: [],
        stockCounter: "",
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
    dispatch(
      updateDataDetail({
        ...dataDetail,
        relatedSCs: relatedSCs,
      }),
    );
  }, [relatedSCs]);

  useEffect(() => {
    //set value detail from search
    if (Action.UPDATE === action && !objectNullOrEmpty(stockAdjustDetail)) {
      setRelatedSCs(stockAdjustDetail.relatedSCs);
      //set value for data detail
      dispatch(
        updateDataDetail({
          id: stockAdjustDetail.id,
          documentNumber: stockAdjustDetail.documentNumber,
          status: stockAdjustDetail.status,
          createdDate: stockAdjustDetail.createdDate,
          createdBy: stockAdjustDetail.createdBy,
          APDocumentNumber: stockAdjustDetail.APDocumentNumber,
          APId: stockAdjustDetail.APId,
          branchCode: stockAdjustDetail.branchCode,
          branchName: stockAdjustDetail.branchName,
          relatedSCs: stockAdjustDetail.relatedSCs
            ? stockAdjustDetail.relatedSCs
            : [],
          recheckSkus: stockAdjustDetail.recheckSkus
            ? stockAdjustDetail.recheckSkus
            : [],
          notCountableSkus: stockAdjustDetail.notCountableSkus
            ? stockAdjustDetail.notCountableSkus
            : [],
          relatedSlDocuments: stockAdjustDetail.relatedSlDocuments,
          skuDifferenceEqual: 0,
          skuDifferenceNegative: 0,
          skuDifferencePositive: 0,
          stockCounter: stockAdjustDetail.stockCounter,
        }),
      );
    }
  }, [stockAdjustDetail]);

  useEffect(() => {
    let stockCounter: number;
    if (Action.INSERT === action) {
      stockCounter = dataDetail.stockCounter;
    } else if (Action.UPDATE === action) {
      if (!objectNullOrEmpty(stockAdjustDetail)) {
        stockCounter = stockAdjustDetail.stockCounter;
      } else {
        stockCounter = dataDetail.stockCounter;
      }
    } else {
      stockCounter = dataDetail.stockCounter;
    }
    // handle display follow role
    let isDisplay = false;
    if (STOCK_COUNTER_TYPE.BRANCH === stockCounter) {
      if (auditPermission) {
        isDisplay = false;
      } else {
        isDisplay = isGroupBranchParam(_group);
      }
    } else if (STOCK_COUNTER_TYPE.AUDIT === stockCounter) {
      isDisplay = auditPermission;
    }
    setDisplayFollowRole(isDisplay);
  }, [open]);

  const handleCreateDraft = async (
    relatedSCsParam: any,
    withoutNotice: boolean,
  ) => {
    handleOpenLoading("open", true);
    setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    try {
      const payload = {
        ...dataDetail,
        relatedSCs: relatedSCsParam,
      };
      const rs = await saveDraftStockAdjust(payload);
      if (rs.code === 20000) {
        if (!withoutNotice) {
          dispatch(updateCheckEdit(false));
          setOpenSnackBar(true);
          setTextSnackBar("คุณได้ทำการบันทีกข้อมูลเรียบร้อยแล้ว");
        }
        await dispatch(
          updateDataDetail({
            ...dataDetail,
            id: rs.data.id,
            documentNumber: rs.data.documentNumber,
            status: StockActionStatus.DRAFT,
            notCountableSkus: rs.data.notCountableSkus
              ? rs.data.notCountableSkus
              : [],
            relatedSCs: rs.data.relatedSCs ? rs.data.relatedSCs : relatedSCs,
            recheckSkus: rs.data.recheckSkus ? rs.data.recheckSkus : [],
          }),
        );
        if (!withoutNotice) {
          handleRefresh();
        }
        if (onSearchMain) onSearchMain();
      } else {
        setOpenModalError(true);
      }
    } catch (error) {
      setOpenModalError(true);
    }
    handleOpenLoading("open", false);
  };

  const handleConfirm = async () => {
    setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    try {
      const payload = {
        id: dataDetail.id,
      };
      const rs = await confirmStockAdjust(payload);
      if (rs.code === 20000) {
        dispatch(
          updateDataDetail({
            ...dataDetail,
            status: StockActionStatus.CONFIRM,
          }),
        );
        // handle create AP when have recheck SA
        if (dataDetail.recheckSkus && dataDetail.recheckSkus.length > 0) {
          const body = {
            branchCode: dataDetail.branchCode,
            branchName: dataDetail.branchName,
            countingDate: moment(new Date()).endOf("day").toISOString(true),
            stockCounter: dataDetailAP.stockCounter,
            recounting: true,
            product: dataDetail.recheckSkus,
          };
          saveDraftAuditPlan(body);
        }
        setOpenPopup(true);
        setPopupMsg("คุณได้ทำการยืนยันตรวจนับสต๊อกรวม (SA) \n เรียบร้อยแล้ว");
        handleClose();
        if (onSearchMain) onSearchMain();
      } else {
        setOpenModalError(true);
      }
    } catch (error) {
      setOpenModalError(true);
    }
  };

  const handleCancel = async () => {
    setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    if (!stringNullOrEmpty(status)) {
      try {
        const rs = await cancelStockAdjust(dataDetail.id);
        if (rs.status === 200) {
          setOpenPopup(true);
          setPopupMsg("คุณได้ยกเลิกตรวจนับสต๊อกรวม (SA) เรียบร้อยแล้ว");
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
      setPopupMsg("คุณได้ยกเลิกตรวจนับสต๊อกรวม (SA) เรียบร้อยแล้ว");
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

  const [openDetailAP, setOpenDetailAP] = React.useState(false);
  const auditPlanDetail = useAppSelector(
    (state) => state.auditPlanDetailSlice.auditPlanDetail.data,
  );

  const handleOpenAP = async () => {
    if (viewMode && openFromAP) return;
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

  const handleCloseSnackBar = () => {
    setOpenSnackBar(false);
  };

  const onHandleAfterAddSC = (selectedSCs: any) => {
    setRelatedSCs(selectedSCs);
    setOpenAddSC(false);
    handleCreateDraft(selectedSCs, false);
  };

  const handleRefresh = () => {
    dispatch(updateRefresh(true));
  };

  return (
    <div>
      <Dialog open={open} maxWidth={false} fullWidth>
        <DialogTitle sx={{ m: 0, p: 3 }}>
          <IconButton
            data-testid="testid-title-btnClose"
            aria-label="close"
            onClick={handleRefresh}
            disabled={stringNullOrEmpty(dataDetail.id)}
            sx={{
              position: "absolute",
              right: 55,
              top: 8,
              color: (theme: any) => theme.palette.grey[400],
            }}
          >
            <Replay fontSize="large" />
          </IconButton>
          <IconButton
            data-testid="testid-title-btnClose"
            aria-label="close"
            onClick={handleCloseModalCreate}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme: any) => theme.palette.grey[400],
            }}
          >
            <HighlightOff fontSize="large" />
          </IconButton>
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียดตรวจนับสต๊อกรวม (SA)
          </Typography>
          <StepperBar
            style={{ width: "20%", margin: "auto", marginTop: "-1em" }}
            steps={steps}
            activeStep={status}
          />
        </DialogTitle>
        <DialogContent>
          <Grid container mt={1} mb={-1}>
            {/*line 1*/}
            <Grid item container xs={4} mb={2}>
              <Grid item xs={4}>
                เลขที่เอกสาร :
              </Grid>
              <Grid item xs={8}>
                {!!dataDetail.documentNumber ? dataDetail.documentNumber : "-"}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={2}>
              <Grid item xs={4}>
                วันที่สร้างรายการ :
              </Grid>
              <Grid item xs={8}>
                {moment(dataDetail.createdDate)
                  .add(543, "y")
                  .format("DD/MM/YYYY")}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={2}>
              <Grid item xs={4}>
                <Typography>สาขาที่สร้าง</Typography>
                <Typography>รายการ :</Typography>
              </Grid>
              <Grid item xs={8}>
                {dataDetail.branchCode + " - " + dataDetail.branchName}
              </Grid>
            </Grid>
            {/*line 2*/}
            <Grid item container xs={4} mb={4}>
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
            {dataDetail &&
              dataDetail.relatedSCs &&
              dataDetail.relatedSCs.length > 0 && (
                <Grid item container xs={4} pr={4}>
                  <Grid item xs={4}>
                    เอกสาร SC :
                  </Grid>
                  <Grid item xs={8}>
                    <DocumentList
                      openLink={true}
                      viewMode={true}
                      relatedDocuments={dataDetail.relatedSCs}
                      type={"SC"}
                    />
                  </Grid>
                </Grid>
              )}
            {dataDetail &&
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
                <Button
                  id="btnAddSC"
                  variant="contained"
                  color="info"
                  className={classes.MbtnSearch}
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  disabled={!managePermission}
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != StockActionStatus.DRAFT) ||
                      !managePermission ||
                      viewMode ||
                      !displayFollowRole ||
                      auditPlanDetail.status == StockActionStatus.END ||
                      moment(auditPlanDetail.countingDate)
                        .endOf("day")
                        .isBefore(moment(new Date()))
                        ? "none"
                        : undefined,
                  }}
                  onClick={async () => {
                    await dispatch(getAuditPlanDetail(dataDetail.APId));
                    setOpenAddSC(true);
                  }}
                  sx={{ width: 140, height: "36.5px" }}
                >
                  <Typography variant={"body2"} fontSize={12} pt={0.3}>
                    เลือกข้อมูลนับ สต๊อก (SC)
                  </Typography>
                </Button>
              </Box>
              <Box sx={{ marginLeft: "auto" }}>
                <Button
                  id="btnSaveDraft"
                  variant="contained"
                  color="warning"
                  startIcon={<SaveIcon />}
                  disabled={!(relatedSCs && relatedSCs.length > 0)}
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != StockActionStatus.DRAFT) ||
                      !managePermission ||
                      viewMode ||
                      !displayFollowRole ||
                      auditPlanDetail.status == StockActionStatus.END ||
                      moment(auditPlanDetail.countingDate)
                        .endOf("day")
                        .isBefore(moment(new Date()))
                        ? "none"
                        : undefined,
                  }}
                  onClick={() => handleCreateDraft(relatedSCs, false)}
                  className={classes.MbtnSearch}
                >
                  บันทึก
                </Button>
                <Button
                  id="btnConfirm"
                  variant="contained"
                  color="primary"
                  sx={{ margin: "0 17px" }}
                  disabled={
                    stringNullOrEmpty(status) ||
                    status != StockActionStatus.DRAFT
                  }
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != StockActionStatus.DRAFT) ||
                      !managePermission ||
                      viewMode ||
                      !displayFollowRole ||
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
                  disabled={
                    stringNullOrEmpty(status) ||
                    status != StockActionStatus.DRAFT
                  }
                  style={{
                    display:
                      (!stringNullOrEmpty(status) &&
                        status != StockActionStatus.DRAFT) ||
                      !managePermission ||
                      viewMode ||
                      !displayFollowRole ||
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
              <ModalStockAdjustmentItem
                action={action}
                userPermission={userPermission}
                viewMode={viewMode || !displayFollowRole}
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
          viewMode={true}
          notClearWhenClose={true}
          openLink
        />
      )}

      <ModalAddStockCount
        open={openAddSC}
        onClose={() => {
          setOpenAddSC(false);
        }}
        onClickAdd={(selectedSCs: any) => onHandleAfterAddSC(selectedSCs)}
        selectedSCs={relatedSCs}
      />
      <ModelConfirm
        open={openModalCancel}
        onClose={handleCloseModalCancel}
        onConfirm={handleCancel}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันยกเลิกตรวจนับสต๊อกรวม (SA)"}
        documentField={"เลขที่เอกสาร"}
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
      <ModelConfirmStockAdjust
        open={openModalConfirmConfirm}
        onClose={() => handleCloseModalConfirm(false)}
        onConfirm={() => handleCloseModalConfirm(true)}
        headerTitle={"ยืนยันตรวจนับสต๊อกรวม (SA)"}
        documentField={"เลขที่เอกสาร"}
        confirmInfo={{
          documentNumber: dataDetail.documentNumber,
          numberOfSkuFromAP:
            dataDetailAP && dataDetailAP.product
              ? dataDetailAP.product.length
              : 0,
          numberOfDifferenceEqual: dataDetail.skuDifferenceEqual,
          numberOfDifferenceNegative: dataDetail.skuDifferenceNegative,
          numberOfDifferencePositive: dataDetail.skuDifferencePositive,
          numberOfSkuRecheckFromSA:
            dataDetail && dataDetail.recheckSkus
              ? dataDetail.recheckSkus.length
              : 0,
          numberOfCantCountFromSC:
            dataDetail && dataDetail.notCountableSkus
              ? dataDetail.notCountableSkus.length
              : 0,
        }}
      />
      <SnackbarStatus
        open={openSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={true}
        contentMsg={textSnackBar}
      />
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}
