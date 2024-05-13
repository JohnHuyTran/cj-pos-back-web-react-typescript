import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../../store/store";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowData,
  GridRowParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { convertUtcToBkkDate } from "../../utils/date-utill";
// import { makeStyles } from '@mui/styles';
import { useStyles } from "../../styles/makeTheme";
import LoadingModal from "../commons/ui/loading-modal";
import { Chip, Typography } from "@mui/material";
import {
  StockTransferInfo,
  StockTransferRequest,
  StockTransferResponse,
} from "../../models/stock-transfer-model";
import { featchSearchStockTransferRtAsync } from "../../store/slices/stock-transfer-rt-slice";
import { saveSearchStockTransferRt } from "../../store/slices/save-search-stock-transfer-rt-slice";
import ModalDetailStockTransfer from "./stock-request-detail";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { updatestockRequestItemsState } from "../../store/slices/stock-request-items-slice";
import { featchStockRequestDetailAsync } from "../../store/slices/stock-request-detail-slice";
import { isPreferredUsername } from "../../utils/role-permission";
import { getUserInfo } from "../../store/sessionStore";
import { PERMISSION_GROUP } from "../../utils/enum/permission-enum";

interface loadingModalState {
  open: boolean;
}

export interface DataGridProps {
  onSelectRows: (rowsList: Array<any>) => void;
}

const columns: GridColDef[] = [
  {
    field: "index",
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
    field: "rtNo",
    headerName: "เลขที่เอกสารร้องขอ RT",
    minWidth: 190,
    flex: 1.2,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "startDate",
    headerName: "วันที่โอน",
    minWidth: 150,
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
    minWidth: 210,
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
    minWidth: 210,
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
    field: "createdBy",
    headerName: "ผู้สร้างรายการ",
    minWidth: 120,
    headerAlign: "center",
    align: "left",
    sortable: false,
  },
  {
    field: "status",
    headerName: "สถานะ RT",
    minWidth: 80,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => {
      if (
        params.value === "DRAFT" ||
        params.value === "WAIT_FOR_APPROVAL_1" ||
        params.value === "WAIT_FOR_APPROVAL_2" ||
        params.value === "AWAITING_FOR_REQUESTER"
      ) {
        return (
          <Chip
            label={params.getValue(params.id, "statusText")}
            size="small"
            sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
          />
        );
      } else if (params.value === "APPROVED") {
        return (
          <Chip
            label={params.getValue(params.id, "statusText")}
            size="small"
            sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
          />
        );
      } else if (params.value === "CANCELED") {
        return (
          <Chip
            label={params.getValue(params.id, "statusText")}
            size="small"
            sx={{ color: "#F54949", backgroundColor: "#FFD7D7" }}
          />
        );
      }
    },
  },
  // {
  //   field: 'delete',
  //   headerName: ' ',
  //   width: 50,
  //   align: 'center',
  //   sortable: false,
  //   renderCell: (params) => {
  //     if (params.getValue(params.id, 'edit')) {
  //       return (
  //         <div>
  //           <DeleteForever fontSize="medium" sx={{ color: '#F54949' }} />
  //         </div>
  //       );
  //     } else {
  //       return <div></div>;
  //     }
  //   },
  // },
];

function useApiRef() {
  const apiRef = useGridApiRef();
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "",
        width: 0,
        minWidth: 0,
        sortable: false,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        },
      }),
    [columns],
  );

  return { apiRef, columns: _columns };
}

// function StockTransferRtList() {

