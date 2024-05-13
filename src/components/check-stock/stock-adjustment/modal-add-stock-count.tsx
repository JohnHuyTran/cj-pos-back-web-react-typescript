import React, { useEffect } from "react";
import { useAppSelector } from "../../../store/store";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { Box } from "@material-ui/core";
import {
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import {
  DateFormat,
  StockActionStatus,
  STORE_TYPE,
} from "../../../utils/enum/common-enum";
import HtmlTooltip from "../../commons/ui/html-tooltip";
import Button from "@mui/material/Button";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import { getAuditPlanDetail } from "../../../store/slices/audit-plan-detail-slice";

export interface DataGridProps {
  open: boolean;
  onClose: () => void;
  onClickAdd: (selectedSCs: any[]) => void;
  selectedSCs: any[];
}

const _ = require("lodash");

export const ModalAddStockCount = (props: DataGridProps) => {
  const { open, onClose, onClickAdd, selectedSCs } = props;
  const classes = useStyles();
  const [dataTable, setDataTable] = React.useState<any[]>([]);
  const [checkAll, setCheckAll] = React.useState<boolean>(false);
  const dataDetailAP = useAppSelector(
    (state) => state.auditPlanDetailSlice.auditPlanDetail.data,
  );

  useEffect(() => {
    if (
      dataDetailAP &&
      dataDetailAP.relatedScDocuments &&
      dataDetailAP.relatedScDocuments.length > 0
    ) {
      let lstSCConfirmed = dataDetailAP.relatedScDocuments.filter(
        (itF: any) => StockActionStatus.CONFIRM === itF.status,
      );
      if (lstSCConfirmed && lstSCConfirmed.length > 0) {
        let rows = lstSCConfirmed.map((item: any, index: number) => {
          let inSelectedSCs = selectedSCs.filter(
            (it: any) =>
              it.documentNumber === item.documentNumber &&
              it.countingTime === item.countingTime,
          );
          return {
            checked: inSelectedSCs && inSelectedSCs.length > 0,
            id: item.id,
            index: index + 1,
            documentNumber: item.documentNumber,
            countingTime: item.countingTime,
            storeType: item.storeType,
            createdDate: convertUtcToBkkDate(
              item.createdDate,
              DateFormat.DATE_FORMAT,
            ),
            status: item.status,
            createdBy: item.createdBy,
            disabledChecked: inSelectedSCs && inSelectedSCs.length > 0,
          };
        });
        setDataTable(rows);
        setCheckAll(
          rows.filter((it: any) => it.checked).length === dataTable.length,
        );
      } else {
        setDataTable([]);
        setCheckAll(false);
      }
    }
  }, [dataDetailAP, open]);

  const onCheckCell = async (params: GridRenderCellParams, event: any) => {
    let dataTableHandle = _.cloneDeep(dataTable);
    for (let item of dataTableHandle) {
      if (item.id === params.row.id) {
        item.checked = event.target.checked;
      }
    }
    setDataTable(dataTableHandle);
    let lstUnCheck = dataTableHandle.filter((it: any) => !it.checked);
    if (lstUnCheck != null && lstUnCheck.length > 0) setCheckAll(false);
    else setCheckAll(true);
  };

  const onCheckAll = async (event: any) => {
    setCheckAll(event.target.checked);
    let dataTableHandle = _.cloneDeep(dataTable);
    for (let item of dataTableHandle) {
      item.checked = event.target.checked;
    }
    setDataTable(dataTableHandle);
  };

  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "นับทวน",
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderHeader: (params) => (
        <FormControl component="fieldset" sx={{ marginLeft: "-16px" }}>
          <FormGroup aria-label="position" row>
            <FormControlLabel
              className={classes.MFormControlLabel}
              value="top"
              control={
                <Checkbox
                  checked={checkAll}
                  onClick={onCheckAll.bind(this)}
                  disabled={
                    dataTable.filter((it: any) => it.disabledChecked).length ===
                    dataTable.length
                  }
                />
              }
              label={""}
              labelPlacement="top"
            />
          </FormGroup>
        </FormControl>
      ),
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(params.value)}
          disabled={Boolean(params.getValue(params.id, "disabledChecked"))}
          onClick={onCheckCell.bind(this, params)}
        />
      ),
    },
    {
      field: "documentNumber",
      headerName: "เลขที่เอกสาร",
      flex: 1.5,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "countingTime",
      headerName: "นับครั้งที่",
      flex: 0.8,
      headerAlign: "center",
      align: "right",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "storeType",
      headerName: "คลัง",
      flex: 1,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => genStoreType(params),
    },
    {
      field: "createdDate",
      headerName: "วันที่เอกสาร",
      headerAlign: "center",
      align: "center",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Box component="div" sx={{ marginLeft: "0.2rem" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "สถานะ",
      headerAlign: "center",
      align: "center",
      sortable: false,
      flex: 1,
      renderCell: (params) => genRowStatus(params),
    },
    {
      field: "createdBy",
      headerName: "ผู้ทำรายการ",
      headerAlign: "center",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Box component="div" sx={{ marginLeft: "1rem" }}>
          {params.value}
        </Box>
      ),
    },
  ];

  const genStoreType = (params: GridValueGetterParams) => {
    let valueDisplay = "";
    switch (params.value) {
      case STORE_TYPE.FRONT:
        valueDisplay = "หน้าร้าน";
        break;
      case STORE_TYPE.BACK:
        valueDisplay = "หลังร้าน";
        break;
    }
    return valueDisplay;
  };

  const genRowStatus = (params: GridValueGetterParams) => {
    let statusDisplay;
    let status = params.value ? params.value.toString() : "";
    switch (status) {
      case StockActionStatus.DRAFT:
        statusDisplay = genRowStatusValue("บันทึก", {
          color: "#FBA600",
          backgroundColor: "#FFF0CA",
        });
        break;
      case StockActionStatus.CONFIRM:
        statusDisplay = genRowStatusValue("ยืนยัน", {
          color: "#20AE79",
          backgroundColor: "#E7FFE9",
        });
        break;
    }
    return statusDisplay;
  };

  const genRowStatusValue = (statusLabel: any, styleCustom: any) => {
    return (
      <HtmlTooltip title={<React.Fragment>{statusLabel}</React.Fragment>}>
        <Typography className={classes.MLabelBDStatus} sx={styleCustom}>
          {statusLabel}
        </Typography>
      </HtmlTooltip>
    );
  };

  const [pageSize, setPageSize] = React.useState<number>(10);

  const onHandleAddSelectedSC = () => {
    let lstSelected = dataTable.filter((it: any) => it.checked);
    let selectedSCs = [];
    if (lstSelected && lstSelected.length > 0) {
      for (const it of lstSelected) {
        selectedSCs.push({
          id: it.id,
          documentNumber: it.documentNumber,
          countingTime: it.countingTime,
        });
      }
    }
    onClickAdd(selectedSCs);
  };

  return (
    <div>
      <Dialog open={open} maxWidth={"md"} fullWidth>
        <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
          <Typography sx={{ fontSize: "1em" }}>
            <b>เลือกรายการเอกสาร SC :</b>
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent>
          <div
            style={{
              width: "100%",
              height: dataTable.length >= 5 ? "41vh" : "auto",
            }}
            className={classes.MdataGridDetail}
          >
            <DataGrid
              rows={dataTable}
              columns={columns}
              pageSize={pageSize}
              hideFooterSelectedRowCount={true}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[10, 20, 50, 100]}
              pagination
              disableColumnMenu
              autoHeight={dataTable.length < 5}
              scrollbarSize={10}
              rowHeight={54}
              components={{
                NoRowsOverlay: () => (
                  <Typography
                    position="relative"
                    textAlign="center"
                    top="112px"
                    color="#AEAEAE"
                  >
                    ไม่มีข้อมูล
                  </Typography>
                ),
              }}
            />
          </div>
        </DialogContent>
        <Grid item xs={12} sx={{ textAlign: "right" }} mr={3} mb={4}>
          <Button
            variant="contained"
            color="info"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={onHandleAddSelectedSC}
            disabled={
              !(
                dataTable &&
                dataTable.length > 0 &&
                dataTable.filter((it: any) => it.checked).length > 0
              )
            }
            className={classes.MbtnSearch}
          >
            เพิ่มรายการ
          </Button>
        </Grid>
      </Dialog>
    </div>
  );
};

export default ModalAddStockCount;
