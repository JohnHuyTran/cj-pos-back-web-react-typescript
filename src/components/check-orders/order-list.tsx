import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { DataGrid, GridColDef, GridCellParams } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import {
  ShipmentResponse,
  ShipmentInfo,
  ShipmentRequest,
} from "../../models/order-model";
import CheckOrderDetail from "./check-order-detail";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import {
  getShipmentTypeText,
  ShipmentDeliveryStatusCodeEnum,
} from "../../utils/enum/check-order-enum";
import { useStyles } from "../../styles/makeTheme";
import { featchOrderListAsync } from "../../store/slices/check-order-slice";
import { saveSearchCriteria } from "../../store/slices/save-search-order";
import { featchOrderDetailAsync } from "../../store/slices/check-order-detail-slice";
import LoadingModal from "../commons/ui/loading-modal";
import { Chip, Typography } from "@mui/material";
import { updateAddItemsState } from "../../store/slices/add-items-slice";

function OrderList() {
  const { t } = useTranslation(["orderReceive", "common"]);
  const classes = useStyles();
  const items = useAppSelector((state) => state.checkOrderList);
  const cuurentPages = useAppSelector(
    (state) => state.checkOrderList.orderList.page,
  );
  const limit = useAppSelector((state) =>
    state.checkOrderList.orderList.perPage
      ? state.checkOrderList.orderList.perPage
      : 0,
  );

  const res: ShipmentResponse = items.orderList;
  const payload = useAppSelector(
    (state) => state.saveSearchOrder.searchCriteria,
  );
  const dispatch = useAppDispatch();
  const [opens, setOpens] = React.useState(false);
  const [docRefNo, setDocRefNo] = React.useState("");
  const [docType, setDocType] = React.useState("");
  const [sdNo, setSdNo] = React.useState("");
  const [pageSize, setPageSize] = React.useState(limit.toString());

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      // minWidth: 75,
      flex: 0.65,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "docRefNo",
      headerName: "เลขที่เอกสาร",
      // minWidth: 161,
      flex: 1.3,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "sdNo",
      headerName: "เลขที่เอกสาร SD",
      // minWidth: 160,
      flex: 1.3,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "shipBranchFromcode",
      headerName: "สาขาต้นทาง",
      // minWidth: 90,
      flex: 1.1,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" sx={{ lineHeight: "120%" }}>
            {params.value}-
            {params.getValue(params.id, "shipBranchFromname") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "shipBranchTocode",
      headerName: "สาขาปลายทาง",
      // minWidth: 205,
      // width: 195,
      flex: 1.15,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" sx={{ lineHeight: "120%" }}>
            {params.value}-
            {params.getValue(params.id, "shipBranchToname") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "sdType",
      headerName: "ประเภท",
      // minWidth: 80,
      flex: 0.9,
      // flex: 1.4,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div>{getShipmentTypeText(Number(params.value))}</div>
      ),
    },
    {
      field: "sdStatus",
      headerName: "สถานะ",
      minWidth: 70,
      flex: 0.65,
      headerAlign: "center",
      align: "left",
      sortable: false,
      renderCell: (params) => {
        if (
          params.value === ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT ||
          params.value ===
            ShipmentDeliveryStatusCodeEnum.STATUS_WAITAPPROVEL_1 ||
          params.value ===
            ShipmentDeliveryStatusCodeEnum.STATUS_REJECT_APPROVAL_1
        ) {
          return (
            <Chip
              label={t(`status.${params.value}`)}
              size="small"
              sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
            />
          );
        } else if (
          params.value === ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE
        ) {
          return (
            <Chip
              label={t(`status.${params.value}`)}
              size="small"
              sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
            />
          );
        } else if (
          params.value === ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB
        ) {
          return (
            <Chip
              label={t(`status.${params.value}`)}
              size="small"
              sx={{ color: "#F54949", backgroundColor: "#FFD7D7" }}
            />
          );
        }
      },
    },
    {
      field: "boxCnt",
      headerName: "จำนวนลัง",
      minWidth: 90,
      flex: 0.8,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params) => {
        if (params.getValue(params.id, "sdType") === 1) {
          return <div>-</div>;
        } else {
          <div>{params.value}</div>;
        }
      },
    },
    {
      field: "toteCnt",
      headerName: "จำนวนTote",
      minWidth: 99,
      flex: 0.9,
      headerAlign: "center",
      align: "right",
      sortable: false,
      renderCell: (params) => {
        if (params.getValue(params.id, "sdType") === 1) {
          return <div>-</div>;
        } else {
          <div>{params.value}</div>;
        }
      },
    },
    {
      field: "shipmentDate",
      headerName: "วันที่รับสินค้า",
      headerAlign: "center",
      align: "center",
      minWidth: 105,
      flex: 1,
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
      field: "comment",
      headerName: "เอกสารอ้างอิง",
      minWidth: 145,
      flex: 1.3,
      headerAlign: "center",
      align: "left",
      sortable: false,
    },
  ];

  // console.log('res: ', JSON.stringify(res));
  const rows = res.data.map((data: ShipmentInfo, indexs: number) => {
    return {
      id: `${data.docRefNo}_${data.sdNo}`,
      index: (cuurentPages - 1) * parseInt(pageSize) + indexs + 1,
      // shipmentNo: data.shipmentNo,
      docRefNo: data.docRefNo,
      docType: data.docType,
      sdNo: data.sdNo,
      sdType: data.sdType,
      boxCnt: data.boxCnt,
      toteCnt: data.toteCnt,
      shipmentDate: convertUtcToBkkDate(data.shipmentDate),
      sdStatus: data.sdStatus,
      comment: data.comment,
      shipBranchFromcode: data.shipBranchFrom.code,
      shipBranchFromname: data.shipBranchFrom.name,
      shipBranchTocode: data.shipBranchTo.code,
      shipBranchToname: data.shipBranchTo.name,
    };
  });

  const currentlySelected = async (params: GridCellParams) => {
    setOpenLoadingModal(true);
    setSdNo(params.row.sdNo);
    setDocRefNo(params.row.docRefNo);
    setDocType(params.row.docType);

    await dispatch(updateAddItemsState({}));
    await dispatch(featchOrderDetailAsync(params.row.sdNo))
      .then(
        (value) => {
          if (value) {
            setOpens(true);
          }
        },

        // async function (value) {
        //   setOpens(true);
        // },
        // function (error: ApiError) {
        //   console.log('err message : ', error.message);
        // }
      )
      .catch((err) => {
        console.log("err : ", err);
      });
    // setOpens(true);
    setOpenLoadingModal(false);
  };

  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);

  // const currentlySelected = async (params: GridCellParams) => {
  //   setOpenLoadingModal(true);
  //   setSdNo(params.row.sdNo);
  //   setShipment(params.row.shipmentNo);

  //   try {
  //     await dispatch(featchOrderDetailAsync(params.row.sdNo));
  //     setOpens(true);
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   setOpenLoadingModal(false);
  // };

  function isClosModal() {
    setOpens(false);
  }

  //pagination

  const [loading, setLoading] = React.useState<boolean>(false);

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    // console.log('newPage: ', newPage);
    let page: string = (newPage + 1).toString();

    const payloadNewpage: ShipmentRequest = {
      // limit: payload.limit,
      limit: pageSize,
      page: page,
      paramQuery: payload.paramQuery,
      sdNo: payload.sdNo,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      sdStatus: payload.sdStatus,
      sdType: payload.sdType,
      clearSearch: false,
    };

    await dispatch(featchOrderListAsync(payloadNewpage));
    await dispatch(saveSearchCriteria(payloadNewpage));

    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());

    setLoading(true);

    const payloadNewpage: ShipmentRequest = {
      // limit: payload.limit,
      limit: pageSize.toString(),
      // page: cuurentPages.toString(),
      page: "1",
      paramQuery: payload.paramQuery,
      sdNo: payload.sdNo,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      sdStatus: payload.sdStatus,
      sdType: payload.sdType,
      clearSearch: false,
    };

    await dispatch(featchOrderListAsync(payloadNewpage));
    await dispatch(saveSearchCriteria(payloadNewpage));

    setLoading(false);
  };

  return (
    <div>
      {/* <Box mt={2} bgcolor="background.paper"> */}
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
          page={cuurentPages - 1}
          pageSize={parseInt(pageSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          rowCount={res.total}
          paginationMode="server"
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
          rowHeight={85}
          pagination
        />
      </div>
      {/* </Box> */}
      {opens && (
        <CheckOrderDetail
          sdNo={sdNo}
          docRefNo={docRefNo}
          docType={docType}
          defaultOpen={opens}
          onClickClose={isClosModal}
        />
      )}

      <LoadingModal open={openLoadingModal} />
    </div>
  );
}

export default OrderList;
