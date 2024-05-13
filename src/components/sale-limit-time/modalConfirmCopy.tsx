import React, { ReactElement, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import LoadingModal from "../commons/ui/loading-modal";
import { Box } from "@mui/system";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  choiceCopy: boolean;
  setChoiceCopy: (value: boolean) => void;
}
interface loadingModalState {
  open: boolean;
}

export default function ModalConfirmCopy({
  open,
  choiceCopy,
  setChoiceCopy,
  onClose,
  onConfirm,
}: Props): ReactElement {
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChoiceCopy(JSON.parse(event.target.value.toLowerCase()));
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
        PaperProps={{ sx: { minWidth: 450, minHeight: 241 } }}
      >
        <DialogContent sx={{ textAlign: "left", mt: 1, ml: 5 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h6" sx={{ marginBottom: 1, fontSize: "18px" }}>
              <b>การคัดลอกข้อมูล</b>{" "}
              <span style={{ color: "#AEAEAE", fontSize: "14px" }}>
                (กรุณาเลือก)
              </span>
            </Typography>
          </DialogContentText>
          <Box>
            <FormControl>
              <RadioGroup
                aria-labelledby="copy-radio-buttons-group-label"
                value={choiceCopy}
                name="radio-buttons-group"
                onChange={handleChangeRadio}
                sx={{ fontSize: "14px", color: "#AEAEAE" }}
              >
                <FormControlLabel
                  sx={{ color: choiceCopy ? "#AEAEAE" : "#36C690" }}
                  value={false}
                  control={<Radio />}
                  label={`คัดลอกสินค้าตามเอกสารเดิม`}
                />
                <FormControlLabel
                  sx={{ color: choiceCopy ? "#36C690" : "##AEAEAE" }}
                  value={true}
                  control={<Radio />}
                  label="คัดลอกและอัพเดทรายการสินค้าล่าสุด"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2, mr: 5, ml: 5 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 120, mr: 4 }}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, width: 120 }}
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
