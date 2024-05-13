import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import TextBoxComment from "components/commons/ui/textbox-comment";
import React from "react";
import { stringNullOrEmpty } from "utils/utils";
interface Props {
  docNo: string;
  open: boolean;
  onClose: () => void;
  onCallBack: (comment: string) => void;
}
function ModalReject({ open, docNo, onClose, onCallBack }: Props) {
  const [comment, setComment] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [isDisableSubmitBtn, setIsDisableSubmitBtn] = React.useState(true);
  const handleChangeComment = (value: any) => {
    setComment(value);
    if (!stringNullOrEmpty(value)) {
      setIsDisableSubmitBtn(false);
      setIsError(false);
      setErrorMessage("");
    } else {
      setIsDisableSubmitBtn(true);
    }
  };

  const onSubmit = () => {
    onCallBack(comment);
  };

  React.useEffect(() => {
    setComment("");
    setIsError(false);
    setErrorMessage("");
    setIsDisableSubmitBtn(true);
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
            ยืนยันไม่อนุมัติรับสินค้า
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ justifyContent: "center" }}>
          <Box>
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              เลขที่เอกสาร: {docNo}
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
            disabled={isDisableSubmitBtn}
          >
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModalReject;
