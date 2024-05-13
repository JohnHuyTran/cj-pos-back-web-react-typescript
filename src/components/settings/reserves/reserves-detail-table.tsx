import { Fragment, useState } from "react";
import { useAppSelector, useAppDispatch } from "store/store";
import { useStyles } from "styles/makeTheme";
import { formatNumber } from "utils/utils";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Box, Grid, Typography } from "@mui/material";

// Components
import ModalSettingExpense from "./modal-settings-expense";

// Call API
import { featchBranchAccountingConfigListAsync } from "store/slices/accounting/accounting-search-config-slice";
import { saveExpenseConfigSearch } from "store/slices/accounting/save-accounting-search-config-slice";

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 80,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ margin: "auto" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "typeNameTh",
    headerName: "ประเภท",
    minWidth: 200,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "barcodeName",
    headerName: "สินค้า",
    headerAlign: "center",
    minWidth: 180,
    flex: 2,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2">
          {params.getValue(params.id, "skuName") || ""}
        </Typography>
        <Typography color="textSecondary" sx={{ fontSize: 12 }}>
          {params.getValue(params.id, "skuCode") || ""}
        </Typography>
      </Box>
    ),
  },
  {
    field: "accountNameTh",
    headerName: "ชื่อบัญชี",
    minWidth: 160,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "accountCode",
    headerName: "รหัสบัญชี",
    minWidth: 130,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: "isActive",
    headerName: "สถานะ",
    minWidth: 120,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => (
      <Box
        component="div"
        sx={{
          margin: "auto",
          borderRadius: "8px",
          color: params.value ? "#36C690" : "#F54949",
          backgroundColor: params.value ? "#E7FFE9" : "#FFD7D7",
          padding: "5px 20px",
        }}
      >
        {params.value ? "ใช้งาน" : "ไม่ใช้งาน"}
      </Box>
    ),
  },
  {
    field: "approvalLimit1",
    headerName: "วงเงินอนุมัติ\nของ ผจก.ส่วน",
    minWidth: 130,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ marginLeft: "auto" }}>
        {formatNumber(params.value, 2)}
      </Box>
    ),
  },
  {
    field: "approvalLimit2",
    headerName: "วงเงินอนุมัติ\nของ ผจก.OC",
    minWidth: 130,
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ marginLeft: "auto" }}>
        {formatNumber(params.value, 2)}
      </Box>
    ),
  },
];

export default function ReservesDetailTable() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const payload = useAppSelector(
    (state) => state.saveExpenseConfigSearchRequest.searchExpenseConfig,
  );
  const items = useAppSelector((state) => state.searchBranchAccountingConfig);
  const res: any = items.branchAccountingConfigList;

  // Set state data
  const [pageSize, setPageSize] = useState(res?.perPage);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSelect, setDataSelect] = useState({});
  const [isStatus, setIsStatus] = useState("");

  const rows: any = res?.data.map((data: any, index: number) => {
    return {
      id: index,
      index: (res?.page - 1) * pageSize + index + 1,
      ...data,
    };
  });

  // Handle function
  const getConfigListByQuery = async (payload: any) => {
    setIsLoading(true);
    try {
      await dispatch(featchBranchAccountingConfigListAsync(payload));
      await dispatch(saveExpenseConfigSearch(payload));
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    const payloadNextPage = {
      ...payload,
      limit: "" + pageSize,
      page: "" + (page + 1),
    };
    getConfigListByQuery(payloadNextPage);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    const payloadRowPerPage = {
      ...payload,
      limit: "" + pageSize,
      page: "1",
    };
    getConfigListByQuery(payloadRowPerPage);
  };

  const currentlySelected = async (params: GridCellParams) => {
    setIsStatus("Update");
    setDataSelect(params.row);
    setIsOpenModal(true);
  };

  return (
    <Fragment>
      {rows.length > 0 ? (
        <Box
          style={{
            width: "100%",
            height: `${110 + Math.min(pageSize, rows.length) * 65}px`,
            maxHeight: "calc(100vh - 445px)",
          }}
          className={classes.MdataGridPaginationTop}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
            pagination
            disableColumnMenu
            paginationMode="server"
            autoHeight={rows.length >= 10 ? false : true}
            page={res?.page - 1}
            rowCount={res?.total}
            scrollbarSize={10}
            rowHeight={65}
            onCellClick={currentlySelected}
            loading={isLoading}
            style={{
              minHeight:
                pageSize > 10 && rows.length > 10 ? "calc(100vh - 440px)" : "",
            }}
          />
        </Box>
      ) : (
        <Grid item container xs={12} justifyContent="center">
          <Box color="#CBD4DB">
            <h2>ไม่มีข้อมูล</h2>
          </Box>
        </Grid>
      )}

      <ModalSettingExpense
        isOpen={isOpenModal}
        isStatus={isStatus}
        dataSelect={dataSelect}
        onClickClose={() => setIsOpenModal(false)}
      />
    </Fragment>
  );
}
