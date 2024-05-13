import React, { ReactElement, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import LoadingModal from "../commons/ui/loading-modal";
import { TextField } from "@mui/material";
import { stringNullOrEmpty } from "../../utils/utils";
import { useStyles } from "../../styles/makeTheme";
import { approveTransferOutRM } from "../../services/transfer-out";
import AlertError from "../commons/ui/alert-error";
import _ from "lodash";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  headerTitle: string;
  payload: any;
}

interface loadingModalState {
  open: boolean;
}

export default function ModalAskingPassword(props: Props): ReactElement {
  const { open, onClose, onConfirm, headerTitle, payload } = props;
  const classes = useStyles();
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const [alertTextError, setAlertTextError] = React.useState("");
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleConfirm = async () => {
    handleOpenLoading("open", true);
    setAlertTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    try {
      const payloadAskingPassword = _.cloneDeep(payload);
      payloadAskingPassword.password = password;
      const rs = await approveTransferOutRM(
        payloadAskingPassword.id,
        payloadAskingPassword,
      );
      if (rs.code === 20000) {
        onConfirm();
      } else if (rs.code === 40000) {
        setError("กรุณาตรวจสอบ password และลองอีกครั้ง");
      } else {
        setOpenModalError(true);
      }
    } catch (error) {
      setOpenModalError(true);
    }
    handleOpenLoading("open", false);
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        PaperProps={{ sx: { minWidth: 492, minHeight: 262 } }}
      >
        <DialogContent sx={{ mt: 3, mr: 5, ml: 5 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h6" align="center" sx={{ marginBottom: 3 }}>
              {headerTitle}
            </Typography>
            <TextField
              type={"password"}
              error={!stringNullOrEmpty(error)}
              helperText={error}
              FormHelperTextProps={{
                style: {
                  textAlign: "right",
                  marginRight: 0,
                },
              }}
              className={classes.MtextField}
              variant="outlined"
              size="small"
              fullWidth
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
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
      <AlertError
        open={openModalError}
        onClose={() => {
          setOpenModalError(false);
        }}
        textError={alertTextError}
      />
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}
