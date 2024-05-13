import React, { ReactElement, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import LoadingModal from "../commons/ui/loading-modal";
import { Box } from "@mui/system";
import { Grid, TextField } from "@mui/material";
import { useStyles } from "../../styles/makeTheme";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  HQCode: string;
  headerTitle: string;
  status: number;
  remark: string;
  setRemark: (remark: string) => void;
  error?: boolean;
}
interface loadingModalState {
  open: boolean;
}

export default function ModelConfirm({
  open,
  remark,
  setRemark,
  status,
  onClose,
  onConfirm,
  HQCode,
  headerTitle,
  error,
}: Props): ReactElement {
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const [errorRemark, setErrorRemark] = React.useState(false);
  const classes = useStyles();
  const [characterCount, setCharacterCount] = React.useState(0);

  const handleChangeComment = (event: any) => {
    const value = event.target.value;
    const length = event.target.value.length;
    if (length <= 100) {
      setCharacterCount(event.target.value.length);
      // setComment(value);
    }
    return setRemark(value);
  };

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  useEffect(() => {
    setErrorRemark(false);
  }, [remark]);

  const handleConfirm = async () => {
    if (status > 1 && !remark) {
      setErrorRemark(true);
    } else {
      handleOpenLoading("open", true);
      await onConfirm();
      handleOpenLoading("open", false);
      onClose();
    }
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
            {!!HQCode && (
              <Typography variant="h6" align="center">
                เลขที่เอกสาร ST{" "}
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
                  <b>{HQCode}</b>
                </label>
              </Typography>
            )}
            {status === 2 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={5}>
                    <Typography variant="body2">
                      กรุณากรอกเหตุผล<span style={{ color: "red" }}>*</span>:{" "}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" sx={{ color: "red" }}>
                      {errorRemark && "กรุณาระบุรายละเอียด"}
                    </Typography>
                  </Grid>
                </Grid>

                <TextField
                  multiline
                  fullWidth
                  rows={4}
                  onChange={handleChangeComment}
                  defaultValue={remark}
                  placeholder={`ความยาวไม่เกิน 100 ตัวอักษร`}
                  className={classes.MtextFieldRemark}
                  inputProps={{ maxLength: 100 }}
                  sx={{ maxWidth: 350 }}
                  error={errorRemark}
                />

                <div
                  style={{
                    fontSize: "11px",
                    color: "#AEAEAE",
                    width: "100%",
                    maxWidth: 350,
                    textAlign: "right",
                    // marginTop: "-1.5em",
                  }}
                >
                  {characterCount}/{100}
                </div>
              </Box>
            )}
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
