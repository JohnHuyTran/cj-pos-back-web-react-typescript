import React, { useEffect, useMemo } from "react";
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
import {
  CheckOrderResponse,
  CheckOrderInfo,
  CheckOrderRequest,
} from "../../models/dc-check-order-model";
import { featchOrderListDcAsync } from "../../store/slices/dc-check-order-slice";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import { getSdType, getDCStatus } from "../../utils/utils";
import DCOrderDetail from "./dc-ckeck-order-detail";
import { useStyles } from "../../styles/makeTheme";
import Done from "@mui/icons-material/Done";
import {
  featchorderDetailDCAsync,
  setItemId,
} from "../../store/slices/dc-check-order-detail-slice";
import LoadingModal from "../commons/ui/loading-modal";
import { saveSearchCriteriaDc } from "../../store/slices/save-search-order-dc-slice";
import { PERMISSION_GROUP } from "../../utils/enum/permission-enum";
import { getUserInfo } from "../../store/sessionStore";
import { isGroupDC } from "../../utils/role-permission";
const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 70,
    // flex: 0.7,
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ paddingLeft: "20px" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "shipmentNo",
    headerName: "เลขที่เอกสาร",
    minWidth: 140,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "sdNo",
    headerName: "เลขที่เอกสาร SD",
    minWidth: 160,
    // flex: 1.2,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "branchOutNo",
    headerName: "เลขที่เอกสาร BO",
    minWidth: 128,
    // flex: 1.2,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "shipBranchFrom",
    headerName: "สาขาต้นทาง",
    minWidth: 150,
    flex: 0.9,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "shipBranchTo",
    headerName: "สาขาปลายทาง",
    minWidth: 150,
    flex: 0.9,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "sdType",
    headerName: "ประเภท",
    minWidth: 70,
    flex: 0.75,
    headerAlign: "center",
    align: "left",
    sortable: false,
  },
  {
    field: "verifyDCStatus",
    headerName: "สถานะ",
    minWidth: 70,
    flex: 0.7,
    headerAlign: "center",
    align: "center",
    sortable: false,
  },
  {
    field: "hasBelow",
    headerName: "ขาด",
    width: 65,
    // minWidth: 120,
    // flex: 0.8,
    headerAlign: "center",
    sortable: false,
    align: "center",
    renderCell: (params) => {
      if (params.value === true) {
        return <Done fontSize="small" sx={{ color: "#F54949" }} />;
      } else if (params.value === false) {
        return "-";
      }
    },
  },
  {
    field: "hasOver",
    headerName: "เกิน",
    width: 65,
    // minWidth: 120,
    // flex: 0.7,
    sortable: false,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (params.value === true) {
        return <Done fontSize="small" sx={{ color: "#F54949" }} />;
      } else if (params.value === false) {
        return "-";
      }
    },
  },
  {
    field: "receivedDate",
    headerName: "วันที่รับสินค้า",
    minWidth: 110,
    // flex: 1,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => {
      return (
        <div
          style={{
            textAlign: "center",
          }}
        >
          {params.value}
        </div>
      );
    },
  },
  {
    field: "truckID",
    headerName: "ทะเบียนรถ",
    minWidth: 110,
    // flex: 1,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => {
      return (
        <div
          style={{
            textAlign: "center",
          }}
        >
          {params.value}
        </div>
      );
    },
  },
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
interface loadingModalState {
  open: boolean;
}
export interface DataGridProps {
  onSelectRows: (rowsList: Array<any>) => void;
}

