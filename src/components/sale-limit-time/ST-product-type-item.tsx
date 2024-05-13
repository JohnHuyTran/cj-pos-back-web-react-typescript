import React, { ReactElement, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Typography,
} from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useStyles } from "../../styles/makeTheme";
import { updateAddTypeAndProductState } from "../../store/slices/add-type-product-slice";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import {
  setCheckEdit,
  setProductList,
} from "../../store/slices/sale-limit-time-slice";

const _ = require("lodash");

interface Props {
  unSelectAllType: boolean;
  disabled?: boolean;
}

export default function STProductTypeItems({
  unSelectAllType,
  disabled,
}: Props): ReactElement {
  const classes = useStyles();
  const [dtTable, setDtTable] = React.useState([]);
  const dispatch = useAppDispatch();
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [selectionModel, setSelectionModel] = React.useState<any>([]);
  useEffect(() => {
    if (Object.keys(payloadAddTypeProduct).length !== 0) {
      let rows = payloadAddTypeProduct
        .filter((el: any) => el.selectedType === 1)
        .map((item: any, index: number) => {
          return {
            id: item.productTypeCode,
            index: index + 1,
            productTypeName: item.productTypeName,
            numberOfPruducts: payloadAddTypeProduct.filter(
              (el1: any) =>
                el1.selectedType === 2 &&
                el1.productTypeCode === item.productTypeCode,
            ).length,
          };
        });

      setDtTable(rows);
    } else {
      setDtTable([]);
    }
  }, [payloadAddTypeProduct]);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  useEffect(() => {
    if (unSelectAllType) {
      setSelectionModel([]);
    }
  }, [unSelectAllType]);

  const handleClickRow = (value: any) => {
    let newList = _.cloneDeep(payloadAddTypeProduct);
    newList.map((el: any) => {
      if (el.selectedType === 2 && el.productTypeCode !== value.id) {
        el.showProduct = false;
      } else {
        el.showProduct = true;
      }
    });
    dispatch(updateAddTypeAndProductState(newList));
    dispatch(setProductList(value.productTypeName));
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
      field: "productTypeName",
      headerName: "ประเภท",
      headerAlign: "center",
      flex: 1.8,
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "30px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "numberOfPruducts",
      headerName: "จำนวนสินค้า (รายการ)",
      flex: 6,
      headerAlign: "left",
      sortable: false,
      renderCell: (params) => {
        return (
          <Typography variant="body2" paddingLeft="10rem">
            <b>{params.value}</b>
          </Typography>
        );
      },
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690", marginLeft: "3rem" }}>
            <b>{"จำนวนสินค้า (รายการ)"}</b>
          </div>
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
          let newList = _.cloneDeep(payloadAddTypeProduct)
            .filter((r: any) => r.productTypeCode !== params.row.id)
            .filter((r: any) => {
              if (r.selectedType === 2) {
                return r.productTypeCode !== params.row.id;
              } else {
                return true;
              }
            });
          newList.map((el: any) => {
            if (el.selectedType === 2) {
              el.showProduct = true;
            }
          });
          dispatch(setCheckEdit(true));
          dispatch(setProductList("รายการสินค้าทั้งหมด"));
          dispatch(updateAddTypeAndProductState(newList));
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
              <DialogContent>
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
                  <Grid container spacing={1}>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={7} sx={{ textAlign: "left" }}>
                      ประเภท{" "}
                      <label style={{ color: "#AEAEAE", margin: "0 10px" }}>
                        |
                      </label>
                      <label style={{ color: "#36C690", paddingLeft: "10px" }}>
                        <b>{params.row.productTypeName}</b>
                      </label>
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={7} sx={{ textAlign: "left" }}>
                      {"จำนวนสินค้า (รายการ)"}{" "}
                      <label style={{ color: "#AEAEAE", margin: "0 5px" }}>
                        |
                      </label>
                      <label style={{ color: "#36C690", paddingLeft: "10px" }}>
                        <b>{params.row.numberOfPruducts}</b>
                      </label>
                    </Grid>
                    <Grid item xs={2}></Grid>
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 1.5 }}>
        <div
          style={{ width: "100%" }}
          className={classes.MdataGridChangeColorRow}
        >
          <DataGrid
            rows={dtTable}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            pagination
            disableColumnMenu
            selectionModel={selectionModel}
            onSelectionModelChange={(selectionModel: GridSelectionModel) =>
              setSelectionModel(selectionModel)
            }
            onRowClick={(params) => handleClickRow(params.row)}
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
