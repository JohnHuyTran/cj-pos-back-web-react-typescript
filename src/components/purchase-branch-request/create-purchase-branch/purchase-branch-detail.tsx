import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { Box, Button, DialogTitle, Grid, IconButton } from "@mui/material";
import {
  AddCircleOutlineOutlined,
  Cancel,
  CheckCircle,
  ContentCopy,
  HighlightOff,
  Save,
} from "@mui/icons-material";
import Steppers from "../../commons/ui/steppers";
import moment from "moment";
import { useStyles } from "../../../styles/makeTheme";
import PurchaseBranchListItemDraft from "./purchase-branch-list-item-draft";
import PurchaseBranchListItem from "./purchase-branch-list-item";
import TextBoxComment from "../../commons/ui/textbox-comment";
import ModalAddItems from "../../commons/ui/modal-add-items";
import { getBranchName } from "../../../utils/utils";
import { getUserInfo } from "../../../store/sessionStore";
import { PurchaseBRRequest } from "../../../models/purchase-branch-request-model";
import {
  deletePurchaseBR,
  savePurchaseBR,
  sendPurchaseBR,
} from "../../../services/purchase";
import { ApiError } from "../../../models/api-error-model";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import LoadingModal from "../../commons/ui/loading-modal";
import { getPurchaseBranchList } from "../../../utils/enum/purchase-branch-enum";
import ModelConfirm from "../modal-confirm";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import { ACTIONS } from "../../../utils/enum/permission-enum";
import { isAllowActionPermission } from "../../../utils/role-permission";
import ConfirmModelExit from "../../commons/ui/confirm-exit-model";
import { featchSearchPurchaseBranchRequestAsync } from "../../../store/slices/purchase-branch-request-slice";
import {
  clearDataPurchaseBRDetail,
  featchPurchaseBRDetailAsync,
} from "../../../store/slices/purchase/purchase-branch-request-detail-slice";
import { getProductBySKUCodes } from "../../../services/product-master";
import ModalPurchaseBranchCopy from "./purchase-branch-detail";
import AlertError from "../../commons/ui/alert-error";
import ModelMockupCase from "../modal-mockup-case";
import { mappingErrorParam } from "../../../utils/exception/pos-exception";

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

