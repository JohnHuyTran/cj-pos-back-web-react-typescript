import React, { ReactElement, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useStyles } from "../../styles/makeTheme";
import { updateAddTypeAndProductState } from "../../store/slices/add-type-product-slice";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { STProductDetail } from "../../models/sale-limit-time";
import {
  setCheckEdit,
  setProductList,
} from "../../store/slices/sale-limit-time-slice";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const _ = require("lodash");

interface Props {
  unSelectAllType: (showAll: boolean) => void;
  disabled?: boolean;
}

export default function STProductItems({
  unSelectAllType,
  disabled,
}: Props): ReactElement {
  const classes = useStyles();
  const [dtTable, setDtTable] = React.useState<Array<STProductDetail>>([]);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );
  const productList = useAppSelector(
    (state) => state.saleLimitTime.productList,
  );
  const [showAll, setShowAll] = React.useState(true);
  const dispatch = useAppDispatch();

  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };
  useEffect(() => {
    if (Object.keys(payloadAddTypeProduct).length !== 0) {
      let rows = payloadAddTypeProduct
        .filter((el: any) => el.selectedType === 2 && el.showProduct)
        .map((item: any, index: number) => {
          return {
            id: `${index}-${item.barcode}`,
            index: index + 1,
            barcode: item.barcode,
            skuCode: item.skuCode,
            unitName: item.unitName,
            barcodeName: item.barcodeName,
            categoryTypeCode: item.categoryTypeCode,
          };
        });
      setDtTable(rows);
      if (
        payloadAddTypeProduct.filter(
          (el: any) => el.selectedType === 2 && !el.showProduct,
        ).length !== 0
      ) {
        setShowAll(false);
        unSelectAllType(false);
      } else {
        setShowAll(true);
        unSelectAllType(false);
      }
    } else {
      setDtTable([]);
    }
  }, [payloadAddTypeProduct]);
  useEffect(() => {
    if (showAll && !!Object.keys(payloadAddTypeProduct).length) {
      let newList = _.cloneDeep(payloadAddTypeProduct);
      newList.map((el: any) => {
        if (el.selectedType === 2) {
          el.showProduct = true;
        }
      });
      dispatch(updateAddTypeAndProductState(newList));
    }
  }, [showAll]);
  const handleShowProducts = (e: any) => {
    setShowAll(e.target.checked);
    if (!e.target.checked) {
      setDtTable([]);
    }
    unSelectAllType(e.target.checked);
    dispatch(setProductList("รายการสินค้าทั้งหมด"));
  };
  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      headerAlign: "center",
      disableColumnMenu: false,
      flex: 1,
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
      headerAlign: "center",
      flex: 1.5,
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "barcodeName",
      headerName: "รายละเอียดสินค้า",
      headerAlign: "center",
      flex: 3,
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => {
        return (
          <div style={{ paddingLeft: "10px" }}>
            <Typography variant="body2">{params.value}</Typography>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.getValue(params.id, "skuCode") || ""}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "unitName",
      headerName: "หน่วย",
      flex: 1,
      align: "left",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        return (
          <Typography variant="body2" paddingLeft="10px">
            {params.value}
          </Typography>
        );
      },
    },
    {
      field: "delete",
      headerName: " ",
      flex: 0.5,
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const [openModalDelete, setOpenModalDelete] =
          React.useState<boolean>(false);
        const handleOpenModalDelete = () => {
          setOpenModalDelete(true);
        };

        const handleCloseModalDelete = () => {
          setOpenModalDelete(false);
        };

        const handleDeleteItem = () => {
          let newList = payloadAddTypeProduct.filter(
            (r: any) => r.barcode !== params.row.barcode,
          );
          let newListProducts = newList.filter((r: any) => r.selectedType == 2);
          if (newListProducts.length > 0) {
            let listAdd = newList.filter((item: any) => {
              let listCodeProductByType = newList.map(
                (el1: any) => el1.productTypeCode,
              );
              if (
                item.selectedType === 1 &&
                !listCodeProductByType.includes(item.productTypeCode)
              ) {
                return false;
              } else return true;
            });
            dispatch(updateAddTypeAndProductState(listAdd));
          } else {
            dispatch(updateAddTypeAndProductState([]));
          }
          dispatch(setCheckEdit(true));
          setOpenModalDelete(false);
          setShowSnackBar(true);
        };

        return (
          <>
            {!disabled && (
              <Button onClick={handleOpenModalDelete}>
                <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
              </Button>
            )}

            <Dialog
              open={openModalDelete}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              PaperProps={{ sx: { minWidth: 450, minHeight: 241 } }}
            >
              <DialogContent sx={{ pl: 6, pr: 8 }}>
                <DialogContentText
                  id="alert-dialog-description"
                  sx={{ color: "#263238" }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ marginBottom: 2 }}
                  >
                    ต้องการลบสินค้า
                  </Typography>
                  <Grid container>
                    <Grid item xs={4} sx={{ textAlign: "right" }}>
                      สินค้า{" "}
                      <label style={{ color: "#AEAEAE", margin: "0 5px" }}>
                        |
                      </label>
                    </Grid>
                    <Grid item xs={8} sx={{ pl: 1 }}>
                      <label style={{ color: "#36C690" }}>
                        <b>{params.row.barcodeName}</b>
                        <br />
                        <label
                          style={{
                            color: "#AEAEAE",
                            fontSize: 13,
                          }}
                        >
                          {params.row.skuCode}
                        </label>
                      </label>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: "right" }}>
                      บาร์โค้ด{" "}
                      <label style={{ color: "#AEAEAE", margin: "0 5px" }}>
                        |
                      </label>
                    </Grid>
                    <Grid item xs={8} sx={{ pl: 1 }}>
                      <label style={{ color: "#36C690" }}>
                        <b>{params.row.barcode}</b>
                      </label>
                    </Grid>
                  </Grid>
                </DialogContentText>
              </DialogContent>

              <DialogActions
                sx={{ justifyContent: "center", mb: 2, pl: 6, pr: 8 }}
              >
                <Button
                  id="btnCancle"
                  variant="contained"
                  color="inherit"
                  sx={{ borderRadius: 2, width: 90, mr: 2 }}
                  onClick={handleCloseModalDelete}
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
          </>
        );
      },
    },
  ];
  return (
    <>
      <Typography sx={{ fontSize: "24px" }}>
        <b>รายการสินค้า : {productList}</b>
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={showAll}
              onClick={handleShowProducts}
            />
          }
          label="แสดงรายการสินค้าทั้งหมด"
        />
      </FormGroup>
      <Box
        sx={{ display: "flex", justifyContent: "flex-start", mt: 1, mb: 1.5 }}
      >
        <div
          style={{ width: "90%" }}
          className={classes.MdataGridPaginationTop}
        >
          <DataGrid
            rows={dtTable}
            columns={columns}
            disableColumnMenu
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            pagination
            autoHeight
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
      </Box>

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={true}
        contentMsg={"คุณได้ลบข้อมูลเรียบร้อยแล้ว"}
      />
    </>
  );
}
