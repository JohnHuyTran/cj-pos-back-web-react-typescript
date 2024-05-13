import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiRef,
  GridRowId,
  GridRowData,
  GridValueGetterParams,
  GridCellParams,
  GridEditCellValueParams,
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
import { DeleteForever } from "@mui/icons-material";
import ModelDeleteConfirm from "../commons/ui/modal-delete-confirm";
import { numberWithCommas } from "../../utils/utils";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { updatestockRequestItemsState } from "../../store/slices/stock-request-items-slice";
import { getUserInfo } from "../../store/sessionStore";
import { PERMISSION_GROUP } from "../../utils/enum/permission-enum";
import { ErrorDetail } from "../../models/api-error-model";

export interface DataGridProps {
  type: string;
  edit: boolean;
  onChangeItems: (items: Array<any>) => void;
  // changeItems: (chang: Boolean) => void;
  update: boolean;
  status: string;
  skuCode: string;
  skuName: string;
}

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 80,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => {
      const condition =
        params.getValue(params.id, "isError") &&
        params.getValue(params.id, "codeError") === 40010;

      return (
        <Box
          component="div"
          sx={{
            paddingLeft: "20px",
            color: `${condition ? "#F54949" : "#000000"}`,
          }}
        >
          {params.value}
        </Box>
      );
    },
  },
  {
    field: "barcode",
    headerName: "บาร์โค้ด",
    minWidth: 200,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => {
      const condition =
        params.getValue(params.id, "isError") &&
        params.getValue(params.id, "codeError") === 40010;

      return (
        <Box
          component="div"
          sx={{
            paddingLeft: "20px",
            color: `${condition ? "#F54949" : "#000000"}`,
          }}
        >
          {params.value}
        </Box>
      );
    },
  },
  {
    field: "productName",
    headerName: "รายละเอียดสินค้า",
    headerAlign: "center",
    minWidth: 300,
    flex: 2,
    sortable: false,
    renderCell: (params) => {
      const condition =
        params.getValue(params.id, "isError") &&
        params.getValue(params.id, "codeError") === 40010;

      return (
        <div
          style={{
            color: `${condition ? "#F54949" : "#000000"}`,
          }}
        >
          <Typography variant="body2">{params.value}</Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: `${condition ? "#F54949" : "#999999"}`,
            }}
          >
            {params.getValue(params.id, "skuCode") || ""}
          </Typography>
        </div>
      );
    },
  },
  {
    field: "qty",
    headerName: "จำนวนที่สั่ง",
    minWidth: 150,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      const condition1 =
        params.getValue(params.id, "isError") &&
        params.getValue(params.id, "codeError") === 40010;
      const condition2 =
        params.getValue(params.id, "isError") &&
        params.getValue(params.id, "codeError") === 40014;

      return (
        <TextField
          variant="outlined"
          name="txnQuantity"
          type="number"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: `${condition2 ? "#F54949" : "#000000"}`,
              },
              "&:hover fieldset": {
                borderColor: `${condition2 ? "#F54949" : "#000000"}`,
              },
            },
          }}
          inputProps={{
            style: {
              textAlign: "right",
              color: `${condition1 ? "#F54949" : "#000000"}`,
            },
          }}
          value={params.value}
          onChange={(e) => {
            let qty = Number(params.getValue(params.id, "qty"));
            var value = e.target.value ? parseInt(e.target.value, 10) : "";
            if (qty === 0) value = chkQty(value);
            if (value < 0) value = 0;
            params.api.updateRows([{ ...params.row, qty: value }]);
          }}
          disabled={params.getValue(params.id, "editMode") ? false : true}
          autoComplete="off"
        />
      );
    },
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    minWidth: 120,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => {
      const condition =
        params.getValue(params.id, "isError") &&
        params.getValue(params.id, "codeError") === 40010;

      return (
        <Box
          component="div"
          sx={{
            paddingLeft: "20px",
            color: `${condition ? "#F54949" : "#000000"}`,
          }}
        >
          {params.value}
        </Box>
      );
    },
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
        {params.getValue(params.id, "editMode") && (
          <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
        )}
      </div>
    ),
    // renderCell: () => {
    //   return <DeleteForever fontSize="medium" sx={{ color: '#F54949' }} />;
    // },
  },
];

var chkQty = (value: any) => {
  let v = String(value);
  if (v.substring(1) === "0") return Number(v.substring(0, 1));
  return value;
};