function purchaseBranchDetail({ isOpen, onClickClose }: Props): ReactElement {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { t } = useTranslation(["purchaseBranch", "common"]);
  const [open, setOpen] = React.useState(isOpen);
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);

  const [flagSave, setFlagSave] = React.useState(false);
  const handleChkSaveClose = async () => {
    if (status === "DRAFT" && flagSave) {
      setConfirmModelExit(true);
    } else {
      handleClose();
    }
  };

  const handleClose = async () => {
    setOpen(false);
    onClickClose();
  };

  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const handleNotExitModelConfirm = () => {
    setConfirmModelExit(false);
  };
  const handleExitModelConfirm = () => {
    handleClose();
  };

  const purchaseBRDetail = useAppSelector(
    (state) => state.purchaseBRDetailSlice.purchaseBRDetail.data,
  );
  const [docNo, setDocNo] = React.useState("");
  const [remark, setRemark] = React.useState("");
  const [createDate, setCreateDate] = React.useState<Date | null>(new Date());
  const [status, setStatus] = React.useState("DRAFT");
  const [branchName, setBranchName] = React.useState("");
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const payloadAddItem = useAppSelector((state) => state.addItems.state);

  const [displayBtnSubmit, setDisplayBtnSubmit] = React.useState(true);
  const [displayBtnSave, setDisplayBtnSave] = React.useState(true);
  const [displayBtnDelete, setDisplayBtnDelete] = React.useState(true);
  const [disabledBtnDelete, setDisabledBtnDelete] = React.useState(true);
  const [displayAddItems, setDisplayAddItems] = React.useState(true);
  const [displayCopyItems, setDisplayCopyItems] = React.useState(true);

  useEffect(() => {
    // if (status !== 'DRAFT' && isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE)) {
    //   setDisplayBtnDelete(true);
    // } else {
    //   setDisplayBtnDelete(false);
    // }

    if (purchaseBRDetail) {
      setDocNo(purchaseBRDetail.docNo);
      setStatus(purchaseBRDetail.status);
      handleStatusStepper(purchaseBRDetail.status);
      setRemark(purchaseBRDetail.remark);
      setCreateDate(new Date(purchaseBRDetail.createdDate));

      if (purchaseBRDetail.status === "DRAFT") {
        setDisplayAddItems(isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE));
        setDisplayBtnSubmit(
          isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE),
        );
        setDisplayBtnSave(isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE));
        setDisplayBtnDelete(
          isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE),
        );
        setDisabledBtnDelete(false);

        if (purchaseBRDetail.items.length > 0) {
          let items: any = [];
          purchaseBRDetail.items.forEach((data: any) => {
            const item: any = {
              skuCode: data.skuCode,
              barcode: data.barcode,
              barcodeName: data.barcodeName,
              unitCode: data.unitCode,
              unitName: data.unitName,
              baseUnit: data.barFactor,
              qty: data.orderQty,
              stockMax: data.orderMaxQty,
            };
            items.push(item);
          });

          dispatch(updateAddItemsState(items));
        }
      } else if (
        purchaseBRDetail.status === "INCOMPLETE_RECEIVED" ||
        purchaseBRDetail.status === "DC_NO_STOCK"
      ) {
        dispatch(updateAddItemsState(purchaseBRDetail.items));

        let DisplayCopy = true;
        purchaseBRDetail.items.map((item: any) => {
          const actualQty = item.actualQty ? item.actualQty : 0;
          const orderQty = item.orderQty ? item.orderQty : 0;
          let diff = Number(actualQty) - Number(orderQty);
          if (diff < 0) DisplayCopy = false;
        });

        if (!isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE))
          setDisplayCopyItems(DisplayCopy);
      }

      const strBranchName = getBranchName(
        branchList,
        purchaseBRDetail.branchCode,
      );
      setBranchName(
        strBranchName
          ? `${purchaseBRDetail.branchCode}-${strBranchName}`
          : getUserInfo().branch,
      );
    } else {
      const strBranchName = getBranchName(branchList, getUserInfo().branch);
      setBranchName(
        strBranchName
          ? `${getUserInfo().branch}-${strBranchName}`
          : getUserInfo().branch,
      );
      handleStatusStepper("DRAFT");
      setDisplayAddItems(isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE));
      setDisplayBtnSubmit(isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE));
      setDisplayBtnSave(isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE));
      setDisplayBtnDelete(isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE));
    }
  }, [branchList]);

  const [steps, setSteps] = React.useState([]);
  const [statusSteps, setStatusSteps] = React.useState(0);
  const stepsList: any = [];
  const handleStatusStepper = async (status: string) => {
    getPurchaseBranchList().map((item) => {
      if (item.stepperGrp === 1 && item.value === status) {
        stepsList.push(t(`status.${item.value}`));
        stepsList.push("อยู่ระหว่างดำเนินการ: -");
        stepsList.push(t(`ปิดงาน`));
        setStatusSteps(item.stepperGrp - 1);
      } else if (item.stepperGrp === 2 && item.value === status) {
        stepsList.push(t("status.DRAFT"));
        stepsList.push("อยู่ระหว่างดำเนินการ: " + t(`status.${item.value}`));
        stepsList.push(t(`ปิดงาน`));
        setStatusSteps(item.stepperGrp - 1);
      } else if (item.stepperGrp === 3 && item.value === status) {
        stepsList.push(t("status.DRAFT"));
        stepsList.push("อยู่ระหว่างดำเนินการ: -");
        stepsList.push("ปิดงาน - " + t(`status.${item.value}`));
        setStatusSteps(item.stepperGrp - 1);
      }
      //setSteps
      setSteps(stepsList);
    });
  };

  const handleChangeComment = (value: any) => {
    setFlagSave(true);
    setRemark(value);
  };

  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const handleOpenAddItems = () => {
    setOpenModelAddItems(true);
  };
  const handleModelCloseAddItems = async () => {
    if (Object.keys(payloadAddItem).length !== 0) setFlagSave(true);
    setOpenModelAddItems(false);
  };
  const handleChangeItems = async () => {
    setFlagSave(true);
    // await dispatch(updateAddItemsState(items));
  };

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const handleCloseAlert = () => {
    setOpenAlert(false);

    if (status === "DC_NO_STOCK") {
      handleClose();
    }
  };

  const featchPurchaseBRDetail = async (docNo: string) => {
    await dispatch(featchPurchaseBRDetailAsync(docNo)).then((v) => {
      if (v.payload) {
        const p: any = v.payload ? v.payload : null;
        if (p) {
          let items: any = [];
          p.data.items.forEach((data: any) => {
            const item: any = {
              skuCode: data.skuCode,
              barcode: data.barcode,
              barcodeName: data.barcodeName,
              unitCode: data.unitCode,
              unitName: data.unitName,
              baseUnit: data.barFactor,
              qty: data.orderQty,
              stockMax: data.orderMaxQty,
            };
            items.push(item);
          });
          dispatch(updateAddItemsState(items));
        }
      }
    });
  };

  const handleSaveBR = async () => {
    setOpenLoadingModal(true);
    const payloadSave: any = await handleMapPayloadSave();
    await savePurchaseBR(payloadSave)
      .then((value) => {
        setDocNo(value.docNo);
        setStatus("DRAFT");
        setDisabledBtnDelete(false);
        featchPurchaseBRDetail(value.docNo);

        setFlagSave(false);
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
      })
      .catch((error: ApiError) => {
        setTextError(error.message);
        setOpenAlert(true);
      });
    setOpenLoadingModal(false);
  };

  const handleMapPayloadSave = async () => {
    const items: any = [];
    if (Object.keys(payloadAddItem).length > 0) {
      await payloadAddItem.forEach((data: any) => {
        const item: any = {
          barcode: data.barcode,
          orderMaxQty: data.stockMax ? data.stockMax : 0,
          orderQty: data.qty ? data.qty : 0,
        };
        items.push(item);
      });
    }

    if (docNo !== "") {
      const payload: PurchaseBRRequest = {
        docNo: docNo,
        remark: remark,
        items: items,
      };

      return await payload;
    } else {
      const payload: PurchaseBRRequest = {
        remark: remark,
        items: items,
      };

      return await payload;
    }
  };

  const [openModalConfirmDelete, setOpenModalConfirmDelete] =
    React.useState<boolean>(false);
  const handleOpenConfirm = async () => {
    setOpenModalConfirmDelete(true);
  };
  const handleCloseModalConfirm = () => {
    setOpenModalConfirmDelete(false);
  };

  const payLoadSearch = useAppSelector(
    (state) =>
      state.saveSearchPurchaseBranchRequest.searchPurchaseBranchRequest,
  );
  const handleDeletePurchaseBR = async () => {
    handleCloseModalConfirm();
    setOpenLoadingModal(true);
    await deletePurchaseBR(docNo)
      .then((value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้ยกเลิกข้อมูลเรียบร้อยแล้ว");

        dispatch(featchSearchPurchaseBranchRequestAsync(payLoadSearch));

        setTimeout(() => {
          handleClose();
        }, 300);
      })
      .catch((error: ApiError) => {
        setTextError(error.message);
        setOpenAlert(true);
      });
    setOpenLoadingModal(false);
  };

  const payloadSearch = useAppSelector(
    (state) =>
      state.saveSearchPurchaseBranchRequest.searchPurchaseBranchRequest,
  );
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [textHeaderConfirm, setTextHeaderConfirm] = React.useState("");
  const handleCloseModelConfirm = () => {
    setOpenModelConfirm(false);
  };
  const handleConfirm = async () => {
    setOpenModelConfirm(false);

    handleSendBR();
  };

  const handleBtnSendBR = async () => {
    // if (flagSave) {
    if (docNo === "") {
      const payloadSave: any = await handleMapPayloadSave();
      await savePurchaseBR(payloadSave)
        .then((value) => {
          setFlagSave(false);
          setDocNo(value.docNo);
          setStatus("DRAFT");
          setDisabledBtnDelete(false);

          setTextHeaderConfirm("ยืนยันส่งรายการ เบิกของใช้หน้าร้าน");
          setOpenModelConfirm(true);
        })
        .catch((error: ApiError) => {
          setTextError(error.message);
          setOpenAlert(true);
        });
    } else {
      setTextHeaderConfirm("ยืนยันส่งรายการ เบิกของใช้หน้าร้าน");
      setOpenModelConfirm(true);
    }
  };
  const handleSendBR = async () => {
    setOpenLoadingModal(true);
    await sendPurchaseBR(docNo, caseNo)
      .then((value) => {
        // DC_NO_STOCK
        if (String(value.data.status) === "DC_NO_STOCK") {
          setStatus(value.data.status);
          setTextError("ไม่มีสต๊อกสินค้าที่คลัง");
          setOpenAlert(true);
        } else {
          setFlagSave(false);
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("คุณได้ส่งรายการเรียบร้อยแล้ว");
          dispatch(featchSearchPurchaseBranchRequestAsync(payloadSearch));
          setTimeout(() => {
            handleClose();
          }, 500);
        }
      })
      .catch((error: ApiError) => {
        if (error.code === 40113) {
          setTextError(error.message);
          setOpenAlert(true);
        } else if (error.code === 40114) {
          setTextError(
            mappingErrorParam(error.message, {
              headerErrMsg: error.data.toString(),
            }),
          );
          setOpenAlert(true);
        } else {
          setTextError(error.message);
          setOpenAlert(true);
        }
      });
    setOpenLoadingModal(false);
  };

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const [openCopyModal, setOpenCopyModal] = React.useState(false);
  const handleOpenCopyModal = () => {
    setOpenCopyModal(true);
  };
  const handleCloseCopyModal = () => {
    handleClose();
    setOpenCopyModal(false);
  };
  const handleOpenCopyItems = async () => {
    setOpenLoadingModal(true);
    await dispatch(clearDataPurchaseBRDetail());

    const itemsCopy: any = [];
    const SKUCodes: any = [];
    payloadAddItem.map((item: any) => {
      const actualQty = item.actualQty ? item.actualQty : 0;
      const orderQty = item.orderQty ? item.orderQty : 0;
      let diff = Number(actualQty) - Number(orderQty);
      if (diff < 0) {
        itemsCopy.push(item);
        SKUCodes.push(item.skuCode);
      }
    });

    await getProductBySKUCodes(SKUCodes)
      .then((value) => {
        const itemsCopyMap: any = [];
        itemsCopy.map((data: any) => {
          const sku = value.data.filter((r: any) => r.skuCode === data.skuCode);
          const diff = Number(data.orderQty) - Number(data.actualQty);
          const item: any = {
            skuCode: data.skuCode,
            barcode: data.barcode,
            barcodeName: data.barcodeName,
            unitCode: data.unitCode,
            unitName: data.unitName,
            baseUnit: data.barFactor,
            qty: diff ? diff : 0,
            stockMax: sku[0].stockMax ? sku[0].stockMax : data.orderMaxQty,
          };
          itemsCopyMap.push(item);
        });

        dispatch(updateAddItemsState(itemsCopyMap));
        setFlagSave(true);
      })
      .catch((error: ApiError) => {
        const itemsCopyMap: any = [];
        itemsCopy.map((data: any) => {
          const diff = Number(data.orderQty) - Number(data.actualQty);
          const item: any = {
            skuCode: data.skuCode,
            barcode: data.barcode,
            barcodeName: data.barcodeName,
            unitCode: data.unitCode,
            unitName: data.unitName,
            baseUnit: data.barFactor,
            qty: diff ? diff : 0,
            stockMax: data.orderMaxQty,
          };
          itemsCopyMap.push(item);
        });

        dispatch(updateAddItemsState(itemsCopyMap));
        setFlagSave(true);
      });

    handleOpenCopyModal();
    // handleClose();

    setTimeout(() => {
      setOpenLoadingModal(false);
    }, 300);
  };

  // Mock Case Await Sap
  const [openModelMockupCase, setOpenModelMockupCase] = React.useState(false);
  const [caseNo, setCaseNo] = React.useState("5");
  const handleOpenModelMockupCase = () => {
    setOpenModelMockupCase(true);
  };
  const handleCloseModelMockupCase = (valueCase: string) => {
    setCaseNo(valueCase);
    setOpenModelMockupCase(false);

    handleBtnSendBR();
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleChkSaveClose}
        >
          <Typography sx={{ fontSize: "1em" }}>เบิกของใช้หน้าร้าน</Typography>
          <Steppers status={statusSteps} stepsList={steps}></Steppers>
        </BootstrapDialogTitle>

        <DialogContent sx={{ minHeight: "70vh" }}>
          <Grid container spacing={2} mb={2} id="top-item">
            <Grid item xs={2}>
              เลขที่เอกสาร BR :
            </Grid>
            <Grid item xs={2}>
              {docNo !== "" && docNo}
              {docNo === "" && "-"}
            </Grid>
            <Grid item xs={2}>
              วันที่สร้างรายการ :
            </Grid>
            <Grid item xs={2}>
              {moment(createDate).add(543, "y").format("DD/MM/YYYY")}
            </Grid>

            <Grid item xs={2}>
              {status !== "DRAFT" && "เลขที่เอกสาร PO :"}
            </Grid>
            <Grid item xs={2}>
              {status !== "DRAFT" && purchaseBRDetail?.poNo}
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={2} id="top-item">
            <Grid item xs={2}>
              สาขาที่สร้างรายการ :
            </Grid>
            <Grid item xs={2}>
              {branchName}
            </Grid>
            <Grid item xs={2}>
              สถานะ :
            </Grid>
            <Grid item xs={2}>
              {status !== "" && t(`status.${status}`)}
              {status === "" && "-"}
            </Grid>

            <Grid item xs={2}>
              {status !== "DRAFT" && "เลขที่เอกสาร DO :"}
            </Grid>
            <Grid item xs={2}>
              {status !== "DRAFT" && purchaseBRDetail?.doNo}
            </Grid>
          </Grid>

          <Box mb={6}>
            <Grid container spacing={2} mt={4} mb={2}>
              <Grid item xs={5}>
                <Button
                  id="btnAddItems"
                  variant="contained"
                  onClick={handleOpenAddItems}
                  sx={{
                    width: 120,
                    display: `${displayAddItems ? "none" : ""}`,
                  }}
                  className={classes.MbtnAdd}
                  startIcon={<AddCircleOutlineOutlined />}
                  color="secondary"
                >
                  เพิ่มสินค้า
                </Button>
              </Grid>
              <Grid item xs={7} sx={{ textAlign: "end" }}>
                <Button
                  id="btnSave"
                  variant="contained"
                  onClick={handleSaveBR}
                  sx={{
                    width: 120,
                    display: `${displayBtnSave ? "none" : ""}`,
                  }}
                  className={classes.MbtnAdd}
                  startIcon={<Save />}
                  color="warning"
                  disabled={Object.keys(payloadAddItem).length === 0}
                >
                  บันทึก
                </Button>
                <Button
                  id="btnClear"
                  variant="contained"
                  // onClick={handleBtnSendBR}
                  onClick={handleOpenModelMockupCase}
                  sx={{
                    width: 120,
                    ml: 2,
                    display: `${displayBtnSubmit ? "none" : ""}`,
                  }}
                  className={classes.MbtnClear}
                  startIcon={<CheckCircle />}
                  color="primary"
                  disabled={Object.keys(payloadAddItem).length === 0}
                >
                  ส่งรายการ
                </Button>
                <Button
                  id="btnSearch"
                  variant="contained"
                  onClick={handleOpenConfirm}
                  sx={{
                    width: 120,
                    ml: 2,
                    display: `${displayBtnDelete ? "none" : ""}`,
                  }}
                  startIcon={<Cancel />}
                  className={classes.MbtnSearch}
                  color="error"
                  disabled={disabledBtnDelete}
                >
                  ยกเลิก
                </Button>

                <Button
                  id="btnCopyItems"
                  variant="contained"
                  onClick={handleOpenCopyItems}
                  sx={{
                    width: 120,
                    display: `${displayCopyItems ? "none" : ""}`,
                  }}
                  className={classes.MbtnAdd}
                  startIcon={<ContentCopy />}
                  color="secondary"
                >
                  คัดลอก
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box mb={5}>
            {status === "DRAFT" && (
              <PurchaseBranchListItemDraft onChangeItems={handleChangeItems} />
            )}
            {status !== "" && status !== "DRAFT" && (
              <PurchaseBranchListItem onChangeItems={handleChangeItems} />
            )}
          </Box>
          <Box mb={8}>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={3}>
                <TextBoxComment
                  fieldName="หมายเหตุ :"
                  defaultValue={remark}
                  maxLength={100}
                  onChangeComment={handleChangeComment}
                  isDisable={status !== "DRAFT"}
                />
              </Grid>
            </Grid>
          </Box>

          <ModalAddItems
            open={openModelAddItems}
            onClose={handleModelCloseAddItems}
            requestBody={{
              skuCodes: [],
              skuTypes: [3, 6],
              isOrderable: true,
            }}
          ></ModalAddItems>

          <LoadingModal open={openLoadingModal} />

          <ModelConfirm
            open={openModalConfirmDelete}
            onClose={handleCloseModalConfirm}
            onConfirm={handleDeletePurchaseBR}
            headerTitle={"ยืนยันยกเลิกสั่งสินค้าสาขา"}
            docNo={docNo}
          />

          <ModelConfirm
            open={openModelConfirm}
            onClose={handleCloseModelConfirm}
            onConfirm={handleConfirm}
            headerTitle={textHeaderConfirm}
            docNo={docNo}
          />

          <SnackbarStatus
            open={showSnackBar}
            onClose={handleCloseSnackBar}
            isSuccess={snackbarIsStatus}
            contentMsg={contentMsg}
          />

          <ConfirmModelExit
            open={confirmModelExit}
            onClose={handleNotExitModelConfirm}
            onConfirm={handleExitModelConfirm}
          />

          <AlertError
            open={openAlert}
            onClose={handleCloseAlert}
            textError={textError}
          />

          <ModelMockupCase
            open={openModelMockupCase}
            onClose={handleCloseModelMockupCase}
            caseNo={caseNo}
          />
        </DialogContent>
      </Dialog>

      {openCopyModal && (
        <ModalPurchaseBranchCopy
          isOpen={openCopyModal}
          onClickClose={handleCloseCopyModal}
        />
      )}
    </div>
  );
}

export default purchaseBranchDetail;
