import React, { useEffect, useMemo } from "react";
import { useStyles } from "../../../styles/makeTheme";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { numberWithCommas, stringNullOrEmpty } from "../../../utils/utils";
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
import Typography from "@mui/material/Typography";

import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  ErrorItem,
  Item,
  ItemGroups,
} from "../../../models/stock-transfer-model";
import { isGroupBranch } from "../../../utils/role-permission";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { DeleteForever, Tune } from "@mui/icons-material";
import ModalDeleteItem from "../modal-delete-item-confirm";
import { ErrorDetail } from "../../../models/api-error-model";

interface Props {
  skuCodeSelect: string;
  skuNameSelect: string;
  isClickSKU: boolean;
  onUpdateItemList: (item: Item[]) => void;
}
const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    minWidth: 70,
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
    minWidth: 150,
    flex: 0.7,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcodeName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 200,
    flex: 1,
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
    field: "orderQty",
    headerName: "จำนวนที่สั่ง",
    minWidth: 120,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => numberWithCommas(params.value),
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    minWidth: 110,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "actualQty",
    headerName: "จำนวนโอนจริง",
    minWidth: 120,
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txnActualQty"
        type="number"
        inputProps={{ style: { textAlign: "right" } }}
        value={params.value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          var value = e.target.value ? parseInt(e.target.value, 10) : "0";
          var returnQty = Number(params.getValue(params.id, "actualQty"));
          if (returnQty === 0) value = chkReturnQty(value);
          if (value < 0) value = 0;
          params.api.updateRows([{ ...params.row, actualQty: value }]);
        }}
        disabled={params.getValue(params.id, "isDisable") ? true : false}
        autoComplete="off"
      />
    ),
  },
  {
    field: "toteCode",
    headerName: "เลข Tote/ลัง",
    minWidth: 120,
    headerAlign: "center",
    flex: 0.45,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txbToteCode"
        inputProps={{ style: { textAlign: "right" } }}
        value={params.value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          params.api.updateRows([{ ...params.row, toteCode: e.target.value }]);
        }}
        disabled={params.getValue(params.id, "isDisable") ? true : false}
        autoComplete="off"
        error={isToteErrot(params.getValue(params.id, "isToteError"))}
      />
    ),
  },
  {
    field: "boNo",
    headerName: "เลขที่ BO",
    minWidth: 150,
    flex: 0.35,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "delete",
    headerName: " ",
    width: 50,
    align: "center",
    sortable: false,
    renderCell: (params) => {
      var orderQty = Number(params.getValue(params.id, "orderQty"));
      if (params.getValue(params.id, "edit") || orderQty <= 0) {
        return (
          <div>
            <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
          </div>
        );
      } else {
        return <div></div>;
      }
    },
  },
];

