import React, { ReactElement, useEffect } from "react";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import {
  Button,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Download, ErrorOutline, HighlightOff } from "@mui/icons-material";
import { useStyles } from "../../styles/makeTheme";
import { useAppDispatch } from "../../store/store";
import DatePickerComponent from "../commons/ui/date-picker-detail";
import ReasonsListDropDown from "./transfer-reasons-list-dropdown";
import {
  fetchDownloadTemplateRT,
  importStockRequest,
} from "../../services/stock-transfer";
import moment from "moment";
import LoadingModal from "../commons/ui/loading-modal";
import { ImportStockRequest } from "../../models/stock-transfer-model";
import { ApiUploadError } from "../../models/api-error-model";
import AlertError from "../commons/ui/alert-error";
import SnackbarStatus from "../commons/ui/snackbar-status";
import ConfirmModelExit from "../commons/ui/confirm-exit-model";

interface Props {
  isOpen: boolean;
  onClickClose: () => void;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

interface State {
  branchFrom: string;
  branchTo: string;
  dateFrom: string;
  dateTo: string;
  transferReason: string;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={{ m: 0, p: 3 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme: any) => theme.palette.grey[400],
          }}
        >
          <HighlightOff fontSize="large" />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

function stockRequestUploadFile({ isOpen, onClickClose }: Props): ReactElement {
  const [open, setOpen] = React.useState(isOpen);
  // const dispatch = useAppDispatch();
  const classes = useStyles();

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<boolean>(false);
  // const [clearBranchDropDown, setClearBranchDropDown] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<State>({
    branchFrom: "",
    branchTo: "",
    dateFrom: "",
    dateTo: "",
    transferReason: "",
  });

  useEffect(() => {
    setOpen(isOpen);
  }, [open]);

  const [flagEdit, setFlagEdit] = React.useState(false);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const handleChkEditClose = async () => {
    if (flagEdit) {
      setConfirmModelExit(true);
    } else {
      handleClose();
    }
  };

  const handleClose = async () => {
    onClickClose();
  };
  const handleNotExitModelConfirm = () => {
    setConfirmModelExit(false);
  };
  const handleExitModelConfirm = async () => {
    handleClose();
  };

  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const handleStartDatePicker = (value: any) => {
    setFlagEdit(true);
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setFlagEdit(true);
    setEndDate(value);
  };

  if (endDate != null && startDate != null) {
    if (endDate < startDate) {
      setEndDate(null);
    }
  }

  const handleChangeReasons = (ReasonsCode: string) => {
    setFlagEdit(true);
    if (ReasonsCode !== null) {
      let codes = JSON.stringify(ReasonsCode);
      setValues({ ...values, transferReason: JSON.parse(codes) });
    } else {
      setValues({ ...values, transferReason: "" });
    }
  };

  const handleDownloadTemplate = async () => {
    setOpenLoadingModal(true);
    await fetchDownloadTemplateRT()
      .then((value) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(value.data);
        a.download = `RT_TEMPLATE_${moment(new Date()).format(
          "YYYYMMDDhhmmss",
        )}.xlsx`;
        a.click();
      })
      .catch((error: any) => {
        console.log("fetchDownloadTemplateRT:", error);
      });

    // console.log('fetchDownloadTemplateRT response headers: ', (await response).headers['content-disposition']);
    // // const headerval = (await response).headers['content-disposition'])
    // // var filename = headerval.split(';')[1].split('=')[1].replace('"', '').replace('"', '');
    // console.log('fetchDownloadTemplateRT response data: ', (await response).data);

    setOpenLoadingModal(false);
  };

  const [errorUploadFile, setErrorUploadFile] = React.useState(false);
  const [errorBrowseFile, setErrorBrowseFile] = React.useState(false);
  const [msgErrorBrowseFile, setMsgErrorBrowseFile] = React.useState("");
  // const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [validationFile, setValidationFile] = React.useState(false);

  const [file, setFile] = React.useState<File>();
  const [fileName, setFileName] = React.useState("");

  const handleFileInputChange = (e: any) => {
    setFlagEdit(true);
    setValidationFile(false);
    setErrorBrowseFile(false);
    setMsgErrorBrowseFile("");
    // checkSizeFile(e);

    let file: File = e.target.files[0];
    // let file: File = e.target.files;
    setFileName(file.name);
    const chkValidation = chkValidationFile(file.name);
    if (chkValidation) setFile(file);

    // let fileType = file.type.split('/');
    // const fileName = `${sdNo}-01.${fileType[1]}`;
  };

  const chkValidationFile = (fileName: string) => {
    let parts = fileName.split(".");
    let length = parts.length - 1;

    if (parts[length].toLowerCase() !== "xlsx") {
      setValidationFile(true);
      setErrorBrowseFile(true);
      setMsgErrorBrowseFile("กรุณาแนบไฟล์.xlsx เท่านั้น");
      return false;
    }

    setValidationFile(false);
    setErrorBrowseFile(false);
    setMsgErrorBrowseFile("");
    return true;
  };

  const handleUpLoadFile = async () => {
    setOpenLoadingModal(true);

    if (!startDate || !endDate) {
      setOpenAlert(true);
      setTextError("กรุณาเลือกวันที่โอนสินค้า");
    } else if (
      values.transferReason === "All" ||
      values.transferReason === undefined ||
      values.transferReason === ""
    ) {
      setOpenAlert(true);
      setTextError("กรุณาเลือกสาเหตุการโอน");
    } else if (!file) {
      setOpenAlert(true);
      setTextError("กรุณาแนบไฟล์");
    } else {
      const payload: ImportStockRequest = {
        file: file,
        startDate: moment(startDate).startOf("day").toISOString(),
        endDate: moment(endDate).startOf("day").toISOString(),
        transferReason: values.transferReason,
      };

      if (file) {
        await importStockRequest(payload, file)
          .then((value) => {
            // setErrorUploadFile(false);

            setFlagEdit(false);
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("คุณได้Importข้อมูลเรียบร้อยแล้ว");

            setTimeout(() => {
              onClickClose();
            }, 1000);
          })
          .catch((error: ApiUploadError) => {
            setFile(undefined);
            setFileName("");

            if (errorUploadFile) setErrorUploadFile(false);
            else if (!errorUploadFile) setErrorUploadFile(true);

            if (error.code === 40000) {
              setOpenAlertFile(true);
              setOpenAlert(true);
              setTitelError("ไม่สามารถ import file ได้");
              setTextError("รูปแบบไฟล์ต้องเป็น excel format (.xlsx)");
              setBase64EncodeFile("");
              setLinkFileError(false);
            } else if (error.code === 40001) {
              setOpenAlertFile(true);
              setOpenAlert(true);
              setTitelError("ไม่สามารถ import file ได้");
              setTextError(error.message);
              setBase64EncodeFile("");
              setLinkFileError(false);
            } else if (error.code === 40013) {
              setOpenAlertFile(true);
              setOpenAlert(true);
              setTitelError("ไม่สามารถ import file ได้");
              setTextError("");

              const b64Data = error.data?.base64EncodeFile;
              if (b64Data) {
                setBase64EncodeFile(b64Data);
                setLinkFileError(true);
              }
            } else {
              setOpenAlertFile(true);
              setOpenAlert(true);
              setTitelError("ไม่สามารถ import file ได้");
              setTextError("");
              setBase64EncodeFile("");
              setLinkFileError(false);
            }
          });
      }
    }

    setOpenLoadingModal(false);
  };

  const handleDownloadErrorFile = () => {
    var contentType = "application/vnd.ms-excel";
    const blob = b64toBlob(base64EncodeFile, contentType);
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);

    a.download = `RT_TEMPLATE_${moment(new Date()).format(
      "YYYYMMDDhhmmss",
    )}.xlsx`;
    // a.text = 'ดาวน์โหลดผลการ import file คลิ๊กที่ link นี้';
    a.click();
    handleCloseAlert();
  };

  const b64toBlob = (b64Data: any, contentType = "", sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const [openAlertFile, setOpenAlertFile] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [titelError, setTitelError] = React.useState("");
  const [textError, setTextError] = React.useState("");
  const [linkFileError, setLinkFileError] = React.useState(false);
  const [base64EncodeFile, setBase64EncodeFile] = React.useState("");
  const handleCloseAlert = () => {
    setOpenAlertFile(false);
    setOpenAlert(false);
  };

  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  return (
    <div>
      <Dialog open={open} maxWidth="sm" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleChkEditClose}
        ></BootstrapDialogTitle>

        <DialogContent>
          <Grid container rowSpacing={2} columnSpacing={{ xs: 7 }}>
            <Grid item xs={12} mt={2} sx={{ textAlign: "end" }}>
              <Button
                id="btnImport"
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={handleDownloadTemplate}
                className={classes.MbtnSearch}
              >
                Download Template
              </Button>
            </Grid>
          </Grid>
          <Grid container rowSpacing={2} columnSpacing={{ xs: 4 }}>
            <Grid item xs={6}>
              <Typography gutterBottom variant="subtitle1" component="div">
                วันที่โอน
              </Typography>
              <Typography gutterBottom variant="subtitle1" component="div">
                ตั้งแต่*
              </Typography>
              <DatePickerComponent
                onClickDate={handleStartDatePicker}
                value={startDate}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                sx={{ mt: 3.5 }}
              >
                ถึง*
              </Typography>
              <DatePickerComponent
                onClickDate={handleEndDatePicker}
                value={endDate}
                type={"TO"}
                minDateTo={startDate}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                สาเหตุการโอน*
              </Typography>
              <ReasonsListDropDown
                onChangeReasons={handleChangeReasons}
                isClear={false}
                isDetail={true}
              />
            </Grid>

            <Grid item xs={12} mt={2}>
              <div>
                {errorBrowseFile === true && (
                  <>
                    <TextField
                      error
                      name="browserTxf"
                      className={classes.MtextFieldUpload}
                      value={fileName}
                      placeholder="แนบไฟล์ .xlsx"
                      helperText={msgErrorBrowseFile}
                    />
                  </>
                )}

                {errorBrowseFile === false && (
                  <>
                    <TextField
                      name="browserTxf"
                      className={classes.MtextFieldUpload}
                      value={fileName}
                      placeholder="แนบไฟล์ .xlsx"
                    />
                  </>
                )}

                {errorUploadFile === true && (
                  <>
                    <input
                      id="btnBrowse"
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileInputChange}
                      style={{ display: "none" }}
                    />
                  </>
                )}

                {errorUploadFile === false && (
                  <>
                    <input
                      id="btnBrowse"
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileInputChange}
                      style={{ display: "none" }}
                    />
                  </>
                )}
                <label htmlFor={"btnBrowse"}>
                  <Button
                    id="btnPrint"
                    color="primary"
                    variant="contained"
                    component="span"
                    className={classes.MbtnSearch}
                    style={{ marginLeft: 10, textTransform: "none" }}
                  >
                    แนบไฟล์
                  </Button>
                </label>
              </div>
            </Grid>

            <Grid item xs={12} mt={2} sx={{ textAlign: "center" }}>
              <Button
                id="btnImport"
                variant="contained"
                color="cancelColor"
                onClick={handleChkEditClose}
                sx={{ width: "20%", mr: 2 }}
                className={classes.MbtnClear}
              >
                ยกเลิก
              </Button>
              <Button
                id="btnImport"
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={handleUpLoadFile}
                className={classes.MbtnSearch}
                sx={{ width: "27%" }}
              >
                อัพโหลดเอกสาร
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <LoadingModal open={openLoadingModal} />
      {!openAlertFile && openAlert && (
        <AlertError
          open={openAlert}
          onClose={handleCloseAlert}
          textError={textError}
        />
      )}
      {openAlertFile && openAlert && (
        <Dialog
          open={openAlert}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogContent sx={{ padding: "1em" }}>
            <DialogContentText
              sx={{ textAlign: "center", whiteSpace: "pre-line" }}
            >
              <ErrorOutline sx={{ color: "#FF0000", fontSize: "4em" }} />
              <br />
              {titelError}
              <div style={{ color: "#FF0000" }}>{textError}</div>
              {linkFileError && (
                <Link
                  onClick={handleDownloadErrorFile}
                  style={{ color: "#FF0000", cursor: "pointer" }}
                >
                  ดาวน์โหลดผลการ import file คลิ๊กที่ link นี้
                </Link>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ display: "block", textAlign: "center" }}>
            <Button
              id="btnClose"
              variant="contained"
              color="error"
              sx={{
                borderRadius: "5px",
                display: `${linkFileError ? "none" : ""}`,
              }}
              onClick={handleCloseAlert}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />

      <ConfirmModelExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />
    </div>
  );
}

export default stockRequestUploadFile;
