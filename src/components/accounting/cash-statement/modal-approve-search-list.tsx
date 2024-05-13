import React, { Fragment } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import NumberFormat from "react-number-format";

//css
import { useStyles } from "../../../styles/makeTheme";

//util
import { convertUtcToBkkDate } from "../../../utils/date-utill";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmApprove: () => void;
  payloadApprove: any;
}

function ModalApproveSearchList({
  open,
  onClose,
  onConfirmApprove,
  payloadApprove,
}: Props) {
  const classes = useStyles();

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ลำดับ",
      width: 65,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "branch",
      headerName: "สาขา",
      minWidth: 120,
      flex: 1.2,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "cashDate",
      headerName: "วันที่เงินขาด-เกิน",
      minWidth: 150,
      headerAlign: "center",
      align: "left",
      sortable: false,
    },
    {
      field: "salesDate",
      headerName: "วันที่ยอดขาย",
      minWidth: 120,
      flex: 1.2,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "cashShort",
      headerName: "เงินขาด",
      minWidth: 100,
      flex: 1.2,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <NumberFormat
            value={String(params.value)}
            thousandSeparator={true}
            decimalScale={2}
            disabled={true}
            customInput={TextField}
            sx={{
              ".MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#000",
                textAlign: "end",
                fontSize: "14px",
              },
              ".MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            fixedDecimalScale
            type="text"
          />
        );
      },
    },
    {
      field: "cashOver",
      headerName: "เงินเกิน",
      minWidth: 100,
      flex: 1.2,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <NumberFormat
            value={String(params.value)}
            thousandSeparator={true}
            decimalScale={2}
            disabled={true}
            customInput={TextField}
            sx={{
              ".MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#000",
                textAlign: "end",
                fontSize: "14px",
              },
              ".MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            fixedDecimalScale
            type="text"
          />
        );
      },
    },
  ];

  let rows: any = payloadApprove.map((item: any, index: number) => {
    return {
      id: index + 1,
      branch: item.branchCode,
      cashDate: item.cashDate,
      salesDate: item.salesDate,
      cashShort: item.cashShort,
      cashOver: item.cashOver,
    };
  });

  return (
    <Fragment>
      <Dialog open={open} maxWidth="md" fullWidth={true}>
        <DialogContent>
          <Typography variant="h6" align="center" sx={{ marginBottom: 1 }}>
            ยืนยันการอนุมัติรายการ
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ mb: 2 }}
          >
            กรุณายืนยันการอนุมัติ {payloadApprove.length} รายการ
          </Typography>

          <Box>
            <div
              style={{ width: "100%", height: "auto" }}
              className={classes.MdataGridPaginationTop}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                disableColumnMenu
                hideFooter
                scrollbarSize={10}
                autoHeight
              />
            </div>
          </Box>

          <DialogActions sx={{ justifyContent: "center", mt: 5 }}>
            <Button
              id="btnCancle"
              variant="contained"
              color="cancelColor"
              className={classes.MbtnSearch}
              onClick={onClose}
              sx={{ mr: 3, width: "20%" }}
            >
              ยกเลิก
            </Button>
            <Button
              id="btnDelete"
              variant="contained"
              color="primary"
              className={classes.MbtnSearch}
              sx={{ width: "20%" }}
              onClick={() => onConfirmApprove()}
            >
              ยืนยัน
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default ModalApproveSearchList;
