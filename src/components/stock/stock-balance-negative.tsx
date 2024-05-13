import { Box, Grid, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { OutstandingRequest, StockInfo } from "../../models/stock-model";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { useStyles } from "../../styles/makeTheme";
import { SearchOff } from "@mui/icons-material";
import {
  featchStockBalanceNegativeSearchAsync,
  savePayloadSearchNegative,
} from "../../store/slices/stock/stock-balance-negative-search-slice";
import { numberWithCommas } from "../../utils/utils";

function StockBalance() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const savePayLoadSearch = useAppSelector(
    (state) => state.stockBalanceNegativeSearchSlice.savePayloadSearch,
  );
  const items = useAppSelector(
    (state) => state.stockBalanceNegativeSearchSlice.stockList,
  );
  const cuurentPage = useAppSelector(
    (state) => state.stockBalanceNegativeSearchSlice.stockList.page,
  );
  const limit = useAppSelector(
    (state) => state.stockBalanceNegativeSearchSlice.stockList.perPage,
  );
  const [pageSize, setPageSize] = React.useState(limit);

  const columns: GridColDef[] = [
    {
      field: "index",
      headerClassName: "columnHeaderTitle",
      headerName: "ลำดับ",
      width: 70,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "skuName",
      headerClassName: "columnHeaderTitle",
      headerName: "รายละเอียดสินค้า",
      headerAlign: "center",
      // minWidth: 235,
      flex: 0.3,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="body2" color="textSecondary">
            {params.getValue(params.id, "skuCode") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "availableQty",
      headerClassName: "columnHeaderTitle-BG",
      cellClassName: "columnFilled-BG",
      headerName: "สินค้าคงเหลือ",
      minWidth: 125,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params) => handleNumberWithCommas(params.value),
    },
    {
      field: "unitName",
      headerClassName: "columnHeaderTitle",
      headerName: "หน่วย",
      minWidth: 125,
      headerAlign: "center",
      sortable: false,
    },
  ];

  const rows = items.data.map((data: StockInfo, indexs: number) => {
    return {
      id: indexs,
      index: (Number(cuurentPage) - 1) * Number(pageSize) + indexs + 1,
      skuCode: data.skuCode,
      skuName: data.skuName,
      availableQty: data.availableQty,
      unitName: data.unitName,
    };
  });

  const handleNumberWithCommas = (availableQty: any) => {
    return (
      <Typography variant="body2" sx={{ color: "#F54949" }}>
        {numberWithCommas(availableQty)}
      </Typography>
    );
  };

  const [loading, setLoading] = React.useState<boolean>(false);
  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    let page: number = newPage + 1;
    handleSearchStockBalanceNegative(pageSize, page);
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize);
    setLoading(true);
    handleSearchStockBalanceNegative(pageSize, 1);
    setLoading(false);
  };

  const handleSearchStockBalanceNegative = async (
    pageLimit: number,
    page: number,
  ) => {
    const payloadNewpage: OutstandingRequest = {
      limit: pageLimit,
      page: page,
      branchCode: savePayLoadSearch.branchCode,
      skuCodes: savePayLoadSearch.skuCodes,
    };

    await dispatch(featchStockBalanceNegativeSearchAsync(payloadNewpage));
    await dispatch(savePayloadSearchNegative(payloadNewpage));
  };

  return (
    <div>
      <Box
        mt={2}
        bgcolor="background.paper"
        sx={{
          "& .columnHeaderTitle-BG": {
            backgroundColor: "#20AE79",
            color: "#FFFFFF !important",
          },
          "& .columnHeaderTitle": {
            color: "#20AE79 !important",
          },
          "& .columnFilled-BG": {
            backgroundColor: "#E7FFE9",
          },
        }}
      >
        {items.data.length > 0 && (
          <div
            className={classes.MdataGridPaginationTopStock}
            style={{ height: rows.length >= 10 ? "80vh" : "auto" }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              disableColumnMenu
              autoHeight={rows.length >= 10 ? false : true}
              scrollbarSize={10}
              pagination
              page={cuurentPage - 1}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 20, 50, 100]}
              rowCount={items.total}
              paginationMode="server"
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              rowHeight={65}
            />
          </div>
        )}
        {items.data.length === 0 && (
          <Grid container xs={12} justifyContent="center">
            <Box color="#CBD4DB" justifyContent="center">
              <h2>
                ไม่มีข้อมูล <SearchOff fontSize="large" />
              </h2>
            </Box>
          </Grid>
        )}
      </Box>
    </div>
  );
}

export default StockBalance;
