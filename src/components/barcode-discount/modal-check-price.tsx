import { ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import { useAppSelector } from "../../store/store";
import { useStyles } from "../../styles/makeTheme";
import { numberWithCommas } from "../../utils/utils";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Props {
  open: boolean;
  onClose: () => void;
  products: object[];
}

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    headerAlign: "right",
    disableColumnMenu: false,
    flex: 0.6,
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ paddingLeft: "20px" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "barcode",
    headerName: "บาร์โค๊ด",
    flex: 1,
    headerAlign: "left",
    sortable: false,
  },
  {
    field: "barcodeName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "left",
    flex: 2,
    disableColumnMenu: false,
    sortable: false,
    renderCell: (params) => {
      return (
        <div>
          <Typography variant="body2">{params.value}</Typography>
          <Typography color="textSecondary" sx={{ fontSize: 12 }}>
            {params.row.skuCode || ""}
          </Typography>
        </div>
      );
    },
  },
  {
    field: "oldPrice",
    headerName: "ราคาเดิม",
    flex: 0.8,
    align: "right",
    headerAlign: "left",
    sortable: false,
    renderCell: (params) => {
      return (
        <Typography variant="body2">
          <b>{numberWithCommas(params.value)}</b>
        </Typography>
      );
    },
  },
  {
    field: "currentPrice",
    headerName: "ราคาใหม่",
    flex: 0.8,
    align: "right",
    headerAlign: "left",
    sortable: false,
    renderCell: (params) => {
      return (
        <Typography variant="body2" sx={{ color: "#446EF2" }}>
          <b>{numberWithCommas(params.value)}</b>
        </Typography>
      );
    },
  },
];

export default function ModalCheckPrice({
  open,
  onClose,
  products,
}: Props): ReactElement {
  const classes = useStyles();
  const payloadAddItem = useAppSelector((state) => state.addItems.state);

  let rows: any = [];
  if (Object.keys(payloadAddItem).length !== 0) {
    rows = products.map((item: any, index: number) => {
      const itemConvert = payloadAddItem.find(
        (el: any) => el.barcode === item.barcode,
      );
      return {
        id: index,
        index: index + 1,
        barcode: item.barcode,
        barcodeName: itemConvert.barcodeName,
        oldPrice: item.oldPrice,
        skuCode: itemConvert.skuCode,
        currentPrice: item.currentPrice,
      };
    });
  }

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      // fullWidth={true}
      PaperProps={{ sx: { width: "700px", maxWidth: "700px" } }}
    >
      <DialogContent sx={{ padding: "1em" }}>
        <DialogContentText sx={{ textAlign: "center" }}>
          <ErrorOutline sx={{ color: "#F54949", fontSize: "3em" }} />
          <Typography fontWeight="bold">
            ราคาสินค้าบางรายการมีการเปลี่ยนแปลง
            <br />
            โดยระบบทำการคำนวนราคาส่วนลดใหม่เรียบร้อยแล้ว
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 1.5 }}
          >
            <div
              style={{ width: "100%" }}
              className={classes.MdataGridPaginationTop}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                disableColumnMenu
                hideFooter
                autoHeight
                rowHeight={70}
              />
            </div>
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          id="btnClose"
          variant="contained"
          color="error"
          sx={{
            margin: "0 auto",
            borderRadius: "5px",
            mb: 3,
            width: 126,
            height: 40,
          }}
          onClick={onClose}
        >
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
