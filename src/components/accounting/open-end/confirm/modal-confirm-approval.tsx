import { ReactElement, Fragment, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography,
} from "@mui/material";

interface ModalConfirmApprovalProps {
  open: boolean;
  docNo: string;
  onClose: () => void;
  onConfirm: (submit: boolean) => void;
}

export default function ModalConfirmApproval(
  props: ModalConfirmApprovalProps,
): ReactElement {
  const { open, docNo, onConfirm, onClose } = props;
  // Handle function
  const handleConfirm = () => {
    onConfirm(true);
  };
  const handleCancle = () => {
    onClose();
  };

  return (
    <Fragment>
      <Dialog
        id="ModalConfirmApproval"
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        PaperProps={{ sx: { minWidth: 450, minHeight: 241 } }}
      >
        <DialogContent sx={{ mt: 3, mr: 5, ml: 5 }}>
          <DialogContentText
            id="Topic"
            align="center"
            sx={{ color: "#263238", mb: 3 }}
          >
            <Typography component="span" variant="h6">
              ยืนยันขออนุมัติ สรุปปิดรอบการขาย
            </Typography>
          </DialogContentText>
          <Box id="Description">
            <Box
              id="DetailBox"
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box id="DetailTitle" sx={{ width: "80%", textAlign: "right" }}>
                เลขที่เอกสาร
              </Box>
              <Box id="DetailLine">
                <Typography
                  component="label"
                  sx={{ color: "#AEAEAE", m: "0 10px" }}
                >
                  |
                </Typography>
              </Box>
              <Box id="DetailDescription" sx={{ width: "100%" }}>
                <Typography
                  component="label"
                  sx={{ color: "#36C690", fontWeight: "700" }}
                >
                  {docNo || "-"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 5, mr: 5, ml: 5 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 140, mr: 4 }}
            onClick={handleCancle}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, width: 140 }}
            onClick={handleConfirm}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
