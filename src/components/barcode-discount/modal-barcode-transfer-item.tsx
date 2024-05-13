import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useStyles } from "../../styles/makeTheme";
import { DiscountDetail } from "../../models/barcode-discount";
import DatePickerComponent from "../commons/ui/date-picker-v2";
import {
  saveBarcodeDiscount,
  updateApproveReject,
  updateCheckEdit,
  updateCheckStock,
  updateDataDetail,
  updateErrorList,
} from "../../store/slices/barcode-discount-slice";
import moment from "moment";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import {
  handleNumberBeforeUse,
  numberWithCommas,
  objectNullOrEmpty,
  stringNullOrEmpty,
} from "../../utils/utils";
import { Action, BDStatus } from "../../utils/enum/common-enum";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { ACTIONS } from "../../utils/enum/permission-enum";
import NumberFormat from "react-number-format";
import TextBoxComment from "../commons/ui/textbox-comment";
import HtmlTooltip from "../commons/ui/html-tooltip";
import {
  updateBarcodeDiscountPrintState,
  updatePrintInDetail,
} from "../../store/slices/barcode-discount-print-slice";
import { env } from "../../adapters/environmentConfigs";
import ModelConfirmDeleteProduct from "../commons/ui/modal-confirm-delete-product";
import { getPercentages } from "../../services/common";

export interface DataGridProps {
  action: Action | Action.INSERT;
  userPermission?: any[];
  id: string;
  typeDiscount: string;
  // onClose?: () => void;
}

const _ = require("lodash");

