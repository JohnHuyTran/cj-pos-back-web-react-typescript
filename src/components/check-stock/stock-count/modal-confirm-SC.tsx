import { ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Typography,
} from "@mui/material";
import { useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { STORE_TYPE } from "../../../utils/enum/common-enum";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const columns: GridColDef[] = [
  {
    field: "totalRecords",
    headerName: "รายการทั้งหมด",
    flex: 1.76,
    headerAlign: "center",
    align: "right",
    sortable: false,
  },
  {
    field: "numberCounted",
    headerName: "นับแล้ว",
    headerAlign: "center",
    align: "right",
    flex: 1.12,
    disableColumnMenu: false,
    sortable: false,
  },
  {
    field: "numberCanNotCount",
    headerName: "ไม่สามารถนับได้",
    flex: 1.34,
    align: "right",
    headerAlign: "center",
    sortable: false,
  },
];

export default function ModalConfirmSC({
  open,
  onClose,
  onConfirm,
}: Props): ReactElement {
  const classes = useStyles();
  const payloadStockCount = useAppSelector(
    (state) => state.stockCountSlice.createDraft,
  );
  const stockCountDetail = useAppSelector(
    (state) => state.stockCountDetailSlice.stockCountDetail.data,
  );

  let rows: any = [
    {
      id: stockCountDetail.id,
      totalRecords: payloadStockCount.products.length,
      numberCounted: payloadStockCount.products.filter(
        (el: any) => !el.canNotCount,
      ).length,
      numberCanNotCount: payloadStockCount.products.filter(
        (el: any) => !!el.canNotCount,
      ).length,
    },
  ];

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      // fullWidth={true}
      PaperProps={{ sx: { width: "500px", maxWidth: "700px" } }}
    >
      <DialogContent sx={{ padding: "1em" }}>
        <DialogContentText>
          <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
            <b> ยืนยันตรวจนับสต๊อก (SC)</b>
          </Typography>
          <Grid container spacing={1} mb={3}>
            <Grid item xs={2}></Grid>
            <Grid item xs={3}>
              <b>เลขที่เอกสาร </b>
            </Grid>
            <Grid item xs={6}>
              <label style={{ color: "#AEAEAE", margin: "0 5px" }}>|</label>
              <label style={{ color: "#36C690", paddingLeft: "10px" }}>
                <b>{stockCountDetail.documentNumber}</b>
              </label>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={3}>
              <b>คลัง</b>
            </Grid>
            <Grid item xs={6}>
              <label style={{ color: "#AEAEAE", margin: "0 5px" }}>|</label>
              <label style={{ color: "#36C690", paddingLeft: "10px" }}>
                <b>
                  {stockCountDetail.storeType == STORE_TYPE.BACK
                    ? "หลังร้าน"
                    : "หน้าร้าน"}
                </b>
              </label>
            </Grid>
          </Grid>
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
                rowHeight={50}
              />
            </div>
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ margin: "0 auto" }}>
        <Button
          id="btnClose"
          variant="contained"
          color="cancelColor"
          sx={{ borderRadius: "5px", mb: 3, width: 126, height: 40, mr: 3 }}
          onClick={onClose}
        >
          ยกเลิก
        </Button>
        <Button
          id="btnConfirm"
          variant="contained"
          color="primary"
          sx={{ borderRadius: "5px", mb: 3, width: 126, height: 40, ml: 3 }}
          onClick={onConfirm}
        >
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
}
