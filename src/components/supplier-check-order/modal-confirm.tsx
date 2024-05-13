import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { ApiError } from "../../models/api-error-model";
import {
  SavePurchasePIRequest,
  SavePurchaseRequest,
} from "../../models/supplier-check-order-model";
import {
  approveSupplierOrder,
  approveSupplierPI,
  deleteSupplierPI,
} from "../../services/purchase";
import LoadingModal from "../commons/ui/loading-modal";
import { useAppDispatch, useAppSelector } from "../../store/store";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdateAction: (value: boolean, errorMsg: any) => void;
  piNo: string;
  docNo: string;
  billNo: string;
  supplierId: string;
  comment: string;
  piType: number;
  items: any;
  piDetail: boolean;
  title: string;
  action: string;
}

export default function ModelConfirm({
  open,
  onClose,
  onUpdateAction,
  piNo,
  docNo,
  billNo,
  supplierId,
  comment,
  piType,
  items,
  piDetail,
  title,
  action,
}: Props): ReactElement {
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);
  const handleConfirm = async () => {
    setOpenLoadingModal(true);

    if (action === "delete") {
      canclePI();
    } else if (action === "approve") {
      if (piDetail) {
        const payloadSave: SavePurchasePIRequest = {
          billNo: billNo,
          SupplierCode: supplierId,
          comment: comment,
          piNo: piNo,
          docNo: docNo,
          flagPO: piType,
          items: items,
        };

        await approveSupplierPI(payloadSave, fileUploadList).then(
          function (value) {
            setTimeout(() => {
              onUpdateAction(true, "");
            }, 500);
          },
          function (error: ApiError) {
            onUpdateAction(false, error.message);
          },
        );

        setOpenLoadingModal(false);
      } else {
        const payloadSave: SavePurchaseRequest = {
          billNo: billNo,
          comment: comment,
          items: items,
        };

        await approveSupplierOrder(payloadSave, piNo, fileUploadList).then(
          function (value) {
            setTimeout(() => {
              onUpdateAction(true, "");
            }, 500);
          },
          function (error: ApiError) {
            onUpdateAction(false, error.message);
          },
        );

        setOpenLoadingModal(false);
      }
    }
    onClose();
  };

  const canclePI = async () => {
    await deleteSupplierPI(piNo)
      .then((value) => {
        setTimeout(() => {
          onUpdateAction(true, "");
        }, 500);
      })
      .catch((error: ApiError) => {
        onUpdateAction(false, error.message);
      });
  };
  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      sx={{ minWidth: 500 }}
    >
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          sx={{ color: "#263238" }}
        >
          <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
            {title}
          </Typography>
          {docNo && (
            <Typography variant="body1" align="center">
              เลขที่ใบสั่งซื้อ PO <label style={{ color: "#AEAEAE" }}>|</label>{" "}
              <label style={{ color: "#36C690" }}>
                <b>{docNo}</b>
              </label>
            </Typography>
          )}
          <Typography variant="body1" align="center">
            เลขที่ใบเอกสาร PI <label style={{ color: "#AEAEAE" }}>|</label>{" "}
            <label style={{ color: "#36C690" }}>
              <b>{piNo}</b>
            </label>
          </Typography>
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        <Button
          id="btnCancle"
          variant="contained"
          color="cancelColor"
          sx={{ borderRadius: 2, width: 80, mr: 2 }}
          onClick={onClose}
        >
          ยกเลิก
        </Button>
        <Button
          id="btnConfirm"
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, width: 80 }}
          onClick={handleConfirm}
        >
          ยืนยัน
        </Button>

        <LoadingModal open={openLoadingModal} />
      </DialogActions>
    </Dialog>
  );
}