function StockTransferRtList({ onSelectRows }: DataGridProps) {
  const { t } = useTranslation(["stockTransfer", "common"]);
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [groupSCM, setGroupSCM] = React.useState(false);
  useEffect(() => {
    const scm = getUserInfo().group === PERMISSION_GROUP.SCM;
    setGroupSCM(scm);
  }, []);

  const items = useAppSelector((state) => state.searchStockTrnasferRt);
  const cuurentPage = useAppSelector(
    (state) => state.searchStockTrnasferRt.orderList.page,
  );
  const limit = useAppSelector(
    (state) => state.searchStockTrnasferRt.orderList.perPage,
  );
  const res: StockTransferResponse = items.orderList;
  const payload = useAppSelector(
    (state) => state.saveSearchStockRt.searchStockTransferRt,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());

  const { apiRef, columns } = useApiRef();
  const [preferredUsername, setPreferredUsername] = React.useState(
    isPreferredUsername(),
  );
  const [groupOC, setGroupOC] = React.useState(
    getUserInfo().group === PERMISSION_GROUP.OC,
  );

  const rows = res.data.map((data: StockTransferInfo, indexs: number) => {
    let editMode = false;
    if (
      (data.status === "DRAFT" || data.status === "AWAITING_FOR_REQUESTER") &&
      !groupOC &&
      data.createdBy === preferredUsername
    ) {
      editMode = true;
    }

    return {
      id: data.id,
      index: (cuurentPage - 1) * parseInt(pageSize) + indexs + 1,
      rtNo: data.rtNo,
      startDate: convertUtcToBkkDate(data.startDate),
      endDate: convertUtcToBkkDate(data.endDate),
      branchFromName: data.branchFromName,
      branchToName: data.branchToName,
      branchFrom: data.branchFrom,
      branchTo: data.branchTo,
      createdBy: data.createdBy,
      status: data.status,
      statusText: t(`status.${data.status}`),
      edit: editMode,
      itemGroups: data.itemGroups,
    };
  });

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const [loading, setLoading] = React.useState<boolean>(false);
  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    // console.log('newPage: ', newPage);
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

    await dispatch(featchSearchStockTransferRtAsync(payloadNewpage));
    await dispatch(saveSearchStockTransferRt(payloadNewpage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    // console.log("pageSize: ", pageSize);
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

    await dispatch(featchSearchStockTransferRtAsync(payloadNewpage));
    await dispatch(saveSearchStockTransferRt(payloadNewpage));

    setLoading(false);
  };

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  // const [rtNoDel, setRtNoDel] = React.useState('');
  // const [openModelDeleteConfirm, setOpenModelDeleteConfirm] = React.useState(false);

  const currentlySelected = async (params: GridCellParams) => {
    const value = params.colDef.field;

    handleOpenLoading("open", true);
    await handleOpenDetailModal(params.row.rtNo, params.row.edit);
    handleOpenLoading("open", false);

    // if (value === 'delete') {
    //   setRtNoDel(params.row.rtNo);
    //   setOpenModelDeleteConfirm(true);
    // } else {
    //   handleOpenLoading('open', true);
    //   await handleOpenDetailModal(params.row.rtNo, params.row.edit);
    //   handleOpenLoading('open', false);
    // }
  };

  // const handleModelDeleteConfirm = async (confirm: boolean) => {
  //   if (confirm === true) {
  //     await removeStockRequest(rtNoDel)
  //       .then((value) => {
  //         const payloadNewpage: StockTransferRequest = {
  //           limit: pageSize,
  //           page: cuurentPage.toString(),
  //           docNo: payload.docNo,
  //           branchFrom: payload.branchFrom,
  //           branchTo: payload.branchTo,
  //           dateFrom: payload.dateFrom,
  //           dateTo: payload.dateTo,
  //           statuses: payload.statuses,
  //           transferReason: payload.transferReason,
  //         };
  //         dispatch(featchSearchStockTransferRtAsync(payloadNewpage));
  //         dispatch(saveSearchStockTransferRt(payloadNewpage));
  //         setOpenModelDeleteConfirm(false);
  //       })
  //       .catch((error) => {});
  //   } else {
  //     setOpenModelDeleteConfirm(false);
  //   }
  // };

  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [typeDetailModal, setTypeDetailModal] = React.useState("View");
  const [editDetailModal, setEditDetailModal] = React.useState(false);
  const handleOpenDetailModal = async (rtNo: string, edit: boolean) => {
    await dispatch(updateAddItemsState({}));
    await dispatch(updatestockRequestItemsState({}));
    setTypeDetailModal("View");
    setEditDetailModal(edit);

    await dispatch(featchStockRequestDetailAsync(rtNo));
    setOpenDetailModal(true);
  };

  function handleCloseDetailModal() {
    setOpenDetailModal(false);
  }

  const handleSubmitRowSelect = async () => {
    const rowSelect = apiRef.current.getSelectedRows();
    let rowSelectList: any = [];
    rowSelect.forEach((data: GridRowData) => {
      // rowSelectList.push(data.rtNo);
      rowSelectList.push(data);
    });

    return onSelectRows(rowSelectList ? rowSelectList : []);
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
            page={cuurentPage - 1}
            pageSize={parseInt(pageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            rowCount={res.total}
            paginationMode="server"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            rowHeight={65}
            pagination
            checkboxSelection={groupSCM ? true : false}
            isRowSelectable={(params: GridRowParams) => params.row.edit}
            onSelectionModelChange={handleSubmitRowSelect}
            disableSelectionOnClick
          />
        </div>
      </Box>

      <LoadingModal open={openLoadingModal.open} />

      {openDetailModal && (
        <ModalDetailStockTransfer
          type={typeDetailModal}
          edit={editDetailModal}
          isOpen={openDetailModal}
          onClickClose={handleCloseDetailModal}
        />
      )}

      {/* <ModelDeleteConfirm open={openModelDeleteConfirm} onClose={handleModelDeleteConfirm} rtNo={rtNoDel} /> */}
    </div>
  );
}

export default StockTransferRtList;
