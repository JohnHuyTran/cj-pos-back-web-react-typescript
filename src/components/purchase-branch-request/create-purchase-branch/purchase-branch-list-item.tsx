import React from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { useStyles } from "../../../styles/makeTheme";
import { Typography } from "@mui/material";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import HtmlTooltip from "../../commons/ui/html-tooltip";

export interface DataGridProps {
  // onChangeItems: (items: Array<any>) => void;
  onChangeItems: () => void;
}

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 65,
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
    field: "barcode",
    headerName: "บาร์โค้ด",
    minWidth: 115,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcodeName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 200,
    flex: 2,
    sortable: false,
    renderCell: (params) => (
      <div>
        <Typography variant="body2">{params.value}</Typography>
        <Typography color="textSecondary" sx={{ fontSize: 12 }}>
          {params.getValue(params.id, "skuCode") || ""}
        </Typography>
      </div>
    ),
  },
  {
    field: "orderMaxQty",
    headerName: "จำนวนที่สั่งได้มากที่สุด",
    headerAlign: "center",
    align: "right",
    minWidth: 160,
    sortable: false,
  },
  {
    field: "orderQty",
    headerName: "จำนวนที่สาขาเบิก",
    minWidth: 135,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
  },

  {
    field: "referenceQty",
    headerName: "อ้างอิง (จำนวนที่คลังส่ง)",
    minWidth: 175,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "actualQty",
    headerName: "จำนวนรับจริง",
    minWidth: 115,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "actualQtyDiff",
    headerName: "ส่วนต่างการรับจริง",
    minWidth: 142,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => calActualQtyDiff(params),
  },
  {
    field: "orderQtyDiff",
    headerName: "ส่วนต่างการเบิกสินค้า",
    minWidth: 158,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => calOrderQtyDiff(params),
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    minWidth: 60,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "remark",
    headerName: "หมายเหตุ",
    minWidth: 90,
    flex: 1,
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => {
      return (
        <HtmlTooltip title={<React.Fragment>{params.value}</React.Fragment>}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </HtmlTooltip>
      );
    },
  },
];

var calActualQtyDiff = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "actualQty")) -
    Number(params.getValue(params.id, "referenceQty"));

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

var calOrderQtyDiff = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "actualQty")) -
    Number(params.getValue(params.id, "orderQty"));

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

function PurchaseBranchListItem({ onChangeItems }: DataGridProps) {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  let rows: any = [];
  const [pageSize, setPageSize] = React.useState<number>(10);
  const purchaseBRDetail = useAppSelector(
    (state) => state.purchaseBRDetailSlice.purchaseBRDetail.data,
  );
  if (purchaseBRDetail) {
    if (purchaseBRDetail.items.length > 0) {
      rows = purchaseBRDetail.items.map((item: any, index: number) => {
        return {
          id: index,
          index: index + 1,
          skuCode: item.skuCode,
          barcode: item.barcode,
          barcodeName: item.barcodeName,
          orderQty: item.orderQty ? item.orderQty : 0,
          orderMaxQty: item.orderMaxQty ? item.orderMaxQty : 0,
          unitName: item.unitName,
          referenceQty: item.referenceQty ? item.referenceQty : 0,
          actualQty: item.actualQty ? item.actualQty : 0,
          remark: item.remark ? item.remark : "-",
        };
      });
    }
  }

  return (
    <>
      <div
        style={{ width: "100%", height: rows.length >= 8 ? "70vh" : "auto" }}
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

export default PurchaseBranchListItem;
