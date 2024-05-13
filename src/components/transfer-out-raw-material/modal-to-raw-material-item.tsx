import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@material-ui/core";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useStyles } from "../../styles/makeTheme";
import {
  save,
  updateCheckEdit,
  updateDataDetail,
  updateErrorList,
} from "../../store/slices/transfer-out-raw-material-slice";
import {
  numberWithCommas,
  objectNullOrEmpty,
  stringNullOrEmpty,
} from "../../utils/utils";
import { Action, TOStatus } from "../../utils/enum/common-enum";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { TransferOutDetail } from "../../models/transfer-out";
import TextBoxComment from "../commons/ui/textbox-comment";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import ModelConfirmDeleteProduct from "../commons/ui/modal-confirm-delete-product";

export interface DataGridProps {
  action: Action | Action.INSERT;
  userPermission?: any[];
  id: string;
  // onClose?: () => void;
}

const _ = require("lodash");

export const ModalToRawMaterialItem = (props: DataGridProps) => {
  const { action, userPermission } = props;

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const payloadTransferOut = useAppSelector(
    (state) => state.transferOutRawMaterialSlice.createDraft,
  );
  const dataDetail = useAppSelector(
    (state) => state.transferOutRawMaterialSlice.dataDetail,
  );
  const errorList = useAppSelector(
    (state) => state.transferOutRawMaterialSlice.errorList,
  );

  const [dtTable, setDtTable] = React.useState<Array<TransferOutDetail>>([]);
  const [sumOfDiscount, updateSumOfDiscount] = React.useState<number>(0);
  const [sumOfApprovedDiscount, updateSumOfApprovedDiscount] =
    React.useState<number>(0);
  const [openPopupModal, setOpenPopupModal] = React.useState<boolean>(false);
  const checkStocks = useAppSelector(
    (state) => state.stockBalanceCheckSlice.checkStock,
  );

  useEffect(() => {
    if (Object.keys(payloadAddItem).length !== 0) {
      let rows = payloadAddItem.map((item: any, index: number) => {
        let sameItem = dtTable.find((el) => el.barcode === item.barcode);
        let numberOfRequested = item.qty ? item.qty : 0;
        let remark = !!sameItem ? sameItem.remark : "";
        if (Action.UPDATE === action && objectNullOrEmpty(sameItem)) {
          remark = stringNullOrEmpty(item.remark) ? "" : item.remark;
          numberOfRequested = stringNullOrEmpty(item.qty) ? null : item.qty;
        }

        return {
          id: `${item.barcode}-${index + 1}`,
          index: index + 1,
          barcode: item.barcode,
          barcodeName: item.barcodeName,
          unit: item.unitName,
          unitCode: item.unitCode || "",
          barFactor: item.baseUnit || 0,
          qty: numberOfRequested,
          errorQty: "",
          numberOfRequested: numberOfRequested,
          numberOfApproved: numberOfRequested,
          errorNumberOfApproved: "",
          skuCode: item.skuCode,
          remark: remark,
        };
      });
      setDtTable(rows);
    } else {
      setDtTable([]);
    }
  }, [payloadAddItem]);

  useEffect(() => {
    if (dtTable.length !== 0) {
      updateSumOfDiscount(
        dtTable.reduce((acc, val) => acc + Number(val.numberOfRequested), 0),
      );
      updateSumOfApprovedDiscount(
        dtTable.reduce((acc, val) => acc + Number(val.numberOfApproved), 0),
      );
      const products = dtTable.map((item) => {
        return {
          barcode: item.barcode,
          numberOfRequested: parseInt(
            String(item.numberOfRequested).replace(/,/g, ""),
          ),
          numberOfApproved: parseInt(
            String(item.numberOfApproved).replace(/,/g, ""),
          ),
          unitName: item.unit,
          unitFactor: item.unitCode,
          barFactor: item.barFactor,
          productName: item.barcodeName,
          sku: item.skuCode,
          remark: item.remark,
        };
      });
      dispatch(save({ ...payloadTransferOut, products: products }));
      dispatch(
        updateDataDetail({
          ...dataDetail,
          sumOfApprovedDiscountDefault: sumOfApprovedDiscount,
          sumOfDiscountDefault: sumOfDiscount,
        }),
      );
    } else {
      updateSumOfApprovedDiscount(0);
      updateSumOfDiscount(0);
      dispatch(save({ ...payloadTransferOut, products: [] }));
    }
  }, [dtTable]);

  const handleClosePopup = () => {
    setOpenPopupModal(false);
  };

  const handleChangeNumberOfRequested = (
    event: any,
    index: number,
    errorIndex: number,
    barcode: string,
  ) => {
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
    setDtTable((preData: Array<TransferOutDetail>) => {
      const data = [...preData];
      data[index - 1].numberOfRequested = currentValue
        ? parseInt(currentValue.replace(/,/g, ""))
        : 0;
      return data;
    });
    dispatch(
      updateErrorList(
        errorList.map((item: any, idx: number) => {
          return idx === errorIndex
            ? {
                ...item,
                errorNumberOfRequested: "",
              }
            : item;
        }),
      ),
    );
    dispatch(updateCheckEdit(true));
  };

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      flex: 0.4,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: false,
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
      flex: 0.8,
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
      field: "numberOfRequested",
      headerName: "จำนวนสินค้า",
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barcode)
            : -1;
        const indexStock =
          checkStocks && checkStocks.length > 0
            ? checkStocks.findIndex(
                (item: any) => item.barcode === params.row.barcode,
              )
            : -1;
        const condition =
          (index != -1 && errorList[index].errorNumberOfRequested) ||
          indexStock !== -1;
        return (
          <div className={classes.MLabelTooltipWrapper}>
            <TextField
              error={condition}
              type="text"
              inputProps={{ maxLength: 13 }}
              className={classes.MtextFieldNumber}
              value={numberWithCommas(
                stringNullOrEmpty(params.value) ? "" : params.value,
              )}
              onChange={(e) => {
                handleChangeNumberOfRequested(
                  e,
                  params.row.index,
                  index,
                  params.row.barcode,
                );
              }}
              disabled={
                !stringNullOrEmpty(dataDetail.status) &&
                dataDetail.status != TOStatus.DRAFT
              }
            />
            {condition && (
              <div className="title">
                {errorList[index]?.errorNumberOfRequested}
              </div>
            )}
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
      hide:
        !stringNullOrEmpty(dataDetail.status) &&
        dataDetail.status != TOStatus.DRAFT,
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
          dispatch(
            updateAddItemsState(
              payloadAddItem.filter(
                (r: any) => r.barcode !== params.row.barcode,
              ),
            ),
          );
          dispatch(updateCheckEdit(true));
          setOpenModalDelete(false);
          setOpenPopupModal(true);
        };

        return (
          <>
            <Button
              onClick={handleOpenModalDelete}
              disabled={dataDetail.status > 1}
              sx={{ opacity: dataDetail.status > 1 ? "0.5" : "1" }}
            >
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

  const handleChangeNote = (e: any) => {
    dispatch(save({ ...payloadTransferOut, requesterNote: e }));
    dispatch(updateCheckEdit(true));
  };
  const [pageSize, setPageSize] = React.useState<number>(10);

  return (
    <div>
      <div
        style={{ width: "100%", height: dtTable.length >= 8 ? "70vh" : "auto" }}
        className={classes.MdataGridDetail}
      >
        <DataGrid
          rows={dtTable}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          pagination
          disableColumnMenu
          autoHeight={dtTable.length < 8}
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
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={3}>
            <TextBoxComment
              fieldName="หมายเหตุ :"
              defaultValue={payloadTransferOut.requesterNote}
              maxLength={100}
              onChangeComment={handleChangeNote}
              isDisable={
                !stringNullOrEmpty(dataDetail.status) &&
                dataDetail.status != TOStatus.DRAFT
              }
              rowDisplay={4}
            />
          </Grid>
          <Grid item xs={3} />
          <Grid item xs={3} />
          <Grid item xs={3} />
        </Grid>
      </Box>
      <SnackbarStatus
        open={openPopupModal}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={"คุณได้ลบข้อมูลเรียบร้อยแล้ว"}
      />
    </div>
  );
};

export default ModalToRawMaterialItem;
