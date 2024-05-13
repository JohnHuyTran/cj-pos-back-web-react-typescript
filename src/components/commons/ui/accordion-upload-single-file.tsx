import React, { ReactElement, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

import theme from "../../../styles/theme";
import { useStyles } from "../../../styles/makeTheme";

import ModalAlert from "../../modal-alert";
import { uploadFileState } from "../../../store/slices/upload-file-slice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { FileType } from "../../../models/supplier-check-order-model";
import { ApiError } from "../../../models/api-error-model";
import { getFileUrlHuawei } from "../../../services/master-service";
import ModalShowHuaweiFile from "../../commons/ui/modal-show-huawei-file";

interface fileDisplayList {
  branchCode?: string;
  file?: File;
  fileKey?: string;
  fileName?: string;
  status?: string;
  mimeType?: string;
}

interface Props {
  files: FileType[];
  isStatus?: boolean;
  disabledControl: boolean;
  idControl?: string; //set id for in case use more than 1 upload component in 1 form
}

function AccordionUploadSingleFile({
  files,
  isStatus,
  disabledControl,
  idControl,
}: Props): ReactElement {
  const classes = useStyles();

  const dispatch = useAppDispatch();
  const [accordionFile, setAccordionFile] = useState<boolean>(false);

  const [displayFile, setDisplayFile] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");

  const [newFilename, setNewFilename] = useState<string>("test-rename");
  const [isImage, setIsImage] = useState(false);

  const [validationFile, setValidationFile] = React.useState(false);
  const [errorBrowseFile, setErrorBrowseFile] = React.useState(false);
  const [msgErrorBrowseFile, setMsgErrorBrowseFile] = React.useState("");
  const [fileList, setFileList] = React.useState<File[]>([]);

  const [statusSaveFile, setStatusSaveFile] = useState<boolean>(false);
  const [statusUpload, setStatusUpload] = useState<boolean>(false);

  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);

  const checkSizeFile = (e: any) => {
    // console.log('e.target.files: ', e.target.files);
    const fileSize = e.target.files[0].size;
    const fileName = e.target.files[0].name;
    let parts = fileName.split(".");
    let length = parts.length - 1;
    let checkError: boolean = false;

    //match file name
    const matchFilename: any = newFileDisplayList.find(
      (r: any) => r.fileName === fileName,
    );
    if (newFileDisplayList.length > 0 && matchFilename) {
      setErrorBrowseFile(true);
      setMsgErrorBrowseFile(
        "ไม่สามารถอัพโหลดไฟล์ได้ เนื่องจากไฟล์นี้มีอยู่แล้ว",
      );
      return (checkError = true);
    }

    // pdf, .jpg, .jpeg
    if (parts[length].toLowerCase() !== "pdf") {
      setErrorBrowseFile(true);
      setMsgErrorBrowseFile("ไม่สามารถอัพโหลดไฟล์ได้ กรุณาแนบไฟล์.pdfเท่านั้น");

      return (checkError = true);
    }

    // 1024 = bytes
    // 1024*1024*1024 = mb
    let mb = 1024 * 1024 * 1024;
    // fileSize = mb unit
    if (fileSize < mb) {
      //size > 5MB
      let size = fileSize / 1024 / 1024;
      if (size > 50) {
        setErrorBrowseFile(true);
        setMsgErrorBrowseFile(
          "ไม่สามารถอัพโหลดไฟล์ได้ เนื่องจากขนาดไฟล์เกิน 50MB กรุณาเลือกไฟล์ใหม่",
        );
        return (checkError = true);
      }
    }
  };

  const handleFileInputChange = (e: any) => {
    setStatusUpload(true);
    setStatusSaveFile(false);
    setValidationFile(false);
    setErrorBrowseFile(false);
    setMsgErrorBrowseFile("");
    const isCheckError = checkSizeFile(e);

    let files: File = e.target.files[0];

    if (!isCheckError) {
      setStatusUpload(true);
      setStatusSaveFile(false);
      setAccordionFile(true);
      setFileList([files]);
    }
  };

  let newFileDisplayList: any = [];

  useEffect(() => {
    dispatch(uploadFileState(fileList));
    // setStatusSaveFile(isStatus);

    if (newFileDisplayList.length > 0) {
      setAccordionFile(true);
    }
  }, [fileList, !isStatus]);

  function getHuaweiFileUrl(item: fileDisplayList) {
    const keys = item.fileKey ? item.fileKey : "";
    const branchCode = item.branchCode ? item.branchCode : "";
    const name = item.fileName ? item.fileName : "";

    if (item.status === "old") {
      getFileUrlHuawei(keys, branchCode)
        .then((resp) => {
          if (resp && resp.data) {
            setFileUrl(resp.data);
            setIsImage(item.mimeType === "image/jpeg");
            setNewFilename(name);
            setDisplayFile(true);
          }
        })
        .catch((error: ApiError) => {
          console.log("error", error);
          setErrorBrowseFile(true);
          setMsgErrorBrowseFile(error.message);
        });
    }
  }

  const mapHuaweiFile = (file: any) => {
    newFileHuawei = file.map((data: FileType, index: number) => {
      return {
        file: null,
        fileKey: data.fileKey,
        fileName: data.fileName,
        status: "old",
        mimeType: data.mimeType,
        branchCode: data.branchCode,
      };
    });
  };

  let newFileHuawei: any = [];
  let newFileUpload: any = [];

  if (files && files.length > 0) {
    mapHuaweiFile(files);
  }

  if (fileList.length > 0) {
    newFileUpload = fileList.map((data: File, index: number) => {
      return {
        file: data,
        fileKey: "",
        fileName: data.name,
        status: "new",
        mimeType: "",
      };
    });
  }

  if (isStatus) {
    newFileDisplayList = [...newFileHuawei];
  } else {
    if (newFileUpload.length > 0) {
      // newFileDisplayList = [...newFileHuawei, ...newFileUpload];
      newFileDisplayList = [...newFileUpload];
    } else {
      newFileDisplayList = [...newFileHuawei];
    }
  }

  const handleFileInputClick = (e: any) => {
    //handle attach file again after remove this file
    e.target.value = "";
  };

  const closeDialogConfirm = (value: string) => {
    setErrorBrowseFile(false);
  };

  return (
    <>
      <Grid
        container
        spacing={0.5}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={9}>
          <input
            id={"btnBrowseFile"}
            data-testid="testid-tbxBrowse"
            type="file"
            accept=".pdf"
            onClick={handleFileInputClick}
            onChange={handleFileInputChange}
            style={{ display: "none" }}
            disabled={disabledControl}
          />

          <Box
            sx={{
              px: 1,
              py: 1,
              mt: 0,
              borderRadius: "5px",
              border: `1px dashed ${theme.palette.primary.main}`,
            }}
          >
            {newFileDisplayList.length === 0 && (
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#676767",
                  whiteSpace: "normal",
                }}
                noWrap
              >
                แนบไฟล์รวมไม่เกิน 50 MB
              </Typography>
            )}

            {newFileDisplayList.length > 0 &&
              newFileDisplayList.map((item: fileDisplayList, index: number) => (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                >
                  {item.status === "old" && (
                    <Typography
                      color="secondary"
                      sx={{
                        textDecoration: "underline",
                        fontSize: "13px",
                        whiteSpace: "normal",
                      }}
                      noWrap
                      onClick={() => getHuaweiFileUrl(item)}
                    >
                      {item.fileName}
                    </Typography>
                  )}

                  {item.status === "new" && (
                    <Typography
                      color="secondary"
                      sx={{ fontSize: "13px", whiteSpace: "normal" }}
                      noWrap
                    >
                      {item.fileName}
                    </Typography>
                  )}

                  {/* <Typography color="secondary" sx={{ fontSize: '13px', whiteSpace: 'normal' }} noWrap>
                    {item.fileName}
                  </Typography> */}
                </Box>
              ))}
          </Box>
        </Grid>

        <Grid item xs={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <label htmlFor={"btnBrowseFile"}>
              <Button
                data-testid="testid-btnBrowse"
                variant="contained"
                color="primary"
                className={classes.MbtnBrowseSmall}
                disabled={disabledControl}
                size="small"
                component="span"
              >
                แนบไฟล์
              </Button>
            </label>
          </Box>
        </Grid>
      </Grid>

      <ModalShowHuaweiFile
        open={displayFile}
        onClose={() => setDisplayFile(false)}
        fileName={newFilename}
        url={fileUrl}
        isImage={isImage}
      />

      <ModalAlert
        open={errorBrowseFile}
        onClose={closeDialogConfirm}
        errormsg={msgErrorBrowseFile}
      />
    </>
  );
}

export default AccordionUploadSingleFile;
