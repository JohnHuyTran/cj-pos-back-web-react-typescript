import React, { ReactElement, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { useStyles } from "../../../styles/makeTheme";
import { ProductListItemProps } from "../../../models/product-master";
import ModalBarcodeDetail from "./modal-barcode-detail";
import { addTwoDecimalPlaces } from "../../../utils/utils";
const _ = require("lodash");

interface Props {
  listData: any;
}

export default function ProductListItems({ listData }: Props): ReactElement {
  const classes = useStyles();
  const [dtTable, setDtTable] = React.useState<Array<ProductListItemProps>>([]);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [barcodeDetaiItem, setBarcodeDetailItem] = React.useState({});
  useEffect(() => {
    console.log(listData);

    if (Object.keys(listData).length !== 0) {
      let rows = listData.map((item: any, index: number) => {
        return {
          id: `${index}-${item.barcode}`,
          index: index + 1,
          barcode: item.barcode,
          skuCode: item.skuCode,
          unitName: item.unitName,
          barcodeName: item.barcodeName,
          barFactor: item.barFactor,
          retailPriceTier1: item.retailPriceTier1,
        };
      });
      setDtTable(rows);
    } else {
      setDtTable([]);
    }
  }, [listData]);

  const handleCloseModal = () => {
    setOpenModal(false);
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
      headerName: "ชื่อสินค้า",
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
      field: "barFactor",
      headerName: "จำนวนต่อหน่วย",
      flex: 1,
      align: "right",
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
      field: "retailPriceTier1",
      headerName: "ราคาสินค้า",
      flex: 1,
      align: "right",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        return (
          <Typography variant="body2" paddingLeft="10px">
            {addTwoDecimalPlaces(params.value)}
          </Typography>
        );
      },
    },
  ];
  const currentlySelected = (params: GridCellParams) => {
    const item = listData.find(
      (item: any) => item.barcode === params.row.barcode,
    );
    setBarcodeDetailItem(item);
    setOpenModal(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          mt: 2,
          pt: 3,
          mb: 1.5,
          borderTop: "1px solid #EAEBEB",
        }}
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
            onCellClick={currentlySelected}
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
      <ModalBarcodeDetail
        open={openModal}
        onClose={handleCloseModal}
        dataDetail={barcodeDetaiItem}
      />
    </>
  );
}
