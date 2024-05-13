import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { ReactElement } from "react";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import { useStyles } from "../../../styles/makeTheme";
import { Barcode } from "../../../models/stock-model";

interface Props {
  open: boolean;
  onClose: () => void;
  movementTransaction: Barcode[];
}
function StockMovementTransaction({
  open,
  onClose,
  movementTransaction,
}: Props): ReactElement {
  const classes = useStyles();
  const columns: GridColDef[] = [
    {
      field: "barcode",
      headerName: "บาร์โค้ด",
      headerAlign: "center",
      align: "center",
      minWidth: 150,
      flex: 0.5,
      sortable: false,
    },
    {
      field: "qty",
      headerName: "จำนวน",
      minWidth: 150,
      // flex: 0.5,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
    {
      field: "unitName",
      headerName: "หน่วย",
      minWidth: 150,
      // flex: 0.5,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "barFactor",
      headerName: "Unit Factor",
      minWidth: 150,
      // flex: 0.5,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
    {
      field: "baseUnitQty",
      headerName: "จำนวนที่ทำรายการ(ชิ้น)",
      minWidth: 200,
      // flex: 0.5,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
  ];

  const rows = movementTransaction.map((data: Barcode, indexs: number) => {
    return {
      id: indexs,
      barFactor: data.barFactor,
      barcode: data.barcode,
      baseUnitQty: data.baseUnitQty,
      qty: data.qty,
      unitCode: data.unitCode,
      unitName: data.unitName,
    };
  });

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth="md"
    >
      <DialogContent sx={{ padding: "1em" }}>
        <DialogContentText
          sx={{
            textAlign: "center",
            whiteSpace: "pre-line",
            color: "#000000",
            pt: 3,
          }}
        >
          <div
            className={classes.MdataGridPaginationTop}
            style={{ width: "100%" }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              disableColumnMenu={true}
              hideFooterPagination={true}
              disableSelectionOnClick={true}
              hideFooter={true}
              autoHeight
            />
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "center", margin: "10px 0px 10px 0px" }}
      >
        <Button
          data-testid="testid-btnClose"
          id="btnClose"
          variant="contained"
          color="error"
          sx={{ borderRadius: "5px", width: "126px" }}
          onClick={onClose}
        >
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StockMovementTransaction;
