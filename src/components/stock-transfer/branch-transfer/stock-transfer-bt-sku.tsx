import React from "react";
import { useStyles } from "../../../styles/makeTheme";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import Typography from "@mui/material/Typography";

import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  Item,
  ItemGroups,
  StockBalanceResponseType,
  StockBalanceType,
} from "../../../models/stock-transfer-model";
import { checkStockBalance } from "../../../services/stock-transfer";
import _ from "lodash";
import { numberWithCommas, objectNullOrEmpty } from "../../../utils/utils";
import { ApiError } from "../../../models/api-error-model";
import BranchTransferListItem from "./stock-transfer-bt-item";

interface Props {
  onSelectSku: (value: any) => void;
  skuList: ItemGroups[];
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
    field: "productName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 220,
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
    field: "remainingQty",
    headerName: "สต๊อกสินค้าคงเหลือ",
    minWidth: 200,
    headerAlign: "center",
    align: "right",
    sortable: false,
    renderCell: (params) => numberWithCommas(params.value),
  },
  {
    field: "orderAllQty",
    headerName: "สั่ง(ชิ้น)",
    minWidth: 200,
    headerAlign: "center",
    sortable: false,
    align: "right",
    renderCell: (params) => params.value,
  },
  {
    field: "actualAllQty",
    headerName: "จัด(ชิ้น)",
    minWidth: 200,
    headerAlign: "center",
    sortable: false,
    align: "right",
    renderCell: (params) => params.value,
  },
  {
    field: "unitDiff",
    headerName: "ส่วนต่าง",
    minWidth: 200,
    headerAlign: "center",
    sortable: false,
    align: "right",
    renderCell: (params: GridRenderCellParams) => calProductDiff(params),
  },
];
var calProductDiff = function (params: GridValueGetterParams) {
  let diff =
    Number(params.getValue(params.id, "actualAllQty")) -
    Number(params.getValue(params.id, "orderAllQty"));

  if (diff < 0)
    return (
      <label style={{ color: "#F54949", fontWeight: 700 }}> {diff} </label>
    );
  if (diff > 0)
    return (
      <label style={{ color: "#F54949", fontWeight: 700 }}> +{diff} </label>
    );
  return diff;
};
function BranchTransferListSKU({
  onSelectSku,
  skuList,
  onUpdateItemList,
}: Props) {
  const classes = useStyles();

  const dispatch = useAppDispatch();

  const branchTransferRslList = useAppSelector(
    (state) => state.branchTransferDetailSlice.branchTransferRs,
  );

  const branchTransferInfo: any = branchTransferRslList.data
    ? branchTransferRslList.data
    : null;
  const [btItemGroups, setBtItemGroups] = React.useState<ItemGroups[]>(
    branchTransferInfo.itemGroups ? branchTransferInfo.itemGroups : [],
  );

  const [isDraft, setIsDraft] = React.useState(false);

  const [pageSize, setPageSize] = React.useState<number>(5);
  const [selectSKU, setSelectSKU] = React.useState("");
  const [selectSKUName, setSelectSKUName] = React.useState("");
  const [isClickCell, setIsClickCell] = React.useState(false);
  const currentlySelected = async (params: GridCellParams) => {
    const skuCode = objectNullOrEmpty(params.getValue(params.id, "skuCode"))
      ? ""
      : params.getValue(params.id, "skuCode")?.toString();
    const skuName = objectNullOrEmpty(params.getValue(params.id, "productName"))
      ? ""
      : params.getValue(params.id, "productName")?.toString();
    setSelectSKU(skuCode ? skuCode : "");
    setSelectSKUName(skuName ? skuName : "");
    onSelectSku(skuCode);
    setIsClickCell(!isClickCell);
  };

  let rows = btItemGroups.map((item: ItemGroups, index: number) => {
    return {
      id: `${item.skuCode}-${index + 1}`,
      index: index + 1,
      productName: item.productName,
      skuCode: item.skuCode,
      remainingQty: item.remainingQty ? item.remainingQty : 0,
      orderAllQty: item.orderAllQty ? item.orderAllQty : 0,
      actualAllQty: item.actualAllQty ? item.actualAllQty : 0,
      isDraft: isDraft,
    };
  });

  React.useEffect(() => {
    setBtItemGroups(skuList);
  }, [skuList]);

  React.useEffect(() => {
    fetchStockBalance();
  }, []);

  async function fetchStockBalance() {
    const _skuSlice = skuList;
    const list = _.uniqBy(_skuSlice, "skuCode");
    const skucodeList: string[] = [];
    list.map((i: any) => {
      skucodeList.push(i.skuCode);
    });
    const payload: StockBalanceType = {
      skuCodes: skucodeList,
      branchCode: branchTransferInfo.branchFrom,
    };

    await checkStockBalance(payload)
      .then(async (value) => {
        mappingSkuWithRemainingQty(value);
      })
      .catch((error: ApiError) => {});
  }

  const mappingSkuWithRemainingQty = (
    stockBalanceRs: StockBalanceResponseType,
  ) => {
    const stockBalanceList: StockBalanceType[] = stockBalanceRs.data;
    const _skuSlice = skuList;
    let _newSku: ItemGroups[] = [];
    _skuSlice.forEach((data: ItemGroups) => {
      const result = stockBalanceList.find((balance: StockBalanceType) => {
        return data.skuCode === balance.skuCode;
      });
      let newData: ItemGroups = {
        skuCode: data.skuCode,
      };
      if (result) {
        newData = {
          skuCode: data.skuCode,
          productName: data.productName,
          orderAllQty: data.orderAllQty,
          actualAllQty: data.actualAllQty,
          remainingQty: result.stockRemain,
        };
      } else {
        newData = {
          skuCode: data.skuCode,
          productName: data.productName,
          orderAllQty: data.orderAllQty,
          actualAllQty: data.actualAllQty,
          remainingQty: data.remainingQty,
        };
      }

      _newSku.push(newData);
    });
    setBtItemGroups(_newSku);
  };

  const updateSKUList = (_items: Item[]) => {
    let _sku = [...btItemGroups];
    let _newSku: ItemGroups[] = [];

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
    setBtItemGroups(_newSku);
    return onUpdateItemList(_items);
  };

  return (
    <>
      <div
        style={{ width: "100%", height: rows.length >= 5 ? "45vh" : "auto" }}
        className={classes.MdataGridDetail}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          pagination
          disableColumnMenu
          autoHeight={rows.length >= 8 ? false : true}
          scrollbarSize={10}
          rowHeight={65}
          onCellClick={currentlySelected}
        />
      </div>

      <BranchTransferListItem
        skuCodeSelect={selectSKU}
        skuNameSelect={selectSKUName}
        onUpdateItemList={updateSKUList}
        isClickSKU={isClickCell}
      />
    </>
  );
}

export default BranchTransferListSKU;
