import React, { ReactElement, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import LoadingModal from "../../commons/ui/loading-modal";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useStyles } from "../../../styles/makeTheme";
import { objectNullOrEmpty } from "../../../utils/utils";

interface ConfirmInfo {
  documentNumber: string;
  numberOfSkuFromAP: number;
  numberOfDifferenceEqual: number;
  numberOfDifferenceNegative: number;
  numberOfDifferencePositive: number;
  numberOfSkuRecheckFromSA: number;
  numberOfCantCountFromSC: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  headerTitle: string;
  documentField: string;
  confirmInfo: ConfirmInfo;
}

interface loadingModalState {
  open: boolean;
}

export default function ModelConfirmStockAdjust(props: Props): ReactElement {
  const { open, onClose, onConfirm, headerTitle, documentField, confirmInfo } =
    props;

  const classes = useStyles();
  const [dataTable, setDataTable] = React.useState<any[]>([]);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  useEffect(() => {
    if (!objectNullOrEmpty(confirmInfo)) {
      let rows = [];
      rows.push({
        ...confirmInfo,
        id: 1,
      });
      setDataTable(rows);
    } else {
      setDataTable([]);
    }
  }, [confirmInfo]);

  const handleConfirm = async () => {
    handleOpenLoading("open", true);
    await onConfirm();
    handleOpenLoading("open", false);
    onClose();
  };

  const columns: GridColDef[] = [
    {
      field: "numberOfSkuFromAP",
      headerName: "ทั้งหมด",
      flex: 1,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "numberOfDifferenceEqual",
      headerName: "ครบ",
      flex: 1,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "numberOfDifferenceNegative",
      headerName: "ขาด",
      flex: 1,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" color={"#F54949"}>
            {params.value}
          </Typography>
        </div>
      ),
    },
    {
      field: "numberOfDifferencePositive",
      headerName: "เกิน",
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" color={"#446EF2"}>
            {params.value}
          </Typography>
        </div>
      ),
    },
    {
      field: "numberOfSkuRecheckFromSA",
      headerName: "นับทวนใหม่",
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      flex: 1.2,
    },
    {
      field: "numberOfCantCountFromSC",
      headerName: "ไม่สามารถนับได้",
      headerAlign: "center",
      align: "right",
      disableColumnMenu: true,
      sortable: false,
      flex: 1.2,
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690", textAlign: "center" }}>
            <Typography variant="body2" noWrap>
              <b>{"ไม่สามารถ"}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>{"นับได้"}</b>
            </Typography>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Dialog open={open} maxWidth={"sm"} fullWidth>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h6" align="center" mb={2}>
              {headerTitle}
            </Typography>
            <Typography variant="body1" align="center" mb={2}>
              {documentField}{" "}
              <label
                style={{
                  color: "#AEAEAE",
                  marginLeft: "10px",
                  marginRight: "5px",
                }}
              >
                |
              </label>{" "}
              <label style={{ color: "#36C690" }}>
                <b>{confirmInfo.documentNumber}</b>
              </label>
            </Typography>
          </DialogContentText>
          <div
            style={{ width: "100%" }}
            className={classes.MdataGridPaginationTop}
          >
            <DataGrid
              rows={dataTable}
              columns={columns}
              disableColumnMenu
              hideFooter
              autoHeight
              rowHeight={50}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 3, mr: 5, ml: 5 }}>
          <Button
            id="btnCancel"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 80, mr: 4 }}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, width: 80 }}
            onClick={handleConfirm}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
      <LoadingModal open={openLoadingModal.open} />
    </div>
  );
}
