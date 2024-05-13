import React, { useEffect } from "react";
import { useAppSelector } from "../../store/store";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { useStyles } from "../../styles/makeTheme";
import moment from "moment";
import { DateFormat } from "../../utils/enum/common-enum";
import {
  Button,
  Divider,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { MoreVertOutlined } from "@mui/icons-material";
import { FileType } from "../../models/supplier-check-order-model";
import { getFileUrlHuawei } from "../../services/master-service";
import ModalShowHuaweiFile from "../commons/ui/modal-show-huawei-file";
import { useTranslation } from "react-i18next";

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 80,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ paddingLeft: "20px" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "name",
    headerName: "ชื่อผู้ทำรายการ",
    minWidth: 150,
    flex: 0.4,
    headerAlign: "center",
    align: "left",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "position",
    headerName: "ตำแหน่ง",
    minWidth: 150,
    flex: 0.2,
    headerAlign: "center",
    align: "left",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "type",
    headerName: "ประเภท",
    minWidth: 150,
    flex: 0.2,
    headerAlign: "center",
    align: "left",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "printNo",
    headerName: "พิมพ์ครั้งที่",
    minWidth: 120,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "date",
    headerName: "พิมพ์วันที่/เวลา",
    minWidth: 150,
    headerAlign: "center",
    align: "left",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "action",
    headerName: " ",
    width: 40,
    align: "center",
    sortable: false,
    renderCell: (params) => handleModelAction(params),
  },
];

const handleModelAction = (params: GridRenderCellParams) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleMenuClose = async () => {
    setAnchorEl(null);
  };
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [displayFile, setDisplayFile] = React.useState(false);
  const [fileUrl, setFileUrl] = React.useState<string>("");
  const [newFilename, setNewFilename] = React.useState<string>("test-rename");
  const [isImage, setIsImage] = React.useState(false);
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
      .catch((error: any) => {
        console.log("getFileUrlHuawei error", error);
      });
  }

  const printNo: any = params.getValue(params.id, "printNo");
  const fileList: any = params.getValue(params.id, "files");
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuList sx={{ width: 300 }}>
          <MenuItem>
            <Typography variant="body1">เอกสารแนบ</Typography>
          </MenuItem>
          <Divider />

          {fileList &&
            fileList.length > 0 &&
            fileList.map((item: any, index: number) => (
              <MenuItem
                key={`item-${index + 1}-${item.fileKey}`}
                onClick={() => getHuaweiFileUrl(item)}
              >
                <Typography
                  color="secondary"
                  sx={{ textDecoration: "underline", fontSize: "13px" }}
                >
                  {item.fileName}
                </Typography>
              </MenuItem>
            ))}
        </MenuList>
      </Menu>

      <ModalShowHuaweiFile
        open={displayFile}
        onClose={() => setDisplayFile(false)}
        fileName={newFilename}
        url={fileUrl}
        isImage={isImage}
        isPrint={false}
      />
    </>
  );

  if (printNo === 1) {
    return "";
  }

  return (
    <>
      <Button onClick={handleMenuOpen}>
        <MoreVertOutlined sx={{ color: "#263238" }} />
      </Button>

      {renderMenu}
    </>
  );
};

export default function TaxInvoiceHistory() {
  const classes = useStyles();
  const { t } = useTranslation(["taxInvoice", "common"]);
  const taxInvoicePrintHistory = useAppSelector(
    (state) => state.taxInvoicePrintHistory.detail,
  );
  const historyDetail: any = taxInvoicePrintHistory.data
    ? taxInvoicePrintHistory.data
    : [];

  let rows: any = [];
  if (historyDetail.length > 0) {
    rows = historyDetail.map((item: any, index: number) => {
      return {
        id: `${item.skuCode}-${index + 1}`,
        index: index + 1,
        name: item.printedByName,
        position: item.printedByPosition,
        type: t(`type.${item.type}`),
        printNo: item.edition,
        date: moment(item.printedDate).format(
          DateFormat.DATE_TIME_DISPLAY_FORMAT,
        ),
        action: "",
        files: item.files,
      };
    });
  }

  useEffect(() => {}, []);

  const [pageSize, setPageSize] = React.useState<number>(10);

  return (
    <>
      <Typography ml={1} mb={2} variant="h6">
        ประวัติการพิมพ์ใบกำกับภาษี
      </Typography>
      <div
        style={{ width: "100%", height: rows.length >= 8 ? "80vh" : "auto" }}
        className={classes.MdataGridDetail}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          pagination
          disableColumnMenu
          autoHeight={rows.length >= 8 ? false : true}
          scrollbarSize={10}
          rowHeight={65}
        />
      </div>
    </>
  );
}
