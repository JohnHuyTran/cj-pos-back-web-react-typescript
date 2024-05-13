import { Fragment, ReactElement, useState } from "react";
import { useStyles } from "styles/makeTheme";
import { HighlightOff } from "@mui/icons-material";
import {
  // Grid,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatNumber } from "utils/utils";
import { useTranslation } from "react-i18next";

// Call API
import { updateConfirmShiftCloses } from "services/accounting";
import store, { useAppDispatch, useAppSelector } from "../../../store/store";
import { featchCloseSaleShiptListAsync } from "store/slices/accounting/close-saleshift-slice";
import LoadingModal from "components/commons/ui/loading-modal";
interface ModalSaveCloseShiftKeyProps {
  open: boolean;
  payload: any;
  onClose: () => void;
}

interface TableSaveCloseShiftKeyProps {
  rowData: any;
}

export default function ModalSaveCloseShiftKey(
  props: ModalSaveCloseShiftKeyProps,
): ReactElement {
  const dispatch = useAppDispatch();
  // Props
  const { open, payload, onClose } = props;

  const classes = useStyles();
  const { t } = useTranslation(["error"]);

  // Set state data
  const [barcode, setBarcode] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [isOpenLoading, setIsOpenLoading] = useState(false);
  const [openLoadingModal, setOpenLoadingModal] = useState<{ open: boolean }>({
    open: false,
  });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleSave = async () => {
    if (barcode) {
      // setIsOpenLoading(true);
      handleOpenLoading("open", true);
      try {
        const res = await updateConfirmShiftCloses(payload?.shiftCode, {
          shiftKey: barcode,
        });

        handleClose();
      } catch (err) {
        setErrorCode(err.code || err.httpStatus);
      } finally {
        const payloadSearch =
          store.getState().closeSaleShiftSlice.payloadSearch;
        await dispatch(featchCloseSaleShiptListAsync(payloadSearch));
        // setIsOpenLoading(false);
        handleOpenLoading("open", false);
      }
    }
  };

  const handleClose = () => {
    setErrorCode("");
    setBarcode("");
    onClose();
  };

  return (
    <Fragment>
      <Dialog
        id="ModalSaveCloseShiftKey"
        open={open}
        fullWidth={true}
        maxWidth="md"
      >
        <Box id="Card" sx={{ m: "10px 10px 20px" }}>
          <DialogContent
            id="CloseButton"
            sx={{ textAlign: "right", padding: 0 }}
          >
            <IconButton
              ria-label="close"
              onClick={handleClose}
              disabled={isOpenLoading}
              sx={{ color: "#bdbdbd" }}
              data-testid="testid-title-btnClose"
            >
              <HighlightOff fontSize="large" />
            </IconButton>
          </DialogContent>

          <TableSaveCloseShiftKey rowData={payload} />

          <DialogActions sx={{ justifyContent: "center", marginTop: "15px" }}>
            <Box sx={{ textAlign: "center", mr: "30px", maxWidth: "450px" }}>
              <Typography component="span" color="primary">
                กรุณาสแกน Barcode เพื่อเพิ่มรหัสปิดรอบ
              </Typography>
              <TextField
                data-testid="testid-tbx-shiftKey"
                name="accountNameTh"
                size="small"
                error={!!errorCode}
                value={barcode}
                onKeyPress={(e) =>
                  e.key === "Enter" && barcode ? handleSave() : ""
                }
                onChange={(e) => setBarcode(e.target.value)}
                className={classes.MtextField}
                sx={{ mt: 1 }}
                fullWidth
              />
              {errorCode && (
                <Typography component="div" color="error" sx={{ mt: 1 }}>
                  {t(errorCode)}
                </Typography>
              )}
            </Box>
            <LoadingButton
              data-testid="testid-btnSubmit"
              id="btnSave"
              variant="contained"
              color="primary"
              disabled={!barcode}
              loading={isOpenLoading}
              loadingIndicator={
                <Typography component="span" sx={{ fontSize: "11px" }}>
                  กรุณารอสักครู่ <CircularProgress color="inherit" size={15} />
                </Typography>
              }
              sx={{ borderRadius: 2, width: 100, mt: "32px", mb: "auto" }}
              onClick={handleSave}
            >
              บันทึกรหัส
            </LoadingButton>
          </DialogActions>
        </Box>
      </Dialog>
      <LoadingModal open={openLoadingModal.open} />
    </Fragment>
  );
}

const TableSaveCloseShiftKey = (props: TableSaveCloseShiftKeyProps) => {
  // Props
  const { rowData } = props;
  // Custom style
  const classes = useStyles();
  // Variable
  const columns: GridColDef[] = [
    {
      field: "posUser",
      headerName: "รหัสพนักงาน",
      minWidth: 120,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
    },
    {
      field: "posCode",
      headerName: "เครื่องขาย",
      minWidth: 120,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
    },
    {
      field: "shiftCode",
      headerName: "เลขรหัสรอบขาย",
      minWidth: 140,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
    },
    {
      field: "shiftAmount",
      headerName: "ยอดขายปิดรอบ",
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
      field: "billAmount",
      headerName: "ยอดขายในบิลขาย",
      minWidth: 140,
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

  const rows = [
    {
      id: 1,
      posUser: rowData?.posUser || "-",
      posCode: rowData?.posCode || "-",
      shiftCode: rowData?.shiftCode || "-",
      shiftAmount: rowData?.shiftAmount || 0,
      billAmount: rowData?.billAmount || 0,
    },
  ];

  return (
    <Box
      className={classes.MdataGridNoPagination}
      style={{ width: "75%", margin: "auto", textAlign: "center" }}
    >
      <Typography component="div" sx={{ mt: 1, mb: 2, fontWeight: 600 }}>
        บันทึกรหัสปิดรอบ
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight={true}
        scrollbarSize={10}
        rowHeight={65}
        disableColumnMenu
        hideFooter
      />
    </Box>
  );
};
