import { Fragment, ReactElement, useState } from "react";
import TextBoxComment from "components/commons/ui/textbox-comment";
import {
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useStyles } from "styles/makeTheme";
interface ModalConfirmExpenseProps {
  open: boolean;
  details: {
    docNo: string;
    type: string;
    period: string;
    sumWithdrawAmount: string;
  };
  onClose: () => void;
  onCallBackFunction: (value: any) => void;
  approve: boolean; // flag show label
  showForward?: boolean; // show dropdown resend
  showReason?: boolean; // show comment
  validateReason?: boolean; // require  comment
  isAllowForwardOC?: boolean;
}

interface DetailsProps {
  topic: string;
  detail: string;
}

export default function ModalConfirmExpense(
  props: ModalConfirmExpenseProps,
): ReactElement {
  const {
    open,
    details,
    approve,
    onClose,
    onCallBackFunction,
    showForward,
    showReason,
    validateReason,
    isAllowForwardOC,
  } = props;
  const classes = useStyles();
  const forwardList = [
    { key: "MANAGER", text: "สาขา", isShowOption: true },
    { key: "OC", text: "OC", isShowOption: isAllowForwardOC },
  ];

  // Set state data
  const [forward, setForward] = useState("");
  const [reason, setReason] = useState("");
  const [isError, setIsError] = useState(false);
  const [isOpenLoading, setIsOpenLoading] = useState(false);

  // Check confirm modal
  const handleConfirm = () => {
    let isForwardValidate = false;
    let isReasonValidate = false;
    if (showForward) {
      isForwardValidate = forward === "" ? true : false;
    }
    if (showReason && validateReason) {
      isReasonValidate = reason === "" ? true : false;
    }
    setIsError(true);

    // Call API
    if (!isForwardValidate && !isReasonValidate) {
      setIsError(false);
      setIsOpenLoading(true);
      onCallBackFunction({ forward, reason });
      setIsOpenLoading(false);
      onCloseModal();
    }
  };

  // Clear state when close modal.
  const onCloseModal = () => {
    onClose();
    setForward("");
    setReason("");
    setIsError(false);
  };

  return (
    <Fragment>
      <Dialog
        id="ModalConfirmExpense"
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
              {approve
                ? "ยืนยันขออนุมัติค่าใช้จ่าย"
                : "ยืนยันไม่อนุมัติค่าใช้จ่าย"}
            </Typography>
          </DialogContentText>
          <Box id="Description">
            <Details topic="เลขที่เอกสาร" detail={details?.docNo} />
            <Details topic="ประเภทค่าใช้จ่าย" detail={details?.type} />
            <Details topic="งวด" detail={details?.period} />
            <Details
              topic="ยอดเบิกทั้งหมด"
              detail={details?.sumWithdrawAmount}
            />
          </Box>
          {showForward && (
            <Box sx={{ mt: 3 }}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                sx={{ mb: "5px" }}
              >
                ส่งกลับแก้ไขให้กับ{" "}
                <Typography component="span" color="red">
                  *
                </Typography>
              </Typography>
              <FormControl
                id="SearchType"
                className={classes.Mselect}
                fullWidth
                error={forward === "" && isError}
              >
                <Select
                  id="type"
                  name="type"
                  value={forward}
                  disabled={isOpenLoading}
                  onChange={(e) => setForward(e.target.value)}
                  displayEmpty
                  renderValue={
                    forward !== ""
                      ? undefined
                      : () => (
                          <div style={{ color: "#CBD4DB" }}>
                            กรุณาเลือกส่งกลับแก้ไขให้กับ
                          </div>
                        )
                  }
                  inputProps={{ "aria-label": "Without label" }}
                >
                  {forwardList.map(
                    (item, index: number) =>
                      item.isShowOption && (
                        <MenuItem key={index} value={item.key}>
                          {item.text}
                        </MenuItem>
                      ),
                  )}
                </Select>
                {forward === "" && isError && (
                  <FormHelperText sx={{ ml: 0 }}>
                    กรุณาเลือกส่งกลับแก้ไขให้กับ
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
          )}
          {showReason && (
            <Box sx={{ mt: 3 }}>
              <TextBoxComment
                fieldName={
                  <Box>
                    หมายเหตุ :{" "}
                    {validateReason && (
                      <Typography component="span" color="red">
                        *
                      </Typography>
                    )}
                  </Box>
                }
                defaultValue={reason}
                isDisable={isOpenLoading}
                maxLength={100}
                maxWidth="100%"
                isError={!reason && validateReason ? isError : false}
                onChangeComment={(e) => {
                  setReason(e);
                }}
                rowDisplay={2}
              />
              {!reason && validateReason && isError && (
                <Typography
                  component="label"
                  variant="caption"
                  sx={{ color: "#F54949" }}
                >
                  กรุณาระบุหมายเหตุ
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 5, mr: 5, ml: 5 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            disabled={isOpenLoading}
            sx={{ borderRadius: 2, width: 140, mr: 4 }}
            onClick={onCloseModal}
          >
            ยกเลิก
          </Button>
          <LoadingButton
            id="btnConfirm"
            variant="contained"
            color="primary"
            loading={isOpenLoading}
            loadingIndicator={
              <Typography component="span" sx={{ fontSize: "11px" }}>
                กรุณารอสักครู่ <CircularProgress color="inherit" size={15} />
              </Typography>
            }
            sx={{ borderRadius: 2, width: 140 }}
            onClick={handleConfirm}
          >
            ยืนยัน
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

const Details = ({ topic, detail }: DetailsProps) => {
  return (
    <Box
      id="DetailBox"
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <Box id="DetailTitle" sx={{ width: "55%", textAlign: "right" }}>
        {topic}
      </Box>
      <Box id="DetailLine">
        <Typography
          component="label"
          sx={{ color: "#AEAEAE", ml: "18px", mr: "5px" }}
        >
          |
        </Typography>
      </Box>
      <Box id="DetailDescription" sx={{ width: "100%" }}>
        <Typography
          component="label"
          sx={{ color: "#36C690", fontWeight: "700" }}
        >
          {detail || "-"}
        </Typography>
      </Box>
    </Box>
  );
};
