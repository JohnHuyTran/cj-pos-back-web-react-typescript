import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import LoadingModal from "../commons/ui/loading-modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  headerTitle: string;
  docNo: string;
  // status: number;
  // error?: boolean;
}
interface loadingModalState {
  open: boolean;
}

export default function ModelConfirm({
  open,
  // remark,
  // setRemark,
  // status,
  onClose,
  onConfirm,
  // HQCode,
  headerTitle,
  docNo,
}: // error,
Props): ReactElement {
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleConfirm = async () => {
    handleOpenLoading("open", true);
    await onConfirm();
    handleOpenLoading("open", false);
    onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        PaperProps={{ sx: { minWidth: 450 } }}
      >
        <DialogContent sx={{ mt: 3, mr: 3, ml: 3 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h6" align="center" sx={{ marginBottom: 1 }}>
              {headerTitle}
            </Typography>
            <Typography variant="h6" align="center">
              เลขที่เอกสาร BR{" "}
              <label
                style={{
                  color: "#AEAEAE",
                  marginLeft: "15px",
                  marginRight: "5px",
                }}
              >
                |
              </label>{" "}
              <label style={{ color: "#36C690" }}>
                <b>{docNo}</b>
              </label>
            </Typography>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 5, mr: 5, ml: 5 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 80, mr: 4 }}
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
        </DialogActions>
      </Dialog>

      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}
