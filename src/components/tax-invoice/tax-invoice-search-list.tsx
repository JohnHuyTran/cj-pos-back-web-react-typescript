import React from "react";
import { Chip, Grid, TextField, Typography } from "@mui/material";
import { Box } from "@mui/material";
import { useStyles } from "../../styles/makeTheme";
import { Button } from "@mui/material";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  featchTaxInvoiceListAsync,
  savePayloadSearchList,
  saveTaxInvoiceList,
} from "../../store/slices/tax-invoice-search-list-slice";
import {
  TaxInvoiceInfo,
  TaxInvoiceRequest,
  TaxInvoiceResponse,
} from "../../models/tax-invoice-model";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import { featchTaxInvoiceDetailAsync } from "../../store/slices/tax-invoice-search-detail-slice";
import { useTranslation } from "react-i18next";
import ModalTaxInvoiceDetails from "./tax-invoice-details";
import LoadingModal from "../commons/ui/loading-modal";
import { requestTaxInvoice } from "../../services/sale";
import { ApiError } from "../../models/api-error-model";
import { uploadFileState } from "../../store/slices/upload-file-slice";
import { featchTaxInvoicePrintHistoryAsync } from "../../store/slices/sale/tax-invoice-print-history-slice";

interface Props {
  actionType: string;
}

export default function TaxInvoiceSearchList({ actionType }: Props) {
  const classes = useStyles();
  const { t } = useTranslation(["taxInvoice", "common"]);
  const dispatch = useAppDispatch();
  const payloadSearch = useAppSelector(
    (state) => state.taxInvoiceSearchList.payloadSearchList,
  );
  const items = useAppSelector((state) => state.taxInvoiceSearchList);
  const cuurentPage = useAppSelector(
    (state) => state.taxInvoiceSearchList.taxInvoiceList.page,
  );
  const limit = useAppSelector(
    (state) => state.taxInvoiceSearchList.taxInvoiceList.perPage,
  );

  const res: TaxInvoiceResponse = items.taxInvoiceList;
  const [pageSize, setPageSize] = React.useState(limit.toString());
  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      width: 70,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "billNo",
      headerName: "เลขที่ใบเสร็จ(ย่อ)",
      minWidth: 200,
      flex: 0.5,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "docDate",
      headerName: "วันที่ออกใบเสร็จ(ย่อ)",
      flex: 0.4,
      minWidth: 100,
      align: "left",
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "billStatusDisplay",
      headerName: "สถานะ(ย่อ)",
      minWidth: 150,
      // flex: 1.2,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        if (params.value === "PRINTED") {
          return (
            <Chip
              label={t(`status.${params.value}`)}
              size="small"
              sx={{ color: "#20AE79", backgroundColor: "#E7FFE9" }}
            />
          );
        } else if (params.value === "CANCELLED") {
          return (
            <Chip
              label={t(`status.${params.value}`)}
              size="small"
              sx={{ color: "#FBA600", backgroundColor: "#FFF0CA" }}
            />
          );
        }
      },
    },
    {
      field: "invoiceNo",
      headerName: "เลขที่ใบเสร็จ(เต็ม)",
      minWidth: 200,
      flex: 0.5,
      headerAlign: "center",
      sortable: false,
    },
    {
      field: "lastPrintedDate",
      headerName: "วันที่พิมพ์ใบเสร็จ(เต็ม)",
      minWidth: 100,
      flex: 0.4,
      headerAlign: "center",
      align: "left",
      sortable: false,
    },
    {
      field: "totalPrint",
      headerName: "พิมพ์ใบเสร็จ(เต็ม)ครั้งที่",
      minWidth: 70,
      flex: 0.4,
      headerAlign: "center",
      align: "right",
      sortable: false,
    },
  ];

  const rows = res.data.map((data: TaxInvoiceInfo, indexs: number) => {
    return {
      id: data.billNo,
      index: (cuurentPage - 1) * parseInt(pageSize) + indexs + 1,
      billNo: data.billNo,
      docDate: convertUtcToBkkDate(data.docDate),
      billStatusDisplay: data.status,
      billStatus: data.status,
      invoiceNo: data.invoiceNo,
      lastPrintedDate: data.lastPrintedDate
        ? convertUtcToBkkDate(data.lastPrintedDate)
        : "",
      totalPrint: data.totalPrint,
    };
  });

  const [loading, setLoading] = React.useState<boolean>(false);

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    let page: string = (newPage + 1).toString();
    const payload: TaxInvoiceRequest = {
      limit: pageSize.toString(),
      page: page,
      docNo: payloadSearch.docNo,
      citizenId: payloadSearch.citizenId,
    };
    await dispatch(featchTaxInvoiceListAsync(payload));
    await dispatch(savePayloadSearchList(payload));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setLoading(true);
    setPageSize(pageSize.toString());
    const payload: TaxInvoiceRequest = {
      limit: pageSize.toString(),
      page: "1",
      docNo: payloadSearch.docNo,
      citizenId: payloadSearch.citizenId,
    };

    await dispatch(featchTaxInvoiceListAsync(payload));
    await dispatch(savePayloadSearchList(payload));
    setLoading(false);
  };

  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const currentlySelected = async (params: GridCellParams) => {
    if (params.row.billStatus !== "CANCELLED") {
      setOpenLoadingModal(true);
      const payload: TaxInvoiceRequest = {
        docNo: params.row.billNo,
      };
      await dispatch(uploadFileState([]));
      await dispatch(featchTaxInvoiceDetailAsync(payload)).then(() => {
        dispatch(featchTaxInvoicePrintHistoryAsync(params.row.billNo)).then(
          () => {
            setOpenDetailModal(true);
          },
        );
      });
      setOpenLoadingModal(false);
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  const reloadRequestTaxInvoice = async () => {
    if (actionType === "search") {
      await dispatch(featchTaxInvoiceListAsync(payloadSearch));
    } else if (actionType === "request") {
      await requestTaxInvoice(payloadSearch)
        .then(async (value) => {
          await dispatch(saveTaxInvoiceList(value));
        })
        .catch((error: ApiError) => {
          console.log("error: ", error);
        });
    }
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

      <LoadingModal open={openLoadingModal} />
      <ModalTaxInvoiceDetails
        isOpen={openDetailModal}
        onClickClose={handleCloseDetailModal}
        reloadRequestTaxInvoice={reloadRequestTaxInvoice}
      />
    </div>
  );
}
