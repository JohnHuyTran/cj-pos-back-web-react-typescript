import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { Box, Button, Chip, Typography } from "@mui/material";
import { styled } from "@mui/styles";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import React from "react";
import {
  PurchaseInfo,
  PurchaseInvoiceSearchCriteriaRequest,
  PurchaseInvoiceSearchCriteriaResponse,
} from "../../models/supplier-check-order-model";
import { saveSearchCriteriaSup } from "../../store/slices/save-search-order-supplier-slice";
import { featchOrderListSupAsync } from "../../store/slices/supplier-check-order-slice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useStyles } from "../../styles/makeTheme";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import SupplierOrderDetail from "./supplier-order-detail";
import SupplierOrderReturn from "./supplier-order-return";
import { updateItemsState } from "../../store/slices/supplier-add-items-slice";
import { featchSupplierOrderDetailAsync } from "../../store/slices/supplier-order-detail-slice";
import { featchPurchaseNoteAsync } from "../../store/slices/supplier-order-return-slice";
import LoadingModal from "../commons/ui/loading-modal";
import { uploadFileState } from "../../store/slices/upload-file-slice";

interface loadingModalState {
  open: boolean;
}

export default function SupplierOrderList() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.supplierCheckOrderSlice);
  const res: PurchaseInvoiceSearchCriteriaResponse = items.orderList;

  const cuurentPage = useAppSelector(
    (state) => state.supplierCheckOrderSlice.orderList.page,
  );
  const limit = useAppSelector(
    (state) => state.supplierCheckOrderSlice.orderList.perPage,
  );

  const payload = useAppSelector(
    (state) => state.saveSearchOrderSup.searchCriteria,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());

  const [openDetail, setOpenDetail] = React.useState(false);
  const [openReturn, setOpenReturn] = React.useState(false);
  const [supplierId, setSupplierId] = React.useState("");

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#FFFFFF",
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 200,
      fontSize: "12px",
      border: "1px solid #CBD4DB",
      borderRadius: "5px",
      boxShadow:
        "0px 30px 84px rgba(19, 10, 46, 0.08), 0px 8px 32px rgba(19, 10, 46, 0.07), 0px 3px 14px rgba(19, 10, 46, 0.03), 0px 1px 3px rgba(19, 10, 46, 0.13)",
    },
  }));

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      width: 70,
      // flex: 0.5,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "createdDate",
      headerName: "วันที่รับสินค้า",
      minWidth: 110,
      // flex: 0.8,
      headerAlign: "center",
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
      field: "supplierName",
      headerName: "ผู้จำหน่าย",
      //   minWidth: 170,
      flex: 1.9,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" sx={{ lineHeight: "120%" }}>
            {params.value}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            sx={{ lineHeight: "120%" }}
          >
            {params.getValue(params.id, "supplierCode") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "docNo",
      headerName: "เลขที่ใบสั่งซื้อ PO",
      minWidth: 130,
      // flex: 1,
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div>
          {params.value && <label>{params.value}</label>}
          {!params.value && <label>-</label>}
        </div>
      ),
    },
    {
      field: "piNo",
      headerName: "เลขที่เอกสาร PI",
      minWidth: 163,
      // flex: 1,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "piStatus",
      headerName: "สถานะ PI",
      minWidth: 70,
      // flex: 0.8,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        if (params.value === 0) {
          return (
            <Chip
              label="บันทึก"
              size="small"
              sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
            />
          );
        } else if (params.value === 1) {
          return (
            <Chip
              label="อนุมัติ"
              size="small"
              sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
            />
          );
        } else if (params.value === 9) {
          return (
            <Chip
              label="ยกเลิก"
              size="small"
              sx={{ color: "#F54949", backgroundColor: "#FFD7D7" }}
            />
          );
        }
      },
    },
    {
      field: "comment",
      headerName: "หมายเหตุ PI",
      //   minWidth: 195,
      flex: 1,
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        return (
          <HtmlTooltip title={<React.Fragment>{params.value}</React.Fragment>}>
            <Typography variant="body2" noWrap>
              {params.value}
            </Typography>
          </HtmlTooltip>
        );
      },
    },
    {
      field: "pnNo",
      headerName: "เลขที่คืนสินค้า PN",
      minWidth: 140,
      // flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        if (params.getValue(params.id, "piStatus") === 1) {
          if (params.getValue(params.id, "pnState") === 0) {
            //check Create PN
            return (
              <Button
                variant="contained"
                color="warning"
                size="small"
                className={classes.MbtnSearch}
                sx={{ minWidth: 90 }}
                onClick={() => handleOpenReturnModal(params.row.piNo, "button")}
              >
                คืนสินค้า
              </Button>
            );
          } else {
            //PN Number 'บันทึก pnState=1, อนุมัติpnState=2'
            return (
              <Typography
                color="secondary"
                variant="body2"
                sx={{ textDecoration: "underline" }}
                onClick={() => handleOpenReturnModal(params.row.piNo, "button")}
              >
                {params.value}
              </Typography>
            );
          }
        } else {
          return (
            <Box
              sx={{ height: "100%", width: "100px" }}
              onClick={() => handleOpenReturnModal(params.row.piNo, "blank")}
            ></Box>
          );
        }
      },
    },
  ];

  const rows = res.data.map((data: PurchaseInfo, indexs: number) => {
    return {
      id: data.id,
      index: (cuurentPage - 1) * parseInt(pageSize) + indexs + 1,
      createdDate: convertUtcToBkkDate(data.createdDate),
      supplierName: data.supplierName,
      supplierCode: data.supplierCode,
      piNo: data.piNo,
      docNo: data.docNo,
      pnNo: data.pnNo,
      pnState: data.pnState,
      piStatus: data.piStatus,
      comment: data.comment,
    };
  });

  const [loading, setLoading] = React.useState<boolean>(false);

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleOpenLoading = (prop: any, event: boolean) => {
    // console.log({ prop, event });
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);

    let page: string = (newPage + 1).toString();

    const payloadNewpage: PurchaseInvoiceSearchCriteriaRequest = {
      limit: pageSize,
      page: page,
      paramQuery: payload.paramQuery,
      piStatus: payload.piStatus,
      piType: payload.piType,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
    };

    await dispatch(featchOrderListSupAsync(payloadNewpage));
    await dispatch(saveSearchCriteriaSup(payloadNewpage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    // console.log("pageSize: ", pageSize);
    setPageSize(pageSize.toString());

    setLoading(true);

    const payloadNewpage: PurchaseInvoiceSearchCriteriaRequest = {
      limit: pageSize.toString(),
      // page: cuurentPages.toString()
      page: "1",
      paramQuery: payload.paramQuery,
      piStatus: payload.piStatus,
      piType: payload.piType,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
    };

    await dispatch(featchOrderListSupAsync(payloadNewpage));
    await dispatch(saveSearchCriteriaSup(payloadNewpage));

    setLoading(false);
  };

  const purchaseDetailList = useAppSelector(
    (state) => state.supplierOrderDetail.purchaseDetail,
  );
  const currentlySelected = async (params: GridCellParams) => {
    const chkPN = params.colDef.field;
    handleOpenLoading("open", true);
    if (chkPN !== "pnNo") {
      try {
        // await dispatch(featchSupplierOrderDetailAsync(params.row.piNo));
        if (purchaseDetailList.data.length > 0 || purchaseDetailList.data) {
          await dispatch(featchSupplierOrderDetailAsync(params.row.piNo));
          await dispatch(updateItemsState({}));
          await dispatch(uploadFileState([]));
          setOpenDetail(true);
        } else {
          console.log("Purchase Detail No data");
          await dispatch(updateItemsState({}));
          await dispatch(uploadFileState([]));
        }
      } catch (error) {
        console.log(error);
      }
    }
    handleOpenLoading("open", false);
  };

  const handleOpenReturnModal = async (piNo: string, status: string) => {
    try {
      if (status === "button") {
        await dispatch(featchPurchaseNoteAsync(piNo));
        setOpenReturn(true);
      } else {
        await dispatch(featchSupplierOrderDetailAsync(piNo));
        await dispatch(updateItemsState({}));
        await dispatch(uploadFileState([]));
        setOpenDetail(true);
      }
    } catch (error) {
      console.log(error);
    }
    handleOpenLoading("open", false);
  };

  function isClosModal() {
    setOpenDetail(false);
    setOpenReturn(false);
  }

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
            // rowHeight={65}
          />
        </div>
      </Box>

      {openDetail && (
        <SupplierOrderDetail isOpen={openDetail} onClickClose={isClosModal} />
      )}
      {openReturn && (
        <SupplierOrderReturn isOpen={openReturn} onClickClose={isClosModal} />
      )}

      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}