export const ModalTransferItem = (props: DataGridProps) => {
  const { typeDiscount, action, userPermission } = props;

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const payloadBarcodeDiscount = useAppSelector(
    (state) => state.barcodeDiscount.createDraft,
  );
  const dataDetail = useAppSelector(
    (state) => state.barcodeDiscount.dataDetail,
  );
  const approveReject = useAppSelector(
    (state) => state.barcodeDiscount.approveReject,
  );
  const errorList = useAppSelector((state) => state.barcodeDiscount.errorList);

  const [dtTable, setDtTable] = React.useState<Array<DiscountDetail>>([]);
  const [percentages, setPercentages] = React.useState([]);
  const [sumOfDiscount, updateSumOfDiscount] = React.useState<number>(0);
  const [sumOfApprovedDiscount, updateSumOfApprovedDiscount] =
    React.useState<number>(0);
  const [openPopupModal, setOpenPopupModal] = React.useState<boolean>(false);
  const checkStocks = useAppSelector(
    (state) => state.stockBalanceCheckSlice.checkStock,
  );
  //permission
  const [approvePermission, setApprovePermission] = useState<boolean>(
    userPermission != null && userPermission.length > 0
      ? userPermission.includes(ACTIONS.CAMPAIGN_BD_APPROVE)
      : false,
  );

  useEffect(() => {
    if (Object.keys(payloadAddItem).length !== 0) {
      let rows = payloadAddItem.map((item: any, index: number) => {
        let sameItem = dtTable.find((el) => el.barCode === item.barcode);
        const price = parseFloat(item.unitPrice);
        let discount = !!sameItem ? sameItem.discount : 0;
        let expiryDate = !!sameItem ? sameItem.expiryDate : null;
        let numberOfDiscounted = item.qty ? item.qty : 0;
        let remark = !!sameItem ? sameItem.remark : "";
        if (Action.UPDATE === action && objectNullOrEmpty(sameItem)) {
          discount = stringNullOrEmpty(item.discount) ? 0 : item.discount;
          expiryDate = stringNullOrEmpty(item.expiryDate)
            ? null
            : item.expiryDate;
          numberOfDiscounted = stringNullOrEmpty(item.qty) ? null : item.qty;
          remark = stringNullOrEmpty(item.remark) ? "" : item.remark;
        }
        const cashDiscount =
          typeDiscount === "percent"
            ? Math.floor(
                (parseFloat(String(discount).replace(/,/g, "")) * price) / 100,
              )
            : parseFloat(String(discount).replace(/,/g, ""));
        const priceAfterDiscount = price - (cashDiscount || 0);
        let numberOfApproved = !!sameItem
          ? sameItem.numberOfApproved
          : item.numberOfApproved
            ? item.numberOfApproved
            : 0;
        let approvedDiscount = !!sameItem
          ? sameItem.approvedDiscount
          : numberOfApproved * cashDiscount;

        return {
          id: `${item.barcode}-${index + 1}`,
          index: index + 1,
          barCode: item.barcode,
          barcodeName: item.barcodeName,
          unit: item.unitName,
          unitCode: item.unitCode || "",
          barFactor: item.baseUnit || 0,
          price: price,
          discount: discount,
          errorDiscount: "",
          qty: numberOfDiscounted,
          errorQty: "",
          expiryDate: expiryDate,
          errorExpiryDate: "",
          cashDiscount: cashDiscount.toFixed(2) || 0,
          priceAfterDiscount: priceAfterDiscount.toFixed(2),
          numberOfDiscounted: numberOfDiscounted,
          numberOfApproved: numberOfApproved,
          errorNumberOfApproved: "",
          approvedDiscount: approvedDiscount,
          skuCode: item.skuCode,
          remark: remark,
        };
      });
      setDtTable(rows);
      if (
        (Action.UPDATE === action &&
          Number(BDStatus.APPROVED) == dataDetail.status) ||
        Number(BDStatus.BARCODE_PRINTED) == dataDetail.status
      ) {
        if (rows && rows.length > 0) {
          let rowData = _.cloneDeep(rows);
          let productPrintFilter = rowData.filter(
            (itPro: any) =>
              !stringNullOrEmpty(itPro.expiryDate) &&
              moment(itPro.expiryDate).isSameOrAfter(
                moment(new Date()),
                "day",
              ) &&
              itPro.numberOfApproved &&
              itPro.numberOfApproved > 0,
          );
          dispatch(updateBarcodeDiscountPrintState(productPrintFilter));
          dispatch(updatePrintInDetail(true));
        }
      }
    } else {
      setDtTable([]);
    }
  }, [payloadAddItem, typeDiscount]);

  useEffect(() => {
    if (dtTable.length !== 0) {
      updateSumOfApprovedDiscount(
        dtTable.reduce((acc, val) => acc + Number(val.approvedDiscount), 0),
      );
      updateSumOfDiscount(
        dtTable.reduce(
          (acc, val) => acc + val.cashDiscount * Number(val.numberOfDiscounted),
          0,
        ),
      );
      const products = dtTable.map((item) => {
        return {
          price: item.price,
          barcode: item.barCode,
          requestedDiscount: parseFloat(
            String(item.discount).replace(/,/g, ""),
          ),
          numberOfDiscounted: parseInt(
            String(item.numberOfDiscounted).replace(/,/g, ""),
          ),
          numberOfApproved: parseInt(
            String(item.numberOfApproved).replace(/,/g, ""),
          ),
          expiredDate: item.expiryDate,
          unitFactor: item.unit,
          unitCode: item.unitCode,
          barFactor: item.barFactor,
          productName: item.barcodeName,
          skuCode: item.skuCode,
          remark: item.remark,
        };
      });
      dispatch(
        saveBarcodeDiscount({ ...payloadBarcodeDiscount, products: products }),
      );
      dispatch(
        updateDataDetail({
          ...dataDetail,
          sumOfApprovedDiscountDefault: sumOfApprovedDiscount,
          sumOfDiscountDefault: sumOfDiscount,
        }),
      );
    } else {
      updateSumOfApprovedDiscount(0);
      updateSumOfDiscount(0);
      dispatch(
        saveBarcodeDiscount({ ...payloadBarcodeDiscount, products: [] }),
      );
    }
  }, [dtTable]);

  useEffect(() => {
    if (typeDiscount === "percent") {
      handleGetPercentages();
    }
  }, [typeDiscount]);

  const handleGetPercentages = async () => {
    let res: any = await getPercentages();
    if (res && res.data && res.data.length > 0) {
      setPercentages(res.data);
    }
  };

  const handleClosePopup = () => {
    setOpenPopupModal(false);
  };

  const handleChangeDiscount = (
    event: any,
    index: number,
    errorIndex: number,
  ) => {
    setDtTable((preData: Array<DiscountDetail>) => {
      const data = [...preData];
      const value = event.target.value;
      data[index - 1].discount = value || 0;

      if (typeDiscount === "percent") {
        const number =
          data[index - 1].price * (data[index - 1].discount / 100) || 0;

        data[index - 1].cashDiscount = Math.trunc(number).toFixed(2) || 0;
      } else {
        data[index - 1].cashDiscount =
          parseFloat(data[index - 1].discount || 0).toFixed(2) || 0;
      }
      data[index - 1].priceAfterDiscount = (
        data[index - 1].price - data[index - 1].cashDiscount
      ).toFixed(2);
      return data;
    });
    dispatch(
      updateErrorList(
        errorList.map((item: any, idx: number) => {
          return idx === errorIndex
            ? {
                ...item,
                errorDiscount: "",
              }
            : item;
        }),
      ),
    );
    dispatch(updateCheckEdit(true));
  };

  const handleChangeNumberOfApprove = (
    event: any,
    index: number,
    errorIndex: number,
    barcode: string,
  ) => {
    let currentValue = handleNumberBeforeUse(event.target.value);
    setDtTable((preData: Array<DiscountDetail>) => {
      const data = [...preData];
      data[index - 1].numberOfApproved = currentValue;
      data[index - 1].approvedDiscount =
        data[index - 1].numberOfApproved * data[index - 1].cashDiscount;
      return data;
    });
    dispatch(
      updateErrorList(
        errorList.map((item: any, idx: number) => {
          return idx === errorIndex
            ? {
                ...item,
                errorNumberOfApproved: "",
              }
            : item;
        }),
      ),
    );
    dispatch(updateCheckEdit(true));
    // dispatch(updateCheckStock(checkStocks.filter((el: any) => el.barcode !== barcode)));
  };

  const handleChangeNumberOfDiscount = (
    event: any,
    index: number,
    errorIndex: number,
    barcode: string,
  ) => {
    let currentValue = handleNumberBeforeUse(event.target.value);
    let currentData: any;
    setDtTable((preData: Array<DiscountDetail>) => {
      const data = [...preData];
      currentData = data[index - 1];
      data[index - 1].numberOfDiscounted = currentValue;
      return data;
    });
    if (Object.keys(payloadAddItem).length !== 0) {
      let updateList = _.cloneDeep(payloadAddItem);
      updateList.map((item: any) => {
        if (item.barcode === currentData.barCode) {
          item.qty = currentValue;
        }
      });
      dispatch(updateAddItemsState(updateList));
    }
    dispatch(
      updateErrorList(
        errorList.map((item: any, idx: number) => {
          return idx === errorIndex
            ? {
                ...item,
                errorNumberOfDiscounted: "",
              }
            : item;
        }),
      ),
    );
    dispatch(updateCheckEdit(true));
    dispatch(
      updateCheckStock(checkStocks.filter((el: any) => el.barcode !== barcode)),
    );
  };

  const handleChangeExpiry = (e: any, index: number, errorIndex: number) => {
    setDtTable((preData: Array<DiscountDetail>) => {
      const data = [...preData];
      data[index - 1].expiryDate = stringNullOrEmpty(e)
        ? null
        : moment(e).toISOString();
      return data;
    });
    dispatch(
      updateErrorList(
        errorList.map((item: any, idx: number) => {
          return idx === errorIndex
            ? {
                ...item,
                errorExpiryDate: "",
              }
            : item;
        }),
      ),
    );
    dispatch(updateCheckEdit(true));
  };

  const handleChangeNumber = (e: any, index: number) => {
    setDtTable((preData: Array<DiscountDetail>) => {
      const data = [...preData];
      data[index - 1].discount = numberWithCommas(
        parseFloat(e.target.value).toFixed(2),
      );

      return data;
    });
  };
  const handleChangeRemark = (
    event: any,
    index: number,
    errorIndex: number,
  ) => {
    setDtTable((preData: Array<DiscountDetail>) => {
      const data = [...preData];
      data[index - 1].remark = stringNullOrEmpty(event.target.value)
        ? ""
        : event.target.value;
      return data;
    });
    dispatch(
      updateErrorList(
        errorList.map((item: any, idx: number) => {
          return idx === errorIndex
            ? {
                ...item,
                errorRemark: "",
              }
            : item;
        }),
      ),
    );
    dispatch(updateCheckEdit(true));
  };

  const handleChangeNote = (e: any) => {
    dispatch(
      saveBarcodeDiscount({ ...payloadBarcodeDiscount, requesterNote: e }),
    );
    dispatch(updateCheckEdit(true));
  };

  const handleChangeReason = (e: any) => {
    dispatch(updateApproveReject({ ...approveReject, approvalNote: e }));
    dispatch(updateCheckEdit(true));
  };

  const addTwoDecimalPlaces = (value: any) => {
    if (stringNullOrEmpty(value)) return "0.00";
    else return value.toFixed(2);
  };

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      width: 70,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "barCode",
      headerName: "บาร์โค้ด",
      minWidth: 125,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "barcodeName",
      headerName: "รายละเอียดสินค้า",
      minWidth: 260,
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
      field: "unit",
      headerName: "หน่วย",
      width: 70,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
    },
    {
      field: "price",
      headerName: "ราคาปกติ",
      minWidth: 70,
      headerAlign: "center",
      disableColumnMenu: false,
      sortable: false,
      renderCell: (params) => (
        <HtmlTooltip
          title={
            <React.Fragment>
              {numberWithCommas(addTwoDecimalPlaces(params.value))}
            </React.Fragment>
          }
        >
          <Typography
            fontSize="15px"
            textAlign="end"
            width="100%"
            className={classes.MTextEllipsis}
          >
            {numberWithCommas(addTwoDecimalPlaces(params.value))}
          </Typography>
        </HtmlTooltip>
      ),
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"ราคาปกติ"}</b>
            </Typography>
            {env.currency && (
              <Typography variant="body2" noWrap textAlign={"center"}>
                <b>{`(${env.currency})`}</b>
              </Typography>
            )}
          </div>
        );
      },
    },
    {
      field: "discount",
      headerName: typeDiscount === "percent" ? "ยอดลด * (%)" : "ยอดลด* (บาท)",
      minWidth: 140,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderHeader: (params) => {
        return typeDiscount === "percent" ? (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"ยอดลด * (%)"}</b>
            </Typography>
          </div>
        ) : (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"ยอดลด*"}</b>
            </Typography>
            {env.currency && (
              <Typography variant="body2" noWrap textAlign={"center"}>
                <b>{`(${env.currency})`}</b>
              </Typography>
            )}
          </div>
        );
      },
      renderCell: (params: GridRenderCellParams) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barCode)
            : -1;
        const condition = index !== -1 && !!errorList[index].errorDiscount;
        return typeDiscount === "percent" ? (
          <div
            className={classes.MLabelTooltipWrapper}
            style={{ width: "100%" }}
          >
            <FormControl
              fullWidth
              className={classes.Mselect}
              error={condition}
            >
              <Select
                id="discountPercent"
                name="discountPercent"
                value={params.value}
                onChange={(e: any) => {
                  handleChangeDiscount(e, params.row.index, index);
                }}
                disabled={dataDetail.status > 1}
                className={classes.MSelected}
                inputProps={{ "aria-label": "Without label" }}
              >
                {percentages &&
                  percentages.length > 0 &&
                  percentages.map((item: any) => {
                    return (
                      <MenuItem key={item.value} value={item.value}>
                        <span style={{ width: "100%", textAlign: "right" }}>
                          {item.code}
                        </span>
                      </MenuItem>
                    );
                  })}
              </Select>
              {condition && (
                <div className="title">{errorList[index].errorDiscount}</div>
              )}
            </FormControl>
          </div>
        ) : (
          <div className={classes.MLabelTooltipWrapper}>
            <NumberFormat
              customInput={TextField}
              variant="outlined"
              className={
                condition
                  ? classes.MtextFieldNumberError
                  : classes.MtextFieldNumber
              }
              style={{ borderColor: "red" }}
              thousandSeparator={true}
              decimalScale={2}
              onChange={(e: any) => {
                handleChangeDiscount(e, params.row.index, index);
              }}
              fixedDecimalScale
              value={String(params.value)}
              disabled={dataDetail.status > 1}
              autoComplete="off"
            />
            {condition && (
              <div className="title">{errorList[index].errorDiscount}</div>
            )}
          </div>
        );
      },
    },
    {
      field: "cashDiscount",
      headerName: "ส่วนลด",
      minWidth: 70,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => (
        <HtmlTooltip
          title={
            <React.Fragment>{numberWithCommas(params.value)}</React.Fragment>
          }
        >
          <Typography
            color="#F54949"
            fontSize="15px"
            textAlign="end"
            width="100%"
            fontWeight="bold"
            className={classes.MTextEllipsis}
          >
            {numberWithCommas(params.value)}
          </Typography>
        </HtmlTooltip>
      ),
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"ส่วนลด"}</b>
            </Typography>
            {env.currency && (
              <Typography variant="body2" noWrap textAlign={"center"}>
                <b>{`(${env.currency})`}</b>
              </Typography>
            )}
          </div>
        );
      },
    },
    {
      field: "priceAfterDiscount",
      headerName: "ราคาหลังลด",
      minWidth: 110,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => (
        <HtmlTooltip
          title={
            <React.Fragment>{numberWithCommas(params.value)}</React.Fragment>
          }
        >
          <Typography
            color="#36C690"
            fontSize="15px"
            textAlign="end"
            width="100%"
            fontWeight="bold"
            className={classes.MTextEllipsis}
          >
            {numberWithCommas(params.value)}
          </Typography>
        </HtmlTooltip>
      ),
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"ราคาหลังลด"}</b>
            </Typography>
            {env.currency && (
              <Typography variant="body2" noWrap textAlign={"center"}>
                <b>{`(${env.currency})`}</b>
              </Typography>
            )}
          </div>
        );
      },
    },
    {
      field: "numberOfDiscounted",
      headerName: "จำนวนที่ขอลด *",
      minWidth: 130,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"จำนวน"}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>{"ที่ขอลด*"}</b>
            </Typography>
          </div>
        );
      },
      renderCell: (params: GridRenderCellParams) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barCode)
            : -1;
        const indexStock =
          checkStocks && checkStocks.length > 0
            ? checkStocks.findIndex(
                (item: any) => item.barcode === params.row.barCode,
              )
            : -1;
        const condition =
          (index != -1 && errorList[index].errorNumberOfDiscounted) ||
          indexStock !== -1;
        return (
          <div className={classes.MLabelTooltipWrapper}>
            <TextField
              error={condition}
              type="number"
              inputProps={{ maxLength: 13, min: 0 }}
              value={stringNullOrEmpty(params.value) ? "" : params.value}
              className={classes.MtextFieldNumber}
              onChange={(e) => {
                handleChangeNumberOfDiscount(
                  e,
                  params.row.index,
                  index,
                  params.row.barCode,
                );
              }}
              disabled={dataDetail.status > 1}
            />
            {condition && (
              <div className="title">
                {errorList[index]?.errorNumberOfDiscounted}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: "numberOfApproved",
      headerName: "จำนวนที่อนุมัติ",
      minWidth: 130,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barCode)
            : -1;
        const indexStock =
          checkStocks && checkStocks.length > 0
            ? checkStocks.findIndex(
                (item: any) => item.barcode === params.row.barCode,
              )
            : -1;
        const condition =
          (index != -1 && errorList[index].errorNumberOfApproved) ||
          indexStock !== -1;
        return (
          <div className={classes.MLabelTooltipWrapper}>
            <TextField
              error={condition}
              type="number"
              inputProps={{ maxLength: 13 }}
              className={classes.MtextFieldNumber}
              value={stringNullOrEmpty(params.value) ? "" : params.value}
              disabled={
                !approvePermission ||
                dataDetail.status > Number(BDStatus.WAIT_FOR_APPROVAL) ||
                (approvePermission &&
                  dataDetail.status < Number(BDStatus.WAIT_FOR_APPROVAL))
              }
              onChange={(e) => {
                handleChangeNumberOfApprove(
                  e,
                  params.row.index,
                  index,
                  params.row.barCode,
                );
              }}
            />
            {condition && (
              <div className="title">
                {errorList[index]?.errorNumberOfApproved}
              </div>
            )}
          </div>
        );
      },
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"จำนวน"}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>{"ที่อนุมัติ *"}</b>
            </Typography>
          </div>
        );
      },
    },
    {
      field: "approvedDiscount",
      headerName: "รวมส่วนลดที่อนุมัติ",
      minWidth: 120,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => (
        <HtmlTooltip
          title={
            <React.Fragment>
              {numberWithCommas(addTwoDecimalPlaces(params.value))}
            </React.Fragment>
          }
        >
          <Typography
            width="100%"
            textAlign="right"
            className={classes.MTextEllipsis}
          >
            {numberWithCommas(addTwoDecimalPlaces(params.value))}
          </Typography>
        </HtmlTooltip>
      ),
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{"รวมส่วนลด"}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>{"ที่อนุมัติ"}</b>
            </Typography>
          </div>
        );
      },
    },
    {
      field: "expiryDate",
      headerName: "วันที่หมดอายุ *",
      minWidth: 130,
      headerAlign: "left",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barCode)
            : -1;
        const condition = index != -1 && errorList[index].errorExpiryDate;
        return (
          <div className={classes.MLabelTooltipWrapper}>
            <DatePickerComponent
              error={condition}
              onClickDate={(e: any) => {
                handleChangeExpiry(e, params.row.index, index);
              }}
              value={params.value}
              placeHolder="วว/ดด/ปปปป"
              disabled={
                (dataDetail.status > 1 && !approvePermission) ||
                dataDetail.status > Number(BDStatus.WAIT_FOR_APPROVAL)
              }
            />
            {condition && (
              <div className="title" title={errorList[index].errorExpiryDate}>
                {errorList[index].errorExpiryDate}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: "remark",
      headerName: "หมายเหตุ",
      minWidth: 130,
      headerAlign: "center",
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barCode)
            : -1;
        const condition = index != -1 && errorList[index].errorRemark;
        return (
          <div className={classes.MLabelTooltipWrapper}>
            <HtmlTooltip
              disableHoverListener={stringNullOrEmpty(params.value)}
              disableTouchListener={stringNullOrEmpty(params.value)}
              disableFocusListener={stringNullOrEmpty(params.value)}
              disableInteractive={stringNullOrEmpty(params.value)}
              title={<React.Fragment>{params.value}</React.Fragment>}
            >
              <TextField
                error={condition}
                type="text"
                sx={{ width: "100%" }}
                inputProps={{ maxLength: 250 }}
                className={classes.MtextField}
                value={stringNullOrEmpty(params.value) ? "" : params.value}
                disabled={
                  (dataDetail.status > 1 && !approvePermission) ||
                  (approvePermission && dataDetail.status != 2)
                }
                onChange={(e) => {
                  handleChangeRemark(e, params.row.index, index);
                }}
              />
            </HtmlTooltip>
            {condition && (
              <div className="title">{errorList[index]?.errorRemark}</div>
            )}
          </div>
        );
      },
    },
    {
      field: "delete",
      headerName: " ",
      flex: 0.2,
      align: "center",
      sortable: false,
      hide: Number(BDStatus.DRAFT) < dataDetail.status,
      renderCell: (params: GridRenderCellParams) => {
        const [openModalDelete, setOpenModalDelete] =
          React.useState<boolean>(false);

        const handleOpenModalDelete = () => {
          setOpenModalDelete(true);
        };

        const handleCloseModalDelete = () => {
          setOpenModalDelete(false);
        };

        const handleDeleteItem = () => {
          dispatch(
            updateAddItemsState(
              payloadAddItem.filter(
                (r: any) => r.barcode !== params.row.barCode,
              ),
            ),
          );
          dispatch(updateCheckEdit(true));
          setOpenModalDelete(false);
          setOpenPopupModal(true);
        };

        return (
          <>
            <Button
              onClick={handleOpenModalDelete}
              disabled={dataDetail.status > 1}
              sx={{ opacity: dataDetail.status > 1 ? "0.5" : "1" }}
            >
              <DeleteForever fontSize="medium" sx={{ color: "#F54949" }} />
            </Button>
            <ModelConfirmDeleteProduct
              open={openModalDelete}
              onConfirm={handleDeleteItem}
              onClose={handleCloseModalDelete}
              productInfo={{
                barcodeName: params.row.barcodeName,
                skuCode: params.row.skuCode,
                barcode: params.row.barCode,
              }}
            />
          </>
        );
      },
    },
  ];
  const [pageSize, setPageSize] = React.useState<number>(10);
  return (
    <div>
      <Box
        sx={{
          "& .row-highlight": {
            bgcolor: "#FFFFB9",
            "&:hover": {
              bgcolor: "#FFFFB9",
            },
          },
        }}
      >
        <div
          style={{
            width: "100%",
            height: dtTable.length >= 8 ? "70vh" : "auto",
          }}
          className={classes.MdataGridDetail}
        >
          <DataGrid
            rows={dtTable}
            columns={columns}
            getRowClassName={(params) => {
              if (
                params.row.numberOfDiscounted !== params.row.numberOfApproved &&
                dataDetail.status >= Number(BDStatus.APPROVED)
              ) {
                return `row-highlight`;
              }
              return "";
            }}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            pagination
            disableColumnMenu
            autoHeight={dtTable.length < 8}
            scrollbarSize={10}
            rowHeight={85}
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
      </Box>
      <Box display="flex" justifyContent="space-between" paddingTop="30px">
        <Grid container spacing={2} mb={2}>
          <Grid item xs={3}>
            <TextBoxComment
              fieldName="หมายเหตุจากสาขา :"
              defaultValue={payloadBarcodeDiscount.requesterNote}
              maxLength={100}
              onChangeComment={handleChangeNote}
              isDisable={dataDetail.status > 1}
              rowDisplay={4}
            />
          </Grid>
          <Grid item xs={3}>
            <Box
              style={{ display: dataDetail.status > 1 ? undefined : "none" }}
            >
              <TextBoxComment
                fieldName="หมายเหตุจากผู้อนุมัติ :"
                defaultValue={approveReject ? approveReject.approvalNote : ""}
                maxLength={100}
                onChangeComment={handleChangeReason}
                isDisable={dataDetail.status > 2 || !approvePermission}
                rowDisplay={4}
              />
            </Box>
          </Grid>
          <Grid item xs={6} display={"flex"} justifyContent={"flex-end"}>
            <Grid item sx={{ minWidth: "380px" }}>
              <Box
                display="flex"
                justifyContent="space-between"
                marginTop="25px"
              >
                <Typography
                  fontSize="14px"
                  lineHeight="21px"
                  height="24px"
                  marginTop="6px"
                >
                  ขอส่วนลดทั้งหมด
                  {env.currency && ` (${env.currency})`}
                </Typography>
                <TextField
                  disabled
                  type="text"
                  sx={{ bgcolor: "#EAEBEB" }}
                  className={classes.MtextFieldNumberNoneArrow}
                  value={numberWithCommas(addTwoDecimalPlaces(sumOfDiscount))}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                marginTop="10px"
              >
                <Typography fontSize="14px" fontWeight="700" marginTop="6px">
                  ส่วนลดที่อนุมัติทั้งหมด
                  {env.currency && ` (${env.currency})`}
                </Typography>
                <TextField
                  type="text"
                  sx={{ bgcolor: "#E7FFE9", pointerEvents: "none" }}
                  inputProps={{
                    style: { fontWeight: "bolder", color: "#263238" },
                  }}
                  className={classes.MtextFieldNumberNoneArrow}
                  value={numberWithCommas(
                    addTwoDecimalPlaces(sumOfApprovedDiscount),
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <SnackbarStatus
        open={openPopupModal}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={"คุณได้ลบข้อมูลเรียบร้อยแล้ว"}
      />
    </div>
  );
};

export default ModalTransferItem;
