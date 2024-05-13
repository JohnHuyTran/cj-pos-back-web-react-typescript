import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../../store/store";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import { useStyles } from "../../styles/makeTheme";

import LoadingModal from "../commons/ui/loading-modal";
import { Chip, Typography } from "@mui/material";
import {
  StockTransferInfo,
  StockTransferRequest,
  StockTransferResponse,
} from "../../models/stock-transfer-model";
import { featchSearchStockTransferAsync } from "../../store/slices/stock-transfer-slice";
import { saveSearchStockTransfer } from "../../store/slices/save-search-stock-transfer-slice";
import { featchBranchTransferDetailAsync } from "../../store/slices/stock-transfer-branch-request-slice";
import { featchTransferReasonsListAsync } from "../../store/slices/transfer-reasons-slice";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import StockTransferBT from "./branch-transfer/stock-transfer-bt";
import { updateAddItemSkuGroupState } from "../../store/slices/stock-transfer-bt-sku-slice";

interface loadingModalState {
  open: boolean;
}

function StockTransferList() {
  const { t } = useTranslation(["stockTransfer", "common"]);
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.searchStockTransfer);
  const cuurentPage = useAppSelector(
    (state) => state.searchStockTransfer.orderList.page,
  );
  const limit = useAppSelector(
    (state) => state.searchStockTransfer.orderList.perPage,
  );
  const res: StockTransferResponse = items.orderList;
  const payload = useAppSelector(
    (state) => state.saveSearchStock.searchStockTransfer,
  );

  const [idDC, setidDC] = React.useState("");

  const [pageSize, setPageSize] = React.useState(limit.toString());

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      width: 65,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "btNo",
      headerName: "เลขที่เอกสาร BT",
      flex: 1,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "rtNo",
      headerName: "เลขที่เอกสารร้องขอ RT",
      minWidth: 185,
      flex: 1,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "startDate",
      headerName: "วันที่โอน",
      minWidth: 130,
      headerAlign: "center",
      align: "left",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" sx={{ lineHeight: "120%" }}>
            {params.value} - {params.getValue(params.id, "endDate") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "branchFromName",
      headerName: "สาขาต้นทาง",
      flex: 1.2,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" sx={{ lineHeight: "120%" }}>
            {params.getValue(params.id, "branchFrom") || ""}-{params.value}
          </Typography>
        </div>
      ),
    },
    {
      field: "branchToName",
      headerName: "สาขาปลายทาง",
      flex: 1.2,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" sx={{ lineHeight: "120%" }}>
            {params.getValue(params.id, "branchTo") || ""}-{params.value}
          </Typography>
        </div>
      ),
    },

    {
      field: "status",
      headerName: "สถานะ BT",
      minWidth: 80,
      flex: 0.7,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        if (
          params.value === "CREATED" ||
          params.value === "READY_TO_TRANSFER" ||
          params.value === "WAIT_FOR_PICKUP" ||
          params.value === "TRANSFERING"
        ) {
          return (
            <Chip
              label={t(`status.${params.value}`)}
              size="small"
              sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
            />
          );
        } else if (params.value === "COMPLETED") {
          return (
            <Chip
              label={t(`status.${params.value}`)}
              size="small"
              sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
            />
          );
        }
      },
    },
  ];

  const rows = res.data.map((data: StockTransferInfo, indexs: number) => {
    return {
      id: data.id,
      index: (cuurentPage - 1) * parseInt(pageSize) + indexs + 1,
      btNo: data.btNo,
      rtNo: data.rtNo,
      startDate: convertUtcToBkkDate(data.startDate),
      endDate: convertUtcToBkkDate(data.endDate),
      branchFromName: data.branchFromName,
      branchToName: data.branchToName,
      branchFrom: data.branchFrom,
      branchTo: data.branchTo,
      createdBy: data.createdBy,
      status: data.status,
    };
  });

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const [loading, setLoading] = React.useState<boolean>(false);
  const handlePageChange = async (newPage: number) => {
    setLoading(true);

    let page: string = (newPage + 1).toString();

    const payloadNewpage: StockTransferRequest = {
      limit: pageSize,
      page: page,
      docNo: payload.docNo,
      branchFrom: payload.branchFrom,
      branchTo: payload.branchTo,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      statuses: payload.statuses,
      transferReason: payload.transferReason,
    };

    await dispatch(featchSearchStockTransferAsync(payloadNewpage));
    await dispatch(saveSearchStockTransfer(payloadNewpage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());

    setLoading(true);

    const payloadNewpage: StockTransferRequest = {
      limit: pageSize.toString(),
      page: "1",
      docNo: payload.docNo,
      branchFrom: payload.branchFrom,
      branchTo: payload.branchTo,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      statuses: payload.statuses,
      transferReason: payload.transferReason,
    };

    await dispatch(featchSearchStockTransferAsync(payloadNewpage));
    await dispatch(saveSearchStockTransfer(payloadNewpage));

    setLoading(false);
  };

  const [openCreateModal, setOpenCreateModal] = React.useState(false);

  function handleCloseCreateModal() {
    setOpenCreateModal(false);
  }
  const reasonsList = useAppSelector(
    (state) => state.transferReasonsList.reasonsList.data,
  );
  const currentlySelected = async (params: GridCellParams) => {
    handleOpenLoading("open", true);
    await dispatch(updateAddItemsState({}));
    await dispatch(featchBranchTransferDetailAsync(params.row.btNo));
    dispatch(updateAddItemSkuGroupState([]));
    if (reasonsList === null || reasonsList.length <= 0)
      await dispatch(featchTransferReasonsListAsync());
    setOpenCreateModal(true);

    handleOpenLoading("open", false);
  };
  return (
    <div>
      <Box mt={2} bgcolor="background.paper">
        <div
          className={classes.MdataGridPaginationTop}
          style={{ height: rows.length >= 10 ? "80vh" : "auto" }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            onCellClick={currentlySelected}
            autoHeight={rows.length >= 10 ? false : true}
            scrollbarSize={10}
            pagination
            page={cuurentPage - 1}
            pageSize={parseInt(pageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            rowCount={res.total}
            paginationMode="server"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            rowHeight={65}
          />
        </div>
      </Box>
      {openCreateModal && (
        <StockTransferBT isOpen={true} onClickClose={handleCloseCreateModal} />
      )}
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}

export default StockTransferList;
