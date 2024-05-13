import {
  Card,
  CardContent,
  Grid,
  TablePagination,
  Typography,
} from "@mui/material";
import moment from "moment";
import React, { useEffect } from "react";
import { useStyles } from "../../styles/makeTheme";
import theme from "../../styles/theme";
import PresentToAllIcon from "@mui/icons-material/PresentToAll";
import { Box } from "@mui/system";
import LoadingModal from "../commons/ui/loading-modal";
import {
  getNotificationTasks,
  updateNotificationItem,
} from "../../services/notification";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getUserInfo } from "../../store/sessionStore";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";
import { getBranchName, objectNullOrEmpty } from "../../utils/utils";
import ModalCreateBarcodeDiscount from "../barcode-discount/modal-create-barcode-discount";
import { Action, DateFormat, TO_TYPE } from "../../utils/enum/common-enum";
import ModalCreateTransferOutDestroy from "../transfer-out-destroy/modal-create-transfer-out-destroy";
import ModalCreateTransferOut from "../transfer-out/modal-create-transfer-out";
import SnackbarStatus from "../commons/ui/snackbar-status";
import { getTransferOutDetail } from "../../store/slices/transfer-out-detail-slice";
import { getBarcodeDiscountDetail } from "../../store/slices/barcode-discount-detail-slice";
import { ShoppingCartSharp } from "@mui/icons-material";
import HtmlTooltip from "../../components/commons/ui/html-tooltip";
import LoyaltyOutlinedIcon from "@mui/icons-material/LoyaltyOutlined";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import StockRequestDetail from "../stock-transfer/stock-request-detail";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { featchOrderDetailAsync } from "../../store/slices/check-order-detail-slice";
import CheckOrderDetail from "../check-orders/check-order-detail";
import DCOrderDetail from "../dc-check-orders/dc-ckeck-order-detail";
import {
  featchorderDetailDCAsync,
  setItemId,
} from "../../store/slices/dc-check-order-detail-slice";
import { featchStockRequestDetailAsync } from "../../store/slices/stock-request-detail-slice";
import { updatestockRequestItemsState } from "../../store/slices/stock-request-items-slice";
import { featchBranchTransferDetailAsync } from "../../store/slices/stock-transfer-branch-request-slice";
import { updateAddItemSkuGroupState } from "../../store/slices/stock-transfer-bt-sku-slice";
import AlertError from "../commons/ui/alert-error";
import { featchTransferReasonsListAsync } from "../../store/slices/transfer-reasons-slice";
import StockTransferBT from "../stock-transfer/branch-transfer/stock-transfer-bt";
import ModalCreateToDestroyDiscount from "../transfer-out-destroy/modal-create-to-destroy-discount";

interface Props {
  refresh: boolean;
}

