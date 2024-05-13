import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useStyles } from "../../styles/makeTheme";
import {
  numberWithCommas,
  objectNullOrEmpty,
  stringNullOrEmpty,
} from "../../utils/utils";
import { BootstrapDialogTitle } from "../commons/ui/dialog-title";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SnackbarStatus from "../commons/ui/snackbar-status";
import AlertError from "../commons/ui/alert-error";
import { updateAddDestroyProductState } from "../../store/slices/add-to-destroy-product-slice";
import { searchProductDiscount } from "../../store/slices/search-product-discount";
import ModelConfirmDeleteProduct from "../commons/ui/modal-confirm-delete-product";
import { debounce } from "lodash";

interface Props {
  open: boolean;
  onClose: () => void;
}

const _ = require("lodash");

export const ModalAddProductToDestroyDiscount = ({ open, onClose }: Props) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [dataTable, setDataTable] = React.useState<Array<any>>([]);
  const [productDiscountListHandle, setProductDiscountListHandle] =
    React.useState<Array<any>>([]);
  const [openPopupModal, setOpenPopupModal] = React.useState<boolean>(false);
  const [textError, setTextError] = React.useState("");
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const payloadAddItem = useAppSelector(
    (state) => state.addToDestroyProductSlice.state,
  );
  const productDiscountList = useAppSelector(
    (state) => state.searchProductDiscountSlice.itemList.data,
  );
  const [pageSize, setPageSize] = React.useState<number>(10);

  useEffect(() => {
    if (productDiscountList && productDiscountList.length > 0) {
      let rows = productDiscountList.map((item: any, index: number) => {
        return {
          id: `${item.detail.barcode}-${index + 1}`,
          index: index + 1,
          barcode: item.detail.barcode,
          barcodeName: item.detail.productName,
          skuCode: item.detail.skuCode,
          unit: item.detail.unitName,
          unitCode: item.detail.unitCode || "",
          barFactor: item.detail.barFactor || 0,
          numberOfDiscounted: item.total || 0,
          numberOfRequested: 0,
        };
      });
      setProductDiscountListHandle(rows);
    } else {
      setProductDiscountListHandle([]);
    }
  }, [productDiscountList]);

  useEffect(() => {
    let dataTableFilter = _.differenceBy(
      productDiscountListHandle,
      payloadAddItem,
      "barcode",
    );
    let dataTableHandle = _.cloneDeep(dataTableFilter);
    if (dataTableHandle && dataTableHandle.length > 0) {
      for (const item of dataTableHandle) {
        item.numberOfRequested = 0;
      }
    }
    setDataTable(dataTableHandle);
  }, [productDiscountListHandle, payloadAddItem]);

  useEffect(() => {
    dispatch(searchProductDiscount());
  }, [open]);

  const handleClosePopup = () => {
    setOpenPopupModal(false);
  };

  const handleCloseModalError = () => {
    setOpenModalError(false);
  };

  const handleChangeNumberOfApprove = (event: any, barcode: any) => {
    let currentValue = event.target.value;
    if (
      stringNullOrEmpty(event.target.value) ||
      stringNullOrEmpty(event.target.value.trim())
    ) {
      currentValue = "0";
    }
    if (isNaN(parseInt(currentValue.replace(/,/g, "")))) {
      return;
    }
    setDataTable((preData: any) => {
      const data = [...preData];
      let currentData = data.find((it: any) => it.barcode === barcode);
      if (!objectNullOrEmpty(currentData)) {
        currentData.numberOfRequested = currentValue
          ? parseInt(currentValue.replace(/,/g, "")) < 10000000000
            ? parseInt(currentValue.replace(/,/g, ""))
            : 0
          : 0;
      }
      return data;
    });
  };

  // const onChangeScanProduct = (e: any) => {
  //   handleDebounceFn(e.target.value);
  // };

  const handleDebounceFn = debounce(async (valueInput: any) => {
    if (!stringNullOrEmpty(valueInput) && valueInput.length > 2) {
      let currentValue = valueInput.trim();
      let prefixValue = currentValue.slice(0, 2);
      if ("A4" === prefixValue) {
        try {
          let barcode = currentValue.slice(9, currentValue.length);
          let dataTableHandle = _.cloneDeep(dataTable);
          let dataObj = dataTableHandle.find(
            (it: any) => it.barcode === barcode,
          );
          if (objectNullOrEmpty(dataObj)) {
            showModalError("บาร์โค้ดส่วนลดไม่ถูกต้อง โปรดสแกนใหม่");
          } else {
            if (dataObj.numberOfRequested === dataObj.numberOfDiscounted) {
              showModalError("จำนวนที่ขอเบิกเกินจำนวนสินค้าในสต๊อก");
            } else {
              dataObj.numberOfRequested = dataObj.numberOfRequested + 1;
              setDataTable(dataTableHandle);
            }
          }
        } catch (e) {
          showModalError("บาร์โค้ดส่วนลดไม่ถูกต้อง โปรดสแกนใหม่");
        }
      } else {
        showModalError("บาร์โค้ดส่วนลดไม่ถูกต้อง โปรดสแกนใหม่");
      }
    }
  }, 500);

  const showModalError = (textError: string) => {
    setOpenModalError(true);
    setTextError(textError);
  };

  const handleAddProductDestroy = () => {
    let allProduct = [...dataTable, ...payloadAddItem];
    dispatch(updateAddDestroyProductState(allProduct));
    onClose();
  };

  const columns: GridColDef[] = [
    {
      field: "barcode",
      headerName: "บาร์โค้ด",
      flex: 1,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "barcodeName",
      headerName: "รายละเอียด",
      flex: 1.4,
      headerAlign: "center",
      disableColumnMenu: false,
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
      field: "unit",
      headerName: "หน่วย",
      flex: 0.5,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
    },
    {
      field: "numberOfDiscounted",
      headerName: "จำนวนขอส่วนลด",
      flex: 1,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return numberWithCommas(
          stringNullOrEmpty(params.value) ? "" : params.value,
        );
      },
    },
    {
      field: "numberOfRequested",
      headerName: "จำนวนทำลายจริง",
      flex: 1,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div className={classes.MLabelTooltipWrapper}>
            <TextField
              type="text"
              inputProps={{ maxLength: 13 }}
              className={classes.MtextFieldNumber}
              value={numberWithCommas(
                stringNullOrEmpty(params.value) ? "" : params.value,
              )}
              onChange={(e) => {
                handleChangeNumberOfApprove(e, params.row.barcode);
              }}
            />
          </div>
        );
      },
    },
    {
      field: "delete",
      headerName: " ",
      flex: 0.3,
      align: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const [openModalDelete, setOpenModalDelete] =
          React.useState<boolean>(false);

        const handleOpenModalDelete = () => {
          setOpenModalDelete(true);
        };

        const handleCloseModalDelete = () => {
          setOpenModalDelete(false);
        };

        const handleDeleteItem = () => {
          setDataTable(
            dataTable.filter((r: any) => r.barcode !== params.row.barcode),
          );
          setOpenModalDelete(false);
          setOpenPopupModal(true);
        };

        return (
          <>
            <Button onClick={handleOpenModalDelete}>
              <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
            </Button>
            <ModelConfirmDeleteProduct
              open={openModalDelete}
              onConfirm={handleDeleteItem}
              onClose={handleCloseModalDelete}
              productInfo={{
                barcodeName: params.row.barcodeName,
                skuCode: params.row.skuCode,
                barcode: params.row.barcode,
              }}
            />
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Dialog open={open} maxWidth="lg" fullWidth>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={() => {
            onClose();
          }}
        ></BootstrapDialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item container xs={12}>
              <Grid item xs={6} mb={2}>
                <Typography sx={{ fontWeight: "800" }}>
                  สแกนบาร์โค้ดเพื่อนับ :
                </Typography>
              </Grid>
            </Grid>
            <Grid item container xs={12} mb={3}>
              <Grid item xs={6}>
                <TextField
                  placeholder={"แสกน/ใส่รหัส, บาร์โค้ดส่วนลด"}
                  className={classes.MtextField}
                  variant="outlined"
                  size="small"
                  sx={{ width: "266px" }}
                  onChange={onChangeScanProduct}
                  onKeyPress={onChangeScanProduct}
                />
              </Grid>
            </Grid>
          </Grid>
          <div
            style={{
              width: "100%",
              height: dataTable.length >= 10 ? "70vh" : "auto",
            }}
            className={classes.MdataGridDetail}
          >
            <DataGrid
              rows={dataTable}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[10, 20, 50, 100]}
              pagination
              disableColumnMenu
              autoHeight={dataTable.length < 10}
              scrollbarSize={10}
              rowHeight={70}
              components={{
                NoRowsOverlay: () => (
                  <Typography
                    position="relative"
                    textAlign="center"
                    top="112px"
                    color="#AEAEAE"
                  >
                    ไม่มีข้อมูล
                  </Typography>
                ),
              }}
            />
          </div>
        </DialogContent>
        <Grid item xs={12} sx={{ textAlign: "right" }} mr={3} mb={3}>
          <Button
            variant="contained"
            color="info"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            className={classes.MbtnSearch}
            onClick={handleAddProductDestroy}
          >
            เพิ่มสินค้า
          </Button>
        </Grid>
        <SnackbarStatus
          open={openPopupModal}
          onClose={handleClosePopup}
          isSuccess={true}
          contentMsg={"คุณได้ลบข้อมูลเรียบร้อยแล้ว"}
        />
        <AlertError
          open={openModalError}
          onClose={handleCloseModalError}
          textError={textError}
        />
      </Dialog>
    </div>
  );
};

export default ModalAddProductToDestroyDiscount;
