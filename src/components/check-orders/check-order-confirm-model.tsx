import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Entry,
  ItemsApprove,
  OrderApproveRequest,
  ShipmentRequest,
} from "../../models/order-model";
import {
  approveOrderShipments,
  closeOrderShipments,
} from "../../services/order-shipment";
import { ShipmentDeliveryStatusCodeEnum } from "../../utils/enum/check-order-enum";
import DataDiffInfo from "./table-diff-info";
import { ApiError } from "../../models/api-error-model";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { featchOrderListAsync } from "../../store/slices/check-order-slice";
import LoadingModal from "../commons/ui/loading-modal";
import { env } from "../../adapters/environmentConfigs";
import { Grid } from "@mui/material";
import { searchToteAsync } from "../../store/slices/search-tote-slice";

interface ConfirmOrderShipment {
  open: boolean;
  onClose: () => void;
  onUpdateShipmentStatus: (value: boolean, errorMsg: any) => void;
  shipmentNo: string;
  sdNo: string;
  action: string;
  items: Entry[];
  percentDiffType: boolean;
  percentDiffValue: string;
  sumActualQty: number;
  sumQuantityRef: number;
  docType: string;
  sdType?: number;
}

interface loadingModalState {
  open: boolean;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function CheckOrderConfirmModel(props: ConfirmOrderShipment) {
  const {
    open,
    onClose,
    onUpdateShipmentStatus,
    shipmentNo,
    sdNo,
    action,
    items,
    percentDiffType,
    percentDiffValue,
    sumActualQty,
    sumQuantityRef,
    docType,
    sdType,
  } = props;
  const searchState = useAppSelector((state) => state.saveSearchOrder);
  const payloadSearchOrder: ShipmentRequest = searchState.searchCriteria;
  const dispatch = useAppDispatch();
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);
  const DCPercent = env.dc.percent;

  let sumDCPercent: number = (sumActualQty * 100) / sumQuantityRef;
  if (sumQuantityRef === 0) {
    sumDCPercent = sumActualQty * 100; //sumDCPercent = Infinity, (sumQuantityRef = 0)
  }
  sumDCPercent = Math.trunc(sumDCPercent); //remove decimal

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const confirmApproveBtn = async () => {
    handleOpenLoading("open", true);

    if (action === ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE) {
      const itemsApprove: any = [];
      items.forEach((data) => {
        const item: ItemsApprove = {
          barcode: data.barcode,
          deliveryOrderNo: data.deliveryOrderNo,
          actualQty: data.actualQty * 1,
          comment: data.comment,
          isTote: data.isTote,
        };

        itemsApprove.push(item);
      });

      const payload: OrderApproveRequest = {
        items: itemsApprove,
      };

      await approveOrderShipments(sdNo, payload).then(
        async function (value) {
          await updateShipmentOrder();
          await dispatch(searchToteAsync());
          // setTimeout(() => {
          onUpdateShipmentStatus(true, "");

          onClose();
          // }, 3000);
        },
        function (error: ApiError) {
          onUpdateShipmentStatus(false, error);
          onClose();
        },
      );
    } else if (action === ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB) {
      await closeOrderShipments(sdNo, fileUploadList)
        .then(
          async function (value) {
            await updateShipmentOrder();
            await dispatch(searchToteAsync());

            onUpdateShipmentStatus(true, "");
            onClose();
          },
          function (error: ApiError) {
            onUpdateShipmentStatus(false, error);
            onClose();
          },
        )
        .catch((err) => {
          onUpdateShipmentStatus(
            false,
            "This is an error alert — check it out!",
          );
          onClose();
        });
    }
    handleOpenLoading("open", false);

    localStorage.removeItem("localStorageRowsEdit");
  };

  const handleClose = () => {
    onClose();
  };
  const updateShipmentOrder = async () => {
    await dispatch(featchOrderListAsync(payloadSearchOrder));
  };

