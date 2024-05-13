import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridCellParams,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { useStyles } from "../../styles/makeTheme";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { numberWithCommas } from "../../utils/utils";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { updatestockRequestItemsState } from "../../store/slices/stock-request-items-slice";
import StockRequestItem from "./stock-request-list-item";
import { checkStockBalance } from "../../services/stock-transfer";
// import { StockBalanceBySKURequest } from '../../models/stock-transfer-model';
import { updateItemsState } from "../../store/slices/supplier-add-items-slice";

export interface DataGridProps {
  type: string;
  edit: boolean;
  onMapSKU: (SKU: Array<any>) => void;
  // onChangeItems: (items: Array<any>) => void;
  changeItems: (chang: Boolean) => void;
  update: boolean;
  stock: boolean;
  branch: string;
  status: string;
}

const columnsSKU: GridColDef[] = [
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
    field: "skuName",
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
    field: "stock",
    headerName: "สต๊อกสินค้าคงเหลือ",
    minWidth: 150,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => numberWithCommas(params.value),
  },
  {
    field: "orderAllQty",
    headerName: "สั่ง(ชิ้น)",
    minWidth: 120,
    headerAlign: "center",
    align: "right",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => checkStock(params),
  },
];

// var calBaseUnit = function (params: GridValueGetterParams) {
//   let cal = Number(params.getValue(params.id, 'qty')) * Number(params.getValue(params.id, 'baseUnit'));
//   return numberWithCommas(cal);
// };

const checkStock = (params: GridValueGetterParams) => {
  const stock = Number(params.getValue(params.id, "stock"));
  const orderAllQty = Number(params.getValue(params.id, "orderAllQty"));
  if (orderAllQty > stock) {
    return (
      <Typography variant="body2" sx={{ color: "#F54949" }}>
        {numberWithCommas(orderAllQty)}
      </Typography>
    );
  }

  return (
    <Typography variant="body2">{numberWithCommas(orderAllQty)}</Typography>
  );
};

