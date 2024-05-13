import React, { ReactElement, useEffect } from "react";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { BootstrapDialogTitle } from "../commons/ui/dialog-title";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import ModelConfirm from "./modal-confirm";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { ContentPaste } from "@mui/icons-material";
import store, { useAppDispatch, useAppSelector } from "../../store/store";
import { getDCStatus, getSdType } from "../../utils/utils";
import DCOrderDetailList from "./dc-check-order-detail-list";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import ModalShowFile from "../commons/ui/modal-show-file";
import LoadingModal from "../commons/ui/loading-modal";
import { useStyles } from "../../styles/makeTheme";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { featchOrderListDcAsync } from "../../store/slices/dc-check-order-slice";
import { isAllowActionPermission } from "../../utils/role-permission";
import { ACTIONS } from "../../utils/enum/permission-enum";
import AccordionHuaweiFile from "../commons/ui/accordion-huawei-file";
import {
  featchorderDetailDCAsync,
  setReloadScreen,
} from "../../store/slices/dc-check-order-detail-slice";
import TextBoxComment from "../commons/ui/textbox-comment";
import AccordionUploadFile from "../commons/ui/accordion-upload-file";
import { featchPurchaseNoteAsync } from "../../store/slices/supplier-order-return-slice";
import AlertError from "../commons/ui/alert-error";
import { fetchVerifyOrderReasonsRejectListAsync } from "../../store/slices/master/verify-order-reject-reasons-slice";
import {
  CheckOrderDetailItims,
  DCOrderApproveRequest,
  VerifyDocLDRequestType,
} from "../../models/dc-check-order-model";
import {
  verifyDCOrderShipmentsBT,
  verifyDCOrderShipmentsLD,
} from "../../services/order-shipment";
import { ApiError } from "../../models/api-error-model";

interface Props {
  isOpen: boolean;
  idDC: string;
  onClickClose: () => void;
}

interface loadingModalState {
  open: boolean;
}

interface State {
  reason: string;
}