const isToteErrot = (value: any) => {
  return stringNullOrEmpty(value) ? false : value;
};
const chkReturnQty = (value: any) => {
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

function BranchTransferListItem({
  skuCodeSelect,
  skuNameSelect,
  isClickSKU,
  onUpdateItemList,
}: Props) {
  const classes = useStyles();
  const _ = require("lodash");
  const { apiRef, columns } = useApiRef();
  const dispatch = useAppDispatch();

  const errorList = useAppSelector(
    (state) => state.branchTransferDetailSlice.errorLists,
  );
  const branchTransferRslList = useAppSelector(
    (state) => state.branchTransferDetailSlice.branchTransferRs,
  );
  const branchTransferInfo: any = branchTransferRslList.data
    ? branchTransferRslList.data
    : null;
  const [branchTransferItems, setBranchTransferItems] = React.useState<Item[]>(
    branchTransferInfo.items ? branchTransferInfo.items : [],
  );

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const [skuGroupItems, setskuGroupItems] = React.useState<ItemGroups[]>(
    branchTransferInfo.itemGroups ? branchTransferInfo.itemGroups : [],
  );

  const [isDisable, setIsDisable] = React.useState(false);
  const [pageSize, setPageSize] = React.useState<number>(10);

  const [isChecked, setIschecked] = React.useState(true);
  let rows = branchTransferItems
    .filter((item: Item, index: number) => {
      if (skuCodeSelect && !isChecked) {
        return item.skuCode === skuCodeSelect;
      } else {
        return item;
      }
    })
    .map((item: Item, index: number) => {
      return {
        id: `${item.barcode}-${index + 1}`,
        index: index + 1,
        seqItem: item.seqItem,
        barcode: item.barcode,
        barcodeName: item.barcodeName,
        skuCode: item.skuCode,
        barFactor: item.barFactor,
        unitCode: item.unitCode ? item.unitCode : 0,
        unitName: item.unitName,
        orderQty: item.orderQty ? item.orderQty : 0,
        actualQty: item.actualQty ? item.actualQty : 0,
        toteCode: item.toteCode ? item.toteCode : "",
        isDisable: isDisable,
        boNo: item.boNo,
        edit: item.edit ? item.edit : false,
        isToteError: item.toteCode
          ? errorList.some((i: ErrorDetail) => i.toteCode == item.toteCode)
          : false,
      };
    });

  React.useEffect(() => {
    storeItemAddItem(payloadAddItem);
  }, [payloadAddItem]);

  React.useEffect(() => {
    if (!skuCodeSelect) {
      setIschecked(true);
    } else {
      setIschecked(false);
    }
  }, [isClickSKU]);

  React.useEffect(() => {
    const isCreate = branchTransferInfo.status === "CREATED";
    setIsDisable(isGroupBranch() && isCreate ? false : true);
    setskuGroupItems(branchTransferInfo.itemGroups);
  }, []);

  const storeItemAddItem = async (_newItem: any) => {
    let _items = [...branchTransferItems];
    let _sku = [...skuGroupItems];
    if (Object.keys(_newItem).length !== 0) {
      _newItem.map((data: any, index: number) => {
        const dupItem: any = branchTransferItems.find(
          (item: Item, index: number) => {
            return item.barcode === data.barcode;
          },
        );
        const dupSku: any = skuGroupItems.find(
          (item: ItemGroups, index: number) => {
            return item.skuCode === data.skuCode;
          },
        );

        if (dupSku) {
          const newData: ItemGroups = {
            skuCode: dupSku.skuCode,
            productName: dupSku.productName,
            orderAllQty: dupSku.orderAllQty,
            actualAllQty: dupSku.actualAllQty + data.baseUnit * data.qty,
            remainingQty: dupSku.remainingQty,
          };
          _.remove(_sku, function (item: ItemGroups) {
            return item.skuCode === data.skuCode;
          });
          _sku = [..._sku, newData];
        } else {
          const newData: ItemGroups = {
            skuCode: data.skuCode,
            productName: data.skuName,
            orderAllQty: 0,
            actualAllQty: 0,
            remainingQty: 0,
          };
          _sku = [..._sku, newData];
        }

        if (dupItem) {
          const newData: Item = {
            seqItem: dupItem.seqItem,
            barcode: dupItem.barcode,
            barcodeName: dupItem.barcodeName,
            skuCode: dupItem.skuCode,
            barFactor: dupItem.barFactor,
            unitName: dupItem.unitName,
            unitCode: dupItem.unitCode,
            orderQty: dupItem.orderQty ? dupItem.orderQty : 0,
            actualQty: dupItem.actualQty + data.qty,
            toteCode: dupItem.toteCode,
            isDisable: isDisable,
            boNo: dupItem.boNo,
            edit: dupItem.edit,
          };
          _.remove(_items, function (item: Item) {
            return item.barcode === data.barcode;
          });
          _items = [..._items, newData];
        } else {
          const newData: Item = {
            seqItem: 0,
            barcode: data.barcode,
            barcodeName: data.barcodeName,
            skuCode: data.skuCode,
            barFactor: data.baseUnit,
            unitCode: data.unitCode ? data.unitCode : 0,
            unitName: data.unitName,
            orderQty: data.orderQty ? data.orderQty : 0,
            actualQty: data.qty,
            toteCode: "",
            isDisable: isDisable,
            edit: true,
          };
          _items = [..._items, newData];
        }
      });
    }
    setBranchTransferItems(
      _.orderBy(_items, ["skuCode", "barFactor"], ["asc", "asc"]),
    );
    return onUpdateItemList(
      _.orderBy(_items, ["skuCode", "barFactor"], ["asc", "asc"]),
    );
  };

  const storeItem = async () => {
    let _items = [...branchTransferItems];
    let _sku = [...skuGroupItems];
    let _newSku: ItemGroups[] = [];

    const rowsEdit: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
    rowsEdit.forEach((dataRow: GridRowData) => {
      const dupItem: any = branchTransferItems.find(
        (item: Item, index: number) => {
          return item.barcode === dataRow.barcode;
        },
      );

      if (dupItem) {
        let _toteCode: string = dataRow.toteCode;
        _toteCode = _toteCode.trim();
        const newData: Item = {
          seqItem: dataRow.seqItem,
          barcode: dataRow.barcode,
          barcodeName: dataRow.barcodeName,
          skuCode: dataRow.skuCode,
          unitName: dataRow.unitName,
          actualQty: dataRow.actualQty,
          toteCode: _toteCode,
          isDisable: isDisable,
          boNo: dataRow.boNo,
          barFactor: dataRow.barFactor,
          unitCode: dataRow.unitCode ? dataRow.unitCode : 0,
          orderQty: dataRow.orderQty ? dataRow.orderQty : 0,
          edit: dataRow.edit,
        };

        _.remove(_items, function (item: Item) {
          return item.barcode === dataRow.barcode;
        });
        _items = [..._items, newData];
      }
    });

    _sku.forEach((data: ItemGroups) => {
      const sum = _items
        .filter((dataItem: Item) => {
          return data.skuCode === dataItem.skuCode;
        })
        .reduce((sum, dataItem: Item) => {
          return (
            sum +
            Number(
              (dataItem.actualQty ? dataItem.actualQty : 0) *
                (dataItem.barFactor ? dataItem.barFactor : 0),
            )
          );
        }, 0);

      const newData: ItemGroups = {
        skuCode: data.skuCode,
        productName: data.productName,
        orderAllQty: data.orderAllQty,
        actualAllQty: sum,
        remainingQty: data.remainingQty,
      };
      _newSku.push(newData);
    });
    setBranchTransferItems(
      _.orderBy(_items, ["skuCode", "barFactor"], ["asc", "asc"]),
    );
    return onUpdateItemList(
      _.orderBy(_items, ["skuCode", "barFactor"], ["asc", "asc"]),
    );
  };

  const deleteItem = async () => {
    let _items = [...branchTransferItems];

    _.remove(_items, function (item: Item) {
      return item.barcode === itemDelete.barcode;
    });
    setBranchTransferItems(
      _.orderBy(_items, ["skuCode", "barFactor"], ["asc", "asc"]),
    );
    return onUpdateItemList(
      _.orderBy(_items, ["skuCode", "barFactor"], ["asc", "asc"]),
    );
  };

  let newColumns = [...columns];
  if (branchTransferInfo.status != "CREATED") {
    newColumns[7]["hide"] = false;
    newColumns[8]["hide"] = true;
  } else {
    newColumns[7]["hide"] = true;
    newColumns[8]["hide"] = false;
  }

  const handleOnFocusOut = async (params: GridEditCellValueParams) => {
    storeItem();
  };

  const handleOnCellOut = (params: GridCellParams) => {
    if (params.field === "actualQty" || params.field === "toteCode") {
      storeItem();
    }
  };

  const handleCheckboxChange = (e: any) => {
    const ischeck = e.target.checked;

    if (ischeck) {
      setIschecked(true);
      skuCodeSelect = "";
    } else {
      setIschecked(false);
    }
  };

  const [itemDelete, setItemDelete] = React.useState<Item>({
    barcode: "",
    barcodeName: "",
  });
  const [openModalDeleteConfirm, setOpenModalDeleteConfirm] =
    React.useState(false);
  const currentlySelected = async (params: GridCellParams) => {
    const value = params.colDef.field;
    const isEdit = params.row.edit;
    const orderQty = params.row.orderqty;

    if (value === "delete" && (isEdit || orderQty <= 0)) {
      const _item: Item = {
        barcode: params.row.barcode,
        barcodeName: params.row.barcodeName,
      };
      setItemDelete(_item);
      setOpenModalDeleteConfirm(true);
    }
  };

  const handleDeleteIterm = (isDelete: boolean) => {
    if (isDelete) {
      deleteItem();
    }
    setOpenModalDeleteConfirm(false);
  };

  return (
    <React.Fragment>
      <Box mt={2} bgcolor="background.paper">
        <div
          style={{ width: "100%", height: rows.length >= 8 ? "70vh" : "auto" }}
          className={classes.MdataGridDetail}
        >
          <Box mt={3}>
            <Typography>
              รายการสินค้า: {isChecked && "รายการสินค้าทั้งหมด"}{" "}
              {!isChecked && `${skuNameSelect} (${skuCodeSelect})`}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }} mt={1}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                checked={isChecked}
                label="รายการสินค้าทั้งหมด"
                onChange={handleCheckboxChange}
              />
            </FormGroup>
          </Box>
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
            onCellFocusOut={handleOnFocusOut}
            onCellOut={handleOnCellOut}
            onCellClick={currentlySelected}
            columnBuffer={10}
          />
        </div>
        <ModalDeleteItem
          open={openModalDeleteConfirm}
          itemInfo={itemDelete}
          onClose={handleDeleteIterm}
        />
      </Box>
    </React.Fragment>
  );
}
export default BranchTransferListItem;
