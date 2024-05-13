import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import React, { ReactElement, useMemo, useRef } from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { ItemInfo } from "../../../models/modal-add-item-model";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import { useStyles } from "../../../styles/makeTheme";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { DeleteForever } from "@mui/icons-material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridRowData,
  GridRowId,
  useGridApiRef,
} from "@mui/x-data-grid";
import LoadingModal from "./loading-modal";
import { featchAllItemsListAsync } from "../../../store/slices/search-all-items";
import {
  FindProductProps,
  FindProductRequest,
} from "../../../models/product-model";
import _ from "lodash";
import { getAllProductByBarcode } from "services/product-master";

interface StateItem {
  barcodeName: string;
  barcode: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  requestBody: FindProductRequest;
}

const columns: GridColDef[] = [
  {
    field: "barcode",
    headerName: "บาร์โค้ด",
    flex: 1.2,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "barcodeName",
    headerName: "รายละเอียด",
    headerAlign: "center",
    minWidth: 200,
    flex: 2.25,
    sortable: false,
    renderCell: (params) => (
      <div>
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {params.value}
        </Typography>
      </div>
    ),
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    flex: 0.7,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "qty",
    headerName: "จำนวน",
    flex: 0.7,
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <TextField
        variant="outlined"
        name="txnQuantity"
        type="number"
        inputProps={{ style: { textAlign: "right" } }}
        value={params.value}
        onChange={(e) => {
          var value = e.target.value ? parseInt(e.target.value) : "";
          if (value < 0) value = 0;
          params.api.updateRows([{ ...params.row, qty: value }]);
        }}
        autoComplete="off"
      />
    ),
  },
  {
    field: "delete",
    headerName: " ",
    width: 40,
    minWidth: 0,
    align: "right",
    sortable: false,
    renderCell: () => {
      return <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />;
    },
  },
];

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

