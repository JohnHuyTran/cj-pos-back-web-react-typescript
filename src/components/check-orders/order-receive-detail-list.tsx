import React from "react";
import { useAppSelector, useAppDispatch } from "../../store/store";
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridRowId,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { useStyles } from "../../styles/makeTheme";
import { OrderReceiveEntry } from "../../models/order-model";
import { Typography } from "@mui/material";
export interface OrderReceiveDetailListProps {
  isTote?: boolean;
}

export default function OrderReceiveDetailList({
  isTote,
}: OrderReceiveDetailListProps) {
  const classes = useStyles();
  const orderReceiveResp = useAppSelector(
    (state) => state.orderReceiveSlice.orderReceiveList,
  );
  const orderReceiveData = orderReceiveResp.data ? orderReceiveResp.data : {};
  const orderReceiveEntrie = orderReceiveData.entries;

  const searchToteResp = useAppSelector((state) => state.searchToteSlice.tote);
  const searchToteData = searchToteResp.data ? searchToteResp.data : null;
  let searchToteEntries: any = [];
  if (searchToteData !== null) {
    searchToteEntries = searchToteData.entries ? searchToteData.entries : [];
  }

  let orderReceiveEntries: any;
  if (isTote === true) {
    orderReceiveEntries = searchToteEntries;
  } else {
    orderReceiveEntries = orderReceiveEntrie;
  }

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      minWidth: 75,
      //   flex: 0.65,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "barcode",
      headerName: "บาร์โค้ด",
      minWidth: 140,
      flex: 1,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "productName",
      headerName: "รายละเอียดสินค้า",
      minWidth: 160,
      flex: 1.3,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="body2" color="textSecondary">
            {params.getValue(params.id, "skuCode") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "unitName",
      headerName: "หน่วย",
      minWidth: 130,
      //   flex: 0.9,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
    {
      field: "qty",
      headerName: "จำนวนอ้างอิง",
      minWidth: 130,
      // flex: 0.5,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
  ];

  const [pageSize, setPageSize] = React.useState<number>(10);

  const rows = orderReceiveEntries.map(
    (data: OrderReceiveEntry, indexs: number) => {
      return {
        id: `${data.barcode}_${indexs + 1}`,
        index: indexs + 1,
        barcode: data.barcode,
        productName: data.productName,
        unitName: data.unitName,
        qty: data.qty,
        skuCode: data.skuCode,
      };
    },
  );

  return (
    <Box mt={4} bgcolor="background.paper">
      <div
        className={classes.MdataGridDetail}
        style={{
          width: "100%",
          marginBottom: "1em",
          height: rows.length >= 8 ? "70vh" : "auto",
        }}
      >
        <DataGrid
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          pagination
          rows={rows}
          columns={columns}
          disableColumnMenu
          autoHeight={rows.length >= 8 ? false : true}
          scrollbarSize={10}
        />
      </div>
    </Box>
  );
}
