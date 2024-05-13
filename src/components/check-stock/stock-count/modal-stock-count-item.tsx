import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@material-ui/core";
import { Checkbox, TextField, Typography } from "@mui/material";
import moment from "moment";
import { useStyles } from "../../../styles/makeTheme";
import {
  save,
  updateCheckEdit,
  updateErrorList,
} from "../../../store/slices/stock-count-slice";
import { handleNumberBeforeUse, stringNullOrEmpty } from "../../../utils/utils";
import {
  Action,
  StockActionStatus,
  STOCK_COUNTER_TYPE,
  TOStatus,
} from "../../../utils/enum/common-enum";
import { ACTIONS } from "../../../utils/enum/permission-enum";
import { StockCountDetail } from "../../../models/stock-count-model";
import { getUserInfo } from "../../../store/sessionStore";
import {
  getUserGroup,
  isGroupAuditParam,
  isGroupBranchParam,
} from "../../../utils/role-permission";

export interface DataGridProps {
  action: Action | Action.INSERT;
  userPermission?: any[];
  viewMode?: boolean;
}

const _ = require("lodash");

export const ModalStockCountItem = (props: DataGridProps) => {
  const { action, userPermission, viewMode } = props;

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const payloadStockCount = useAppSelector(
    (state) => state.stockCountSlice.createDraft,
  );
  const dataDetail = useAppSelector(
    (state) => state.stockCountSlice.dataDetail,
  );
  const errorList = useAppSelector((state) => state.stockCountSlice.errorList);
  const auditPlanDetail = useAppSelector(
    (state) => state.auditPlanDetailSlice.auditPlanDetail.data,
  );

  //permission
  const [managePermission, setManagePermission] = useState<boolean>(
    userPermission != null && userPermission.length > 0
      ? userPermission.includes(ACTIONS.STOCK_SC_MANAGE)
      : false,
  );
  const [dtTable, setDtTable] = React.useState<Array<StockCountDetail>>([]);
  const checkStocks = useAppSelector(
    (state) => state.stockBalanceCheckSlice.checkStock,
  );
  const userGroups = getUserInfo().groups ? getUserInfo().groups : [];
  const _group = getUserGroup(userGroups);

  useEffect(() => {
    if (Object.keys(payloadAddItem).length !== 0) {
      let rows = payloadAddItem.map((item: any, index: number) => {
        return {
          checked: item.canNotCount,
          id: `${item.barcode}-${index + 1}`,
          index: index + 1,
          barcode: item.barcode,
          barcodeName: item.barcodeName,
          unit: item.unitName,
          unitCode: item.unitCode || "",
          barFactor: item.baseUnit || 0,
          quantity:
            stringNullOrEmpty(item.qty) &&
            dataDetail.status == StockActionStatus.CONFIRM &&
            !item.canNotCount
              ? 0
              : stringNullOrEmpty(item.qty) &&
                  dataDetail.status == StockActionStatus.DRAFT
                ? null
                : item.qty,
          errorQty: "",
          skuCode: item.skuCode,
          skuName: item.skuName,
        };
      });
      setDtTable(rows);
    } else {
      setDtTable([]);
    }
  }, [payloadAddItem]);

  useEffect(() => {
    if (dtTable.length !== 0) {
      const products = dtTable.map((item) => {
        return {
          barcode: item.barcode,
          quantity: parseInt(String(item.quantity).replace(/,/g, "")),
          unitName: item.unit,
          productName: item.barcodeName,
          sku: item.skuCode,
          canNotCount: item.checked,
          skuName: item.skuName,
        };
      });
      dispatch(save({ ...payloadStockCount, products: products }));
    } else {
      dispatch(save({ ...payloadStockCount, products: [] }));
    }
  }, [dtTable]);

  const handleChangeQuantity = (
    event: any,
    index: number,
    errorIndex: number,
    barcode: string,
  ) => {
    let currentValue = handleNumberBeforeUse(event.target.value);
    setDtTable((preData: Array<StockCountDetail>) => {
      const data = [...preData];
      data[index - 1].quantity = currentValue;
      return data;
    });
    dispatch(
      updateErrorList(
        errorList.map((item: any, idx: number) => {
          return idx === errorIndex
            ? {
                ...item,
                errorQuantity: "",
              }
            : item;
        }),
      ),
    );
    dispatch(updateCheckEdit(true));
  };

  const onCheckCell = (event: any, index: number, skuCode: string) => {
    let listIndex: number[] = [];
    setDtTable((preData: Array<StockCountDetail>) => {
      const data = [...preData];
      let newList = data.map((item: any, index: number) => {
        if (item.skuCode == skuCode) {
          listIndex.push(index);
        }
        return {
          ...item,
          checked: item.skuCode == skuCode ? !item.checked : item.checked,
          quantity:
            item.skuCode == skuCode && !item.checked ? null : item.quantity,
        };
      });
      dispatch(
        updateErrorList(
          errorList.map((item: any, idx: number) => {
            return listIndex.includes(idx)
              ? {
                  ...item,
                  errorQuantity: "",
                }
              : item;
          }),
        ),
      );
      return newList;
    });
  };

  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "ไม่สามารถนับได้",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(params.value)}
          disabled={
            (!stringNullOrEmpty(dataDetail.status) &&
              dataDetail.status != TOStatus.DRAFT) ||
            !managePermission ||
            viewMode ||
            (isGroupAuditParam(_group) &&
              dataDetail.stockCounter == STOCK_COUNTER_TYPE.BRANCH &&
              !dataDetail.recounting) ||
            (isGroupBranchParam(_group) &&
              dataDetail.stockCounter == STOCK_COUNTER_TYPE.AUDIT &&
              !dataDetail.recounting) ||
            (isGroupAuditParam(_group) &&
              dataDetail.recountingBy == STOCK_COUNTER_TYPE.BRANCH &&
              dataDetail.recounting) ||
            (isGroupBranchParam(_group) &&
              dataDetail.recountingBy == STOCK_COUNTER_TYPE.AUDIT &&
              dataDetail.recounting) ||
            auditPlanDetail.status == StockActionStatus.END ||
            moment(auditPlanDetail.countingDate)
              .endOf("day")
              .isBefore(moment(new Date()))
          }
          onClick={(e) => onCheckCell(e, params.row.index, params.row.skuCode)}
        />
      ),
    },
    {
      field: "index",
      headerName: "ลำดับ",
      flex: 0.4,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "barcode",
      headerName: "บาร์โค้ด",
      flex: 0.8,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "barcodeName",
      headerName: "รายละเอียดสินค้า",
      flex: 1.4,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Typography variant="body2">{params.value}</Typography>
          <Typography color="textSecondary" sx={{ fontSize: 12 }}>
            {params.getValue(params.id, "skuCode") || ""}
          </Typography>
        </div>
      ),
    },
    {
      field: "quantity",
      headerName: "จำนวนนับ",
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barcode)
            : -1;
        const indexStock =
          checkStocks && checkStocks.length > 0
            ? checkStocks.findIndex(
                (item: any) => item.barcode === params.row.barcode,
              )
            : -1;
        const condition =
          (index != -1 && errorList[index].errorQuantity) || indexStock !== -1;
        return (
          <div className={classes.MLabelTooltipWrapper}>
            <TextField
              error={condition}
              type="number"
              inputProps={{ maxLength: 13 }}
              className={classes.MtextFieldNumber}
              value={stringNullOrEmpty(params.value) ? "" : params.value}
              onChange={(e) => {
                handleChangeQuantity(
                  e,
                  params.row.index,
                  index,
                  params.row.barcode,
                );
              }}
              disabled={
                (!stringNullOrEmpty(dataDetail.status) &&
                  dataDetail.status != TOStatus.DRAFT) ||
                !managePermission ||
                viewMode ||
                (isGroupAuditParam(_group) &&
                  dataDetail.stockCounter == STOCK_COUNTER_TYPE.BRANCH &&
                  !dataDetail.recounting) ||
                (isGroupBranchParam(_group) &&
                  dataDetail.stockCounter == STOCK_COUNTER_TYPE.AUDIT &&
                  !dataDetail.recounting) ||
                (isGroupAuditParam(_group) &&
                  dataDetail.recountingBy == STOCK_COUNTER_TYPE.BRANCH &&
                  dataDetail.recounting) ||
                (isGroupBranchParam(_group) &&
                  dataDetail.recountingBy == STOCK_COUNTER_TYPE.AUDIT &&
                  dataDetail.recounting) ||
                !!params.getValue(params.id, "checked") ||
                auditPlanDetail.status == StockActionStatus.END ||
                moment(auditPlanDetail.countingDate)
                  .endOf("day")
                  .isBefore(moment(new Date()))
              }
            />
            {/* {condition && <div className="title">{errorList[index]?.errorQuantity}</div>} */}
          </div>
        );
      },
    },
    {
      field: "unit",
      headerName: "หน่วย",
      flex: 0.5,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
    },
  ];

  const [pageSize, setPageSize] = React.useState<number>(10);

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: dtTable.length >= 10 ? "76vh" : "auto",
          marginBottom: "20px",
        }}
        className={classes.MdataGridDetail}
      >
        <DataGrid
          rows={dtTable}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          pagination
          disableColumnMenu
          disableSelectionOnClick
          autoHeight={dtTable.length < 10}
          scrollbarSize={10}
          rowHeight={60}
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
    </div>
  );
};

export default ModalStockCountItem;
