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
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import { updateAddTypeAndProductState } from "../../../store/slices/add-type-product-slice";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import { STProductDetail } from "../../../models/sale-limit-time";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { StockActionStatus } from "../../../utils/enum/common-enum";
import { setCheckEdit } from "../../../store/slices/sale-limit-time-slice";

const _ = require("lodash");
interface Props {
  status?: string;
  viewMode?: boolean;
}

export default function AuditPlanCreateItem({
  status,
  viewMode,
}: Props): ReactElement {
  const classes = useStyles();
  const [dtTable, setDtTable] = React.useState<Array<STProductDetail>>([]);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );
  const dispatch = useAppDispatch();
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };
  useEffect(() => {
    if (Object.keys(payloadAddTypeProduct).length !== 0) {
      let listProducts = _.uniqBy(
        payloadAddTypeProduct.filter((el: any) => el.selectedType === 2),
        "skuCode",
      );
      let rows = _.sortBy(listProducts, "skuCode").map(
        (item: any, index: number) => {
          return {
            id: `${index}-${item.barcode}`,
            index: index + 1,
            barcode: item.barcode,
            skuCode: item.skuCode,
            unitName: item.unitName,
            productName: item.skuName,
            categoryTypeCode: item.categoryTypeCode,
          };
        },
      );
      setDtTable(rows);
    } else {
      setDtTable([]);
    }
  }, [payloadAddTypeProduct]);

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      headerAlign: "center",
      disableColumnMenu: false,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ margin: "0 auto" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "productName",
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
      field: "delete",
      headerName: " ",
      flex: 4,
      align: "left",
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
            (r: any) => r.skuCode !== params.row.skuCode,
          );
          let newListProducts = newList.filter((r: any) => r.selectedType == 2);
          if (newListProducts.length > 0) {
            let listCodeProductByType = newList.map(
              (el1: any) => el1.productTypeCode,
            );
            let listAdd = newList.filter((item: any) => {
              if (
                item.selectedType === 1 &&
                !listCodeProductByType.includes(item.productTypeCode)
              ) {
                return false;
              } else return true;
            });
            dispatch(updateAddTypeAndProductState(listAdd));
          } else {
            dispatch(setCheckEdit(status == StockActionStatus.DRAFT));
            dispatch(updateAddTypeAndProductState([]));
          }
          setOpenModalDelete(false);
          setShowSnackBar(true);
        };

        return (
          <>
            {(status == "" || status == StockActionStatus.DRAFT) &&
              !viewMode && (
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
                  <Grid container>
                    <Grid item xs={4} sx={{ textAlign: "right" }}>
                      สินค้า{" "}
                      <label style={{ color: "#AEAEAE", margin: "0 5px" }}>
                        |
                      </label>
                    </Grid>
                    <Grid item xs={8} sx={{ pl: 1 }}>
                      <label style={{ color: "#36C690" }}>
                        <b>{params.row.productName}</b>
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
      <Box
        sx={{ display: "flex", justifyContent: "flex-start", mt: 1, mb: 1.5 }}
      >
        <div
          style={{ width: "100%" }}
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
            rowHeight={50}
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
            disableSelectionOnClick
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