export default function ModalAddItems({
  open,
  onClose,
  requestBody,
}: Props): ReactElement {
  const { apiRef, columns } = useApiRef();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [searchItem, setSearchItem] = React.useState<any | null>(null);
  const [values, setValues] = React.useState<string[]>([]);
  // const itemsList = useAppSelector((state) => state.searchAllItemsList.itemList);
  const [itemsList, setItemList] = React.useState([]);
  const [newAddItemListArray, setNewAddItemListArray] = React.useState<
    ItemInfo[]
  >([]);
  const searchDebouceRef = useRef<any>();
  let rows: any = [];
  rows = newAddItemListArray.map((item: any, index: number) => {
    return {
      id: index,
      barcode: item.barcode,
      unitName: item.unitName,
      unitCode: item.unitCode,
      barcodeName: item.barcodeName,
      productName: item.barcodeName,
      qty: item.qty ? item.qty : 1,
      qtyRef: 0,
      skuCode: item.skuCode,
      skuName: item.skuName,
      unitPrice: item.unitPrice,
      unitPriceText: item.unitPriceText,
      baseUnit: item.baseUnit,
      stockMax: item.stockMax,
    };
  });

  const [barcodeNameDel, setBarcodeNameDel] = React.useState("");
  const [skuCodeDel, setSkuCodeDel] = React.useState("");
  const [barCodeDel, setBarCodeDel] = React.useState("");
  const [openModelDeleteConfirm, setOpenModelDeleteConfirm] =
    React.useState(false);
  const currentlyDelete = (params: GridCellParams) => {
    const value = params.colDef.field;
    if (value === "delete") {
      setBarcodeNameDel(String(params.getValue(params.id, "barcodeName")));
      setSkuCodeDel(String(params.getValue(params.id, "skuCode")));
      setBarCodeDel(String(params.getValue(params.id, "barcode")));
      setOpenModelDeleteConfirm(true);
    }
  };
  const handleModelDeleteConfirm = () => {
    setOpenModelDeleteConfirm(false);
  };
  const handleDeleteItem = () => {
    setNewAddItemListArray(
      newAddItemListArray.filter((r: any) => r.barcode !== barCodeDel),
    );
    setOpenModelDeleteConfirm(false);
  };

  const handldCloseAddItemModal = () => {
    onClose();
    setSearchItem(null);
  };

  const onInputChange = async (event: any, value: string, reason: string) => {
    searchDebouceRef.current?.cancel();
    searchDebouceRef.current = _.debounce(async () => {
      if (event && event.keyCode && event.keyCode === 13) {
        return false;
      }

      // console.log('onInputChange', { reason, value });
      if (reason == "reset") {
        clearInput();
      }

      const keyword = value.trim();
      const payload: FindProductProps = {
        search: keyword,
        payload: requestBody,
      };

      if (keyword.length >= 3 && reason !== "reset") {
        setLoading(true);
        setSearchItem(keyword);
        // await dispatch(featchAllItemsListAsync(payload));
        try {
          const rs = await getAllProductByBarcode(payload);
          if (rs) {
            if (rs.data.length === 1) {
              handleChangeItem("", rs.data[0], "selectOption");
              setItemList([]);
            } else {
              setItemList(rs.data);
            }
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
        setLoading(false);
      } else {
        clearData();
      }
    }, 200);
    searchDebouceRef.current();
  };

  let options: any = [];
  if (searchItem) options = itemsList && itemsList.length > 0 ? itemsList : [];
  const filterOptions = createFilterOptions({
    stringify: (option: any) => option.barcodeName + option.barcode,
  });
  const autocompleteRenderListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.barcode}>
        <div>
          <Typography variant="body2">{option.barcodeName}</Typography>
          <Typography color="textSecondary" variant="caption">
            {option.barcode}
          </Typography>
        </div>
      </li>
    );
  };

  const [loading, setLoading] = React.useState(false);
  const autocompleteRenderInput = (params: any) => {
    return (
      <TextField
        data-testid="testid-tbxSearch"
        autoFocus={true}
        {...params}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
        placeholder="บาร์โค้ด/รายละเอียดสินค้า"
        className={classes.MtextField}
        variant="outlined"
        size="small"
        fullWidth
      />
    );
  };

  const handleChangeItem = async (event: any, option: any, reason: string) => {
    if (option && reason === "selectOption") {
      let barcode = option?.barcode;
      setSearchItem(null);
      const chkduplicate: any = newAddItemListArray.find(
        (r: any) => r.barcode === barcode,
      );
      if (chkduplicate) {
        let duplicateIems: any = [];
        newAddItemListArray.forEach((data: any) => {
          if (data.barcode === barcode) {
            const itemsDup: any = {
              barcode: data.barcode,
              barcodeName: data.barcodeName,
              productName: data.barcodeName,
              qty: Number(data.qty ? data.qty : 0) + 1,
              qtyRef: 0,
              skuCode: data.skuCode,
              skuName: data.skuName,
              unitCode: data.unitCode,
              unitName: data.unitName,
              unitPrice: data.unitPrice,
              unitPriceText: data.unitPriceText,
              baseUnit: data.baseUnit,
              stockMax: data.stockMax,
            };
            duplicateIems.push(itemsDup);
          } else {
            duplicateIems.push(data);
          }
        });
        setNewAddItemListArray(duplicateIems);
      } else {
        const itemsList: any = [];
        if (rows.length > 0) {
          const rowsEdit: Map<GridRowId, GridRowData> =
            apiRef.current.getRowModels();
          rowsEdit.forEach((data: GridRowData) => {
            itemsList.push(data);
          });
          setNewAddItemListArray(itemsList);
        }
        itemsList.push(option);
        setNewAddItemListArray(itemsList);
      }

      clearInput();
    } else {
      clearData();
    }
  };

  const clearData = async () => {
    options = [];
  };

  const clearInput = () => {
    setValues([]);
  };

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const handleAddItems = async () => {
    setOpenLoadingModal(true);
    const rowsEdit: Map<GridRowId, GridRowData> = apiRef.current.getRowModels();
    const itemsList: any = [];
    rowsEdit.forEach((data: GridRowData) => {
      itemsList.push(data);
    });

    let result: any = [];
    if (payloadAddItem.length > 0) {
      const sumAddItemList = [...itemsList, ...payloadAddItem];
      var o: any = {};
      sumAddItemList.forEach((i: any) => {
        var id = i.barcode;
        if (!o[id]) {
          return (o[id] = i);
        }
        var iQty = i.qty
          ? i.qty
          : i.orderQty
            ? i.orderQty
            : i.actualQty
              ? i.actualQty
              : 0;
        return (o[id].qty = o[id].qty + iQty), (o[id].qtyRef = i.qtyRef);
      });

      var itemResult: any = [];
      Object.keys(o).forEach((key) => {
        itemResult.push(o[key]);
      });
      result = itemResult;
    } else {
      result = itemsList;
    }

    await dispatch(updateAddItemsState(result));
    setNewAddItemListArray([]);
    setSearchItem(null);
    setTimeout(() => {
      setOpenLoadingModal(false);
      onClose();
    }, 300);
  };

  const handleEditItems = async () => {
    const itemsList: any = [];
    if (rows.length > 0) {
      const rowsEdit: Map<GridRowId, GridRowData> =
        apiRef.current.getRowModels();
      rowsEdit.forEach((data: GridRowData) => {
        itemsList.push(data);
      });
    }

    if (itemsList.length > 0) setNewAddItemListArray(itemsList);
  };

  return (
    <div>
      <Dialog open={open} maxWidth="sm" fullWidth={true}>
        <DialogContent>
          <Box sx={{ display: "flex" }}>
            <Box pt={1.5} sx={{ flex: 2 }}>
              รายการสินค้า :
            </Box>
            <Box sx={{ flex: 7 }}>
              <Autocomplete
                data-testid="autocomplete-search-branch-list"
                id="selAddItem"
                value={values}
                fullWidth
                // freeSolo
                loadingText="กำลังโหลด..."
                loading={loading}
                options={options}
                filterOptions={filterOptions}
                renderOption={autocompleteRenderListItem}
                onChange={handleChangeItem}
                onInputChange={onInputChange}
                getOptionLabel={(option) =>
                  option.barcodeName ? option.barcodeName : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.barcodeName === value.barcodeName
                }
                renderInput={autocompleteRenderInput}
                noOptionsText={""}
              />
            </Box>

            <Box sx={{ flex: 1, ml: 2 }}>
              {handldCloseAddItemModal ? (
                <IconButton
                  data-testid="testid-btnClose"
                  aria-label="close"
                  onClick={handldCloseAddItemModal}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme: any) => theme.palette.grey[400],
                  }}
                >
                  <CancelOutlinedIcon
                    fontSize="large"
                    stroke={"white"}
                    strokeWidth={1}
                  />
                </IconButton>
              ) : null}
            </Box>
          </Box>

          {newAddItemListArray.length > 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}
            >
              <div
                style={{ width: "100%" }}
                className={classes.MdataGridPaginationTop}
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  disableColumnMenu
                  hideFooter
                  autoHeight
                  onCellClick={currentlyDelete}
                  onCellOut={handleEditItems}
                  rowHeight={70}
                />
              </div>
            </Box>
          )}
          {newAddItemListArray.length == 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}
            ></Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              data-testid="testid-btnAdd"
              id="btnAdd"
              variant="contained"
              color="secondary"
              onClick={handleAddItems}
              className={classes.MbtnSearch}
              size="large"
              disabled={newAddItemListArray.length === 0}
              startIcon={<AddCircleOutlineIcon />}
            >
              เพิ่มสินค้า
            </Button>
          </Box>
        </DialogContent>
        <LoadingModal open={openLoadingModal} />
      </Dialog>

      <Dialog
        open={openModelDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ minWidth: 800 }}
      >
        <DialogContent sx={{ pl: 6, pr: 8 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
              ต้องการลบสินค้า
            </Typography>
            <Typography variant="body1" align="left">
              สินค้า{" "}
              <label style={{ color: "#AEAEAE", marginRight: 5 }}>|</label>{" "}
              <label style={{ color: "#36C690" }}>
                <b>{barcodeNameDel}</b>
                <br />
                <label
                  style={{
                    color: "#AEAEAE",
                    fontSize: 14,
                    marginLeft: "3.8em",
                  }}
                >
                  {skuCodeDel}
                </label>
              </label>
            </Typography>
            <Typography variant="body1" align="left">
              บาร์โค้ด{" "}
              <label style={{ color: "#AEAEAE", marginRight: 5 }}>|</label>{" "}
              <label style={{ color: "#36C690" }}>
                <b>{barCodeDel}</b>
              </label>
            </Typography>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2, pl: 6, pr: 8 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 90, mr: 2 }}
            onClick={handleModelDeleteConfirm}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, width: 90 }}
            onClick={handleDeleteItem}
          >
            ลบสินค้า
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
