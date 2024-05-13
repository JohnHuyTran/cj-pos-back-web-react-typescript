import {
  Card,
  CardContent,
  Grid,
  TablePagination,
  Typography,
} from "@mui/material";
import moment from "moment";
import React, { useEffect } from "react";
import {
  getNotificationReminders,
  updateNotificationItem,
} from "../../services/notification";
import { useStyles } from "../../styles/makeTheme";
import theme from "../../styles/theme";
import PresentToAllIcon from "@mui/icons-material/PresentToAll";
import { Box } from "@mui/system";
import LoadingModal from "../commons/ui/loading-modal";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getTransferOutDetail } from "../../store/slices/transfer-out-detail-slice";
import { getBarcodeDiscountDetail } from "../../store/slices/barcode-discount-detail-slice";
import ModalCreateBarcodeDiscount from "../barcode-discount/modal-create-barcode-discount";
import { Action, DateFormat, TO_TYPE } from "../../utils/enum/common-enum";
import { getBranchName, objectNullOrEmpty } from "../../utils/utils";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";
import { getUserInfo } from "../../store/sessionStore";
import ModalCreateTransferOutDestroy from "../transfer-out-destroy/modal-create-transfer-out-destroy";
import ModalCreateTransferOut from "../transfer-out/modal-create-transfer-out";
import { featchOrderDetailAsync } from "../../store/slices/check-order-detail-slice";
import CheckOrderDetail from "../check-orders/check-order-detail";
import { ShoppingCartSharp } from "@mui/icons-material";
import HtmlTooltip from "../commons/ui/html-tooltip";
import AlertError from "../commons/ui/alert-error";
import StockRequestDetail from "../stock-transfer/stock-request-detail";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { featchStockRequestDetailAsync } from "../../store/slices/stock-request-detail-slice";
import { updatestockRequestItemsState } from "../../store/slices/stock-request-items-slice";
import ModalCreateToDestroyDiscount from "../transfer-out-destroy/modal-create-to-destroy-discount";

interface Props {
  refresh: boolean;
}

