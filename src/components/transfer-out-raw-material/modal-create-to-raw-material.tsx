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
} from "../../store/slices/transfer-out-raw-material-slice";
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
import { getUserInfo } from "../../store/sessionStore";
import ModelConfirm from "../barcode-discount/modal-confirm";
import ModalCheckStock from "../barcode-discount/modal-check-stock";
import {
  cancelTransferOut,
  saveDraftTransferOut,
} from "../../services/transfer-out";
import { updateCheckStock } from "../../store/slices/stock-balance-check-slice";
import { checkStockBalance } from "../../services/common";
import StepperBarToRawMaterial from "./stepper-bar-to-raw-material";
import ModalToRawMaterialItem from "./modal-to-raw-material-item";
import ModalAddItems from "../commons/ui/modal-add-items";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import ModalAskingPassword from "./modal-asking-password";

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

export default function ModalCreateToRawMaterial({
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
  const [openModalConfirmApprove, setOpenModalConfirmApprove] =
    React.useState<boolean>(false);
  const [openModelAddItems, setOpenModelAddItems] =
    React.useState<boolean>(false);
  const [openPopupModal, setOpenPopupModal] = React.useState<boolean>(false);
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const [openCheckStock, setOpenCheckStock] = React.useState<boolean>(false);
  const [openModalClose, setOpenModalClose] = React.useState<boolean>(false);
  const [openAskingPassword, setOpenAskingPassword] =
    React.useState<boolean>(false);
  const [textPopup, setTextPopup] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const payloadTransferOut = useAppSelector(
    (state) => state.transferOutRawMaterialSlice.createDraft,
  );
  const dataDetail = useAppSelector(
    (state) => state.transferOutRawMaterialSlice.dataDetail,
  );
  const checkEdit = useAppSelector(
    (state) => state.transferOutRawMaterialSlice.checkEdit,
  );
  const transferOutDetail = useAppSelector(
    (state) => state.transferOutDetailSlice.transferOutDetail.data,
  );
  //permission
  const [approvePermission, setApprovePermission] = useState<boolean>(
    userPermission != null && userPermission.length > 0
      ? userPermission.includes(ACTIONS.CAMPAIGN_TO_APPROVE)
      : false,
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

  const handleCloseAskingPassword = (confirm: boolean) => {
    setOpenAskingPassword(false);
    if (confirm) {
      dispatch(
        updateDataDetail({
          ...dataDetail,
          status: TOStatus.APPROVED,
        }),
      );
      setOpenPopup(true);
      setPopupMsg("คุณได้อนุมัติขอใช้วัตถุดิบร้านบาวเรียบร้อยแล้ว");
      handleClose();
      if (onSearchMain) onSearchMain();
    }
  };

  const handleCloseModalConfirmApprove = (confirm: boolean) => {
    setOpenModalConfirmApprove(false);
    if (confirm) {
      //open popup confirm asking for password
      setOpenAskingPassword(true);
      setOpenModalConfirmApprove(false);
    }
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
    dispatch(updateAddItemsState({}));
    dispatch(
      updateDataDetail({
        id: "",
        documentNumber: "",
        status: "",
        approvedDate: null,
        createdDate: moment(new Date()).toISOString(),
        transferOutReason: "เพื่อใช้ (วัตถุดิบ)",
      }),
    );
    dispatch(updateCheckEdit(false));
    dispatch(save({ ...payloadTransferOut, requesterNote: "" }));
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
      //set value for requesterNote
      dispatch(
        save({
          ...payloadTransferOut,
          requesterNote: transferOutDetail.requesterNote,
        }),
      );
      //set value for products
      if (transferOutDetail.products && transferOutDetail.products.length > 0) {
        let lstProductDetail: any = [];
        for (let item of transferOutDetail.products) {
          lstProductDetail.push({
            barcode: item.barcode,
            barcodeName: item.productName,
            unitName: item.unitName,
            unitCode: item.unitFactor,
            baseUnit: item.barFactor,
            unitPrice: item.price || 0,
            qty: item.numberOfRequested || 0,
            numberOfApproved: item.numberOfRequested || 0,
            skuCode: item.sku,
            remark: item.remark,
          });
        }
        dispatch(updateAddItemsState(lstProductDetail));
      }
    }
  }, [transferOutDetail]);

  const validate = () => {
    let isValid = true;
    //validate product
    const data = [...payloadTransferOut.products];
    if (data.length > 0) {
      let dt: any = [];
      for (let preData of data) {
        const item = {
          id: preData.barcode,
          errorNumberOfRequested: "",
        };
        if (preData.numberOfRequested <= 0 || !preData.numberOfRequested) {
          isValid = false;
          item.errorNumberOfRequested = "จำนวนคำขอต้องมากกว่า 0";
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

  const handleCreateDraft = async (sendRequest: boolean) => {
    setAlertTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    if (validate()) {
      await dispatch(save({ ...payloadTransferOut }));
      try {
        const body = !!dataDetail.id
          ? {
              ...payloadTransferOut,
              id: dataDetail.id,
              documentNumber: dataDetail.documentNumber,
              type: TO_TYPE.TO_RAW_MATERIAL,
            }
          : {
              ...payloadTransferOut,
              type: TO_TYPE.TO_RAW_MATERIAL,
            };
        const rs = await saveDraftTransferOut(body);
        if (rs.code === 201) {
          if (!sendRequest) {
            dispatch(updateCheckEdit(false));
            setOpenPopupModal(true);
            setTextPopup("คุณได้ทำการบันทึกข้อมูลเรียบร้อยแล้ว");
            if (onSearchMain) onSearchMain();
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
            setOpenModalConfirmApprove(true);
          }
        } else {
          setOpenModalError(true);
        }
      } catch (error) {
        setOpenModalError(true);
      }
    }
  };

  const handleClickApprove = async () => {
    const rsCheckStock = await handleCheckStock();
    if (rsCheckStock) {
      handleCreateDraft(true);
    }
  };

  const handleDeleteDraft = async () => {
    setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    if (!stringNullOrEmpty(status)) {
      try {
        const rs = await cancelTransferOut(dataDetail.id);
        if (rs.status === 200) {
          setOpenPopup(true);
          setPopupMsg("คุณได้ยกเลิกขอใช้วัตถุดิบร้านบาว");
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
      setPopupMsg("คุณได้ยกเลิกขอใช้วัตถุดิบร้านบาว");
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
        frontStore: true,
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

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleCloseModalCreate}
        >
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียดขอใช้วัตถุดิบร้านบาว
          </Typography>
          <StepperBarToRawMaterial activeStep={status} />
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
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                <Typography>เลขที่เอกสาร</Typography>
                <Typography>ขอใช้วัตถุดิบ :</Typography>
              </Grid>
              <Grid item xs={8}>
                {!!dataDetail.documentNumber ? dataDetail.documentNumber : "-"}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5}>
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
            <Grid item container xs={4} mb={8}>
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
            <Grid item container xs={4} mb={8}>
              <Grid item xs={4}>
                เหตุผลการเบิก :
              </Grid>
              <Grid item xs={8}>
                {dataDetail.transferOutReason}
              </Grid>
            </Grid>
            <Grid item container xs={4} mb={5}>
              <Grid item xs={4}>
                สต๊อก :
              </Grid>
              <Grid item xs={8}>
                หน้าร้าน
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
                      payloadTransferOut.products.length === 0)
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
                  id="btnApprove"
                  variant="contained"
                  color="primary"
                  sx={{ margin: "0 17px" }}
                  disabled={
                    (!stringNullOrEmpty(status) && status != TOStatus.DRAFT) ||
                    (payloadTransferOut.products &&
                      payloadTransferOut.products.length === 0)
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
                  onClick={handleClickApprove}
                  className={classes.MbtnSearch}
                >
                  อนุมัติ
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
              </Box>
            </Box>
            <Box>
              <ModalToRawMaterialItem
                id=""
                action={action}
                userPermission={userPermission}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ModalAddItems
        open={openModelAddItems}
        onClose={handleCloseModelAddItems}
        requestBody={{
          skuCodes: [],
          skuCoffeeTypes: [1],
        }}
      />
      <ModelConfirm
        open={openModalCancel}
        onClose={handleCloseModalCancel}
        onConfirm={handleDeleteDraft}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันยกเลิกขอใช้วัตถุดิบร้านบาว"}
        documentField={"เลขที่เอกสารขอใช้วัตถุดิบ"}
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
        open={openModalConfirmApprove}
        onClose={() => handleCloseModalConfirmApprove(false)}
        onConfirm={() => handleCloseModalConfirmApprove(true)}
        barCode={dataDetail.documentNumber}
        headerTitle={"ยืนยันอนุมัติขอใช้วัตถุดิบร้านบาว"}
        documentField={"เลขที่เอกสารขอใช้วัตถุดิบ"}
      />
      <ModalAskingPassword
        open={openAskingPassword}
        onClose={() => handleCloseAskingPassword(false)}
        onConfirm={() => handleCloseAskingPassword(true)}
        headerTitle={"กรุณาใส่ password ของคุณเพื่อยืนยัน"}
        payload={{
          id: dataDetail.id,
          products: payloadTransferOut.products,
        }}
      />
    </div>
  );
}