export default function NotificationTask(props: Props) {
  const [page, setPage] = React.useState(0);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<boolean>(false);
  const [total, setTotal] = React.useState(0);
  const [listData, setListData] = React.useState<any[]>([]);
  const [openTransferOutDetail, setOpenTransferOutDetail] =
    React.useState(false);
  const [openTransferOutDestroyDetail, setOpenTransferOutDestroyDetail] =
    React.useState(false);
  const [openBDDetail, setOpenBDDetail] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openCheckOrderDetal, setOpenCheckOrderDetal] = React.useState(false);
  const [docRefNo, setDocRefNo] = React.useState("");
  const [docType, setDocType] = React.useState("");
  const [sdNo, setSdNo] = React.useState("");
  const [opensDCOrderDetail, setOpensDCOrderDetail] = React.useState(false);
  const [idDC, setidDC] = React.useState("");
  const [openStockRequestDetail, setOpenStockRequestDetail] =
    React.useState(false);
  const [openStockTransferBT, setOpenStockTransferBT] = React.useState(false);
  const dispatch = useAppDispatch();
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
  const [openDetailDestroyDiscount, setOpenDetailDestroyDiscount] =
    React.useState(false);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
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
  const handleCloseModalDetail = () => {
    setOpenBDDetail(false);
    setOpenTransferOutDetail(false);
    setOpenTransferOutDestroyDetail(false);
    setOpenCheckOrderDetal(false);
    setOpensDCOrderDetail(false);
    setOpenStockRequestDetail(false);
    setOpenStockTransferBT(false);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  const handleCloseModalError = () => {
    setOpenModalError(false);
  };
  const handleCloseDetailDestroyDiscount = () => {
    setOpenDetailDestroyDiscount(false);
  };
  const handleGetData = async () => {
    try {
      setOpenLoadingModal(true);
      const rs = await getNotificationTasks(page);
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
        item.type === "SEND_TO_FOR_APPROVAL" ||
        item.type === "APPROVE_TRANSFER_OUT"
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
        item.type === "SEND_BD_FOR_APPROVAL" ||
        item.type === "APPROVE_BARCODE"
      ) {
        const rs = await dispatch(
          getBarcodeDiscountDetail(item.payload.documentNumber),
        );
        if (!!rs.payload) {
          setOpenBDDetail(true);
        } else {
          setOpenModalError(true);
        }
      } else if (
        item.type == "ORDER_NEXT_APPROVE_OC" ||
        item.type == "ORDER_NEXT_APPROVE1"
      ) {
        setSdNo(item.payload.sdNo);
        setDocRefNo(item.documentNumber);
        setDocType(item.payload.docType);

        await dispatch(updateAddItemsState({}));
        const rs = await dispatch(featchOrderDetailAsync(item.payload.sdNo));
        if (!!rs.payload) {
          setOpenCheckOrderDetal(true);
        } else {
          setOpenModalError(true);
        }
      } else if (item.type == "SEND_ORDER_RECEIVE_FOR_VERIFY") {
        setidDC(item.payload._id);
        const rs = await dispatch(featchorderDetailDCAsync(item.payload._id));
        const rs1 = await dispatch(setItemId(item.payload._id));
        if (!!rs.payload && !!rs1.payload) {
          setOpensDCOrderDetail(true);
        } else {
          setOpenModalError(true);
        }
      } else if (
        item.type == "EVENT_STOCK_REQUEST_REJECTED" ||
        item.type == "EVENT_REQUEST_UPDATE_RT_DOC" ||
        item.type == "SUBMIT_BRANCH_TRANSFER_REQUEST"
      ) {
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
        setOpenStockRequestDetail(true);
      } else if (
        item.type == "STOCK_TRANSFER_CREATED" ||
        item.type == "EVENT_REQUEST_UPDATE_BT_DOC"
      ) {
        // const reasonsList = useAppSelector((state) => state.transferReasonsList.reasonsList.data);
        await dispatch(updateAddItemsState({}));
        const rs = await dispatch(
          featchBranchTransferDetailAsync(item.documentNumber),
        );
        if (!!rs.payload) {
          setOpenStockTransferBT(true);
        } else {
          setOpenModalError(true);
        }
        dispatch(updateAddItemSkuGroupState([]));
        setOpenStockTransferBT(true);
      }
      setOpenLoadingModal(false);
    } catch (error) {
      console.log(error);
      setOpenLoadingModal(false);
    }
  };

  const handleUpdateRead = async (id: string) => {
    let newList = listData.map((el: any) => {
      if (el.id === id) {
        el.read = true;
        return el;
      } else return el;
    });
    setListData(newList);
    await updateNotificationItem(id);
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
    let itemType = item.type;
    switch (itemType) {
      case "SEND_BD_FOR_APPROVAL":
        branchCode = item.payload.branchCode;
        content = "ส่วนลดสินค้า";
        statusDisplay = genStatusValue("รออนุมัติ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "APPROVE_BARCODE":
        content = "ส่วนลดสินค้า";
        branchCode = item.payload.branchCode;
        statusDisplay = genStatusValue("อนุมัติ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "SEND_TO_FOR_APPROVAL":
        content = item.payload.type === 1 ? "เบิกทำกิจกรรม" : "เบิกทำลาย";
        branchCode = item.payload.branchCode;
        statusDisplay = genStatusValue("รออนุมัติ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "APPROVE_TRANSFER_OUT":
        content = item.payload.type === 1 ? "เบิกทำกิจกรรม" : "เบิกทำลาย";
        branchCode = item.payload.branchCode;
        statusDisplay = genStatusValue("อนุมัติ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "ORDER_NEXT_APPROVE1":
        content = "รับสินค้า-น้อยกว่าเปอร์เซ็นต์ที่กำหนด";
        branchCode = item.payload.shipBranchTo;
        statusDisplay = genStatusValue("รออนุมัติ1", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "ORDER_NEXT_APPROVE_OC":
        content = "รับสินค้า";
        branchCode = item.payload.shipBranchTo;
        statusDisplay = genStatusValue("อนุมัติ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "SEND_ORDER_RECEIVE_FOR_VERIFY":
        content = "ยืนยันผลต่างการรับสินค้า";
        branchCode = item.payload.shipBranchTo;
        statusDisplay = genStatusValue("รอการตรวจสอบ", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "SUBMIT_BRANCH_TRANSFER_REQUEST":
        content = "สร้างแผนโอนสินค้าระหว่างสาขา";
        branchCode = item.payload.branchFrom;
        statusDisplay = genStatusValue("รออนุมัติ1", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "EVENT_REQUEST_UPDATE_RT_DOC":
        content = "สร้างแผนโอนสินค้าระหว่างสาขา";
        branchCode = item.payload.branchFrom;
        if (item.payload.status == "WAIT_FOR_APPROVAL_1") {
          statusDisplay = genStatusValue("รออนุมัติ1", {
            color: "#36C690",
            backgroundColor: "#E7FFE9",
          });
        } else if (item.payload.status == "WAIT_FOR_APPROVAL_2") {
          statusDisplay = genStatusValue("รออนุมัติ2", {
            color: "#36C690",
            backgroundColor: "#E7FFE9",
          });
        } else if (item.payload.status == "CANCELED") {
          statusDisplay = genStatusValue("ส่งกลับแก้ไข", {
            color: "#F54949",
            backgroundColor: "#FFD7D7",
          });
        }
        break;
      case "EVENT_STOCK_REQUEST_REJECTED":
        content = "สร้างแผนโอนสินค้าระหว่างสาขา";
        branchCode = item.payload.branchFrom;
        statusDisplay = genStatusValue("ส่งกลับแก้ไข", {
          color: "#F54949",
          backgroundColor: "#FFD7D7",
        });
        break;
      case "STOCK_TRANSFER_CREATED":
        content = "โอนสินค้าระหว่างสาขา-จัดเตรียมสินค้า";
        branchCode = item.payload.branchFrom;
        statusDisplay = genStatusValue("บันทึก", {
          color: "#36C690",
          backgroundColor: "#E7FFE9",
        });
        break;
      case "EVENT_REQUEST_UPDATE_BT_DOC":
        branchCode = item.payload.branchFrom;
        if (item.payload.status == "READY_TO_TRANSFER") {
          content = "โอนสินค้าระหว่างสาขา-กำหนดรอบรถ";
          statusDisplay = genStatusValue("ส่งงานให้ DC", {
            color: "#36C690",
            backgroundColor: "#E7FFE9",
          });
        } else if (item.payload.status == "WAIT_FOR_PICKUP") {
          content = "โอนสินค้าระหว่างสาขา - รอขนส่งมารับสินค้า";
          statusDisplay = genStatusValue("รอขนส่งมารับสินค้า", {
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
          borderTop: "1px solid #EAEBEB",
          minHeight: "60px",
          minWidth: "600px",
          cursor: "pointer",
          backgroundColor: item.read ? "transparent" : "#F6FFF3",
          fontSize: "12px",
        }}
        onClick={() => currentlySelected(item)}
      >
        <Box sx={{ display: "flex", justifyContent: "start" }}>
          {item.type === "SEND_BD_FOR_APPROVAL" ||
          item.type === "APPROVE_BARCODE" ? (
            <ShoppingCartSharp
              sx={{
                color: theme.palette.primary.main,
                fontSize: "20px",
                mt: 1.5,
                ml: 1,
              }}
            />
          ) : item.type === "APPROVE_TRANSFER_OUT" ||
            item.type === "SEND_TO_FOR_APPROVAL" ? (
            <PresentToAllIcon
              sx={{
                color: theme.palette.primary.main,
                fontSize: "20px",
                mt: 1.5,
                ml: 1,
              }}
            />
          ) : item.type == "SEND_ORDER_RECEIVE_FOR_VERIFY" ||
            item.type == "ORDER_NEXT_APPROVE_OC" ||
            item.type == "ORDER_NEXT_APPROVE1" ? (
            <LoyaltyOutlinedIcon
              sx={{
                color: theme.palette.primary.main,
                fontSize: "20px",
                mt: 1.5,
                ml: 1,
              }}
            />
          ) : (
            <SwapHorizontalCircleIcon
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
                  {item.documentNumber} | {branchCode}-
                  {getBranchName(branchList, branchCode)}
                </React.Fragment>
              }
            >
              <span style={{ marginLeft: 5 }}>
                {item.documentNumber} | {branchCode}-
                {getBranchName(branchList, branchCode)}
              </span>
            </HtmlTooltip>

            <Box>
              <Typography
                style={{ color: theme.palette.grey[500], fontSize: "11px" }}
              >
                กำหนดดำเนินการ{" "}
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
          sx={{ height: "97%", overflowY: "auto", mb: 1 }}
        >
          {listTask}
        </CardContent>
      </Card>
      {openBDDetail && (
        <ModalCreateBarcodeDiscount
          isOpen={openBDDetail}
          onClickClose={handleCloseModalDetail}
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
          onClickClose={handleCloseModalDetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onSearchMain={handleGetData}
          userPermission={userPermission}
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
      {openTransferOutDetail && (
        <ModalCreateTransferOut
          isOpen={openTransferOutDetail}
          onClickClose={handleCloseModalDetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onSearchMain={handleGetData}
          userPermission={userPermission}
        />
      )}
      {openCheckOrderDetal && (
        <CheckOrderDetail
          sdNo={sdNo}
          docRefNo={docRefNo}
          docType={docType}
          defaultOpen={openCheckOrderDetal}
          onClickClose={handleCloseModalDetail}
        />
      )}
      {opensDCOrderDetail && (
        <DCOrderDetail
          idDC={idDC}
          isOpen={opensDCOrderDetail}
          onClickClose={handleCloseModalDetail}
        />
      )}
      {openStockRequestDetail && (
        <StockRequestDetail
          type={"View"}
          edit={true}
          isOpen={openStockRequestDetail}
          onClickClose={handleCloseModalDetail}
        />
      )}
      {openStockTransferBT && (
        <StockTransferBT isOpen={true} onClickClose={handleCloseModalDetail} />
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
