import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import React, { ReactElement, useEffect, useMemo, useRef } from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { ItemInfo } from "../../models/modal-add-item-model";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateItemsState } from "../../store/slices/supplier-add-items-slice";

import { useStyles } from "../../styles/makeTheme";
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
import LoadingModal from "../commons/ui/loading-modal";
import _ from "lodash";

interface Props {
  open: boolean;
  onClose: () => void;
  supNo: string;
}

const columns: GridColDef[] = [
  {
    field: "barcode",
    headerName: "บาร์โค้ด",
    flex: 1.2,
    // minWidth: 125,
    headerAlign: "center",
    // disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcodeName",
    headerName: "รายละเอียด",
    headerAlign: "center",
    flex: 1.7,
    // minWidth: 180,
    // disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "unitName",
    headerName: "หน่วย",
    flex: 0.7,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "actualQty",
    headerName: "จำนวน",
    flex: 0.7,
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
          var value = e.target.value ? parseInt(e.target.value) : "";
          if (value < 0) value = 0;
          params.api.updateRows([{ ...params.row, actualQty: value }]);
        }}
        autoComplete="off"
      />
    ),
  },
  {
    field: "delete",
    headerName: "ลบ",
    // flex: 0.5,
    width: 50,
    minWidth: 0,
    align: "center",
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

function ModalAddItem({ open, onClose, supNo }: Props): ReactElement {
  const { apiRef, columns } = useApiRef();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const searchDebouceRef = useRef<any>();
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  // const [searchItem, setSearchItem] = React.useState<any | null>(null);
  const [values, setValues] = React.useState<string[]>([]);
  const [newAddItemListArray, setNewAddItemListArray] = React.useState<
    ItemInfo[]
  >([]);
  let rows: any = [];
  rows = newAddItemListArray.map((item: any, index: number) => {
    return {
      id: index,
      barcode: item.barcode,
      unitName: item.unitName,
      barcodeName: item.barcodeName,
      actualQty: item.actualQty ? item.actualQty : 1,
      skuCode: item.skuCode,
      unitPrice: item.unitPriceText,
    };
  });

  const handldCloseAddItemModal = () => {
    onClose();
    // setSearchItem(null);
    setNewAddItemListArray([]);
  };

  const _itemsList = useAppSelector(
    (state) => state.searchItemListBySupplier.itemList,
  );
  const [itemsList, setItemList] = React.useState(
    _itemsList.data && _itemsList.data.length > 0 ? _itemsList.data : [],
  );
  let options: any = itemsList && itemsList.length > 0 ? itemsList : [];
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

  const autocompleteRenderInput = (params: any) => {
    return (
      <TextField
        id="tbxSearch"
        {...params}
        placeholder="บาร์โค้ด/รายละเอียดสินค้า"
        className={classes.MtextField}
        variant="outlined"
        size="small"
        fullWidth
        onMouseDown={handleOnMouseDown}
        onChange={handleOnMouseDown}
      />
    );
  };

  const handleChangeItem = async (event: any, option: any, reason: string) => {
    if (option && reason === "selectOption") {
      let barcode = option?.barcode;
      // setSearchItem(null);
      const chkduplicate: any = newAddItemListArray.find(
        (r: any) => r.barcode === barcode,
      );
      if (chkduplicate) {
        let duplicateIems: any = [];
        newAddItemListArray.forEach((data: any) => {
          let qty = data.qty ? data.qty : data.actualQty;
          if (data.barcode === barcode) {
            const itemsDup: any = {
              barcode: data.barcode,
              barcodeName: data.barcodeName,
              actualQty: Number(qty) + 1,
              skuCode: data.skuCode,
              unitCode: data.unitCode,
              unitName: data.unitName,
              unitPrice: data.unitPriceText,
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
      // setItemList(_itemsList.data && _itemsList.data.length > 0 ? _itemsList.data : []);
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

  const payloadAddItem = useAppSelector(
    (state) => state.supplierAddItems.state,
  );
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
        return (o[id].actualQty = o[id].actualQty + i.actualQty);
      });

      var itemResult: any = [];
      Object.keys(o).forEach((key) => {
        itemResult.push(o[key]);
      });
      result = itemResult;
    } else {
      result = itemsList;
    }

    await dispatch(updateItemsState(result));
    setNewAddItemListArray([]);
    // setSearchItem(null);
    setTimeout(() => {
      setOpenLoadingModal(false);
      onClose();
    }, 300);
  };

  const onInputChange = async (event: any, value: string, reason: string) => {
    searchDebouceRef.current?.cancel();
    searchDebouceRef.current = _.debounce(async () => {
      if (event && event.keyCode && event.keyCode === 13) {
        return false;
      }
      if (reason == "reset") {
        clearInput();
      }
      const keyword = value.trim();
      const _itemList = itemsList && itemsList.length > 0 ? itemsList : [];
      const _option: any = _itemList.filter((r: any) => r.barcode === keyword);
      if (value && _option.length > 0) {
        const item: any = {
          barcode: _option[0].barcode,
          barcodeName: _option[0].barcodeName,
          freshLifeBuyPrice: _option[0].freshLifeBuyPrice,
          qty: 1,
          skuCode: _option[0].skuCode,
          unitCode: _option[0].unitCode,
          unitName: _option[0].unitName,
          unitPrice: _option[0].unitPrice,
          unitPriceText: _option[0].unitPriceText,
        };
        setItemList([]);
        handleChangeItem(null, item, "selectOption");
      }
    }, 200);
    searchDebouceRef.current();
  };

  const handleOnMouseDown = () => {
    setItemList(
      _itemsList.data && _itemsList.data.length > 0 ? _itemsList.data : [],
    );
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
                id="selAddItem"
                value={values}
                fullWidth
                loadingText="กำลังโหลด..."
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
                noOptionsText=""
              />
            </Box>

            <Box sx={{ flex: 1, ml: 2 }}>
              {handldCloseAddItemModal ? (
                <IconButton
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
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
                />
              </div>
            </Box>
          )}
          {newAddItemListArray.length == 0 && _itemsList.code === 204 && (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 4 }}
              color="#CBD4DB"
            >
              <h4>ไม่พบสินค้า</h4>
            </Box>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              id="btnSearch"
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

export default ModalAddItem;