function DCOrderDetail({ isOpen, idDC, onClickClose }: Props): ReactElement {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const orderDetailList = useAppSelector(
    (state) => state.dcCheckOrderDetail.orderDetail,
  );
  const reasonRejectList = useAppSelector(
    (state) => state.verifyReasonsRejectListSlice.reasonsList.data,
  );
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const [valueCommentDC, setValueCommentDC] = React.useState("");
  const [errorCommentDC, setErrorCommentDC] = React.useState(false);

  const [open, setOpen] = React.useState(isOpen);
  const [openModelPreviewDocument, setOpenModelPreviewDocument] =
    React.useState(false);

  const [statusFile, setStatusFile] = React.useState(0);
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");

  const [approveDCStatus, setApproveDCStatus] = React.useState(false);

  const [characterCount, setCharacterCount] = React.useState(0);
  const [disableCheckBtn, setDisableCheckBtn] = React.useState(true);
  const [isAllowRejectBtn, setIsAllowRejectBtn] = React.useState(true);
  const [isAllowApproveBtn, setIsApproveRejectBtn] = React.useState(true);
  const detailDC: any = orderDetailList.data ? orderDetailList.data : null;
  // const detailDCItems = detailDC.items ? detailDC.items : [];
  const [detailDCItems, setDetailDCItems] = React.useState<any>([]);

  const [idVerify, setIDVerify] = React.useState(idDC);
  const [isTote, setIsTote] = React.useState(false);
  const [isDocTypeLD, setIsDocTypeLD] = React.useState(false);

  useEffect(() => {
    setDetailDCItems(detailDC.items ? detailDC.items : []);
    if (reasonRejectList === null || reasonRejectList.length <= 0)
      dispatch(fetchVerifyOrderReasonsRejectListAsync());
    //if reason
    if (detailDC.verifyDCStatus === 1) {
      setValues({
        ...values,
        reason: detailDC.approvalReasonCode ? detailDC.approvalReasonCode : "",
      });
    }

    setDisableCheckBtn(isAllowActionPermission(ACTIONS.ORDER_VER_MANAGE));
    setIsAllowRejectBtn(isAllowActionPermission(ACTIONS.ORDER_VER_MANAGE));
    setIsApproveRejectBtn(isAllowActionPermission(ACTIONS.ORDER_VER_MANAGE));
    setOpen(isOpen);
    setValueCommentDC(detailDC.dcComment);
    setIDVerify(detailDC.id);
    setIsTote(detailDC.sdType === 0 ? true : false);
    setIsDocTypeLD(detailDC.docType === "LD" ? true : false);
  }, [open, detailDC]);

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleChangeComment = (value: any) => {
    setValueCommentDC(value);
    if (value !== "") {
      setErrorCommentDC(false);
    } else {
      setErrorCommentDC(true);
    }
  };

  const handleClearComment = () => {
    setValueCommentDC("");
  };

  const handlCheckedButton = () => {
    if (valueCommentDC !== "") {
      setErrorCommentDC(false);
      setOpenModelConfirm(true);
    } else {
      setErrorCommentDC(true);
    }
  };

  const handleLinkDocument = () => {
    setStatusFile(0);
    setOpenModelPreviewDocument(true);
  };

  const handleModelPreviewDocument = () => {
    setOpenModelPreviewDocument(false);
  };

  const handleModelConfirm = () => {
    setOpenModelConfirm(false);
  };

  const payloadSearchDC = useAppSelector(
    (state) => state.saveSearchOrderDc.searchCriteriaDc,
  );

  const handleGenerateBOStatus = async (
    issuccess: boolean,
    errorMsg: string,
  ) => {
    handleOpenLoading("open", true);
    const isRefreshScreen = store.getState().dcCheckOrderDetail.isReloadScreen;
    const msg = issuccess ? "ตรวจสอบผลต่าง(DC) สำเร็จ" : errorMsg;
    const successMessage = () => {
      setShowSnackBar(true);
      setContentMsg(msg);
      setApproveDCStatus(issuccess);
    };

    if (issuccess && !isRefreshScreen) {
      await dispatch(featchOrderListDcAsync(payloadSearchDC));
      successMessage();
      setTimeout(() => {
        handleClose();
      }, 500);
    } else if (issuccess && isRefreshScreen) {
      await dispatch(featchOrderListDcAsync(payloadSearchDC));
      const itemId = store.getState().dcCheckOrderDetail.itemId;
      await dispatch(featchorderDetailDCAsync(itemId));
      handleOpenLoading("open", false);
      successMessage();
      setTimeout(() => {
        handleCloseSnackBar();
      }, 500);
      await dispatch(setReloadScreen(false));
    } else {
      handleOpenLoading("open", false);
      setOpenAlert(true);
      setTextError(msg);
    }
  };

  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const handleClose = async () => {
    const isRefreshScreen = store.getState().dcCheckOrderDetail.isReloadScreen;
    if (isRefreshScreen) {
      handleOpenLoading("open", true);
      const itemId = store.getState().dcCheckOrderDetail.itemId;
      await dispatch(featchorderDetailDCAsync(itemId));
      await dispatch(setReloadScreen(false));
      handleOpenLoading("open", false);
    } else {
      setOpen(false);
      onClickClose();
    }
  };

  const [values, setValues] = React.useState<State>({
    reason: "All",
  });
  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
  };

  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);
  const handleOnChangeUploadFile = (status: boolean) => {
    setUploadFileFlag(status);
  };

  const onUpdateItems = (items: any) => {
    setDetailDCItems(items);
  };

  const handleOnClickApproveBtn = () => {
    setAction("approve");
    setOpenModelConfirm(true);
  };
  const handleOnClickRejectBtn = () => {
    const isValid = validateInput();
    setOpenAlert(!isValid);
    if (isValid) {
      setAction("reject");
      setOpenModelConfirm(true);
    }
  };

  const validateInput = () => {
    const isvalid = fileUploadList.length > 0 ? true : false;
    if (
      values.reason === null ||
      values.reason === undefined ||
      values.reason === "All"
    ) {
      setTextError("กรุณาระบุเหตุผลที่แก้ไข");
      return false;
    } else if (!isvalid) {
      setTextError("กรุณาแนบเอกสาร");
      return false;
    }
    return true;
  };

  const verifyBT = async () => {
    const payload: DCOrderApproveRequest = {
      dcComment: valueCommentDC,
    };
    await verifyDCOrderShipmentsBT(detailDC.sdNo, payload).then(
      function (value) {
        return;
      },
      function (error: ApiError) {
        throw error;
      },
    );
  };

  const verifyLD = async (isApprove: boolean) => {
    let payload: VerifyDocLDRequestType;
    if (isApprove) {
      const items = detailDCItems.map((item: CheckOrderDetailItims) => {
        return {
          barcode: item.barcode,
          actualQty: Number(item.actualQty),
        };
      });
      payload = {
        approved: isApprove,
        items: items,
      };
    } else {
      payload = {
        approved: isApprove,
        reasonCode: values.reason,
      };
    }
    await verifyDCOrderShipmentsLD(
      detailDC.sdNo,
      payload,
      isApprove ? [] : fileUploadList,
    ).then(
      function (value) {
        return;
      },
      function (error: ApiError) {
        throw error;
      },
    );
  };

  const updateDCOrder = async () => {
    await dispatch(featchorderDetailDCAsync(idDC));
  };
  const [action, setAction] = React.useState("");
  const handleVerfiyDoc = () => {
    handleOpenLoading("open", true);
    if (isDocTypeLD) {
      verifyLD(action === "approve")
        .then(() => {
          updateDCOrder();
          handleGenerateBOStatus(true, "");
        })
        .catch((error: ApiError) => {
          handleGenerateBOStatus(false, error.message);
        })
        .finally(() => handleOpenLoading("open", false));
    } else {
      verifyBT()
        .then(() => {
          updateDCOrder();
          handleGenerateBOStatus(true, "");
        })
        .catch((error: ApiError) => {
          handleGenerateBOStatus(false, error.message);
        })
        .finally(() => handleOpenLoading("open", false));
    }
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          <Typography sx={{ fontSize: "1em" }}>ตรวจสอบผลต่าง (DC)</Typography>
        </BootstrapDialogTitle>
        <DialogContent>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} mb={1}>
              <Grid item xs={2}>
                <Typography variant="body2">เลขที่เอกสาร:</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">{detailDC.docRefNo}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2">สถานะการตรวจสอบผลต่าง:</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">
                  {getDCStatus(detailDC.verifyDCStatus)}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item xs={2}>
                <Typography variant="body2">เลขที่เอกสาร SD:</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">{detailDC.sdNo}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2">ประเภท:</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">
                  {getSdType(detailDC.sdType)}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item xs={2}>
                <Typography variant="body2">สาขาต้นทาง:</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">{`${detailDC.shipBranchFrom.code}-${detailDC.shipBranchFrom.name}`}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2">สาขาปลายทาง:</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">{`${detailDC.shipBranchTo.code}-${detailDC.shipBranchTo.name}`}</Typography>
              </Grid>
            </Grid>
            {!isDocTypeLD && (
              <>
                <Grid container spacing={2} mb={1}>
                  <Grid item xs={2}>
                    <Typography variant="body2">วันที่:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      {convertUtcToBkkDate(detailDC.receivedDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={4}></Grid>
                </Grid>
                <Grid container spacing={2} mb={1}>
                  <Grid item xs={2}>
                    <Typography variant="body2">แนบเอกสาร:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    {detailDC.files && detailDC.files.length > 0 && (
                      <AccordionHuaweiFile files={detailDC.files} />
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">หมายเหตุ:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <TextBoxComment
                      fieldName=""
                      defaultValue={valueCommentDC}
                      maxLength={100}
                      onChangeComment={handleChangeComment}
                      isDisable={detailDC.verifyDCStatus !== 0}
                      rowDisplay={2}
                      isError={errorCommentDC}
                      hypterText="กรุณากรอก หมายเหตุ"
                    />
                  </Grid>
                </Grid>
              </>
            )}
            {isDocTypeLD && (
              <>
                <Grid container spacing={2} mb={1}>
                  <Grid item xs={2}>
                    <Typography variant="body2">วันที่:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      {convertUtcToBkkDate(detailDC.receivedDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">เหตุผล-การแก้ไข:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    {" "}
                    <FormControl fullWidth className={classes.Mselect}>
                      <Select
                        data-testid="testid-reason"
                        id="reason"
                        name="reason"
                        value={values.reason}
                        onChange={handleChange}
                        inputProps={{ "aria-label": "Without label" }}
                        disabled={detailDC.verifyDCStatus !== 0}
                      >
                        <MenuItem value={"All"} selected={true}>
                          กรุณาระบุเหตุผล
                        </MenuItem>
                        {reasonRejectList.map((reason) => (
                          <MenuItem key={reason.code} value={reason.code}>
                            {reason.nameTH}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2} mb={1}>
                  <Grid item xs={2}>
                    <Typography variant="body2">แนบเอกสาร:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    {detailDC.files && detailDC.files.length > 0 && (
                      <AccordionHuaweiFile files={detailDC.files} />
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">แนบเอกสาร-การแก้ไข:</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    {detailDC.verifyDCStatus === 0 && (
                      <AccordionUploadFile
                        files={[]}
                        docNo={detailDC.docRefNo}
                        docType={detailDC.docType}
                        isStatus={uploadFileFlag}
                        onChangeUploadFile={handleOnChangeUploadFile}
                        enabledControl={true}
                      />
                    )}
                    {detailDC.approvalFiles &&
                      detailDC.approvalFiles.length > 0 && (
                        <AccordionHuaweiFile files={detailDC.approvalFiles} />
                      )}
                  </Grid>
                </Grid>
              </>
            )}

            {isDocTypeLD && (
              <>
                <Grid
                  container
                  spacing={2}
                  justifyContent="right"
                  sx={{ mt: 1 }}
                >
                  <Grid item>
                    {detailDC.verifyDCStatus === 0 && (
                      <>
                        <Button
                          data-testid="testid-btnApprove"
                          id="btnApprove"
                          name="btnApprove"
                          variant="contained"
                          color="secondary"
                          startIcon={<ContentPaste />}
                          onClick={handleOnClickApproveBtn}
                          sx={{
                            borderRadius: "5px",
                            width: "200px",
                            padding: "8px",
                            display: `${isAllowApproveBtn ? "none" : ""}`,
                          }}
                        >
                          อนุมัติ
                        </Button>

                        <Button
                          data-testid="testid-btnReject"
                          id="btnReject"
                          variant="contained"
                          color="error"
                          startIcon={<ContentPaste />}
                          onClick={handleOnClickRejectBtn}
                          sx={{
                            ml: 1,
                            borderRadius: "5px",
                            width: "200px",
                            padding: "8px",
                            display: `${isAllowRejectBtn ? "none" : ""}`,
                          }}
                        >
                          ไม่อนุมัติ
                        </Button>
                      </>
                    )}
                  </Grid>
                </Grid>
              </>
            )}

            {!isDocTypeLD && (
              <>
                <Grid
                  container
                  spacing={2}
                  justifyContent="right"
                  sx={{ mt: 1 }}
                >
                  <Grid item>
                    {detailDC.verifyDCStatus === 0 && (
                      <Button
                        data-testid="testid-btnChecked"
                        id="btnChecked"
                        variant="contained"
                        color="primary"
                        startIcon={<ContentPaste />}
                        onClick={handlCheckedButton}
                        sx={{
                          borderRadius: "5px",
                          width: "200px",
                          padding: "8px",
                          display: `${disableCheckBtn ? "none" : ""}`,
                        }}
                      >
                        ยืนยันยอด
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
          {detailDCItems !== [] && (
            <DCOrderDetailList
              items={detailDCItems}
              clearCommment={handleClearComment}
              isTote={isTote}
              onUpdateItems={onUpdateItems}
              isLD={isDocTypeLD}
              isWaitForCheck={detailDC.verifyDCStatus === 0}
            />
          )}
        </DialogContent>
      </Dialog>

      <ModelConfirm
        open={openModelConfirm}
        onClose={handleModelConfirm}
        onUpdateAction={handleGenerateBOStatus}
        idDC={idVerify}
        sdNo={detailDC.sdNo}
        docRefNo={detailDC.docRefNo}
        comment={valueCommentDC}
        handleActionVerify={handleVerfiyDoc}
        subject={
          isDocTypeLD
            ? action === "approve"
              ? "ยืนยันอนุมัติผลต่างการรับสินค้า"
              : "ยืนยันไม่อนุมัติผลต่างการรับสินค้า"
            : "ยืนยันการตรวจสอบผลต่าง (DC)"
        }
      />

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={approveDCStatus}
        contentMsg={contentMsg}
      />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}

export default DCOrderDetail;
