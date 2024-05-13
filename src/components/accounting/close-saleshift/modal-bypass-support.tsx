import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { stringNullOrEmpty } from "utils/utils";
import { byPassBySupport } from "services/accounting";
import { ApiError } from "models/api-error-model";
import LoadingModal from "components/commons/ui/loading-modal";
import { featchCloseSaleShiptListAsync } from "store/slices/accounting/close-saleshift-slice";
import store, { useAppDispatch } from "store/store";
import SnackbarStatus from "components/commons/ui/snackbar-status";
import TextBoxComment from "components/commons/ui/textbox-comment";
import AlertError from "components/commons/ui/alert-error";
import { BypassPayload } from "models/branch-accounting-model";

interface Props {
  shiftCode: string;
  branchCode: string;
  open: boolean;
  onClose: () => void;
}
function ModalBypassBySupport({ shiftCode, branchCode, open, onClose }: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [comment, setComment] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] = React.useState<{
    open: boolean;
  }>({
    open: false,
  });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const [isDisableBypass, setIsDisableBypass] = React.useState(true);

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");

  const handleChangeComment = (value: any) => {
    setComment(value);
    if (!stringNullOrEmpty(value)) {
      setIsDisableBypass(false);
      setIsError(false);
      setErrorMessage("");
    } else {
      setIsDisableBypass(true);
    }
  };

  const onSubmit = async () => {
    handleOpenLoading("open", true);
    if (stringNullOrEmpty(comment)) {
      setErrorMessage("กรุณากรอกหมายเหตุ");
      setIsError(true);
    } else {
      const payload: BypassPayload = {
        shiftCode: shiftCode,
        branchCode: branchCode,
        remark: comment,
      };
      await byPassBySupport(payload)
        .then(async (value) => {
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
          setTimeout(() => {
            onClose();
          }, 500);
        })
        .catch((error: ApiError) => {
          setOpenAlert(true);
          setTextError(error.message);
        })
        .finally(async () => {
          const payloadSearch =
            store.getState().closeSaleShiftSlice.payloadSearch;
          await dispatch(featchCloseSaleShiptListAsync(payloadSearch));
        });
    }
    handleOpenLoading("open", false);
  };

  React.useEffect(() => {
    setComment("");
    setIsError(false);
    setErrorMessage("");
    setIsDisableBypass(true);
  }, [open]);
  return (
    <>
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth={true}
        key="modal-add-expense"
      >
        <DialogTitle>
          <Typography
            sx={{ fontSize: 20, fontWeight: 400, textAlign: "center" }}
          >
            ยืนยันการตรวจสอบ Bypass
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ justifyContent: "center" }}>
          <Box>
            <Typography
              variant="body2"
              sx={{ textAlign: "center" }}
              data-testid="testid-label-shiftCode"
            >
              เลขรหัสรอบขาย: {shiftCode}
            </Typography>
          </Box>
          <Box sx={{ ml: 10, mr: 5, mt: 2 }}>
            <TextBoxComment
              fieldName={
                <Box>
                  <Typography component="span" color="red">
                    *
                  </Typography>
                  กรุณากรอกหมายเหตุ
                </Box>
              }
              defaultValue={""}
              maxLength={100}
              onChangeComment={handleChangeComment}
              isDisable={false}
              rowDisplay={3}
              isError={isError}
              hypterText={errorMessage}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 3 }}>
          <Button
            id="btnCancel"
            data-testid="testid-btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 80, mr: 2 }}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            data-testid="testid-btnSubmit"
            id="btnSubmit"
            variant="contained"
            color="primary"
            onClick={onSubmit}
            sx={{ borderRadius: 2, width: 80 }}
            disabled={isDisableBypass}
          >
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>
      <LoadingModal open={openLoadingModal.open} />
      <SnackbarStatus
        open={showSnackBar}
        onClose={() => setShowSnackBar(false)}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
        durationTime={1000}
      />
      <AlertError
        open={openAlert}
        onClose={() => {
          onClose();
          setOpenAlert(false);
        }}
        textError={textError}
        payload={null}
      />
    </>
  );
}

export default ModalBypassBySupport;
