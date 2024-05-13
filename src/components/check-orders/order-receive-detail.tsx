import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import {
  HighlightOff,
  CheckCircleOutline,
  SearchOff,
} from "@mui/icons-material";
import { useStyles } from "../../styles/makeTheme";
import SearchIcon from "@mui/icons-material/Search";
import {
  ItemsInfo,
  OrderReceiveApproveRequest,
} from "../../models/dc-check-order-model";
import { approveOrderReceive, submitTote } from "../../services/order-shipment";
import OrderReceiveDetailList from "../check-orders/order-receive-detail-list";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import {
  getorderReceiveThStatus,
  getShipmentTypeText,
} from "../../utils/enum/check-order-enum";
import OrderReceiveConfirmModel from "../check-orders/order-receive-confirm-model";
import LoadingModal from "../commons/ui/loading-modal";
import {
  searchOrderReceiveAsync,
  clearDataFilter,
} from "../../store/slices/order-receive-slice";
import { searchToteAsync } from "../../store/slices/search-tote-slice";
import { EntryTote } from "../../models/order-model";
import CheckOrderDetailTote from "./check-order-detail-tote";
import {
  featchOrderDetailAsync,
  setReloadScreen,
} from "../../store/slices/check-order-detail-slice";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { updateItemsToteState } from "../../store/slices/items-tote-slice";
import { featchOrderDetailToteAsync } from "../../store/slices/check-order-detail-tote-slice";

