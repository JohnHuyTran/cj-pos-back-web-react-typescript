import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../store/store";
import { Box, Dialog, DialogContent, Grid, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useStyles } from "../../styles/makeTheme";
import {
  getShipmentTypeText,
  ShipmentDeliveryStatusCodeEnum,
} from "../../utils/enum/check-order-enum";
import { CheckOrderSDDetailProps, Entry } from "../../models/order-model";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import { HighlightOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const columns: GridColDef[] = [
  {
    field: "col1",
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
    field: "productId",
    headerName: "รหัสสินค้า",
    width: 180,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "productBarCode",
    headerName: "บาร์โค้ด",
    minWidth: 135,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "productDescription",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    // minWidth: 250,
    flex: 1,
    sortable: false,
  },
  {
    field: "productUnit",
    headerName: "หน่วย",
    width: 90,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "productQuantityRef",
    headerName: "จำนวนอ้างอิง",
    width: 130,
    headerAlign: "center",
    align: "right",
    sortable: false,
  },
  {
    field: "productQuantityActual",
    headerName: "จำนวนรับจริง",
    width: 135,
    headerAlign: "center",
    align: "right",
    sortable: false,
  },
  {
    field: "productDifference",
    headerName: "ส่วนต่างการรับ",
    width: 140,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => calProductDiff(params),
  },
  {
    field: "productComment",
    headerName: "หมายเหตุ",
    headerAlign: "center",
    minWidth: 120,
    sortable: false,
  },
];

var calProductDiff = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "productQuantityActual")) -
    Number(params.getValue(params.id, "productQuantityRef"));

  if (diff > 0)
    return (
      <label style={{ color: "#446EF2", fontWeight: 700 }}> +{diff} </label>
    );
  if (diff < 0)
    return (
      <label style={{ color: "#F54949", fontWeight: 700 }}> {diff} </label>
    );
  return diff;
};

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
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

export default function CheckOrderDetail({
  defaultOpen,
  onClickClose,
}: CheckOrderSDDetailProps) {
  const classes = useStyles();
  const { t } = useTranslation(["orderReceive", "common"]);
  const res = useAppSelector((state) => state.checkOrderSDList.orderList);
  const [open, setOpen] = React.useState(defaultOpen);
  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const [shipmentStatusText, setShipmentStatusText] = useState<
    string | undefined
  >("");
  const [shipmentTypeText, setShipmentTypeText] = useState<string | undefined>(
    "",
  );
  const [shipmentDateFormat, setShipmentDateFormat] = useState<
    string | undefined
  >("");

  const [pageSize, setPageSize] = React.useState<number>(10);

  useEffect(() => {
    setOpen(defaultOpen);

    setShipmentStatusText(t(`status.${SD.sdStatus}`));
    setShipmentTypeText(getShipmentTypeText(SD.sdType));
    setShipmentDateFormat(convertUtcToBkkDate(SD.shipmentDate));
  }, [open, openModelConfirm]);

  const SD: any = res.data ? res.data : null;
  let entries: Entry[] = SD.entries ? SD.entries : [];
  let rowsEntries = entries.map((item: Entry, index: number) => {
    return {
      id: `${item.deliveryOrderNo}${item.barcode}_${index}`,
      doNo: item.deliveryOrderNo,
      isTote: item.isTote,
      isDraftStatus:
        SD.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT
          ? false
          : true,
      col1: index + 1,
      productId: item.skuCode,
      productBarCode: item.barcode,
      productDescription: item.productName,
      productUnit: item.unitName,
      productQuantityRef: item.qty,
      productQuantityActual: item.actualQty,
      productDifference: item.qtyDiff,
      productComment: item.comment,
    };
  });

  const handleClose = () => {
    setOpen(false);
    onClickClose();
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          <Typography sx={{ fontSize: "1em" }}>
            รายละเอียด อ้างอิง SD โอนลอย
          </Typography>
        </BootstrapDialogTitle>

        <DialogContent>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร LD:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{SD.docRefNo}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">สถานะ:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{shipmentStatusText}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร SD:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{SD.sdNo}</Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">ประเภท:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{shipmentTypeText}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">{shipmentDateFormat}</Typography>
              </Grid>
              <Grid item lg={2}>
                {SD.hasDoc === true &&
                  SD.sdStatus ===
                    ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB && (
                    <Typography variant="body2">ใบผลต่างหลังเซ็นต์:</Typography>
                  )}
              </Grid>
            </Grid>
          </Box>

          <Box mt={6} bgcolor="background.paper">
            <div style={{ width: "100%" }} className={classes.MdataGridDetail}>
              <DataGrid
                rows={rowsEntries}
                columns={columns}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[10, 20, 50, 100]}
                pagination
                autoHeight
                disableColumnMenu
              />
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
