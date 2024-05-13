import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { useAppDispatch } from "../../../store/store";
import { uploadFileState } from "../../../store/slices/upload-file-slice";

interface Confirm {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface loadingModalState {
  open: boolean;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

export default function ConfirmCloseModel(props: Confirm) {
  const { open, onClose, onConfirm } = props;
  const dispatch = useAppDispatch();
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleClose = () => {
    onClose();
  };

  const confirmApproveBtn = () => {
    dispatch(uploadFileState([]));
    onConfirm();
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
            width={350}
          >
            <Typography variant="body1" align="center">
              ข้อมูลที่แก้ไขยังไม่ได้รับการบันทึก <br />{" "}
              ต้องการอกจากหน้าจอนี้หรือไม่
            </Typography>
          </DialogContentText>
        </DialogContent>

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
      </Dialog>
    </div>
  );
}