function StockRequestSKU({
  type,
  edit,
  onMapSKU,
  changeItems,
  update,
  stock,
  branch,
  status,
}: DataGridProps) {
  const dispatch = useAppDispatch();
  const _ = require("lodash");
  const classes = useStyles();
  const stockRequestDetail = useAppSelector(
    (state) => state.stockRequestDetail.stockRequestDetail.data,
  );
  const payloadAddItem = useAppSelector((state) => state.addItems.state);

  let rowsSKU: any = [];

  useEffect(() => {
    if (stock) {
      let skuCodes: any = [];
      if (Object.keys(payloadAddItem).length !== 0) {
        payloadAddItem.map((item: any) => {
          //chk duplicates sku
          const sku = skuCodes.filter((r: any) => r === item.skuCode);
          if (sku.length == 0) {
            skuCodes.push(item.skuCode);
          }
        });
      }
      stockBalanceBySKU(skuCodes);
    }
  }, [update, stock]);

  const [stockBalanceList, setStockBalanceList] = React.useState([]);
  // const [flagCheckStock, setFlagCheckStock] = React.useState(false);
  const [skuCodeSelect, setSkuCodeSelect] = React.useState("ALL");
  const [skuNameDisplay, setSkuNameDisplay] = React.useState("");
  const [isChecked, setIschecked] = React.useState(true);

  const stockBalanceBySKU = async (skuCodes: any) => {
    const payload: any = {
      branchCode: branch,
      skuCodes: skuCodes,
    };

    await checkStockBalance(payload)
      .then((value) => {
        setStockBalanceList(value.data);
        // itemsMapStock(payloadAddItem, value.data);
      })
      .catch((error: any) => {
        console.log("StockBalanceBySKU Error:", error);
      });
  };

  const skuMapStock = async (items: any, stockBalance: any) => {
    //orderBy skuCode
    items = _.orderBy(items, ["skuCode"], ["asc"]);

    let resultSKU: any = [];
    items.map((a: any) => {
      let stockRemain = 0;

      if ((a.stock === 0 || a.stock === undefined) && stockBalance) {
        if (stockBalance.length > 0) {
          stockBalance.forEach((s: any) => {
            if (s.skuCode === a.skuCode) stockRemain = s.stockRemain;
          });
        }
      } else if (a.stock !== 0) {
        stockRemain = a.stock;
      }

      const chkduplicate: any = resultSKU.find(
        (r: any) => r.skuCode === a.skuCode,
      );

      if (chkduplicate) {
        let duplicateSKU: any = [];
        resultSKU.forEach((dup: any) => {
          if (dup.skuCode === a.skuCode) {
            let orderAllQtyDup = dup.orderAllQty ? dup.orderAllQty : 0;
            let sumQty = a.qty * a.baseUnit;
            const itemsDup: any = {
              skuCode: a.skuCode,
              skuName: a.skuName,
              qty: a.qty,
              baseUnit: a.baseUnit,
              stock: stockRemain ? stockRemain : 0,
              orderAllQty: orderAllQtyDup + sumQty,
            };
            duplicateSKU.push(itemsDup);
          } else {
            duplicateSKU.push(dup);
          }
        });

        resultSKU = duplicateSKU;
      } else {
        let sumQty = a.qty * a.baseUnit;
        let orderAllQty = a.orderAllQty ? a.orderAllQty : 0;

        const item: any = {
          skuCode: a.skuCode,
          skuName: a.skuName,
          qty: a.qty,
          baseUnit: a.baseUnit,
          stock: stockRemain ? stockRemain : 0,
          orderAllQty: orderAllQty + sumQty,
        };
        resultSKU.push(item);
      }
    });
    // }, Object.create(null));

    rowsSKU = resultSKU.map((item: any, index: number) => {
      return {
        id: `${item.skuCode}-${index + 1}`,
        index: index + 1,
        skuCode: item.skuCode,
        skuName: item.skuName ? item.skuName : "",
        stock: item.stock ? item.stock : 0,
        orderAllQty: item.orderAllQty ? item.orderAllQty : 0,
        qty: item.qty ? item.qty : 0,
      };
    });

    return onMapSKU(rowsSKU ? rowsSKU : []);
  };

  const itemMap = async (items: any) => {
    let itemsOrderBy: any = [];
    rowsSKU.map((data: any) => {
      let skuCode = data.skuCode;
      let i = items.filter((r: any) => r.skuCode === skuCode);
      i = _.orderBy(i, ["skuCode", "baseUnit"], ["asc", "asc"]);
      i.forEach((data: any) => {
        itemsOrderBy.push(data);
      });
    });

    await dispatch(updatestockRequestItemsState(itemsOrderBy));
  };

  const itemsMap = async (items: any) => {
    skuMapStock(items, stockBalanceList);
    itemMap(items);
  };

  const updateItemsState = async (items: any) => {
    await dispatch(updateAddItemsState(items));
  };

  const mapStockRequestDetail = async () => {
    let _item: any = [];
    if (stockRequestDetail) {
      const itemGroups = stockRequestDetail.itemGroups
        ? stockRequestDetail.itemGroups
        : [];
      const items = stockRequestDetail.items ? stockRequestDetail.items : [];

      if (
        (stockRequestDetail.status === "DRAFT" ||
          stockRequestDetail.status === "AWAITING_FOR_REQUESTER") &&
        stockBalanceList.length === 0
      ) {
        let skuCodes: any = [];
        const itemGroups = stockRequestDetail.itemGroups
          ? stockRequestDetail.itemGroups
          : [];
        itemGroups.map((item: any) => {
          skuCodes.push(item.skuCode);
        });
        await stockBalanceBySKU(skuCodes);
      }

      if (items.length > 0) {
        items.map((item: any) => {
          let productName: any = "";
          let remainingQty: any = 0;
          let orderAllQty: any = 0;
          if (itemGroups.length > 0) {
            itemGroups.forEach((i: any) => {
              const pName = i.productName;
              const oAllQty = i.orderAllQty;
              let sRemain = 0;

              if (stockRequestDetail.status === "DRAFT") {
                stockBalanceList.forEach((s: any) => {
                  if (i.skuCode === s.skuCode) {
                    sRemain = s.stockRemain;
                  }
                });
              } else {
                sRemain = i.remainingQty;
              }

              if (i.skuCode === item.skuCode) {
                productName = pName;
                remainingQty = sRemain;
                orderAllQty = oAllQty;
              }
            });
          }

          const _i: any = {
            barcode: item.barcode,
            barcodeName: item.barcodeName,
            baseUnit: item.barFactor,
            qty: item.orderQty,
            skuCode: item.skuCode,
            skuName: productName,
            unitCode: item.unitCode,
            unitName: item.unitName,
            stock: remainingQty ? remainingQty : 0,
            // orderAllQty: orderAllQty,
          };

          _item.push(_i);
        });
      }
      updateItemsState(_item);
      itemsMap(_item);
    }
  };

  if (Object.keys(payloadAddItem).length > 0) {
    itemsMap(payloadAddItem);
  } else if (!update && type !== "Create") {
    mapStockRequestDetail();
  }

  const [pageSizeSKU, setPageSizeSKU] = React.useState<number>(10);
  const handleChangeItems = async (items: any) => {
    await dispatch(updateAddItemsState(items));
    return changeItems(true);
  };

  const currentlySelected = async (params: GridCellParams) => {
    setIschecked(false);
    setSkuCodeSelect(params.row.skuCode);
    setSkuNameDisplay(params.row.skuName);
  };

  const [flagSave, setFlagSave] = React.useState(false);
  // const handleStatusChangeItems = async (items: any) => {
  //   setFlagSave(true);
  // };

  // const handleCheckboxChange = (e: any) => {
  //   const ischeck = e.target.checked;
  // };

  return (
    <div>
      <div
        style={{ width: "100%", height: rowsSKU.length >= 8 ? "70vh" : "auto" }}
        className={classes.MdataGridDetail}
      >
        <DataGrid
          rows={rowsSKU}
          columns={columnsSKU}
          pageSize={pageSizeSKU}
          onPageSizeChange={(newPageSize) => setPageSizeSKU(newPageSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          pagination
          disableColumnMenu
          autoHeight={rowsSKU.length >= 8 ? false : true}
          scrollbarSize={10}
          rowHeight={65}
          onCellClick={currentlySelected}
        />
      </div>

      <StockRequestItem
        type={type}
        edit={edit}
        onChangeItems={handleChangeItems}
        update={flagSave}
        status={status}
        skuCode={skuCodeSelect}
        skuName={skuNameDisplay}
      />
    </div>
  );
}

export default StockRequestSKU;
