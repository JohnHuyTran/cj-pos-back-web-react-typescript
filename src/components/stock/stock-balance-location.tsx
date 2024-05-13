import { Box, Grid, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  gridColumnsTotalWidthSelector,
} from "@mui/x-data-grid";
import React from "react";
import { useStyles } from "../../styles/makeTheme";
import {
  OutstandingRequest,
  positionInfo,
  StockInfo,
} from "../../models/stock-model";
import { useAppSelector, useAppDispatch } from "../../store/store";
import {
  featchStockBalanceLocationSearchAsync,
  savePayloadSearchLocation,
} from "../../store/slices/stock/stock-balance-location-search-slice";
import { SearchOff } from "@mui/icons-material";
import { numberWithCommas } from "utils/utils";

function StockBalanceLocation() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const _ = require("lodash");
  const savePayLoadSearch = useAppSelector(
    (state) => state.stockBalanceLocationSearchSlice.savePayloadSearch,
  );
  const items = useAppSelector(
    (state) => state.stockBalanceLocationSearchSlice.stockList,
  );
  const cuurentPage = useAppSelector(
    (state) => state.stockBalanceLocationSearchSlice.stockList.page,
  );
  const limit = useAppSelector(
    (state) => state.stockBalanceLocationSearchSlice.stockList.perPage,
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
      field: "barcode",
      headerClassName: "columnHeaderTitle",
      headerName: "บาร์โค้ด",
      minWidth: 122,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "skuName",
      headerClassName: "columnHeaderTitle",
      headerName: "รายละเอียดสินค้า",
      headerAlign: "center",
      minWidth: 235,
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
      field: "locationName",
      headerClassName: "columnHeaderTitle",
      headerName: "คลัง",
      width: 75,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "positions",
      headerClassName: "columnHeaderTitle",
      headerName: "โลเคชั่น",
      minWidth: 120,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "qty",
      headerClassName: "columnHeaderTitle-BG",
      cellClassName: "columnFilled-BG",
      headerName: "สินค้าคงเหลือ",
      width: 111,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params) => textNegative(params.value),
    },
    {
      field: "unitName",
      headerClassName: "columnHeaderTitle",
      headerName: "หน่วย",
      width: 75,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "minBeauty",
      headerClassName: "columnHeaderTitle",
      headerName: "จำนวนกำหนดต่ำสุด",
      minWidth: 150,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
    {
      field: "maxBeauty",
      headerClassName: "columnHeaderTitle",
      headerName: "จำนวนกำหนดสูงสุด",
      minWidth: 150,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
  ];

  const textNegative = (value: any) => {
    if (Number(value) < 0)
      return (
        <Typography variant="body2" sx={{ color: "#F54949" }}>
          {numberWithCommas(value)}
        </Typography>
      );
    return numberWithCommas(value);
  };

  const concatName = (value: positionInfo[]) => {
    let positionNameStr: string = "";
    value.forEach((data, index) => {
      if (index === value.length - 1) {
        positionNameStr += `${data.name}`;
      } else {
        positionNameStr += `${data.name} ,`;
      }
    });
    return positionNameStr;
  };

  const rows = items.data.map((data: StockInfo, indexs: number) => {
    let minValObject = _.maxBy(data.positions, "minBeauty");
    let maxValObject = _.maxBy(data.positions, "maxBeauty");

    return {
      id: indexs,
      index: (Number(cuurentPage) - 1) * Number(pageSize) + indexs + 1,
      barcode: data.barcode,
      barcodeName: data.barcodeName,
      skuCode: data.skuCode,
      skuName: data.skuName,
      locationCode: data.locationCode,
      locationName: data.locationName,
      qty: data.qty,
      unitCode: data.unitCode,
      unitName: data.unitName,
      barFactor: data.barFactor,
      positions: data.positions ? concatName(data.positions) : "",
      minBeauty: minValObject ? minValObject.minBeauty : 0,
      maxBeauty: maxValObject ? maxValObject.maxBeauty : 0,
    };
  });

  const [loading, setLoading] = React.useState<boolean>(false);
  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    // let page: number = newPage + 1;
    const payloadNewpage: OutstandingRequest = await {
      limit: pageSize,
      page: newPage + 1,
      branchCode: savePayLoadSearch.branchCode,
      skuCodes: savePayLoadSearch.skuCodes,
      locationCode: savePayLoadSearch.locationCode,
      positionName: savePayLoadSearch.positionName,
    };

    await dispatch(featchStockBalanceLocationSearchAsync(payloadNewpage));
    await dispatch(savePayloadSearchLocation(payloadNewpage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize);
    setLoading(true);

    const payloadNewpage: OutstandingRequest = {
      limit: pageSize,
      page: 1,
      branchCode: savePayLoadSearch.branchCode,
      skuCodes: savePayLoadSearch.skuCodes,
      locationCode: savePayLoadSearch.locationCode,
      positionName: savePayLoadSearch.positionName,
    };

    await dispatch(featchStockBalanceLocationSearchAsync(payloadNewpage));
    await dispatch(savePayloadSearchLocation(payloadNewpage));

    setLoading(false);
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

export default StockBalanceLocation;
