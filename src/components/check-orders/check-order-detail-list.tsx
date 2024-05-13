import React, { useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridEditCellValueParams,
  GridRenderCellParams,
  GridRowData,
  GridRowId,
  GridValueGetterParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import { TextField, Typography } from "@mui/material";
import { useStyles } from "../../styles/makeTheme";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { itemsDetail, ShipmentDetailInfo } from "../../models/order-model";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { ShipmentDeliveryStatusCodeEnum } from "../../utils/enum/check-order-enum";

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
    field: "hhQty",
    headerName: "จำนวนที่ scanHH",
    width: 133,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => calHHDiff(params),
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
          let actualQty = Number(params.getValue(params.id, "actualQty"));
          var value = e.target.value ? parseInt(e.target.value, 10) : "";

          if (actualQty === 0) value = chkActualQty(value);
          if (value < 0) value = 0;
          params.api.updateRows([{ ...params.row, actualQty: value }]);
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

var chkActualQty = (value: any) => {
  let v = String(value);
  if (v.substring(1) === "0") return Number(v.substring(0, 1));
  return value;
};

var calHHDiff = function (params: GridValueGetterParams) {
  let hhQty = params.getValue(params.id, "hhQty");
  let diff =
    Number(params.getValue(params.id, "actualQty")) -
    Number(params.getValue(params.id, "hhQty"));

  if (diff > 0)
    return (
      <label style={{ color: "#FBA600", fontWeight: 700 }}> {hhQty} </label>
    );
  return hhQty;
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

function CheckOrderDetailList() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { apiRef, columns } = useApiRef();
  const orderDetails = useAppSelector(
    (state) => state.checkOrderDetail.orderDetail,
  );
  const orderDetail: any = orderDetails.data ? orderDetails.data : null;
  const payloadAddItem = useAppSelector((state) => state.addItems.state);

  const [pageSize, setPageSize] = React.useState<number>(10);

  const updateState = async (items: any) => {
    await dispatch(updateAddItemsState(items));
  };

  let rowsEntries: any = [];
  const entries: itemsDetail[] = orderDetail.items ? orderDetail.items : [];
  if (entries.length > 0 && Object.keys(payloadAddItem).length === 0) {
    const itemsNewMap = entries.map((item: any, index: number) => {
      return {
        actualQty: item.actualQty,
        barcode: item.barcode,
        comment: item.comment,
        deliveryOrderNo: item.deliveryOrderNo,
        hhQty: item.hhQty,
        isTote: item.isTote,
        productName: item.productName,
        qtyRef: item.qty,
        qtyDiff: item.qtyDiff,
        sdID: item.sdID,
        sdNo: item.sdNo,
        skuCode: item.skuCode,
        skuType: item.skuType,
        toteCode: item.toteCode,
        unitCode: item.unitCode,
        unitFactor: item.unitFactor,
        unitName: item.unitName,
      };
    });
    updateState(itemsNewMap);
  }

  if (Object.keys(payloadAddItem).length !== 0) {
    rowsEntries = payloadAddItem.map((item: any, index: number) => {
      let qtyRef: number = 0;
      let actualQty: number = 0;

      if (item.id !== null && item.id !== undefined) {
        qtyRef = Number(item.qtyRef) ? Number(item.qtyRef) : 0;
        actualQty = Number(item.qty)
          ? Number(item.qty)
          : Number(item.actualQty)
            ? Number(item.actualQty)
            : 0;
      } else {
        // qtyRef = Number(item.qty);
        qtyRef = Number(item.qtyRef);
        actualQty = Number(item.actualQty);
      }

      return {
        rowOrder: index + 1,
        id: index,
        deliveryOrderNo: item.deliveryOrderNo,
        isTote: item.isTote ? item.isTote : false,
        sdStatus:
          orderDetail.sdStatus ===
            ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT ||
          orderDetail.sdStatus ===
            ShipmentDeliveryStatusCodeEnum.STATUS_REJECT_APPROVAL_1
            ? false
            : true,
        skuCode: item.skuCode,
        barcode: item.barcode,
        productName: item.productName,
        unitName: item.unitName,
        qtyRef: qtyRef,
        actualQty: actualQty,
        qtyDiff: item.qtyDiff,
        comment: item.comment,
        hhQty: item.hhQty ? item.hhQty : 0,
      };
    });
  }

  const handleEditItems = async (params: GridEditCellValueParams) => {
    if (orderDetail.sdStatus === ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT) {
      if (params.field === "actualQty" || params.field === "comment") {
        mapUpdateState();
      }
    }
  };

  const mapUpdateState = async () => {
    const itemsList: any = [];

    if (rowsEntries.length > 0) {
      const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
      await rows.forEach((data: GridRowData) => {
        itemsList.push(data);
      });

      if (itemsList.length > 0) {
        updateState(itemsList);
        // return onChangeItems(itemsList ? itemsList : []);
      }
    }
  };

  return (
    <>
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
          onCellOut={handleEditItems}
          onCellEditStart={handleEditItems}
          onCellEditStop={handleEditItems}
        />
      </div>
    </>
  );
}

export default CheckOrderDetailList;