function DCOrderList({ onSelectRows }: DataGridProps) {
  const classes = useStyles();
  // const classes = useStyles2();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.dcCheckOrderList);
  const cuurentPage = useAppSelector(
    (state) => state.dcCheckOrderList.orderList.page,
  );
  const limit = useAppSelector(
    (state) => state.dcCheckOrderList.orderList.perPage,
  );
  const res: CheckOrderResponse = items.orderList;
  const payload = useAppSelector(
    (state) => state.saveSearchOrderDc.searchCriteriaDc,
  );
  const [opensDCOrderDetail, setOpensDCOrderDetail] = React.useState(false);
  const [shipment, setShipment] = React.useState("");
  const [sdNo, setSdNo] = React.useState("");

  const [idDC, setidDC] = React.useState("");
  const [index, setIndex] = React.useState(1);
  const [currentpage, setCurrentpage] = React.useState(0);

  const [pageSize, setPageSize] = React.useState(limit.toString());

  const { apiRef, columns } = useApiRef();
  const [groupDC, setGroupDC] = React.useState<boolean>(false);

  const rows = res.data.map((data: CheckOrderInfo, indexs: number) => {
    return {
      id: data.id,
      index: (cuurentPage - 1) * parseInt(pageSize) + indexs + 1,
      shipmentNo: data.docRefNo,
      sdNo: data.sdNo,
      shipBranchFrom: `${data.shipBranchFrom.code}-${data.shipBranchFrom.name}`,
      shipBranchTo: `${data.shipBranchTo.code}-${data.shipBranchTo.name}`,
      sdType: getSdType(data.sdType),
      verifyDCStatus: getDCStatus(data.verifyDCStatus),
      verifyDCStatusCode: data.verifyDCStatus,
      hasBelow: data.hasBelow,
      hasOver: data.hasOver,
      receivedDate: convertUtcToBkkDate(data.receivedDate),
      branchOutNo: data.branchOutNo,
      truckID: data.truckID,
    };
  });

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const currentlySelected = async (params: GridCellParams) => {
    handleOpenLoading("open", true);
    setidDC(params.row.sdNo);

    try {
      await dispatch(featchorderDetailDCAsync(params.row.sdNo));
      await dispatch(setItemId(params.row.sdNo));
      setOpensDCOrderDetail(true);
    } catch (error) {
      console.log(error);
    }

    handleOpenLoading("open", false);
  };

  function isClosModal() {
    setOpensDCOrderDetail(false);
  }

  const [loading, setLoading] = React.useState<boolean>(false);
  const handlePageChange = async (newPage: number) => {
    setLoading(true);

    let page: string = (newPage + 1).toString();

    const payloadNewpage: CheckOrderRequest = {
      limit: pageSize,
      page: page,
      docNo: payload.docNo,
      shipBranchFrom: payload.shipBranchFrom,
      shipBranchTo: payload.shipBranchTo,
      verifyDCStatus: payload.verifyDCStatus,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      sdType: payload.sdType,
      sortBy: payload.sortBy,
    };

    await dispatch(featchOrderListDcAsync(payloadNewpage));
    await dispatch(saveSearchCriteriaDc(payloadNewpage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    // console.log("pageSize: ", pageSize);
    setPageSize(pageSize.toString());

    setLoading(true);

    const payloadNewpage: CheckOrderRequest = {
      limit: pageSize.toString(),
      // page: cuurentPages.toString(),
      page: "1",
      docNo: payload.docNo,
      shipBranchFrom: payload.shipBranchFrom,
      shipBranchTo: payload.shipBranchTo,
      verifyDCStatus: payload.verifyDCStatus,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      sdType: payload.sdType,
      sortBy: payload.sortBy,
    };

    await dispatch(featchOrderListDcAsync(payloadNewpage));
    await dispatch(saveSearchCriteriaDc(payloadNewpage));

    setLoading(false);
  };

  const handleSubmitRowSelect = async () => {
    const rowSelect = apiRef.current.getSelectedRows();
    let rowSelectList: any = [];
    rowSelect.forEach((data: GridRowData) => {
      rowSelectList.push(data.sdNo);
    });

    return onSelectRows(rowSelectList ? rowSelectList : []);
  };

  useEffect(() => {
    setGroupDC(isGroupDC());
  }, []);

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
            checkboxSelection={groupDC ? true : false}
            isRowSelectable={(params: GridRowParams) =>
              params.row.verifyDCStatusCode === 0
            }
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
            onSelectionModelChange={handleSubmitRowSelect}
            disableSelectionOnClick
          />
        </div>
      </Box>
      {opensDCOrderDetail && (
        <DCOrderDetail
          idDC={idDC}
          isOpen={opensDCOrderDetail}
          onClickClose={isClosModal}
        />
      )}

      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}

export default DCOrderList;
