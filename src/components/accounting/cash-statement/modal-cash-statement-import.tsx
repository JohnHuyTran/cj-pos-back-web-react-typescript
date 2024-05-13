import React, { ReactElement, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import LoadingModal from "../../commons/ui/loading-modal";
import { useStyles } from "styles/makeTheme";
import { BootstrapDialogTitle } from "components/commons/ui/dialog-title";
import { Box, Grid, TextField, Typography } from "@mui/material";
import { Download, UploadFile } from "@mui/icons-material";
import moment from "moment";
import { ApiUploadError } from "models/api-error-model";
import { downloadTemplateCS, importCashStatement } from "services/accounting";

interface Props {
  open: boolean;
  onClickClose: () => void;
  onConfirm: (files: any) => void;
  errorUploadFile: boolean;
}
interface loadingModalState {
  open: boolean;
}

export default function ModalCashStatementImport({
  open,
  onClickClose,
  onConfirm,
  errorUploadFile,
}: Props): ReactElement {
  const classes = useStyles();
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);

  useEffect(() => {
    console.log("open:", open);
  }, [open === true]);

  const handleDownloadTemplate = async () => {
    setOpenLoadingModal(true);
    await downloadTemplateCS()
      .then((value) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(value.data);
        a.download = `FINANCE_RESULT_${moment(new Date()).format(
          "YYYYMMDDhhmmss",
        )}.xlsx`;
        a.click();
      })
      .catch((error: any) => {
        console.log("downloadTemplateCS:", error);
      });

    setOpenLoadingModal(false);
  };

  const [errorBrowseFile, setErrorBrowseFile] = React.useState(false);
  const [msgErrorBrowseFile, setMsgErrorBrowseFile] = React.useState("");
  const [validationFile, setValidationFile] = React.useState(false);
  const [file, setFile] = React.useState<File>();
  const [fileName, setFileName] = React.useState("");

  const handleFileInputChange = (e: any) => {
    // setFlagEdit(true);
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
    setFileName("");
    return onConfirm(file ? file : null);
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        PaperProps={{ sx: { minWidth: 700 } }}
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={onClickClose}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, pl: 4 }}>
            นำเข้าเอกสาร
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ mr: 4, ml: 4, mt: -3 }}>
          <Grid container columnSpacing={{ xs: 7 }}>
            <Grid item xs={12} sx={{ textAlign: "end" }}>
              <Button
                id="btnImport"
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={handleDownloadTemplate}
                className={classes.MbtnSearch}
                style={{ minWidth: 150 }}
              >
                Download Template
              </Button>
            </Grid>
          </Grid>

          <Grid
            container
            rowSpacing={2}
            columnSpacing={{ xs: 4 }}
            mt={1}
            mb={2}
          >
            <Grid item xs={6}>
              <div>
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
                  {fileName === "" && (
                    <Box
                      component="div"
                      sx={{
                        borderRadius: "5px !important",
                        border: "2px dashed #36C690 !important",
                        padding: "0 4px !important",
                        width: "455px",
                        height: 35,
                        textAlign: "center",
                      }}
                    >
                      <UploadFile fontSize="small" sx={{ color: "#EAEBEB" }} />
                      <label style={{ color: "#AEAEAE", fontSize: 12 }}>
                        {" "}
                        กรุณาเลือกไฟล์ที่ต้องการนำเข้า
                      </label>
                    </Box>
                  )}
                  {fileName !== "" && errorBrowseFile === true && (
                    <Box
                      component="div"
                      sx={{
                        borderRadius: "5px !important",
                        border: "2px dashed #FF0000 !important",
                        padding: "4px !important",
                        width: "455px",
                        height: 35,
                      }}
                    >
                      {fileName}
                    </Box>
                  )}
                  {fileName !== "" && errorBrowseFile === false && (
                    <Box
                      component="div"
                      sx={{
                        borderRadius: "5px !important",
                        border: "2px dashed #36C690 !important",
                        padding: "4px !important",
                        width: "455px",
                        height: 35,
                      }}
                    >
                      {fileName}
                    </Box>
                  )}

                  <label style={{ fontSize: 12, color: "#676767" }}>
                    แนบไฟล์ .xlsx
                  </label>
                </label>
              </div>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: "end" }}>
              <Button
                id="btnImport"
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={handleUpLoadFile}
                className={classes.MbtnSearch}
                sx={{ minWidth: 200 }}
                disabled={fileName === ""}
              >
                อัพโหลดเอกสาร
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <LoadingModal open={openLoadingModal} />
    </div>
  );
}
