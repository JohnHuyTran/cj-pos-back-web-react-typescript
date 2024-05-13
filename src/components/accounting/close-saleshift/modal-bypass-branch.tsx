import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import { stringNullOrEmpty } from "utils/utils";
import { byPassByBranch } from "services/accounting";
import { ApiError } from "models/api-error-model";
import LoadingModal from "components/commons/ui/loading-modal";
import { featchCloseSaleShiptListAsync } from "store/slices/accounting/close-saleshift-slice";
import store, { useAppDispatch } from "store/store";
import SnackbarStatus from "components/commons/ui/snackbar-status";
import { BypassPayload } from "models/branch-accounting-model";

interface Props {
  open: boolean;
  onClose: () => void;
  onCallBack: () => void;
}

function ModalByPassByBranch({ open, onClose, onCallBack }: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [qrcode, setQrcode] = React.useState("");
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
  const onChange = (e: any) => {
    setQrcode(e.target.value);
    setIsDisableBypass(false);
    setIsError(false);
    setErrorMessage("");
  };

  const onSubmit = async () => {
    handleOpenLoading("open", true);
    if (stringNullOrEmpty(qrcode)) {
      setErrorMessage("ข้อมูล Bypass ไม่ถูกต้อง");
      setIsError(true);
    } else {
      const payload: BypassPayload = {
        payload: qrcode,
      };
      await byPassByBranch(payload)
        .then(async (value) => {
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("ส่งคำร้องขอ เรียบร้อยแล้ว");
          setTimeout(() => {
            onClose();
            onCallBack();
          }, 500);
        })
        .catch((error: ApiError) => {
          setIsError(true);
          setErrorMessage(error.message);
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
    setQrcode("");
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
        <BootstrapDialogTitle id="dialog-title" onClose={onClose}>
          <Typography
            sx={{ fontSize: 20, fontWeight: 400, textAlign: "center" }}
          >
            Bypass
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ justifyContent: "center" }}>
          <Box>
            <Typography
              variant="body2"
              color="primary"
              sx={{ textAlign: "center" }}
            >
              กรุณาสแกน QR Code เพื่อ Bypass
            </Typography>
          </Box>
          <Box>
            <TextField
              data-testid="testid-tbx-qrcode"
              name="tbxQrcode"
              size="small"
              error={isError}
              value={qrcode}
              onChange={onChange}
              className={classes.MtextField}
              sx={{ mt: 1 }}
              fullWidth
              autoFocus={true}
              autoComplete="off"
              //   disabled={true}
              //   inputProps={{ readOnly: true }}
            />
            {errorMessage && (
              <Typography
                variant="body2"
                component="div"
                color="error"
                sx={{ textAlign: "center" }}
              >
                {errorMessage}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 3 }}>
          <Button
            data-testid="testid-btnSubmit"
            id="btnSubmit"
            variant="contained"
            color="primary"
            onClick={onSubmit}
            sx={{ width: 110, ml: 2 }}
            className={classes.MbtnSearch}
            disabled={isDisableBypass}
          >
            บันทึกรหัส
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
    </>
  );
}

export default ModalByPassByBranch;
