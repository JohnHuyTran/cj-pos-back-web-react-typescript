import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { TextField, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiRef,
  GridValueGetterParams,
  GridRowId,
  GridRowData,
  GridEditCellValueParams,
} from "@mui/x-data-grid";

import { useStyles } from "../../styles/makeTheme";

import { updateAddItemsState } from "../../store/slices/add-items-slice";

export interface CheckOrderItemProps {
  onchengItem?: (items: Array<any>) => void;
  rowList: Array<any>;
}

const columns: GridColDef[] = [
  {
    field: "rowOrder",
    headerName: "ลำดับ",
    width: 80,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcode",
    headerName: "บาร์โค้ด",
    minWidth: 135,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "productName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 160,
    flex: 1,
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
    width: 90,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "qtyRef",
    headerName: "จำนวนอ้างอิง",
    width: 130,
    headerAlign: "center",
    align: "right",
    sortable: false,
  },
  {
    field: "actualQty",
    headerName: "จำนวนรับจริง",
    width: 135,
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txnQuantityActual"
        type="number"
        inputProps={{ style: { textAlign: "right" } }}
        value={params.value}
        onChange={(e) => {
          var value = e.target.value ? parseInt(e.target.value, 10) : "";
          if (value < 0) value = 0;

          params.api.updateRows([{ ...params.row, actualQty: value }]);
        }}
        onBlur={(e) => {
          // isAllowActualQty(params, parseInt(e.target.value, 10));
          params.api.updateRows([{ ...params.row, actualQty: e.target.value }]);
        }}
        disabled={isDisable(params) ? true : false}
        autoComplete="off"
      />
    ),
  },
  {
    field: "qtyDiff",
    headerName: "ส่วนต่างการรับ",
    width: 140,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => calProductDiff(params),
  },
  {
    field: "comment",
    headerName: "หมายเหตุ",
    headerAlign: "center",
    minWidth: 120,
    // flex: 0.5,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txnComment"
        value={params.value}
        onChange={(e) =>
          params.api.updateRows([{ ...params.row, comment: e.target.value }])
        }
        disabled={isDisable(params) ? true : false}
        autoComplete="off"
      />
    ),
  },
];

var calProductDiff = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "actualQty")) -
    Number(params.getValue(params.id, "qtyRef"));

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

function useApiRef() {
  const apiRef = useGridApiRef();
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "",
        width: 0,
        minWidth: 0,
        sortable: false,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        },
      }),
    [columns],
  );

  return { apiRef, columns: _columns };
}
const isDisable = (params: GridRenderCellParams) => {
  return params.row.sdStatus;
};

export default function CheckOrderDetailItems({
  onchengItem,
  rowList,
}: CheckOrderItemProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { apiRef, columns } = useApiRef();

  const [pageSize, setPageSize] = React.useState<number>(10);

  useEffect(() => {}, []);

  const updateState = async (items: any) => {
    await dispatch(updateAddItemsState(items));
  };

  let rowsEntries: any = [];

  rowsEntries = rowList.map((item: any, index: number) => {
    return {
      rowOrder: index + 1,
      id: `${item.deliveryOrderNo}${item.barcode}_${index}`,
      deliveryOrderNo: item.deliveryOrderNo,
      isTote: item.isTote ? item.isTote : false,
      sdStatus: item.sdStatus,
      skuCode: item.skuCode,
      barcode: item.barcode,
      productName: item.productName,
      unitName: item.unitName,
      qtyRef: item.qtyRef,
      actualQty: item.actualQty,
      qtyDiff: item.qtyDiff,
      comment: item.comment,
    };
  });
  // }

  const mapUpdateState = async () => {
    const itemsList: any = [];

    if (rowsEntries.length > 0) {
      const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
      await rows.forEach((data: GridRowData) => {
        itemsList.push(data);
      });
    }

    if (itemsList.length > 0) {
      updateState(itemsList);
    }
  };

  const handleEditItems = async (params: GridEditCellValueParams) => {
    if (params.field === "actualQty" || params.field === "comment") {
      mapUpdateState();
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: rowsEntries.length >= 8 ? "70vh" : "auto",
      }}
      className={classes.MdataGridDetail}
    >
      <DataGrid
        rows={rowsEntries}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[10, 20, 50, 100]}
        pagination
        disableColumnMenu
        autoHeight={rowsEntries.length >= 8 ? false : true}
        scrollbarSize={10}
        onCellFocusOut={handleEditItems}
        // onCellOut={handleEditItems}
        // onCellKeyDown={handleEditItems}
        // onCellBlur={handleEditItems}
      />
    </div>
  );
}
