import React, { ReactElement, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { Box, InputLabel, TextField, Typography } from "@mui/material";
import { useStyles } from "../../styles/makeTheme";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { Action, DateFormat } from "../../utils/enum/common-enum";
import moment from "moment";
import {
  getEncodeBarcode,
  numberWithCommas,
  stringNullOrEmpty,
} from "../../utils/utils";
import AlertError from "../commons/ui/alert-error";
import {
  printBarcodeDiscount,
  saveLogPrintBarcodeDiscountHistory,
} from "../../services/barcode-discount";
import { BootstrapDialogTitle } from "../commons/ui/dialog-title";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const _ = require("lodash");

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  values: {
    action: Action;
    dialogTitle: string;
    printNormal: boolean;
    printInDetail: boolean;
    ids: any[];
    lstProductNotPrinted: any[];
    lstProductPrintAgain: any[];
    lstProductPrint: any[];
  };
}

export default function ModalConfirmPrintedBarcode({
  open,
  onClose,
  onConfirm,
  values,
}: Props): ReactElement {
  const classes = useStyles();
  const [printAgainRows, setPrintAgainRows] = useState<any>([]);
  const [reasonForReprint, setReasonForReprint] = useState("1");
  const [errorReasonForReprint, setErrorReasonForReprint] = useState("");
  const [errorList, setErrorList] = useState<any>([]);
  const [textError, setTextError] = React.useState("");
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);

  const handleCloseModalError = () => {
    setOpenModalError(false);
  };

  const validate = () => {
    let isValid = true;
    const data = _.cloneDeep(printAgainRows);
    if (data.length > 0) {
      if (stringNullOrEmpty(reasonForReprint) || "1" == reasonForReprint) {
        isValid = false;
        setErrorReasonForReprint("กรุณาระบุรายละเอียด");
      } else {
        let dt: any = [];
        for (let preData of data) {
          const item = {
            id: preData.barcode,
            errorNumberOfPrinting: "",
          };
          if (
            !stringNullOrEmpty(preData.numberOfPrinting) &&
            preData.numberOfPrinting > preData.numberOfApproved
          ) {
            isValid = false;
            item.errorNumberOfPrinting = "จำนวนที่พิมพ์เกินจำนวนที่อนุมัติ";
          }
          if (!isValid) {
            dt.push(item);
          }
        }
        setErrorList(dt);
        let lstPrintZero = data.filter((it: any) => it.numberOfPrinting === 0);
        if (
          lstPrintZero &&
          lstPrintZero.length > 0 &&
          lstPrintZero.length === data.length
        ) {
          isValid = false;
          setTextError("กรุณาใส่จำนวนส่วนลดที่ต้องการจะพิมพ์");
          setOpenModalError(true);
        } else if (dt.length > 0) {
          isValid = false;
          setTextError("จำนวนที่พิมพ์เกินจำนวนที่อนุมัติ");
          setOpenModalError(true);
        }
      }
    }
    return isValid;
  };

  const handleConfirm = async () => {
    if (values.lstProductPrintAgain && values.lstProductPrintAgain.length > 0) {
      if (validate()) {
        onConfirmModalPrint(true);
      }
    } else {
      onConfirmModalPrint(false);
    }
  };

  const onConfirmModalPrint = async (printAgain: boolean) => {
    setTextError("เกิดข้อผิดพลาดระหว่างการดำเนินการ");
    try {
      if (!values.ids?.length) return;

      const rs = await printBarcodeDiscount({
        template_code: "BD",
        bd_barcodes: (
          (printAgain ? printAgainRows : values?.lstProductPrint) || []
        )
          .filter((print: any) =>
            printAgain
              ? print.numberOfPrinting > 0
              : print.numberOfApproved > 0,
          )
          .map((item: any) => ({
            quantity: printAgain
              ? item.numberOfPrinting
              : item.numberOfApproved,
            discounted_barcode: getEncodeBarcode({
              barcode: item.barcode,
              price: item.price,
            }),
            product_name: item.productName,
            unit_factor: item.unit,
            price_then: stringNullOrEmpty(item.price)
              ? "0"
              : numberWithCommas(Number(item.price).toFixed(2)),
            price_now: stringNullOrEmpty(item.priceAfterDiscount)
              ? "0"
              : numberWithCommas(Number(item.priceAfterDiscount).toFixed(2)),
            currency: item.currency || "บาท",
          })),
      });
      if (rs.code === 20000) {
        let payload = printAgain
          ? [
              {
                id: values.ids?.length > 0 ? values.ids[0] : "",
                printReason: reasonForReprint,
                listOfProduct: printAgainRows
                  .filter((item: any) => item.numberOfPrinting > 0)
                  .map((item: any) => ({
                    productBarcode: item.barcode,
                    numberOfPrinting: item.numberOfPrinting,
                  })),
              },
            ]
          : (values.ids || []).map((id) => ({ id }));

        await saveLogPrintBarcodeDiscountHistory(payload);
        onConfirm();
        onClose();
      } else {
        setOpenModalError(true);
      }
    } catch (error) {
      setTextError("ไม่สามารถติดต่อเครื่องพิมพ์");
      setOpenModalError(true);
    }
  };

  useEffect(() => {
    if (values.lstProductPrintAgain && values.lstProductPrintAgain.length > 0) {
      let rows = values.lstProductPrintAgain.map((item: any, index: number) => {
        return {
          ...item,
          id: index,
          index: index + 1,
          barcodeName: item.productName,
          expiredDate: moment(item.expiredDate).format(DateFormat.DATE_FORMAT),
          numberOfPrinting: item.numberOfPrinting || 0,
          errorNumberOfPrinting: "",
        };
      });
      setPrintAgainRows(rows);
    } else {
      setPrintAgainRows([]);
    }
  }, [values.lstProductPrintAgain]);

  let notPrintRows: any = [];
  if (values.lstProductNotPrinted && values.lstProductNotPrinted.length > 0) {
    notPrintRows = values.lstProductNotPrinted.map(
      (item: any, index: number) => {
        return {
          ...item,
          id: index,
          index: index + 1,
          barcodeName: item.productName,
          expiredDate: moment(item.expiredDate).format(DateFormat.DATE_FORMAT),
        };
      },
    );
  }

  const notPrintColumns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      disableColumnMenu: false,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "documentNumber",
      headerName: "เลขที่เอกสาร BD",
      headerAlign: "center",
      flex: 1.3,
      sortable: false,
      hide: values.printInDetail,
    },
    {
      field: "barcode",
      headerName: "บาร์โค้ด",
      headerAlign: "center",
      flex: 1,
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "barcodeName",
      headerName: "รายละเอียดสินค้า",
      headerAlign: "center",
      flex: 1.8,
      sortable: false,
      renderCell: (params) => {
        return (
          <div>
            <Typography variant="body2">{params.value}</Typography>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.getValue(params.id, "skuCode") || ""}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "expiredDate",
      headerName: "วันที่หมดอายุ",
      headerAlign: "center",
      align: "center",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        return (
          <Typography
            variant="body2"
            sx={{
              color: "#F54949",
              background: "#EAEBEB",
              border: "1px solid #CBD4DB",
              boxSizing: "border-box",
              borderRadius: "5px",
              padding: "3px 2px 2px 20px",
            }}
          >
            {params.value}
          </Typography>
        );
      },
    },
  ];

  const printAgainColumns: GridColDef[] = [
    {
      field: "index",
      headerName: "ลำดับ",
      disableColumnMenu: false,
      flex: 0.5,
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
      headerAlign: "center",
      flex: 1,
      disableColumnMenu: false,
      sortable: false,
    },
    {
      field: "barcodeName",
      headerName: "รายละเอียดสินค้า",
      headerAlign: "center",
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        return (
          <div>
            <Typography variant="body2">{params.value}</Typography>
            <Typography color="textSecondary" sx={{ fontSize: 12 }}>
              {params.getValue(params.id, "skuCode") || ""}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "numberOfApproved",
      headerName: "จำนวนที่อนุมัติ",
      headerAlign: "center",
      align: "center",
      flex: 1,
      sortable: false,
      hide: Action.VIEW === values.action,
      renderCell: (params) => {
        return (
          <Typography
            variant="body2"
            sx={{
              width: "92px",
              height: "26px",
              background: "#EAEBEB",
              border: "1px solid #CBD4DB",
              boxSizing: "border-box",
              borderRadius: "5px",
              padding: "3px 2px 2px 20px",
              textAlign: "right",
            }}
          >
            {params.value}
          </Typography>
        );
      },
    },
    {
      field: "numberOfPrinting",
      headerName: "รายการส่วนลดที่พิมพ์",
      headerAlign: "center",
      align: "center",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const index =
          errorList && errorList.length > 0
            ? errorList.findIndex((item: any) => item.id === params.row.barcode)
            : -1;
        const condition = index != -1 && errorList[index].errorNumberOfPrinting;
        return (
          // <div className={classes.MLabelTooltipWrapper}>
          <TextField
            error={condition}
            type="text"
            inputProps={{ maxLength: 13, maxWidth: "92px", maxHeight: "20px" }}
            disabled={Action.VIEW === values.action}
            className={classes.MTextFieldNumberPrint}
            value={numberWithCommas(
              stringNullOrEmpty(params.value) ? "" : params.value,
            )}
            onChange={(e) => {
              handleChangePrintedDiscount(e, params.row.index, index);
            }}
          />
          // {condition && <div className="title">{errorList[index]?.errorNumberOfPrinting}</div>}
          // </div>
        );
      },
    },
  ];

  const handleChangePrintedDiscount = (
    event: any,
    index: number,
    errorIndex: number,
  ) => {
    let currentValue = event.target.value;
    if (
      stringNullOrEmpty(event.target.value) ||
      stringNullOrEmpty(event.target.value.trim())
    ) {
      currentValue = "0";
    }
    if (isNaN(parseInt(currentValue.replace(/,/g, "")))) {
      return;
    }
    setPrintAgainRows((preData: Array<any>) => {
      const data = [...preData];
      data[index - 1].numberOfPrinting = currentValue
        ? parseInt(currentValue.replace(/,/g, ""))
        : 0;
      return data;
    });
    if (errorList && errorList.length > 0) {
      let errors = _.cloneDeep(errorList).map((item: any, idx: number) => {
        return idx === errorIndex
          ? {
              ...item,
              errorNumberOfPrinting: "",
            }
          : item;
      });
      setErrorList(errors);
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        PaperProps={{
          sx: {
            minWidth:
              values.lstProductNotPrinted != null &&
              values.lstProductNotPrinted.length > 0
                ? "877px"
                : "547px",
          },
        }}
      >
        {values.printNormal ? (
          <DialogContent sx={{ mt: 3, mr: 5, ml: 5 }}>
            <Box>
              <Typography>เหตุผลที่ทำการพิมพ์บาร์โค้ด : </Typography>
              <Typography
                sx={{
                  marginTop: "5px",
                  padding: "15px",
                  backgroundColor: "#EAEBEB",
                  borderRadius: "8px",
                }}
              >
                พิมพ์บาร์โค้ดส่วนลดสินค้าใกล้หมดอายุตามเกณฑ์
              </Typography>
            </Box>
          </DialogContent>
        ) : (
          <div>
            <BootstrapDialogTitle id={"printed-barcode"} onClose={onClose}>
              <Typography variant="h6">{values.dialogTitle}</Typography>
            </BootstrapDialogTitle>
            <DialogContent>
              {values.lstProductNotPrinted != null &&
                values.lstProductNotPrinted.length > 0 && (
                  <div>
                    <Box sx={{ width: "50%" }}>
                      <Typography>เหตุผลที่ทำการพิมพ์บาร์โค้ด : </Typography>
                      <Typography
                        sx={{
                          marginTop: "5px",
                          padding: "15px",
                          backgroundColor: "#EAEBEB",
                          borderRadius: "8px",
                        }}
                      >
                        พิมพ์บาร์โค้ดส่วนลดสินค้าใกล้หมดอายุตามเกณฑ์
                      </Typography>
                    </Box>
                    <Box mt={4} sx={{ width: "850px" }}>
                      <Box>
                        <Typography variant="h6">
                          รายการสินค้าที่ไม่สามารถพิมพ์ได้
                        </Typography>
                      </Box>
                      <Box>
                        <div
                          style={{
                            width: "100%",
                            height: notPrintRows.length >= 5 ? "43vh" : "auto",
                          }}
                          className={classes.MdataGridPaginationTop}
                        >
                          <DataGrid
                            rows={notPrintRows}
                            columns={notPrintColumns}
                            disableColumnMenu
                            hideFooter
                            scrollbarSize={10}
                            autoHeight={notPrintRows.length < 5}
                            rowHeight={70}
                          />
                        </div>
                      </Box>
                    </Box>
                  </div>
                )}
              {values.lstProductPrintAgain != null &&
                values.lstProductPrintAgain.length > 0 && (
                  <div>
                    <Box
                      sx={{
                        width: "50%",
                        display:
                          Action.VIEW === values.action ? "none" : undefined,
                      }}
                    >
                      <Typography
                        align="left"
                        sx={{ display: "flex", width: "100%" }}
                      >
                        เหตุผลที่ทำการพิมพ์บาร์โค้ดซ้ำ
                        <Typography
                          sx={{
                            color: "#F54949",
                            marginRight: "5px",
                          }}
                        >
                          {" "}
                          *{" "}
                        </Typography>{" "}
                        :
                      </Typography>
                      <FormControl fullWidth className={classes.Mselect}>
                        {stringNullOrEmpty(reasonForReprint) ||
                        reasonForReprint == "1" ? (
                          <InputLabel
                            disableAnimation
                            shrink={false}
                            focused={false}
                            sx={{
                              color: "#C1C1C1",
                              marginTop: "-8px",
                              fontSize: "14px",
                            }}
                            id="reasonPlaceholder"
                          >
                            กรุณาเลือกเหตุผล
                          </InputLabel>
                        ) : null}
                        <Select
                          error={!stringNullOrEmpty(errorReasonForReprint)}
                          id="reasonForReprint"
                          name="reasonForReprint"
                          value={reasonForReprint}
                          onChange={(e) => {
                            setReasonForReprint(e.target.value);
                            setErrorReasonForReprint("");
                          }}
                          inputProps={{ "aria-label": "Without label" }}
                        >
                          <MenuItem value={"2"}>
                            {"พิมพ์บาร์โค้ดส่วนลดทดแทนที่ชำรุด"}
                          </MenuItem>
                          <MenuItem value={"3"}>
                            {"พิมพ์บาร์โค้ดส่วนลดทดแทนที่สูญหาย"}
                          </MenuItem>
                        </Select>
                        <Typography
                          hidden={stringNullOrEmpty(errorReasonForReprint)}
                          display={"flex"}
                          justifyContent={"flex-end"}
                          sx={{ color: "#F54949" }}
                        >
                          {errorReasonForReprint}
                        </Typography>
                      </FormControl>
                    </Box>
                    <Box mt={4} sx={{ width: "850px" }}>
                      <div
                        style={{
                          width: "100%",
                          height: printAgainRows.length >= 5 ? "43vh" : "auto",
                        }}
                        className={classes.MdataGridPaginationTop}
                      >
                        <DataGrid
                          rows={printAgainRows}
                          columns={printAgainColumns}
                          disableColumnMenu
                          hideFooter
                          scrollbarSize={10}
                          autoHeight={printAgainRows.length < 5}
                          rowHeight={70}
                        />
                      </div>
                    </Box>
                  </div>
                )}
            </DialogContent>
          </div>
        )}

        <DialogActions
          sx={{ justifyContent: "center", mb: 5, mr: 5, ml: 5, mt: 1 }}
        >
          <Button
            id="btnCancle"
            variant="contained"
            color="cancelColor"
            sx={{
              borderRadius: 2,
              width: 80,
              mr: 4,
              display: Action.VIEW === values.action ? "none" : undefined,
            }}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              width: 80,
              display: Action.VIEW === values.action ? "none" : undefined,
            }}
            onClick={handleConfirm}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
      <AlertError
        open={openModalError}
        onClose={handleCloseModalError}
        textError={textError}
      />
    </div>
  );
}