export interface OrderReceiveDetailProps {
  defaultOpen: boolean;
  onClickClose: any;
  isTote?: boolean;
  toteCodeNew?: string;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

interface State {
  docNo: string;
}
interface loadingModalState {
  open: boolean;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 3 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme: any) => theme.palette.grey[400],
          }}
        >
          <HighlightOff fontSize="large" />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default function OrderReceiveDetail({
  defaultOpen,
  onClickClose,
  isTote,
  toteCodeNew,
}: OrderReceiveDetailProps) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const orderReceiveResp = useAppSelector(
    (state) => state.orderReceiveSlice.orderReceiveList,
  );
  const orderReceiveDatas = orderReceiveResp.data ? orderReceiveResp.data : {};
  const orderReceiveEntries = orderReceiveDatas.entries;
  const searchToteResp = useAppSelector((state) => state.searchToteSlice.tote);
  const searchToteData = searchToteResp.data ? searchToteResp.data : null;
  let searchToteEntries: any = [];
  if (searchToteData !== null) {
    searchToteEntries = searchToteData.entries ? searchToteData.entries : [];
  }
  const orderDetails = useAppSelector(
    (state) => state.checkOrderDetail.orderDetail,
  );
  const orderDetail: any = orderDetails.data ? orderDetails.data : null;

  const [isTotes, setIsTotes] = React.useState(isTote);
  const [open, setOpen] = React.useState(defaultOpen);
  const [values, setValues] = React.useState<State>({
    docNo: "",
  });

  let orderReceiveData: any;
  if (isTotes === true && searchToteData !== null) {
    orderReceiveData = searchToteData;
  } else {
    orderReceiveData = orderReceiveDatas;
  }

  const handleClose = async () => {
    await dispatch(searchOrderReceiveAsync());
    await dispatch(searchToteAsync());
    setOpen(false);
    onClickClose();
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
  };

  const removeSpace = (value: string) => {
    return value.replace(/\s/g, "");
  };

  const handleSearch = async () => {
    await dispatch(searchOrderReceiveAsync());
    await dispatch(searchToteAsync());
    handleOpenLoading("open", true);
    setFlagSearch(true);

    let newDocNo = removeSpace(values.docNo);

    await dispatch(searchOrderReceiveAsync(newDocNo));
    handleOpenLoading("open", false);
  };

  const [openModelConfirm, setOpenModelConfirm] = React.useState(false);
  const handleApproveBtn = () => {
    setOpenModelConfirm(true);
  };

  const handleModelConfirm = async () => {
    await dispatch(searchOrderReceiveAsync(""));
    setOpenModelConfirm(false);
  };

  const handleConfirmStatus = async (status: string) => {
    if (status === "ok") {
      if (!isTote) {
        handleOpenLoading("open", true);
        let items: any = [];
        orderReceiveEntries.forEach((data: any) => {
          const itemsNew: ItemsInfo = {
            barcode: data.barcode,
            actualQty: data.actualQty,
            comment: data.comment,
          };
          items.push(itemsNew);
        });
        const payload: OrderReceiveApproveRequest = {
          docRefNo: orderReceiveData.docRefNo,
          items: items,
        };
        await approveOrderReceive(payload);
        await dispatch(searchOrderReceiveAsync());
        setOpen(false);
        onClickClose();
        handleOpenLoading("open", false);
      } else if (isTote === true) {
        await dispatch(featchOrderDetailAsync());
        handleConfirmTote();
      }
    } else {
      if (!isTote) {
        await dispatch(searchOrderReceiveAsync());
        setOpen(false);
        onClickClose();
      }
    }
  };

  const [openTote, setOpenTote] = React.useState(false);

  const handleConfirmTote = async () => {
    handleOpenLoading("open", true);
    let items: any = [];
    searchToteEntries.forEach((data: EntryTote) => {
      const item: any = {
        barcode: data.barcode,
        actualQty: Number(data.actualQty),
        comment: data.comment,
      };
      items.push(item);
    });

    let data = {
      shipmentNo: orderDetail.docRefNo,
      toteCode: orderReceiveData.toteCode
        ? orderReceiveData.toteCode
        : toteCodeNew,
      items: items,
    };

    await submitTote(data)
      .then((resp: any) => {
        dispatch(updateAddItemsState({}));
        dispatch(featchOrderDetailAsync(resp.sdNo));
        // dispatch(setReloadScreen(true));

        // dispatch(updateItemsToteState({}));
        // dispatch(featchOrderDetailToteAsync(resp.sdNo)).then(() => {
        //   setOpenTote(true);
        // });

        setOpen(false);
      })
      .catch((error: any) => {
        console.log(error);
      });

    handleOpenLoading("open", false);
  };

  // function handleCloseDetailToteModal() {
  //   setOpenTote(false);
  //   setOpen(false);
  //   onClickClose();
  // }

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  let orderReceiveDataLength = Object.keys(orderReceiveData).length;
  let orderReceiveTable;
  const [flagSearch, setFlagSearch] = React.useState(false);

  if (flagSearch) {
    if (Object.keys(orderReceiveData).length > 0) {
      orderReceiveTable = <OrderReceiveDetailList isTote={isTote} />;
    } else {
      orderReceiveTable = (
        <Grid item container xs={12} justifyContent="center">
          <Box color="#CBD4DB">
            <h2>
              ไม่มีข้อมูล <SearchOff fontSize="large" />
            </h2>
          </Box>
        </Grid>
      );
    }
  } else if (!flagSearch && isTote === true) {
    if (Object.keys(orderReceiveData).length > 0) {
      orderReceiveTable = <OrderReceiveDetailList isTote={isTote} />;
    } else {
      orderReceiveTable = (
        <Grid item container xs={12} justifyContent="center">
          <Box color="#CBD4DB">
            <h2>
              ไม่มีข้อมูล <SearchOff fontSize="large" />
            </h2>
          </Box>
        </Grid>
      );
    }
  }

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          {isTotes && (
            <Typography sx={{ fontSize: "1em" }}>รับสินค้าใน Tote</Typography>
          )}
          {!isTotes && (
            <Typography sx={{ fontSize: "1em" }}>รับสินค้า</Typography>
          )}
        </BootstrapDialogTitle>

        <DialogContent>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={1} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร:</Typography>
              </Grid>
              <Grid item lg={4}>
                {isTotes && (
                  <Typography variant="body2">
                    {orderDetail.docRefNo ? orderDetail.docRefNo : "-"}
                  </Typography>
                )}
                {!isTotes && (
                  <>
                    <TextField
                      id="txtDocNo"
                      name="docNo"
                      size="small"
                      value={values.docNo}
                      onChange={handleChange}
                      className={classes.MtextField}
                      placeholder="เลขที่เอกสาร LD/BT"
                    />

                    <IconButton
                      color="primary"
                      component="span"
                      onClick={handleSearch}
                    >
                      <SearchIcon />
                    </IconButton>
                  </>
                )}
              </Grid>

              {isTotes && (
                <>
                  <Grid item lg={2}>
                    <Typography variant="body2">เลขที่ Tote:</Typography>
                  </Grid>
                  <Grid item lg={4}>
                    <Typography variant="body2">
                      {orderReceiveData.toteCode
                        ? orderReceiveData.toteCode
                        : toteCodeNew
                          ? toteCodeNew
                          : "-"}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
            <Grid container spacing={1} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">เลขที่เอกสาร SD:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderReceiveData.sdNo ? orderReceiveData.sdNo : "-"}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">วันที่:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderReceiveData.shipmentDate
                    ? convertUtcToBkkDate(orderReceiveData.shipmentDate)
                    : "-"}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">สถานะ:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderReceiveData.sdStatus
                    ? getorderReceiveThStatus(orderReceiveData.sdStatus)
                    : "-"}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">ประเภท:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {getShipmentTypeText(orderReceiveData.sdType)}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={1} mb={1}>
              <Grid item lg={2}>
                <Typography variant="body2">สาขาต้นทาง:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderReceiveData.shipBranchFrom
                    ? orderReceiveData.shipBranchFrom.code
                    : ""}
                  -
                  {orderReceiveData.shipBranchFrom
                    ? orderReceiveData.shipBranchFrom.name
                    : ""}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <Typography variant="body2">สาขาปลายทาง:</Typography>
              </Grid>
              <Grid item lg={4}>
                <Typography variant="body2">
                  {orderReceiveData.shipBranchTo
                    ? orderReceiveData.shipBranchTo.code
                    : ""}
                  -
                  {orderReceiveData.shipBranchTo
                    ? orderReceiveData.shipBranchTo.name
                    : ""}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ marginTop: 4 }}>
            <Grid item container spacing={2} justifyContent="flex-end">
              {!isTotes && (
                <Button
                  id="btnApprove"
                  variant="contained"
                  color="primary"
                  className={classes.MbtnApprove}
                  onClick={handleApproveBtn}
                  startIcon={<CheckCircleOutline />}
                  sx={{ width: "15%" }}
                  disabled={orderReceiveDataLength === 0}
                >
                  ยืนยัน
                </Button>
              )}

              {isTotes && (
                <Button
                  id="btnApprove"
                  variant="contained"
                  color="primary"
                  className={classes.MbtnApprove}
                  onClick={handleApproveBtn}
                  startIcon={<CheckCircleOutline />}
                  sx={{ width: "15%" }}
                >
                  ยืนยัน
                </Button>
              )}
            </Grid>
          </Box>

          {orderReceiveTable}

          <OrderReceiveConfirmModel
            open={openModelConfirm}
            onClose={handleModelConfirm}
            onUpdateAction={handleConfirmStatus}
            sdNo={orderReceiveData.sdNo}
            docRefNo={
              !isTote ? orderReceiveData.docRefNo : orderDetail.docRefNo
            }
            isTote={isTote}
            toteCode={
              orderReceiveData.toteCode
                ? orderReceiveData.toteCode
                : toteCodeNew
            }
          />

          <LoadingModal open={openLoadingModal.open} />
        </DialogContent>
      </Dialog>

      {/* {openTote && <CheckOrderDetailTote defaultOpen={openTote} onClickClose={handleCloseDetailToteModal} />} */}
    </div>
  );
}
