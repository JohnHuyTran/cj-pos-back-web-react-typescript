import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { updateItemsState } from "../../../store/slices/supplier-add-items-slice";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import LoadingModal from "./loading-modal";

interface Props {
  open: boolean;
  onClose: () => void;
  productName: string;
  skuCode: string;
  barCode: string;
}

export default function ModelConfirm({
  open,
  onClose,
  productName,
  skuCode,
  barCode,
}: Props): ReactElement {
  const dispatch = useAppDispatch();
  // const payloadItem = useAppSelector((state) => state.supplierAddItems.state);

  const payloadItem = useAppSelector((state) => state.addItems.state);
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);

  const handleDeleteItem = async () => {
    setOpenLoadingModal(true);
    let items = payloadItem;
    let payload = items.filter((r: any) =>
      r.barCode ? r.barCode : r.barcode !== barCode,
    );
    await dispatch(updateAddItemsState(payload));
    // }

    setTimeout(() => {
      setOpenLoadingModal(false);
      onClose();
    }, 200);
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      sx={{ minWidth: 800 }}
    >
      <DialogContent sx={{ pl: 6, pr: 8 }}>
        <DialogContentText
          id="alert-dialog-description"
          sx={{ color: "#263238" }}
        >
          <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
            ต้องการลบสินค้า
          </Typography>
          <Typography variant="body1" align="left">
            สินค้า <label style={{ color: "#AEAEAE", marginRight: 5 }}>|</label>{" "}
            <label style={{ color: "#36C690" }}>
              <b>{productName}</b>
              <br />
              <label
                style={{ color: "#AEAEAE", fontSize: 14, marginLeft: "3.8em" }}
              >
                {skuCode}
              </label>
            </label>
          </Typography>
          <Typography variant="body1" align="left">
            บาร์โค้ด{" "}
            <label style={{ color: "#AEAEAE", marginRight: 5 }}>|</label>{" "}
            <label style={{ color: "#36C690" }}>
              <b>{barCode}</b>
            </label>
          </Typography>
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mb: 2, pl: 6, pr: 8 }}>
        <Button
          id="btnCancle"
          variant="contained"
          color="cancelColor"
          sx={{ borderRadius: 2, width: 90, mr: 2 }}
          onClick={onClose}
          data-testid="btnCancle"
        >
          ยกเลิก
        </Button>
        <Button
          id="btnConfirm"
          variant="contained"
          color="error"
          sx={{ borderRadius: 2, width: 90 }}
          onClick={handleDeleteItem}
          data-testid="btnConfirm"
        >
          ลบสินค้า
        </Button>
      </DialogActions>

      <LoadingModal open={openLoadingModal} />
    </Dialog>
  );
}
