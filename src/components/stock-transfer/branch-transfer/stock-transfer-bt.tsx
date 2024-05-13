import React from "react";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import store, { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import {
  BranchTransferRequest,
  Delivery,
  ErrorItem,
  Item,
  ItemGroups,
} from "../../../models/stock-transfer-model";
import { Button, Grid, IconButton, Link, Typography } from "@mui/material";
import Steppers from "../steppers";
import Box from "@mui/system/Box";
import { convertUtcToBkkDate } from "../../../utils/date-utill";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ControlPoint from "@mui/icons-material/ControlPoint";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  formatFileStockTransfer,
  getBranchName,
  getReasonLabel,
  isToteNo,
} from "../../../utils/utils";
import { getUserInfo } from "../../../store/sessionStore";
import { PERMISSION_GROUP } from "../../../utils/enum/permission-enum";
import { DOCUMENT_TYPE } from "../../../utils/enum/stock-transfer-enum";
import DatePickerAllComponent from "../../commons/ui/date-picker-all";
import TextBoxComment from "../../commons/ui/textbox-comment";

import ModalShowFile from "../../commons/ui/modal-show-file";
import SnackbarStatus from "../../commons/ui/snackbar-status";
import AlertError from "../../commons/ui/alert-error";
import LoadingModal from "../../commons/ui/loading-modal";
import ConfirmModalExit from "../../commons/ui/confirm-exit-model";
import ModalConfirmTransaction from "../modal-confirm-transaction";
import ModalAddItems from "../../commons/ui/modal-add-items";
import { FindProductRequest } from "../../../models/product-model";
import {
  getPathReportBT,
  sendBranchTransferToDC,
  sendBranchTransferToPickup,
  submitStockTransfer,
  saveBranchTransfer,
} from "../../../services/stock-transfer";
import { featchPurchaseNoteAsync } from "../../../store/slices/supplier-order-return-slice";
import { featchSearchStockTransferAsync } from "../../../store/slices/stock-transfer-slice";
import {
  ApiError,
  ErrorDetail,
  ErrorDetailResponse,
  Header,
} from "../../../models/api-error-model";
import { GridRowData } from "@mui/x-data-grid";
import {
  featchBranchTransferDetailAsync,
  updateErrorList,
} from "../../../store/slices/stock-transfer-branch-request-slice";
import moment from "moment";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import { isGroupBranch } from "../../../utils/role-permission";
import AccordionUploadFile from "../../commons/ui/accordion-upload-file";
import AccordionHuaweiFile from "../../commons/ui/accordion-huawei-file";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import BranchTransferListSKU from "./stock-transfer-bt-sku";
import { InquiryToteRequest, ToteItem } from "../../../models/tote-model";
import { inquiryTote } from "../../../services/tote-service";
import { isErrorCode } from "../../../utils/exception/pos-exception";
interface Props {
  isOpen: boolean;
  onClickClose: () => void;
}