var calBaseUnit = function (params: GridValueGetterParams) {
  let cal =
    Number(params.getValue(params.id, "qty")) *
    Number(params.getValue(params.id, "baseUnit"));
  return numberWithCommas(cal);
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

function StockTransferListItem({
  type,
  edit,
  onChangeItems,
  update,
  status,
  skuCode,
  skuName,
}: DataGridProps) {
  const dispatch = useAppDispatch();
  const _ = require("lodash");
  const classes = useStyles();
  const stockRequestDetail = useAppSelector(
    (state) => state.stockRequestDetail.stockRequestDetail.data,
  );
  // const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const stockRequestItems = useAppSelector(
    (state) => state.stockRequestItems.state,
  );
  const errorListUpdate = useAppSelector((state) => state.addItems.errorLists);
  const errorList = errorListUpdate ? errorListUpdate : null;
  const errorDetail = errorList.error_details ? errorList.error_details : [];

  let rows: any = [];

  const [isChecked, setIschecked] = React.useState(true);
  // const [skuNameDisplay, setSkuNameDisplay] = React.useState(skuName);
  const [skuCodeSelect, setSkuCodeSelect] = React.useState("ALL");

  const handleCheckboxChange = (e: any) => {
    const ischeck = e.target.checked;
    if (ischeck) {
      setIschecked(true);
      setSkuCodeSelect("ALL");
    } else {
      setIschecked(false);
      setSkuCodeSelect("");
    }
  };

  useEffect(() => {
    if (skuCode !== "ALL") {
      setIschecked(false);
      setSkuCodeSelect(skuCode);
    }
  }, [update, skuCode]);

  const itemsMap = (items: any) => {
    let editM = false;
    const oc = getUserInfo().group === PERMISSION_GROUP.OC;
    const scm = getUserInfo().group === PERMISSION_GROUP.SCM;

    if (!oc) {
      if (
        edit &&
        (status === "" ||
          status === "DRAFT" ||
          status === "AWAITING_FOR_REQUESTER")
      )
        editM = true;
    }

    rows = items.map((item: any, index: number) => {
      return {
        id: `${item.barcode}-${index + 1}`,
        index: index + 1,
        skuName: item.skuName ? item.skuName : "",
        skuCode: item.skuCode,
        barcode: item.barcode,
        productName: item.productName ? item.productName : item.barcodeName,
        unitCode: item.unitCode,
        unitName: item.unitName,
        baseUnit: item.baseUnit ? item.baseUnit : 0,
        qty: item.orderQty ? item.orderQty : item.qty ? item.qty : 0,
        editMode: editM,
        stock: item.stock,
        isError: item.skuCode
          ? errorDetail.some((i: ErrorDetail) => i.skuCode == item.skuCode)
          : false,
        codeError: errorList ? errorList.code : 0,
      };
    });

    // return onChangeItems(items ? items : []);
  };

  if (skuCodeSelect === "ALL") {
    if (type === "Create") {
      if (Object.keys(stockRequestItems).length > 0)
        itemsMap(stockRequestItems);
    } else {
      if (Object.keys(stockRequestItems).length > 0) {
        itemsMap(stockRequestItems);
      } else if (stockRequestDetail) {
        const items = stockRequestDetail.items ? stockRequestDetail.items : [];
        if (items.length > 0) {
          //   updateItemsState(items);
          itemsMap(items);
        }
      }
    }
  } else {
    if (skuCodeSelect === "") {
      rows = [];
      skuName = "";
    } else {
      let itemsOrderBy: any = [];
      let item = stockRequestItems.filter(
        (r: any) => r.skuCode === skuCodeSelect,
      );
      item = _.orderBy(item, ["skuCode", "baseUnit"], ["asc", "asc"]);
      item.forEach((data: any) => {
        itemsOrderBy.push(data);
      });

      itemsMap(item);
    }
  }

  const [pageSize, setPageSize] = React.useState<number>(10);

  const { apiRef, columns } = useApiRef();
  const handleEditItems = async (params: GridEditCellValueParams) => {
    if (params.field === "qty") {
      const itemsList: any = [];
      if (rows.length > 0) {
        const rows: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
        if (skuCodeSelect === "ALL") {
          await rows.forEach((data: GridRowData) => {
            itemsList.push(data);
          });
        } else {
          await stockRequestItems.forEach((data: any) => {
            if (data.skuCode === skuCodeSelect) {
              rows.forEach((d: GridRowData) => {
                if (data.barcode === d.barcode) itemsList.push(d);
              });
            } else {
              itemsList.push(data);
            }
          });
        }
      }
      return onChangeItems(itemsList ? itemsList : []);
    }
  };

  const [openModelDeleteConfirm, setOpenModelDeleteConfirm] =
    React.useState(false);
  const [deleteItems, setDeleteItems] = React.useState(false);
  const [productNameDel, setProductNameDel] = React.useState("");
  const [skuCodeDel, setSkuCodeDel] = React.useState("");
  const [barCodeDel, setBarCodeDel] = React.useState("");
  const currentlySelected = async (params: GridCellParams) => {
    const value = params.colDef.field;
    const isRefPO = params.getValue(params.id, "isRefPO");
    //deleteItem
    // handleUpdateRowState();

    if (!isRefPO && value === "delete") {
      setDeleteItems(true);
      setProductNameDel(String(params.getValue(params.id, "productName")));
      setSkuCodeDel(String(params.getValue(params.id, "skuCode")));
      setBarCodeDel(String(params.getValue(params.id, "barcode")));
      setOpenModelDeleteConfirm(true);
    }
  };

  const handleModelDeleteConfirm = () => {
    setOpenModelDeleteConfirm(false);
  };
  return (
    <div
      style={{ width: "100%", height: rows.length >= 8 ? "70vh" : "auto" }}
      className={classes.MdataGridDetail}
    >
      <Box mt={6}>
        {" "}
        <Typography>
          รายการสินค้า: {isChecked && "รายการสินค้าทั้งหมด"}{" "}
          {!isChecked && `${skuName}`}
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
        onCellClick={currentlySelected}
        onCellFocusOut={handleEditItems}
        onCellOut={handleEditItems}
        onCellKeyDown={handleEditItems}
      />

      <ModelDeleteConfirm
        open={openModelDeleteConfirm}
        onClose={handleModelDeleteConfirm}
        productName={productNameDel}
        skuCode={skuCodeDel}
        barCode={barCodeDel}
      />
    </div>
  );
}

export default StockTransferListItem;