export default function NotificationReminder(props: Props) {
  const [page, setPage] = React.useState(0);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<boolean>(false);
  const [total, setTotal] = React.useState(0);
  const [orderDetailParams, setOrderDetailParams] = React.useState({
    sdNo: "",
    docRefNo: "",
    docType: "",
  });
  const [openCheckOrderDetail, setOpenCheckOrderDetail] = React.useState(false);
  const [openStockRequestDetail, setOpenStockRequestDetail] =
    React.useState(false);
  const [listData, setListData] = React.useState<any[]>([]);
  const [openTransferOutDetail, setOpenTransferOutDetail] =
    React.useState(false);
  const [openTransferOutDestroyDetail, setOpenTransferOutDestroyDetail] =
    React.useState(false);
  const [openBDDetail, setOpenBDDetail] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const [openDetailDestroyDiscount, setOpenDetailDestroyDiscount] =
    React.useState(false);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  const userPermission =
    !objectNullOrEmpty(userInfo) &&
    !objectNullOrEmpty(userInfo.acl) &&
    userInfo.acl["service.posback-campaign"] != null &&
    userInfo.acl["service.posback-campaign"].length > 0
      ? userInfo.acl["service.posback-campaign"]
      : [];
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };
  const classes = useStyles();
  useEffect(() => {
    handleGetData();
  }, []);
  useEffect(() => {
    handleGetData();
  }, [page]);
  useEffect(() => {
    if (page === 0) {
      handleGetData();
    } else {
      setPage(0);
    }
  }, [props.refresh]);
  const handleCloseTODetail = () => {
    setOpenTransferOutDetail(false);
  };
  const handleCloseTODestroyDetail = () => {
    setOpenTransferOutDestroyDetail(false);
  };
  const handleCloseBDDetail = () => {
    setOpenBDDetail(false);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  const handleCloseModalError = () => {
    setOpenModalError(false);
  };
  function handleCloseModalCheckOrderDetail() {
    setOpenCheckOrderDetail(false);
  }
  const handleCloseDetailDestroyDiscount = () => {
    setOpenDetailDestroyDiscount(false);
  };

  const handleGetData = async () => {
    try {
      setOpenLoadingModal(true);
      const rs = await getNotificationReminders(page);
      if (rs && rs != 204) {
        if (rs.data) {
          setListData(rs.data);
          setTotal(rs.total);
        } else {
          setListData([]);
          setTotal(0);
        }
      }
      setOpenLoadingModal(false);
    } catch (error) {
      setOpenLoadingModal(false);
    }
  };
  const currentlySelected = async (item: any) => {
    try {
      setOpenLoadingModal(true);
      handleUpdateRead(item.id);
      if (
        item.type === "REJECT_TRANSFER_OUT" ||
        item.type === "CLOSE_TRANSFER_OUT"
      ) {
        if (item.payload.type === TO_TYPE.TO_ACTIVITY) {
          const rs = await dispatch(getTransferOutDetail(item.documentNumber));
          if (!!rs.payload) {
            setOpenTransferOutDetail(true);
          } else {
            setOpenModalError(true);
          }
        } else if (item.payload.type === TO_TYPE.TO_WITH_DISCOUNT) {
          const rs = await dispatch(getTransferOutDetail(item.documentNumber));
          if (!!rs.payload) {
            setOpenDetailDestroyDiscount(true);
          } else {
            setOpenModalError(true);
          }
        } else if (
          item.payload.type === TO_TYPE.TO_WITHOUT_DISCOUNT ||
          item.payload.type === TO_TYPE.TO_DEFECT
        ) {
          const rs = await dispatch(getTransferOutDetail(item.documentNumber));
          if (!!rs.payload) {
            setOpenTransferOutDestroyDetail(true);
          } else {
            setOpenModalError(true);
          }
        }
      } else if (
        item.type === "REJECT_BARCODE" ||
        item.type === "APPROVE_BARCODE" ||
        item.type == "PRINT_BARCODE"
      ) {
        const rs = await dispatch(
          getBarcodeDiscountDetail(item.payload.documentNumber),
        );
        if (!!rs.payload) {
          setOpenBDDetail(true);
        } else {
          setOpenModalError(true);
        }
      } else if (item.type === "ORDER_SD_CLOSED") {
        const rs = await dispatch(featchOrderDetailAsync(item?.payload?.sdNo));
        if (!!rs.payload) {
          setOrderDetailParams({
            sdNo: item?.payload?.sdNo,
            docRefNo: item?.payload?.docRefNo,
            docType: item?.payload?.docType,
          });
          setOpenCheckOrderDetail(true);
        } else {
          setOpenModalError(true);
        }
      } else if (item.type === "STOCK_TRANSFER_APPROVED") {
        await dispatch(updateAddItemsState({}));
        await dispatch(updatestockRequestItemsState({}));
        const rs = await dispatch(
          featchStockRequestDetailAsync(item.payload.rtNo),
        );
        if (!!rs.payload) {
          setOpenStockRequestDetail(true);
        } else {
          setOpenModalError(true);
        }
      }
      setOpenLoadingModal(false);
    } catch (error) {
      console.log(error);
      setOpenLoadingModal(false);
    }
  };
  const handleUpdateRead = async (id: string) => {
    await updateNotificationItem(id);
    const rs = await getNotificationReminders(page);
    if (rs) {
      if (rs.data !== null) {
        setListData(rs.data);
        setTotal(rs.total);
      } else {
        setListData([]);
        setTotal(0);
      }
    }
  };
  const genStatusValue = (statusLabel: any, styleCustom: any) => {
    return (
      <HtmlTooltip title={<React.Fragment>{statusLabel}</React.Fragment>}>
        <Typography className={classes.MLabelBDStatus} sx={styleCustom}>
          {statusLabel}
        </Typography>
      </HtmlTooltip>
    );
  };

  const listTask = listData.map((item: any, index: number) => {
    let content, statusDisplay, branchCode;
    let periodContent = "กำหนดดำเนินการ";
    switch (item.type) {
      case "REJECT_BARCODE":
        {
          content = "ส่วนลดสินค้า";
          branchCode = item.payload.branchCode;
          statusDisplay = genStatusValue("ไม่อนุมัติ", {
            color: "#F76C6C",
            backgroundColor: "#FFD7D7",
          });
        }

        break;
      case "APPROVE_BARCODE":
        content = "ส่วนลดสินค้า";
        branchCode = item.payload.branchCode;
        statusDisplay = genStatusValue("อนุมัติ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "PRINT_BARCODE":
        content = "ส่วนลดสินค้า";
        periodContent = `พิมพ์ครั้งที่ ${item.documentNumber.split("_")[1]}`;
        branchCode = item.payload.branchCode;
        statusDisplay = genStatusValue("พิมพ์บาร์โค้ดแล้ว", {
          color: "#676767",
          backgroundColor: "#EAEBEB",
        });
        break;
      case "CLOSE_TRANSFER_OUT":
        {
          content = item.payload.type === 1 ? "เบิกทำกิจกรรม" : "เบิกทำลาย";
          branchCode = item.payload.branchCode;
          statusDisplay = genStatusValue("ปิดงาน", {
            color: "#676767",
            backgroundColor: "#EAEBEB",
          });
        }

        break;
      case "REJECT_TRANSFER_OUT":
        {
          content = item.payload.type === 1 ? "เบิกทำกิจกรรม" : "เบิกทำลาย";
          branchCode = item.payload.branchCode;
          statusDisplay = genStatusValue("ไม่อนุมัติ", {
            color: "#F76C6C",
            backgroundColor: "#FFD7D7",
          });
        }

        break;
      case "ORDER_SD_CLOSED":
        {
          content = "รับสินค้า-โอนลอย";
          branchCode = item.payload.branchCode;
          statusDisplay = genStatusValue("รับทราบ", {
            color: "#36C690",
            backgroundColor: "#E7FFE9",
          });
        }

        break;
      case "EVENT_REQUEST_GENERATE_ORDER_SHIPMENT_ORDER_TOTE":
        {
          content = "โอนสินค้าระหว่างสาขา - อยู่ระหว่างขนส่ง";
          branchCode = item.payload.branchCode;
          statusDisplay = genStatusValue("รับทราบ", {
            color: "#36C690",
            backgroundColor: "#E7FFE9",
          });
        }

        break;
      case "STOCK_TRANSFER_APPROVED":
        {
          content = "สร้างแผนโอนระหว่างสาขา-อนุมัติ";
          branchCode = item.payload.branchCode;
          statusDisplay = genStatusValue("อนุมัติ", {
            color: "#36C690",
            backgroundColor: "#E7FFE9",
          });
        }

        break;
    }
    return (
      <Box
        key={index}
        sx={{
          borderTop: "2px solid #EAEBEB",
          minHeight: "60px",
          backgroundColor: "#F6FFF3",
          minWidth: "600px",
          cursor: "pointer",
          fontSize: "12px",
        }}
        onClick={() => currentlySelected(item)}
      >
        <Box sx={{ display: "flex", justifyContent: "start" }}>
          {item.type == "REJECT_BARCODE" ||
          item.type == "APPROVE_BARCODE" ||
          item.type == "PRINT_BARCODE" ? (
            <ShoppingCartSharp
              sx={{
                color: theme.palette.primary.main,
                fontSize: "20px",
                mt: 1.5,
                ml: 1,
              }}
            />
          ) : (
            <PresentToAllIcon
              sx={{
                color: theme.palette.primary.main,
                fontSize: "20px",
                mt: 1.5,
                ml: 1,
              }}
            />
          )}
          <Box
            sx={{
              mt: 1,
              ml: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "80%",
            }}
          >
            <span style={{ color: theme.palette.primary.main }}>
              {content}:{" "}
            </span>
            <HtmlTooltip
              title={
                <React.Fragment>
                  {item.type == "PRINT_BARCODE"
                    ? item.payload.documentNumber
                    : item.documentNumber}{" "}
                  | {branchCode}-{getBranchName(branchList, branchCode)}
                </React.Fragment>
              }
            >
              <span style={{ marginLeft: 5 }}>
                {item.type == "PRINT_BARCODE"
                  ? item.payload.documentNumber
                  : item.documentNumber}{" "}
                | {branchCode}-{getBranchName(branchList, branchCode)}
              </span>
            </HtmlTooltip>
            <Box>
              <Typography
                style={{ color: theme.palette.grey[500], fontSize: "11px" }}
              >
                {periodContent}{" "}
                {moment(item.createdDate)
                  .add(543, "y")
                  .format(DateFormat.DATE_FORMAT)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right", mt: "6px", pr: 2.5 }}>
            {statusDisplay}
          </Box>
        </Box>
      </Box>
    );
  });
  return (
    <>
      <Card
        sx={{
          height: "100%",
          border: "1px solid #E0E0E0",
          borderRadius: "10px",
          minWidth: "600px",
        }}
      >
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={10}
          rowsPerPageOptions={[]}
          sx={{ height: "40px", overflow: "hidden" }}
        />
        <CardContent
          className={classes.MScrollBar}
          sx={{ height: "97%", overflowY: "auto" }}
        >
          {listTask}
        </CardContent>
      </Card>
      {openBDDetail && (
        <ModalCreateBarcodeDiscount
          isOpen={openBDDetail}
          onClickClose={handleCloseBDDetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onSearchBD={handleGetData}
          userPermission={userPermission}
        />
      )}
      {openTransferOutDestroyDetail && (
        <ModalCreateTransferOutDestroy
          isOpen={openTransferOutDestroyDetail}
          onClickClose={handleCloseTODestroyDetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onSearchMain={handleGetData}
          userPermission={userPermission}
        />
      )}
      {openTransferOutDetail && (
        <ModalCreateTransferOut
          isOpen={openTransferOutDetail}
          onClickClose={handleCloseTODetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onSearchMain={handleGetData}
          userPermission={userPermission}
        />
      )}
      {openCheckOrderDetail && (
        <CheckOrderDetail
          sdNo={orderDetailParams.sdNo}
          docRefNo={orderDetailParams.docRefNo}
          docType={orderDetailParams.docType}
          defaultOpen={openCheckOrderDetail}
          onClickClose={handleCloseModalCheckOrderDetail}
        />
      )}
      {openStockRequestDetail && (
        <StockRequestDetail
          type={"View"}
          edit={false}
          isOpen={openStockRequestDetail}
          onClickClose={() => {
            setOpenStockRequestDetail(false);
          }}
        />
      )}
      {openDetailDestroyDiscount && (
        <ModalCreateToDestroyDiscount
          isOpen={openDetailDestroyDiscount}
          onClickClose={handleCloseDetailDestroyDiscount}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onSearchMain={handleGetData}
          userPermission={userPermission}
        />
      )}
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
      <LoadingModal open={openLoadingModal} />
      <AlertError
        open={openModalError}
        onClose={handleCloseModalError}
        textError={"เกิดข้อผิดพลาดระหว่างการดำเนินการ"}
      />
    </>
  );
}
