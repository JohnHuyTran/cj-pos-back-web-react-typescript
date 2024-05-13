import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridEditCellValueParams,
  GridRenderCellParams,
  GridRowData,
  GridRowId,
  useGridApiRef,
} from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { useStyles } from "../../../styles/makeTheme";
import { TextField, Typography } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import ModelDeleteConfirm from "../../commons/ui/modal-delete-confirm";
import { isAllowActionPermission } from "../../../utils/role-permission";
import { ACTIONS } from "../../../utils/enum/permission-enum";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";

export interface DataGridProps {
  // onChangeItems: (items: Array<any>) => void;
  onChangeItems: () => void;
}

const columns: GridColDef[] = [
  {
    field: "index",
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
    field: "barcode",
    headerName: "บาร์โค้ด",
    minWidth: 200,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcodeName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 300,
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
    field: "stockMax",
    headerName: "จำนวนที่สั่งได้มากที่สุด",
    headerAlign: "center",
    align: "right",
    minWidth: 160,
    sortable: false,
  },
  {
    field: "qty",
    headerName: "จำนวนที่สาขาเบิก",
    minWidth: 150,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txnQuantity"
        type="number"
        inputProps={{ style: { textAlign: "right" } }}
        value={params.value}
        onChange={(e) => {
          let qty = Number(params.getValue(params.id, "qty"));
          let stockMax = Number(params.getValue(params.id, "stockMax"));
          var value = e.target.value ? parseInt(e.target.value, 10) : "";
          if (qty === 0) value = chkQty(value);
          if (value < 0) value = 0;
          if (value > stockMax) value = stockMax;
          params.api.updateRows([{ ...params.row, qty: value }]);
        }}
        disabled={params.getValue(params.id, "editMode") ? true : false}
        autoComplete="off"
      />
    ),
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    minWidth: 120,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "delete",
    headerName: " ",
    width: 40,
    minWidth: 0,
    align: "right",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <div>
        {!params.getValue(params.id, "editMode") && (
          <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
        )}
      </div>
    ),
  },
];

const chkQty = (value: any) => {
  let v = String(value);
  if (v.substring(1) === "0") return Number(v.substring(0, 1));
  return value;
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

function PurchaseBranchListItem({ onChangeItems }: DataGridProps) {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  let rows: any = [];
  const [pageSize, setPageSize] = React.useState<number>(10);

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  if (Object.keys(payloadAddItem).length !== 0) {
    rows = payloadAddItem.map((item: any, index: number) => {
      let qty = item.qty ? item.qty : 1;
      if (item.qty > item.stockMax) qty = item.stockMax;
      return {
        id: index,
        index: index + 1,
        skuCode: item.skuCode,
        barcode: item.barcode,
        barcodeName: item.barcodeName,
        qty: qty,
        stockMax: item.stockMax,
        unitName: item.unitName,
        editMode: isAllowActionPermission(ACTIONS.PURCHASE_BR_MANAGE),
      };
    });
  }

  const { apiRef, columns } = useApiRef();
  const handleEditItems = async (params: GridEditCellValueParams) => {
    if (params.field === "qty") {
      const itemsList: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        await rows.forEach((data: GridRowData) => {
          itemsList.push(data);
        });

        await dispatch(updateAddItemsState(itemsList));
        return onChangeItems();
        // return onChangeItems(itemsList ? itemsList : []);
      }
    }
  };

  const [openModelDeleteConfirm, setOpenModelDeleteConfirm] =
    React.useState(false);
  const [productNameDel, setProductNameDel] = React.useState("");
  const [skuCodeDel, setSkuCodeDel] = React.useState("");
  const [barCodeDel, setBarCodeDel] = React.useState("");
  const currentlySelected = async (params: GridCellParams) => {
    const value = params.colDef.field;
    if (value === "delete") {
      setProductNameDel(String(params.getValue(params.id, "barcodeName")));
      setSkuCodeDel(String(params.getValue(params.id, "skuCode")));
      setBarCodeDel(String(params.getValue(params.id, "barcode")));
      setOpenModelDeleteConfirm(true);
    }
  };
  const handleModelDeleteConfirm = () => {
    setOpenModelDeleteConfirm(false);
  };

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
          onCellClick={currentlySelected}
          onCellFocusOut={handleEditItems}
          onCellOut={handleEditItems}
          onCellKeyDown={handleEditItems}
        />
      </div>

      <ModelDeleteConfirm
        open={openModelDeleteConfirm}
        onClose={handleModelDeleteConfirm}
        productName={productNameDel}
        skuCode={skuCodeDel}
        barCode={barCodeDel}
      />
    </>
  );
}

export default PurchaseBranchListItem;