  const itemsDiff: any = [];
  items.forEach((data) => {
    if (data.qtyDiff !== 0) {
      const item: Entry = {
        barcode: data.barcode,
        deliveryOrderNo: data.deliveryOrderNo,
        actualQty: data.actualQty * 1,
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
        qtyDiff: data.qtyDiff,
        price: 0,
        isControlStock: 0,
        toteCode: "",
        expireDate: "",
        isTote: false,
      };

      itemsDiff.push(item);
    }
  });

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ minWidth: 500 }}
      >
        {action === ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE && (
          <div>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                sx={{ color: "#263238" }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ marginBottom: 2 }}
                >
                  ยืนยันอนุมัติใบตรวจสอบการรับ-โอนสินค้า
                </Typography>
                <Typography variant="body1" align="center">
                  เลขที่เอกสาร <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                  <label style={{ color: "#36C690" }}>
                    <b>{shipmentNo}</b>
                  </label>
                </Typography>
                <Typography variant="body1" align="center">
                  เลขที่เอกสาร SD <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                  <label style={{ color: "#36C690" }}>
                    <b>{sdNo}</b>
                  </label>
                </Typography>
                {itemsDiff.length > 0 && (
                  <div>
                    <Typography
                      variant="body1"
                      align="center"
                      sx={{
                        marginTop: 2,
                        marginBottom: 1,
                        fontWeight: 600,
                      }}
                    >
                      รายการสินค้าขาด / เกิน
                    </Typography>

                    {docType === "LD" && sdType !== 1 && (
                      <Typography
                        variant="body1"
                        align="center"
                        sx={{
                          marginBottom: 2,
                          fontSize: 13,
                          color: "#FF0000",
                        }}
                      >
                        {sumDCPercent < DCPercent &&
                          `(จำนวนรับจริง ${sumDCPercent}% น้อยกว่าค่าที่กำหนด ${DCPercent}%)`}
                        {sumDCPercent > DCPercent &&
                          `(จำนวนรับจริง ${sumDCPercent}% มากกว่าค่าที่กำหนด ${DCPercent}%)`}
                      </Typography>
                    )}

                    <DataDiffInfo items={itemsDiff} />
                  </div>
                )}
              </DialogContentText>
            </DialogContent>
          </div>
        )}

        {action === ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB &&
          fileUploadList.length > 0 && (
            <div>
              <DialogContent>
                <DialogContentText
                  id="alert-dialog-description"
                  sx={{ color: "#263238" }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ marginBottom: 2 }}
                  >
                    ปิดงานใบตรวจสอบการรับ-โอนสินค้า
                  </Typography>
                  <Typography variant="body1" align="center">
                    เลขที่เอกสาร <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                    <label style={{ color: "#36C690" }}>
                      <b>{shipmentNo}</b>
                    </label>
                  </Typography>
                  <Typography variant="body1" align="center">
                    เลขที่เอกสาร SD{" "}
                    <label style={{ color: "#AEAEAE" }}>|</label>{" "}
                    <label style={{ color: "#36C690" }}>
                      <b>{sdNo}</b>
                    </label>
                  </Typography>
                </DialogContentText>
              </DialogContent>
            </div>
          )}

        {action === ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB &&
          fileUploadList.length < 0 && (
            <DialogActions sx={{ justifyContent: "center" }}>
              <Button
                id="btnAccept"
                variant="contained"
                size="small"
                color="primary"
                onClick={handleClose}
              >
                รับทราบ
              </Button>
            </DialogActions>
          )}

        {(action === ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE ||
          (action === ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB &&
            fileUploadList.length > 0)) && (
          <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
            <Button
              id="btnCancel"
              variant="contained"
              size="small"
              color="cancelColor"
              sx={{ borderRadius: 2, width: 80, mr: 2 }}
              onClick={handleClose}
            >
              ยกเลิก
            </Button>
            <Button
              id="btnConfirm"
              variant="contained"
              size="small"
              color="primary"
              sx={{ borderRadius: 2, width: 80 }}
              onClick={confirmApproveBtn}
            >
              ยืนยัน
            </Button>
          </DialogActions>
        )}
      </Dialog>
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}
