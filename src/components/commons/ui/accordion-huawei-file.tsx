import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

import theme from "../../../styles/theme";
import { ApiError } from "../../../models/api-error-model";
import { getFileUrlHuawei } from "../../../services/master-service";
import ModalShowHuaweiFile from "../../commons/ui/modal-show-huawei-file";
import { FileType } from "../../../models/supplier-check-order-model";

interface Props {
  files: FileType[];
}

const AccordionHuaweiFile = ({ files }: Props) => {
  // console.log({ files });
  const [accordionFile, setAccordionFile] = useState<boolean>(false);
  const [displayFile, setDisplayFile] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [newFilename, setNewFilename] = useState<string>("test-rename");
  const [isImage, setIsImage] = useState(false);

  async function getHuaweiFileUrl(item: FileType) {
    await getFileUrlHuawei(item.fileKey, item.branchCode)
      .then((resp) => {
        if (resp && resp.data) {
          setFileUrl(resp.data);
          setIsImage(item.mimeType === "image/jpeg");
          setNewFilename(item.fileName);
          setDisplayFile(true);
        }
      })
      .catch((error: ApiError) => {
        console.log("error", error);
      });
  }

  return (
    <>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: "5px",
          border: `1px dashed ${theme.palette.primary.main}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
          onClick={() => {
            if (files && files.length > 0) setAccordionFile(!accordionFile);
          }}
        >
          <Typography sx={{ fontSize: "14px", color: "#676767" }}>
            เอกสารแนบ จำนวน {files.length}/5
          </Typography>
          {accordionFile ? (
            <KeyboardArrowUp color="primary" />
          ) : (
            <KeyboardArrowDown color="primary" />
          )}
        </Box>

        <Box sx={{ display: accordionFile ? "visible" : "none" }}>
          {files &&
            files.length > 0 &&
            files.map((item, index) => (
              <Box
                key={`item-${index + 1}-${item.fileKey}`}
                component="a"
                href={void 0}
                sx={{
                  color: theme.palette.secondary.main,
                  cursor: "pointer",
                }}
                onClick={() => getHuaweiFileUrl(item)}
              >
                <Typography
                  color="secondary"
                  sx={{
                    textDecoration: "underline",
                    fontSize: "13px",
                    whiteSpace: "normal",
                  }}
                  noWrap
                >
                  {item.fileName}
                </Typography>
              </Box>
            ))}
        </Box>
      </Box>

      <ModalShowHuaweiFile
        open={displayFile}
        onClose={() => setDisplayFile(false)}
        fileName={newFilename}
        url={fileUrl}
        isImage={isImage}
      />
    </>
  );
};

export default AccordionHuaweiFile;
