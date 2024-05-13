import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridRowData,
  GridRowParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { useStyles } from "../../../styles/makeTheme";
import LoadingModal from "../../commons/ui/loading-modal";
import { Chip, TextField } from "@mui/material";
import { DeleteForever, Edit } from "@mui/icons-material";
import NumberFormat from "react-number-format";
import ModalEditSearchList from "./modal-edit-search-list";
import ModalDeleteSearchList from "./modal-delete-search-list";

interface loadingModalState {
  open: boolean;
}
import {
  CashStatementInfo,
  CashStatementSearchRequest,
  CashStatementSearchResponse,
} from "models/branch-accounting-model";
import { convertUtcToBkkDate } from "utils/date-utill";
import { featchSearchCashStatementAsync } from "store/slices/accounting/cash-statement/cash-search-slice";
import { saveCashStatementSearch } from "store/slices/accounting/cash-statement/save-cash-search-slice";
import { getBranchName } from "utils/utils";
import { cashStatementDelete } from "services/accounting";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import { ApiUploadError } from "models/api-error-model";
import AlertError from "../../commons/ui/alert-error";

export interface DataGridProps {
  onSelectRows: (rowsList: Array<any>) => void;
}

const columns: GridColDef[] = [
  {
    field: "index",
    headerName: "ลำดับ",
    width: 80,
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => (
      <Box component="div" sx={{ paddingLeft: "20px" }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "branchCode",
    headerName: "สาขา",
    minWidth: 120,
    flex: 1.2,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "cashDate",
    headerName: "วันที่เงินขาด-เกิน",
    minWidth: 150,
    headerAlign: "center",
    align: "left",
    sortable: false,
  },
  {
    field: "salesDate",
    headerName: "วันที่ยอดขาย",
    minWidth: 120,
    flex: 1.2,
    headerAlign: "center",
    sortable: false,
  },
  {
    field: "cashShort",
    headerName: "เงินขาด",
    minWidth: 120,
    flex: 1.2,
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <NumberFormat
          value={String(params.value)}
          thousandSeparator={true}
          decimalScale={2}
          disabled={true}
          customInput={TextField}
          sx={{
            ".MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "#000",
              textAlign: "end",
            },
            ".MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
          fixedDecimalScale
          type="text"
        />
      );
    },
  },
  {
    field: "cashOver",
    headerName: "เงินเกิน",
    minWidth: 120,
    headerAlign: "center",
    align: "left",
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <NumberFormat
          value={String(params.value)}
          thousandSeparator={true}
          decimalScale={2}
          disabled={true}
          customInput={TextField}
          sx={{
            ".MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "#000",
              textAlign: "end",
            },
            ".MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
          fixedDecimalScale
          type="text"
        />
      );
    },
  },
  {
    field: "status",
    headerName: "สถานะ",
    minWidth: 80,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => {
      if (params.value === "DRAFT") {
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
      }
    },
  },
  {
    field: "edit",
    headerName: " ",
    width: 50,
    align: "center",
    sortable: false,
    renderCell: (params) => {
      if (params.getValue(params.id, "status") === "DRAFT") {
        return (
          <div>
            <Edit fontSize="medium" sx={{ color: "#AEAEAE" }} />
          </div>
        );
      }
    },
  },
  {
    field: "delete",
    headerName: " ",
    width: 50,
    align: "center",
    sortable: false,
    renderCell: (params) => {
      if (params.getValue(params.id, "status") === "DRAFT") {
        return (
          <div>
            <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
          </div>
        );
      }
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

function CashStatementList({ onSelectRows }: DataGridProps) {
  const { t } = useTranslation(["cashStatement", "common"]);
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => state.searchCashStatement);
  const cuurentPage = useAppSelector(
    (state) => state.searchCashStatement.cashStatementList.page,
  );
  const limit = useAppSelector(
    (state) => state.searchCashStatement.cashStatementList.perPage,
  );
  const res: CashStatementSearchResponse = items.cashStatementList;
  const payload = useAppSelector(
    (state) => state.saveCashStatementSearchRequest.searchCashStatement,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());

  useEffect(() => {}, []);

  const { apiRef, columns } = useApiRef();
  const rows = res.data.map((data: CashStatementInfo, indexs: number) => {
    return {
      id: data.id,
      index: (cuurentPage - 1) * parseInt(pageSize) + indexs + 1,
      branchCode: data.branchCode?.name ? data.branchCode?.name : "",
      cashDate: convertUtcToBkkDate(data.cashDate),
      salesDate: convertUtcToBkkDate(data.salesDate),
      cashOver: data.cashOver,
      cashShort: data.cashShort,
      status: data.status,
      statusText: t(`status.${data.status}`),
    };
  });

  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const [loading, setLoading] = React.useState<boolean>(false);
  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    let page: string = (newPage + 1).toString();
    const payloadNewpage: CashStatementSearchRequest = {
      limit: pageSize,
      page: page,
      branchCode: payload.branchCode,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      status: payload.status,
    };

    await dispatch(featchSearchCashStatementAsync(payloadNewpage));
    await dispatch(saveCashStatementSearch(payloadNewpage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());
    setLoading(true);

    const payloadNewpage: CashStatementSearchRequest = {
      limit: pageSize.toString(),
      page: "1",
      branchCode: payload.branchCode,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      status: payload.status,
    };
    await dispatch(featchSearchCashStatementAsync(payloadNewpage));
    await dispatch(saveCashStatementSearch(payloadNewpage));
    setLoading(false);
  };

  const handleSubmitRowSelect = async () => {
    const rowSelect = apiRef.current.getSelectedRows();
    let rowSelectList: any = [];
    rowSelect.forEach((data: GridRowData) => {
      rowSelectList.push(data);
    });

    return onSelectRows(rowSelectList ? rowSelectList : []);
  };

  const [openModalEdit, setOpenModalEdit] = React.useState(false);
  const [payloadEdit, setPayloadEdit] = React.useState({
    cashOver: 0,
    cashShort: 0,
  });
  const [selectRowsDeleteList, setSelectRowsDeleteList] = React.useState<
    Array<any>
  >([]);
  const currentlySelected = async (params: GridCellParams) => {
    const value = params.colDef.field;
    if (value === "delete") {
      handleDelete(params.row);
    } else if (value === "edit") {
      handleEdit(params.row);
    }
  };

  const handleEdit = async (data: any) => {
    setOpenLoadingModal(true);
    setOpenModalEdit(true);
    setPayloadEdit(data);
    setOpenLoadingModal(false);
  };

  const onCloseModalEdit = () => {
    dispatch(featchSearchCashStatementAsync(payload));
    setOpenModalEdit(false);
  };

  const [openModalDelete, setOpenModalDelete] = React.useState(false);
  const handleDelete = async (data: any) => {
    // setOpenLoadingModal(true);
    console.log("handleDelete:", JSON.stringify(data));
    setSelectRowsDeleteList([data]);
    setOpenModalDelete(true);
  };

  const handleConfirmDelete = async () => {
    setOpenLoadingModal(true);
    const id = selectRowsDeleteList[0].id ? selectRowsDeleteList[0].id : "";
    await cashStatementDelete(id)
      .then((value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้ลบข้อมูลเรียบร้อยแล้ว");

        setTimeout(() => {
          dispatch(featchSearchCashStatementAsync(payload));
          setOpenModalDelete(false);
        }, 1000);
      })
      .catch((error: ApiUploadError) => {
        setOpenAlert(true);
        setTextError(error.message);
      });

    setOpenLoadingModal(false);
  };

  const onCloseModalDelete = () => {
    setOpenModalDelete(false);
    setOpenLoadingModal(false);
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
            checkboxSelection={true}
            isRowSelectable={(params: GridRowParams) =>
              params.row.status === "DRAFT"
            }
            onSelectionModelChange={handleSubmitRowSelect}
            disableSelectionOnClick
          />
        </div>
      </Box>

      <ModalEditSearchList
        open={openModalEdit}
        onClose={onCloseModalEdit}
        payloadEdit={payloadEdit}
      />
      <ModalDeleteSearchList
        open={openModalDelete}
        onClose={onCloseModalDelete}
        payloadDelete={selectRowsDeleteList}
        onConfirmDelete={handleConfirmDelete}
      />

      <LoadingModal open={openLoadingModal} />

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />

      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />
    </div>
  );
}

export default CashStatementList;
