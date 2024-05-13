import { Card, CardContent, TablePagination, Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect } from "react";
import { useStyles } from "../../styles/makeTheme";
import theme from "../../styles/theme";
import { ShoppingCartSharp } from "@mui/icons-material";
import { Box } from "@mui/system";
import LoadingModal from "../commons/ui/loading-modal";
import STCreateModal from "../sale-limit-time/sale-limit-time-create-modal";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getsaleLimitTimeDetail } from "../../store/slices/sale-limit-time-detail-slice";
import SnackbarStatus from "../commons/ui/snackbar-status";
import {
  getNotificationAnnouncements,
  updateNotificationItem,
} from "../../services/notification";
import { DateFormat } from "../../utils/enum/common-enum";
import AlertError from "../commons/ui/alert-error";

interface Props {
  refresh: boolean;
}

export default function NotificationAnnouncement(props: Props) {
  const [page, setPage] = React.useState<number>(0);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<boolean>(false);
  const [total, setTotal] = React.useState(0);
  const [listData, setListData] = React.useState<any[]>([]);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const [openModalError, setOpenModalError] = React.useState<boolean>(false);
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

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };
  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  const handleCloseModalError = () => {
    setOpenModalError(false);
  };

  const handleGetData = async () => {
    try {
      setOpenLoadingModal(true);
      const rs = await getNotificationAnnouncements(page);
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
      const rs = await dispatch(getsaleLimitTimeDetail(item.payload._id));
      if (!!rs.payload) {
        setOpenDetail(true);
      } else {
        setOpenModalError(true);
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

  const listTask = listData.map((item: any, index: number) => {
    return (
      <>
        <Box
          key={index}
          sx={{
            borderTop: "1px solid #EAEBEB",
            minHeight: "80px",
            cursor: "pointer",
            backgroundColor: item.read ? "transparent" : "#F6FFF3",
            fontSize: "12px",
          }}
          onClick={() => currentlySelected(item)}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "99%",
            }}
          >
            <Box display={"flex"} mt={1} ml={1}>
              <ShoppingCartSharp
                sx={{ color: theme.palette.primary.main, fontSize: "20px" }}
              />
              <span
                style={{ marginLeft: 15, color: theme.palette.primary.main }}
              >
                กำหนด (งด) ขายสินค้า
              </span>
              <span style={{ marginLeft: 5, marginRight: 3 }}>
                : {item.payload.documentNumber}
              </span>{" "}
              {"|"}
            </Box>
            <Box sx={{ textAlign: "right", mt: "3px" }}>
              <Typography
                sx={{
                  backgroundColor: "#E7FFE9",
                  color: "#36C690",
                  textAlign: "center",
                  marginTop: "5px",
                  padding: "2px 15px 3px 15px",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                เริ่มใช้งาน
              </Typography>
            </Box>
          </Box>
          <Box ml={6}>{item.payload.description}</Box>
          <Box ml={6} mt={1}>
            <Typography
              style={{ color: theme.palette.grey[500], fontSize: "11px" }}
            >
              มีผลตั้งแต่{" "}
              {moment(item.payload.stStartTime)
                .add(543, "y")
                .format(DateFormat.DATE_TIME_DISPLAY_FORMAT)}{" "}
              น. -{" "}
              {moment(item.payload.stEndTime).format(
                DateFormat.DATE_TIME_DISPLAY_FORMAT,
              )}{" "}
              น.
            </Typography>
          </Box>
        </Box>
      </>
    );
  });
  return (
    <>
      <Card
        sx={{
          height: "100%",
          border: "1px solid #E0E0E0",
          borderRadius: "10px",
          minWidth: "413px",
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
          sx={{ height: "98%", overflowY: "auto" }}
        >
          {listTask}
        </CardContent>
      </Card>
      {openDetail && (
        <STCreateModal
          type={"Detail"}
          isAdmin={false}
          setOpenPopup={setOpenPopup}
          setPopupMsg={setPopupMsg}
          isOpen={openDetail}
          onClickClose={handleCloseDetail}
          onSearch={handleGetData}
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
