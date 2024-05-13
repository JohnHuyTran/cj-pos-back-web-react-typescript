import React, { ReactElement, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import LoadingModal from "../../../commons/ui/loading-modal";
import { useStyles } from "../../../../styles/makeTheme";
import {
  ExpenseInfo,
  ExpensePeriod,
} from "../../../../models/branch-accounting-model";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useAppSelector } from "../../../../store/store";
import { numberWithCommas, stringNullOrEmpty } from "../../../../utils/utils";
import { Box, DialogContentText, TextField, Typography } from "@mui/material";
import { convertUtcToBkkDate } from "../../../../utils/date-utill";
import NumberFormat from "react-number-format";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: any) => void;
  payload?: any;
  periodProps?: ExpensePeriod;
  docNo?: string;
}
interface loadingModalState {
  open: boolean;
}

export default function ModelConfirm({
  open,
  onClose,
  onConfirm,
  payload,
  periodProps,
  docNo,
}: Props): ReactElement {
  const classes = useStyles();
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const date = new Date();
  const [startDate, setStartDate] = React.useState(
    String(periodProps?.startDate),
  );
  const [endDate, setEndDate] = React.useState(String(periodProps?.endDate));

  const handleConfirm = async () => {
    handleOpenLoading("open", true);
    onConfirm({ comment: "comment" });
    handleOpenLoading("open", false);
    onClose();
  };

  const expenseMasterList = useAppSelector(
    (state) => state.masterExpenseListSlice.masterExpenseList.data,
  );
  const getMasterExpenInto = (key: any) =>
    expenseMasterList.find((e: ExpenseInfo) => e.expenseNo === key);
  const [columnsList, setColumnsList] = React.useState<GridColDef[]>([]);
  const [rowList, setRowList] = React.useState<any[]>([]);

  const columns = columnsList ? columnsList : [];
  const rows = rowList ? rowList : [];
  useEffect(() => {
    if (payload) {
      let infosWithDraw: any;
      payload.map((item: any) => {
        infosWithDraw = {
          ...infosWithDraw,
          [item.key]: item.value,
        };
      });

      infosWithDraw = {
        ...infosWithDraw,
        id: 1,
      };

      setRowList([infosWithDraw]);

      const columns: GridColDef[] = payload.map((i: any) => {
        const hideColumn = i.isOtherExpense ? i.isOtherExpense : false;

        if (String(i.key) === "diff") {
          return {
            field: i.key,
            headerName: i.title,
            minWidth: 120,
            flex: 0.6,
            headerAlign: "center",
            align: "right",
            sortable: false,
            hide: hideColumn,
            // renderCell: (params: GridRenderCellParams) => {
            //   if (Number(params.value) > 0) {
            //     return <label style={{ color: '#446EF2', fontWeight: 700 }}> +{numberWithCommas(params.value)} </label>;
            //   } else if (Number(params.value) < 0) {
            //     return <label style={{ color: '#F54949', fontWeight: 700 }}> {numberWithCommas(params.value)} </label>;
            //   }
            //   return numberWithCommas(params.value);
            // },
            renderCell: (params: GridRenderCellParams) => {
              let _diff = String(params.value);
              if (Number(params.value) > 0) _diff = `+${_diff}`;
              const frontColor = _diff.includes("+")
                ? "#446EF2"
                : _diff.includes("-")
                  ? "#F54949"
                  : "#000";

              return (
                <NumberFormat
                  value={String(params.value)}
                  thousandSeparator={true}
                  decimalScale={2}
                  className={classes.MtextFieldNumberNotStyleDisable}
                  disabled={true}
                  customInput={TextField}
                  sx={{
                    ".MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: frontColor,
                      // color: color,
                    },
                    ".MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    ".MuiInputBase-input-MuiOutlinedInput-input": {
                      textAlign: "right",
                    },
                  }}
                  prefix={Number(params.value) > 0 ? "+" : ""}
                  fixedDecimalScale
                />
              );
            },
          };
        } else {
          return {
            field: i.key,
            headerName: i.title,
            minWidth: 120,
            flex: 0.6,
            headerAlign: "center",
            align: "right",
            sortable: false,
            hide: hideColumn,
            renderCell: (params: GridRenderCellParams) => {
              return (
                <NumberFormat
                  value={String(params.value)}
                  thousandSeparator={true}
                  decimalScale={2}
                  className={classes.MtextFieldNumberNotStyleDisable}
                  disabled={true}
                  customInput={TextField}
                  sx={{
                    ".MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#000",
                    },
                    ".MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    ".MuiInputBase-input-MuiOutlinedInput-input": {
                      textAlign: "right",
                    },
                  }}
                  fixedDecimalScale
                  type="text"
                />
              );
            },
          };
        }
      });

      setColumnsList(columns);
    }
    if (periodProps) {
      setStartDate(periodProps.startDate);
      setEndDate(periodProps.endDate);
    }
  }, [open === true]);

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        PaperProps={{ sx: { minWidth: 550 } }}
      >
        <DialogContent sx={{ mt: 3, mr: 3, ml: 3 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h5" align="center" sx={{ marginBottom: 1 }}>
              ยืนยันอนุมัติค่าใช้จ่าย
            </Typography>

            <Box
              id="DetailBox"
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box id="DetailTitle" sx={{ width: "55%", textAlign: "right" }}>
                เลขที่เอกสาร
              </Box>
              <Box id="DetailLine">
                <Typography
                  component="label"
                  sx={{ color: "#AEAEAE", ml: "18px", mr: "5px" }}
                >
                  |
                </Typography>
              </Box>
              <Box id="DetailDescription" sx={{ width: "100%" }}>
                <Typography
                  component="label"
                  sx={{ color: "#36C690", fontWeight: "700" }}
                >
                  {docNo}
                </Typography>
              </Box>
            </Box>

            <Box
              id="DetailBox"
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box id="DetailTitle" sx={{ width: "55%", textAlign: "right" }}>
                งวด
              </Box>
              <Box id="DetailLine">
                <Typography
                  component="label"
                  sx={{ color: "#AEAEAE", ml: "18px", mr: "5px" }}
                >
                  |
                </Typography>
              </Box>
              <Box id="DetailDescription" sx={{ width: "100%" }}>
                <Typography
                  component="label"
                  sx={{ color: "#36C690", fontWeight: "700" }}
                >
                  {convertUtcToBkkDate(startDate)} -{" "}
                  {convertUtcToBkkDate(endDate)}
                </Typography>
              </Box>
            </Box>
          </DialogContentText>

          <div
            style={{
              width: "100%",
              height: rows.length >= 8 ? "70vh" : "auto",
              marginTop: 25,
            }}
            className={classes.MdataGridConfirm}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              hideFooterPagination
              disableColumnMenu
              autoHeight={rows.length >= 8 ? false : true}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2, mr: 5, ml: 5 }}>
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 120, mr: 4 }}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, width: 120 }}
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