function StockTransferBT({ isOpen, onClickClose }: Props) {
  const [open, setOpen] = React.useState(isOpen);
  const classes = useStyles();
  const _ = require("lodash");
  const dispatch = useAppDispatch();
  const branchTransferRslList = useAppSelector(
    (state) => state.branchTransferDetailSlice.branchTransferRs,
  );
  const reasonsList = useAppSelector(
    (state) => state.transferReasonsList.reasonsList.data,
  );
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const payloadSearch = useAppSelector(
    (state) => state.saveSearchStock.searchStockTransfer,
  );

  const branchTransferInfo: any = branchTransferRslList.data
    ? branchTransferRslList.data
    : null;
  const [branchTransferItems, setBranchTransferItems] = React.useState<Item[]>(
    branchTransferInfo.items ? branchTransferInfo.items : [],
  );

  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [sourceBranch, setSourceBranch] = React.useState("");
  const [destinationBranch, setDestinationBranch] = React.useState("");
  const [btNo, setBtNo] = React.useState("");
  const [btStatus, setBtStatus] = React.useState<string>("CREATED");
  const [reasons, setReasons] = React.useState("");
  const [isDraft, setIsDraft] = React.useState(false);
  const [isDC, setIsDC] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [isChecked, setIschecked] = React.useState(true);
  const [skuNameDisplay, setSkuNameDisplay] = React.useState<string>(
    branchTransferInfo.itemGroups[0].productName,
  );
  const [skuCodeSelect, setSkuCodeSelect] = React.useState<string>("");
  const [defaultSkuSelected, setDefaultSkuSelected] = React.useState<string>(
    branchTransferInfo.itemGroups[0].skuCode,
  );
  const [skuList, setSkuList] = React.useState<ItemGroups[]>([]);
  const [itemList, setItemList] = React.useState<Item[]>([]);
  const [bodyRequest, setBodyRequest] = React.useState<FindProductRequest>();
  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);

  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);

  const [openModelConfirmTransaction, setOpenModelConfirmTransaction] =
    React.useState(false);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const [payloadError, setPayloadError] =
    React.useState<ErrorDetailResponse | null>();
  const [openModelPreviewDocument, setOpenModelPreviewDocument] =
    React.useState(false);
  const [pathReport, setPathReport] = React.useState<string>("");
  const [suffixDocType, setSuffixDocType] = React.useState<string>("");
  const [docLayoutLandscape, setDocLayoutLandscape] = React.useState(false);

  const onClickSku = (skuCode: string) => {
    if (skuCode) {
      setDefaultSkuSelected(skuCode);
      const sku: ItemGroups = branchTransferInfo.itemGroups.find(
        (item: ItemGroups, index: number) => {
          return skuCode === item.skuCode;
        },
      );
      setSkuNameDisplay(sku.productName ? sku.productName : "");
    }
    setSkuCodeSelect(skuCode);
    setIschecked(false);
  };
  const topFunction = () => {
    document.getElementById("top-item")?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  function handleNotExitModelConfirm() {
    setConfirmModelExit(false);
  }

  function handleExitModelConfirm() {
    setConfirmModelExit(false);
    setOpen(false);
    onClickClose();
  }

  const handleOnCloseModalConfirm = () => {
    setOpenModelConfirmTransaction(false);
  };
  function handleModelPreviewDocument() {
    setOpenModelPreviewDocument(false);
  }

  const handleClose = async () => {
    let showPopup = false;
    if (comment !== branchTransferInfo.comment) {
      showPopup = true;
    }

    const _productSelector: Item[] = itemList;
    const btItems: Item[] = branchTransferInfo.items;

    if (_productSelector.length !== btItems.length) {
      showPopup = true;
    } else {
      _productSelector.forEach((data: GridRowData) => {
        const item = btItems.find((item: Item) => {
          return item.barcode === data.barcode;
        });
        if (!item) {
          showPopup = true;
          return;
        }
        if (
          data.actualQty !== (item.actualQty ? item.actualQty : 0) ||
          ((data.toteCode || item.toteCode) && data.toteCode != item.toteCode)
        ) {
          showPopup = true;
          return;
        }
      });
    }

    if (!showPopup) {
      setOpen(false);
      onClickClose();
    } else {
      setConfirmModelExit(true);
    }
  };

  const handleChangeComment = (value: any) => {
    setComment(value);
  };

  const onUpdateItemsList = (item: Item[]) => {
    setItemList(item);
  };

  React.useEffect(() => {
    const fromBranch = `${branchTransferInfo.branchFrom}-${getBranchName(
      branchList,
      branchTransferInfo.branchFrom,
    )}`;
    setSourceBranch(fromBranch ? fromBranch : "");

    const toBranch = `${branchTransferInfo.branchTo}-${getBranchName(
      branchList,
      branchTransferInfo.branchTo,
    )}`;
    setDestinationBranch(toBranch ? toBranch : "");

    const reason = getReasonLabel(
      reasonsList,
      branchTransferInfo.transferReason,
    );
    setReasons(reason ? reason : "");
    setBtNo(branchTransferInfo.btNo);
    setBtStatus(branchTransferInfo.status);
    setComment(branchTransferInfo.comment);

    setIsDraft(branchTransferInfo.status === "CREATED" ? true : false);
    setIsDC(getUserInfo().group === PERMISSION_GROUP.DC);

    const s_date = new Date(branchTransferInfo.startDate);

    if (s_date <= new Date()) {
      setStartDate(new Date());
    } else {
      setStartDate(new Date(branchTransferInfo.startDate));
    }

    const e_date = new Date(branchTransferInfo.endDate);
    if (e_date <= new Date()) {
      setEndDate(null);
    } else {
      setEndDate(new Date(branchTransferInfo.endDate));
    }

    // dispatch(updateAddItemSkuGroupState(branchTransferInfo.itemGroups));
    setSkuList(branchTransferInfo.itemGroups);
    dispatch(updateErrorList([]));
  }, [open]);

  const mappingPayload = () => {
    let items: Item[] = [];
    const _productSelector: any = itemList;
    _productSelector.forEach((data: GridRowData) => {
      const item: Item = {
        seqItem: data.seqItem,
        barcode: data.barcode,
        actualQty: data.actualQty,
        toteCode: data.toteCode,
      };
      items.push(item);
    });

    const _skuSelector = skuList;
    let sku: ItemGroups[] = [];
    _skuSelector.forEach((data: ItemGroups) => {
      const itemGroup: ItemGroups = {
        skuCode: data.skuCode,
        remainingQty: data.remainingQty,
      };
      sku.push(itemGroup);
    });

    const payload: BranchTransferRequest = {
      comment: comment,
      items: items,
      itemGroups: sku,
      btNo: btNo,
    };
    return payload;
  };

  const validateFileInfo = () => {
    const isvalid = fileUploadList.length > 0 ? true : false;
    if (!isvalid) {
      setOpenAlert(true);
      setTextError("กรุณาแนบเอกสาร");
      return false;
    }
    return true;
  };

  const validateItem = (action: string) => {
    // const _productSelector: any = store.getState().updateBTProductSlice.state;
    const _productSelector = itemList;
    let itemNotValid: boolean = false;
    _productSelector.forEach((data: GridRowData) => {
      if (!data.toteCode && data.actualQty > 0) {
        itemNotValid = true;
        setTextError("กรุณาระบุเลขที่ Tote/ลัง");
        // setComment(comment);
        return;
      }
      if (data.toteCode && data.actualQty <= 0) {
        itemNotValid = true;
        setTextError("จำนวนโอนจริงเป็น 0 ไม่ต้องระบุเลขที่ Tote/ลัง ");
        // setComment(comment);
        return;
      }
    });

    let isZero = true;
    let _newSku: ItemGroups[] = [];
    const _sku = skuList;
    _sku.forEach((data: ItemGroups) => {
      const sum = _productSelector
        .filter((dataItem: Item) => {
          return data.skuCode === dataItem.skuCode;
        })
        .reduce((sum, dataItem: Item) => {
          return (
            sum +
            Number(
              (dataItem.actualQty ? dataItem.actualQty : 0) *
                (dataItem.barFactor ? dataItem.barFactor : 0),
            )
          );
        }, 0);

      const newData: ItemGroups = {
        skuCode: data.skuCode,
        productName: data.productName,
        orderAllQty: data.orderAllQty,
        actualAllQty: sum,
        remainingQty: data.remainingQty,
      };
      _newSku.push(newData);
    });

    _newSku.forEach((data: ItemGroups) => {
      const actualQty = data.actualAllQty ? data.actualAllQty : 0;
      const orderQty = data.orderAllQty ? data.orderAllQty : 0;
      if (actualQty > 0) {
        isZero = false;
      }

      if (actualQty < orderQty && !comment) {
        itemNotValid = true;
        setTextError("กรุณาระบุสาเหตุการเปลี่ยนจำนวน");
        // setComment(comment);
        return;
      }
      if (actualQty > orderQty) {
        itemNotValid = true;
        setTextError(
          `สินค้า :${data.productName}\nกรุณาแก้ไขจำนวนโอน ต้องไม่มากกว่า จำนวนสั่ง`,
        );
        // setComment(comment);
        return;
      }
    });
    if (itemNotValid) {
      setOpenAlert(true);
      return false;
    } else if (isZero && action === "sendToDC") {
      setTextError("กรุณาระบุจำนวนโอนจริง > 0 อย่างน้อย 1 รายการ");
      // setComment(comment);
      setOpenAlert(true);
      return false;
    } else {
      setOpenAlert(false);
      return true;
    }
  };

  const saveBranchTransferService = async (payload: BranchTransferRequest) => {
    await saveBranchTransfer(payload)
      .then(async (value) => {
        setBtNo(value.docNo);
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
        await dispatch(featchBranchTransferDetailAsync(value.docNo));
        await dispatch(featchSearchStockTransferAsync(payloadSearch));

        const _branchTransferRslList =
          store.getState().branchTransferDetailSlice.branchTransferRs;
        const _branchTransferInfo: any = _branchTransferRslList.data
          ? _branchTransferRslList.data
          : null;
        setBranchTransferItems(_branchTransferInfo.items);
        // await storeItem();
      })
      .catch((error: ApiError) => {
        setOpenAlert(true);
        setTextError(error.message);
      });
  };

  const handleSaveBtn = async () => {
    setOpenLoadingModal(true);
    // await storeItem();
    await dispatch(updateAddItemsState({}));

    const isvalidItem = validateItem("save");
    if (isvalidItem) {
      const payload: BranchTransferRequest = await mappingPayload();
      const isToteValid = await checkTote(
        payload.items && payload.items?.length > 0 ? payload.items : [],
      );
      if (isToteValid) {
        saveBranchTransferService(payload);
      }
    }
    setOpenLoadingModal(false);
  };
  const handleLinkDocument = (docType: string) => {
    const path = getPathReportBT(docType ? docType : DOCUMENT_TYPE.BT, btNo);
    setSuffixDocType(docType !== DOCUMENT_TYPE.BT ? docType : "");
    setPathReport(path ? path : "");
    setDocLayoutLandscape(docType === DOCUMENT_TYPE.RECALL ? true : false);
    setOpenModelPreviewDocument(true);
  };

  const handleCloseModelAddItems = () => {
    setOpenModelAddItems(false);
  };

  const handleOpenAddItems = async () => {
    await dispatch(updateAddItemsState({}));
    await getSkuList();
    setOpenModelAddItems(true);
  };
  const getSkuList = () => {
    const _skuSlice = skuList;
    const list = _.uniqBy(_skuSlice, "skuCode");
    const skucodeList: string[] = [];
    list.map((i: any) => {
      skucodeList.push(i.skuCode);
    });
    const payload: FindProductRequest = {
      skuCodes: skucodeList,
    };
    setBodyRequest(payload);
  };
  const handleConfirmBtn = async () => {
    await dispatch(updateAddItemsState({}));
    const isvalidItem = validateItem("sendToDC");
    if (isvalidItem) {
      const payload: BranchTransferRequest = await mappingPayload();
      const isToteValid = await checkTote(
        payload.items && payload.items?.length > 0 ? payload.items : [],
      );
      if (isToteValid) {
        if (!btNo) {
          await saveBranchTransfer(payload)
            .then(async (value) => {
              setBtNo(value.btNo);
              setOpenModelConfirmTransaction(true);
            })
            .catch((error: ApiError) => {
              // setShowSnackBar(true);
              // setSnackbarIsStatus(false);
              // setContentMsg(error.message);
              setOpenAlert(true);
              setTextError(error.message);
            });
        } else {
          setOpenModelConfirmTransaction(true);
        }
      }
    }
  };
  const sendTransactionToDC = async () => {
    const payload: BranchTransferRequest = await mappingPayload();
    await sendBranchTransferToDC(payload)
      .then(async (value) => {
        handleOnCloseModalConfirm();
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณส่งรายการให้ DC เรียบร้อยแล้ว");
        await dispatch(featchSearchStockTransferAsync(payloadSearch));
        setTimeout(() => {
          setOpen(false);
          onClickClose();
        }, 500);
      })
      .catch((error: ApiError) => {
        handleOnCloseModalConfirm();
        // setShowSnackBar(true);
        // setSnackbarIsStatus(false);
        // setContentMsg(error.message);
        setOpenAlert(true);
        setTextError(error.message);
      });
    handleOnCloseModalConfirm();
    setOpenLoadingModal(false);
  };

  const handleSubmitTransfer = async () => {
    setOpenLoadingModal(false);
    const isFileValidate: boolean = validateFileInfo();
    if (isFileValidate) {
      const payload: BranchTransferRequest = {
        docNo: btNo,
      };
      await submitStockTransfer(payload, fileUploadList)
        .then(async (value) => {
          handleOnCloseModalConfirm();
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("คุณส่งงาน เรียบร้อยแล้ว");
          await dispatch(featchSearchStockTransferAsync(payloadSearch));
          setTimeout(() => {
            setOpen(false);
            onClickClose();
          }, 500);
        })
        .catch((error: ApiError) => {
          handleOnCloseModalConfirm();
          // setShowSnackBar(true);
          // setSnackbarIsStatus(false);
          // setContentMsg(error.message);
          setOpenAlert(true);
          setTextError(error.message);
        });
      handleOnCloseModalConfirm();
    }
    setOpenLoadingModal(false);
  };

  const handleSendToPickup = async () => {
    setOpenLoadingModal(true);
    if (startDate === null || endDate === null) {
      setOpenAlert(true);
      setTextError("กรุณาระบุรอบรถเข้าต้นทาง");
    } else {
      const _dalivery: Delivery = {
        fromDate: moment(startDate).startOf("day").toISOString(),
        toDate: moment(endDate).startOf("day").toISOString(),
      };
      const payload: BranchTransferRequest = {
        btNo: btNo,
        delivery: _dalivery,
      };
      await sendBranchTransferToPickup(payload)
        .then(async (value) => {
          handleOnCloseModalConfirm();
          setShowSnackBar(true);
          setSnackbarIsStatus(true);
          setContentMsg("คุณบันทึกรอบรถเข้าต้นทางเรียบร้อยแล้ว");
          await dispatch(featchBranchTransferDetailAsync(btNo));
          await dispatch(featchSearchStockTransferAsync(payloadSearch));
          setTimeout(() => {
            setOpen(false);
            onClickClose();
          }, 500);
        })
        .catch((error: ApiError) => {
          handleOnCloseModalConfirm();
          // setShowSnackBar(true);
          // setSnackbarIsStatus(false);
          // setContentMsg(error.message);
          setOpenAlert(true);
          setTextError(error.message);
        });
    }
    setOpenLoadingModal(false);
  };

  const handleStartDatePicker = (value: any) => {
    setStartDate(value);
  };

  const handleEndDatePicker = (value: Date) => {
    setEndDate(value);
  };
  if (endDate != null && startDate != null) {
    const _startDate = moment(startDate).startOf("day").toISOString();
    const _endDate = moment(endDate).startOf("day").toISOString();
    if (_endDate < _startDate) {
      setEndDate(null);
    }
  }

  const handleOnChangeUploadFile = (status: boolean) => {
    setUploadFileFlag(status);
    if (status) {
      dispatch(featchPurchaseNoteAsync(btNo));
    }
  };

  const checkTote = async (items: Item[]) => {
    let status = false;
    const _items = _.uniqBy(items, "toteCode");
    const totes = _items
      .filter(
        (item: Item) =>
          item.actualQty &&
          item.actualQty > 0 &&
          item.toteCode &&
          isToteNo(item.toteCode),
      )
      .map((item: Item) => {
        const tote: ToteItem = {
          toteCode: item.toteCode,
        };
        return tote;
      });

    const payload: InquiryToteRequest = {
      branchCode: branchTransferInfo.branchFrom,
      toteItem: totes,
    };
    if (totes.length <= 0) {
      return true;
    } else {
      await inquiryTote(payload)
        .then(() => {
          status = true;
        })
        .catch((error: ApiError) => {
          let errorList: ErrorDetail[] = [];
          setOpenAlert(true);
          setTextError(error.message);
          setPayloadError(null);
          if (error.data) {
            const datas: ToteItem[] = error.data;
            datas.forEach((item: ToteItem) => {
              if (isErrorCode(item.code)) {
                const _err: ErrorDetail = {
                  toteCode: item.toteCode,
                  description: item.message,
                };
                errorList.push(_err);
              }
            });
            dispatch(updateErrorList(errorList));

            const header: Header = {
              field1: false,
              field2: true,
              field3: true,
              field4: false,
            };
            const payload: ErrorDetailResponse = {
              header: header,
              error_details: errorList,
            };
            setTextError("ไม่สามารถใช้ เลข Tote ดังต่อไปนี้ได้");
            setPayloadError(payload);
          }
        });
    }
    return status;
  };

  const componetStatusCreate = (
    <>
      <Grid container spacing={2} mb={2}>
        <Grid item lg={2}>
          <Typography variant="body2"> สาเหตุการโอน :</Typography>
        </Grid>
        <Grid item lg={3}>
          <Typography variant="body2">{reasons} </Typography>
        </Grid>
        <Grid item lg={1}></Grid>
        <Grid item lg={2}></Grid>
        <Grid item lg={3}>
          <>
            <Box>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  handleLinkDocument(DOCUMENT_TYPE.BT);
                }}
              >
                เรียกดูเอกสารใบโอน BT
              </Link>
            </Box>
          </>
        </Grid>
        <Grid item lg={1}></Grid>
      </Grid>
      <Grid
        item
        container
        xs={12}
        sx={{ mt: 3 }}
        justifyContent="space-between"
        direction="row"
        alignItems="flex-end"
      >
        <Grid item xl={5}>
          <Button
            data-testid="testid-btnAddItem"
            id="btnAddItem"
            variant="contained"
            color="info"
            className={classes.MbtnPrint}
            onClick={handleOpenAddItems}
            startIcon={<ControlPoint />}
            sx={{ width: 200 }}
          >
            เพิ่มสินค้า
          </Button>
        </Grid>
        <Grid item>
          <Button
            data-testid="testid-btnSave"
            id="btnSave"
            variant="contained"
            color="warning"
            className={classes.MbtnSave}
            onClick={handleSaveBtn}
            startIcon={<SaveIcon />}
            sx={{ width: 200 }}
          >
            บันทึก
          </Button>

          <Button
            data-testid="testid-btnSendToDC"
            id="btnSendToDC"
            variant="contained"
            color="primary"
            className={classes.MbtnSendDC}
            onClick={handleConfirmBtn}
            startIcon={<CheckCircleOutline />}
            sx={{ width: 200 }}
          >
            ส่งงานให้ DC
          </Button>
        </Grid>
      </Grid>
    </>
  );

  const componentViewReport = (
    <Grid container spacing={2} mb={2}>
      <Grid item lg={2}>
        <Typography variant="body2"> สาเหตุการโอน :</Typography>
      </Grid>
      <Grid item lg={3}>
        <Typography variant="body2">{reasons} </Typography>
      </Grid>
      <Grid item lg={1}></Grid>
      <Grid item lg={2}></Grid>
      <Grid item lg={3}>
        <>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BT);
              }}
            >
              เรียกดูเอกสารใบโอน BT
            </Link>
          </Box>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BO);
              }}
            >
              เรียกดูเอกสารใบ BO
            </Link>
          </Box>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BOX);
              }}
            >
              เรียกดูเอกสารใบปะลัง
            </Link>
          </Box>
        </>
      </Grid>
      <Grid item lg={1}></Grid>
    </Grid>
  );

  const componentDCStatusReadyToTransfer = (
    <Grid
      item
      container
      xs={12}
      sx={{ mt: 3 }}
      justifyContent="space-between"
      direction="row"
      alignItems="flex-end"
    >
      <Grid item xl={8}>
        <Grid container>
          <Grid item>
            <Typography gutterBottom variant="subtitle1" component="div">
              รอบรถเข้าต้นทางตั้งแต่
            </Typography>
            <DatePickerAllComponent
              onClickDate={handleStartDatePicker}
              value={startDate}
              type={"TO"}
              minDateTo={startDate}
            />
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item>
            <Typography gutterBottom variant="subtitle1" component="div">
              ถึง
            </Typography>
            <DatePickerAllComponent
              onClickDate={handleEndDatePicker}
              value={endDate}
              type={"TO"}
              minDateTo={startDate}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Button
          data-testid="testid-btnSave"
          id="btnSave"
          variant="contained"
          color="warning"
          className={classes.MbtnSave}
          onClick={handleSendToPickup}
          startIcon={<SaveIcon />}
          sx={{ width: 200 }}
        >
          บันทึก
        </Button>
      </Grid>
    </Grid>
  );

  const componentDCStatusWaitForPicup = (
    <>
      <Grid container spacing={2} mb={2}>
        <Grid item lg={2}>
          <Typography variant="body2"> รอบรถเข้าต้นทาง :</Typography>
        </Grid>
        <Grid item lg={3}>
          <Typography variant="body2">
            {convertUtcToBkkDate(branchTransferInfo.delivery.fromDate)}{" "}
          </Typography>
        </Grid>
        <Grid item lg={1}></Grid>
        <Grid item lg={2}>
          <Typography variant="body2">ถึง :</Typography>
        </Grid>
        <Grid item lg={3}>
          <Typography variant="body2">
            {convertUtcToBkkDate(branchTransferInfo.delivery.toDate)}{" "}
          </Typography>
        </Grid>
        <Grid item lg={1}></Grid>
      </Grid>

      <Grid container spacing={2} mb={2}>
        <Grid item lg={2}></Grid>
        <Grid item lg={3}></Grid>
        <Grid item lg={1}></Grid>
        <Grid item lg={2}></Grid>
        <Grid item lg={3}>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.RECALL);
              }}
            >
              เรียกดูเอกสารใบเรียกเก็บ
            </Link>
          </Box>
        </Grid>
        <Grid item lg={1}></Grid>
      </Grid>
    </>
  );

  const componentBranchStatusWaitForPickup = (
    <>
      <Grid container spacing={2} mb={2}>
        <Grid item lg={2}>
          <Typography variant="body2"> รอบรถเข้าต้นทาง :</Typography>
        </Grid>
        <Grid item lg={3}>
          <Typography variant="body2">
            {convertUtcToBkkDate(branchTransferInfo.delivery.fromDate)}{" "}
          </Typography>
        </Grid>
        <Grid item lg={1}></Grid>
        <Grid item lg={2}>
          <Typography variant="body2">ถึง :</Typography>
        </Grid>
        <Grid item lg={3}>
          <Typography variant="body2">
            {convertUtcToBkkDate(branchTransferInfo.delivery.toDate)}{" "}
          </Typography>
        </Grid>
        <Grid item lg={1}></Grid>
      </Grid>

      <Grid container spacing={2} mb={2}>
        <Grid item lg={2}></Grid>
        <Grid item lg={3}></Grid>
        <Grid item lg={1}></Grid>
        <Grid item lg={2}>
          <Typography variant="body2">แนบไฟล์</Typography>
        </Grid>
        <Grid item lg={3}>
          <AccordionUploadFile
            files={[]}
            docNo={btNo}
            docType="PN"
            isStatus={uploadFileFlag}
            onChangeUploadFile={handleOnChangeUploadFile}
            enabledControl={true}
          />
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BT);
              }}
            >
              เรียกดูเอกสารใบโอน BT
            </Link>
          </Box>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BO);
              }}
            >
              เรียกดูเอกสารใบ BO
            </Link>
          </Box>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BOX);
              }}
            >
              เรียกดูเอกสารใบปะลัง
            </Link>
          </Box>
        </Grid>
        <Grid item lg={1}></Grid>
      </Grid>
      <Grid
        item
        container
        xs={12}
        sx={{ mt: 3 }}
        justifyContent="space-between"
        direction="row"
        alignItems="flex-end"
      >
        <Grid item xl={8}></Grid>
        <Grid item>
          <Button
            data-testid="testid-btnApprove"
            id="btnApprove"
            variant="contained"
            color="warning"
            className={classes.MbtnSave}
            onClick={handleSubmitTransfer}
            sx={{ width: 200 }}
          >
            ส่งงาน
          </Button>
        </Grid>
      </Grid>
    </>
  );

  const componentBranchStatusTransfering = (
    <>
      <Grid container spacing={2} mb={2}>
        <Grid item lg={2}>
          <Typography variant="body2"> รอบรถเข้าต้นทาง :</Typography>
        </Grid>
        <Grid item lg={3}>
          <Typography variant="body2">
            {convertUtcToBkkDate(branchTransferInfo.delivery.fromDate)}{" "}
          </Typography>
        </Grid>
        <Grid item lg={1}></Grid>
        <Grid item lg={2}>
          <Typography variant="body2">ถึง :</Typography>
        </Grid>
        <Grid item lg={3}>
          <Typography variant="body2">
            {convertUtcToBkkDate(branchTransferInfo.delivery.toDate)}{" "}
          </Typography>
        </Grid>
        <Grid item lg={1}></Grid>
      </Grid>

      <Grid container spacing={2} mb={2}>
        <Grid item lg={2}></Grid>
        <Grid item lg={3}></Grid>
        <Grid item lg={1}></Grid>
        <Grid item lg={2}>
          <Typography variant="body2">แนบไฟล์</Typography>
        </Grid>
        <Grid item lg={3}>
          {branchTransferInfo.files && branchTransferInfo.files.length > 0 && (
            <AccordionHuaweiFile files={branchTransferInfo.files} />
          )}
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BT);
              }}
            >
              เรียกดูเอกสารใบโอน BT
            </Link>
          </Box>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BO);
              }}
            >
              เรียกดูเอกสารใบ BO
            </Link>
          </Box>
          <Box>
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                handleLinkDocument(DOCUMENT_TYPE.BOX);
              }}
            >
              เรียกดูเอกสารใบปะลัง
            </Link>
          </Box>
        </Grid>
        <Grid item lg={1}></Grid>
      </Grid>
      <Grid
        item
        container
        xs={12}
        sx={{ mt: 3 }}
        justifyContent="space-between"
        direction="row"
        alignItems="flex-end"
      >
        <Grid item xl={8}></Grid>
        <Grid item></Grid>
      </Grid>
    </>
  );

  return (
    <React.Fragment>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          <Typography sx={{ fontSize: 24, fontWeight: 400 }}>
            ตรวจสอบรายการใบโอน
          </Typography>
          <Steppers status={branchTransferInfo.status} type="BT"></Steppers>
        </BootstrapDialogTitle>
        <DialogContent>
          <Box mt={2} sx={{ flexGrow: 1 }} id="top-item">
            <Grid container spacing={2} mb={2}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร BT</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {branchTransferInfo.btNo}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร RT</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {branchTransferInfo.rtNo}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
            </Grid>
            <Grid container spacing={2} mb={2}>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่โอน :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {convertUtcToBkkDate(branchTransferInfo.startDate)}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่สิ้นสุด :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">
                  {convertUtcToBkkDate(branchTransferInfo.endDate)}
                </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
            </Grid>

            <Grid container spacing={2} mb={2}>
              <Grid item lg={2}>
                <Typography variant="body2"> สาขาต้นทาง :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">{sourceBranch} </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
              <Grid item lg={2}>
                <Typography variant="body2">สาขาปลายทาง :</Typography>
              </Grid>
              <Grid item lg={3}>
                <Typography variant="body2">{destinationBranch} </Typography>
              </Grid>
              <Grid item lg={1}></Grid>
            </Grid>
          </Box>
          {!isDC && isDraft && componetStatusCreate}
          {isDC &&
            btStatus === "WAIT_FOR_PICKUP" &&
            componentDCStatusWaitForPicup}
          {isGroupBranch() &&
            btStatus === "WAIT_FOR_PICKUP" &&
            componentBranchStatusWaitForPickup}
          {!isDraft &&
            !isDC &&
            btStatus === "READY_TO_TRANSFER" &&
            componentViewReport}
          {isDC &&
            btStatus === "READY_TO_TRANSFER" &&
            componentDCStatusReadyToTransfer}
          {btStatus === "TRANSFERING" && componentBranchStatusTransfering}

          <Box mb={3} mt={3}>
            <BranchTransferListSKU
              onSelectSku={onClickSku}
              skuList={skuList}
              onUpdateItemList={onUpdateItemsList}
            />
          </Box>
          <Box mt={12}>
            <Grid container spacing={2} mb={1}>
              <Grid item lg={3}>
                <TextBoxComment
                  fieldName="สาเหตุการเปลี่ยนจำนวน:"
                  defaultValue={comment}
                  maxLength={100}
                  onChangeComment={handleChangeComment}
                  isDisable={isGroupBranch() && isDraft ? false : true}
                  rowDisplay={2}
                />
              </Grid>
              <Grid item xs={7}></Grid>
              <Grid item xs={2} textAlign="center">
                <IconButton onClick={topFunction} data-testid="testid-btnTop">
                  <ArrowForwardIosIcon
                    sx={{
                      fontSize: "41px",
                      padding: "6px",
                      backgroundColor: "#C8E8FF",
                      transform: "rotate(270deg)",
                      color: "#fff",
                      borderRadius: "50%",
                    }}
                  />
                </IconButton>

                <Box fontSize="13px">กลับขึ้นด้านบน</Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />

      <ConfirmModalExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />

      <ModalConfirmTransaction
        open={openModelConfirmTransaction}
        onClose={handleOnCloseModalConfirm}
        handleConfirm={sendTransactionToDC}
        header="ยืนยันส่งรายการให้ DC"
        title="เลขที่เอกสาร BT"
        value={btNo}
      />

      <ModalAddItems
        open={openModelAddItems}
        onClose={handleCloseModelAddItems}
        requestBody={bodyRequest ? bodyRequest : { skuCodes: [] }}
      ></ModalAddItems>
      <LoadingModal open={openLoadingModal} />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
        payload={payloadError}
      />
      <ModalShowFile
        open={openModelPreviewDocument}
        onClose={handleModelPreviewDocument}
        url={pathReport}
        statusFile={1}
        sdImageFile={""}
        fileName={formatFileStockTransfer(btNo, btStatus, suffixDocType)}
        btnPrintName="พิมพ์เอกสาร"
        landscape={docLayoutLandscape}
      />
    </React.Fragment>
  );
}

export default StockTransferBT;
