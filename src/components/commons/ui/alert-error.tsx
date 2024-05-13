import React, { ReactElement, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import theme from "../../../styles/theme";
import { ErrorOutline } from "@mui/icons-material";
import {
  ErrorDetail,
  ErrorDetailResponse,
} from "../../../models/api-error-model";
import { numberWithCommas, stringNullOrEmpty } from "../../../utils/utils";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useStyles } from "../../../styles/makeTheme";

interface Props {
  open: boolean;
  onClose: () => void;
  textError: string;
  errorCode?: string;
  payload?: ErrorDetailResponse | null;
  title?: string;
}

export default function AlertError({
  open,
  onClose,
  textError,
  errorCode,
  payload,
  title,
}: Props): ReactElement {
  const classes = useStyles();
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ลำดับ",
      minWidth: 30,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,

      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          <Typography color="textSecondary" sx={{ fontSize: 12 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "barcode",
      headerName: "บาร์โค้ด",
      minWidth: 122,
      flex: 1,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
      hide: !payload?.header.field1,
      renderCell: (params) => {
        return (
          <div>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.value}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "toteCode",
      headerName: "เลข Tote",
      minWidth: 122,
      flex: 0.1,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
      hide: !payload?.header.field2,
      renderCell: (params) => {
        return (
          <div>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.value}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "productDetail",
      headerName: "รายละเอียด",
      // minWidth:
      //   payload?.header.field1 && payload?.header.field3
      //     ? 250
      //     : payload?.header.field1 || payload?.header.field3
      //     ? 250
      //     : 400,
      flex: 0.2,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
      hide: !payload?.header.field3,
      renderCell: (params) => {
        return (
          <div>
            <Typography variant="body2">{params.value}</Typography>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.row.skuCode || ""}
            </Typography>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.row.productName || ""}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {params.row.docNo || ""}
            </Typography>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.row.description || ""}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "qty",
      headerName: "จำนวน",
      headerAlign: "center",
      flex: 0.1,
      sortable: false,
      align: "right",
      hide: !payload?.header.field4,
      renderCell: (params) => {
        return (
          <Typography
            variant="body2"
            sx={{ color: "red", marginRight: "10px" }}
          >
            <b>
              {stringNullOrEmpty(params.value)
                ? ""
                : numberWithCommas(params.value)}
            </b>
          </Typography>
        );
      },
    },
  ];
  let rows: any = [];
  rows = payload?.error_details.map((item: ErrorDetail, index: number) => {
    return {
      id: index + 1,
      skuCode: item.skuCode,
      productName: item.productName,
      barcode: item.barcode,
      barcodeName: item.barcodeName,
      qty: item.qty,
      docNo: item.docNo,
      toteCode: item.toteCode,
      description: item.description,
    };
  });

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle
        data-testid="txtContent"
        sx={{ textAlign: "center", whiteSpace: "pre-wrap", color: "#000000" }}
      >
        <Box>
          <ErrorOutline sx={{ color: "#F54949", fontSize: "2em" }} />
          <br />
          <Typography
            sx={{ color: "red", fontSize: "18px", marginBottom: "8px" }}
          >
            {textError}
          </Typography>
        </Box>
        {!stringNullOrEmpty(title) && (
          <Box>
            <Typography
              sx={{ fontSize: "16px", color: "#000000", marginBottom: "5px" }}
            >
              {title}
            </Typography>
          </Box>
        )}
      </DialogTitle>
      {payload?.error_details && payload.error_details.length > 0 && (
        <DialogContent sx={{ paddingBottom: "0", marginBottom: "10px" }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{ width: "100%" }}
              className={classes.MdataGridPaginationTop}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                pagination
                autoHeight
                rowHeight={67}
                disableColumnMenu
              />
            </div>
          </Box>
        </DialogContent>
      )}
      <DialogActions
        sx={{ justifyContent: "center", margin: "10px 0px 20px 0px" }}
      >
        <Button
          data-testid="btnClose"
          id="btnClose"
          variant="contained"
          color="error"
          sx={{ borderRadius: "5px", width: "126px" }}
          autoFocus
          onClick={onClose}
        >
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
