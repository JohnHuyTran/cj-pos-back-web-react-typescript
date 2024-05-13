import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useStyles } from "../../styles/makeTheme";
import { useTranslation } from "react-i18next";
import {
  BarcodeDiscount,
  BarcodeDiscountProductDetail,
  BarcodeDiscountSearchRequest,
  BarcodeDiscountSearchResponse,
} from "../../models/barcode-discount-model";
import { convertUtcToBkkDate } from "../../utils/date-utill";
import { Action, BDStatus, DateFormat } from "../../utils/enum/common-enum";
import {
  genColumnValue,
  numberWithCommas,
  objectNullOrEmpty,
  stringNullOrEmpty,
} from "../../utils/utils";
import HtmlTooltip from "../../components/commons/ui/html-tooltip";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { saveSearchCriteriaSup } from "../../store/slices/save-search-order-supplier-slice";
import { barcodeDiscountSearch } from "../../store/slices/barcode-discount-search-slice";
import ModalCreateBarcodeDiscount from "../../components/barcode-discount/modal-create-barcode-discount";
import { getBarcodeDiscountDetail } from "../../store/slices/barcode-discount-detail-slice";
import SnackbarStatus from "../../components/commons/ui/snackbar-status";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";
import { getUserInfo } from "../../store/sessionStore";
import {
  updateBarcodeDiscountPrintState,
  updatePrintInDetail,
} from "../../store/slices/barcode-discount-print-slice";
import moment from "moment";
import { env } from "../../adapters/environmentConfigs";

const _ = require("lodash");

interface loadingModalState {
  open: boolean;
}

interface StateProps {
  onSearch: () => void;
}

const BarcodeDiscountList: React.FC<StateProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation(["barcodeDiscount"]);
  const [lstBarcodeDiscount, setLstBarcodeDiscount] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({ open: false });
  const [popupMsg, setPopupMsg] = React.useState<string>("");
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);
  const [checkAll, setCheckAll] = React.useState<boolean>(false);

  const dispatch = useAppDispatch();
  const barcodeDiscountSearchSlice = useAppSelector(
    (state) => state.barcodeDiscountSearchSlice,
  );
  const bdSearchResponse: BarcodeDiscountSearchResponse =
    barcodeDiscountSearchSlice.bdSearchResponse;
  const currentPage = useAppSelector(
    (state) => state.barcodeDiscountSearchSlice.bdSearchResponse.page,
  );
  const limit = useAppSelector(
    (state) => state.barcodeDiscountSearchSlice.bdSearchResponse.perPage,
  );
  const [pageSize, setPageSize] = React.useState(limit.toString());
  const payload = useAppSelector(
    (state) => state.barcodeDiscountCriteriaSearchSlice.searchCriteria,
  );
  const [userPermission, setUserPermission] = useState<any[]>([]);
  const printInDetail = useAppSelector(
    (state) => state.barcodeDiscountPrintSlice.inDetail,
  );

  useEffect(() => {
    const lstBarcodeDiscount = bdSearchResponse.data;
    if (lstBarcodeDiscount != null && lstBarcodeDiscount.length > 0) {
      let rows = lstBarcodeDiscount.map(
        (data: BarcodeDiscount, index: number) => {
          return {
            ...data,
            checked: false,
            id: data.id,
            index: (currentPage - 1) * parseInt(pageSize) + index + 1,
            documentNumber: data.documentNumber,
            status: genStatusIncludeExpiredCase(data),
            totalAmount: data.products.length,
            unit: t("list"),
            sumOfPrice: genTotalPrice(data.products),
            sumOfCashDiscount: genTotalCashDiscount(
              data.percentDiscount,
              data.products,
            ),
            sumOfPriceAfterDiscount: genTotalPriceAfterDiscount(
              data.percentDiscount,
              data.products,
            ),
            branch: stringNullOrEmpty(data.branchCode)
              ? stringNullOrEmpty(data.branchName)
                ? ""
                : data.branchName
              : data.branchCode +
                " - " +
                (stringNullOrEmpty(data.branchName) ? "" : data.branchName),
            createdDate: convertUtcToBkkDate(
              data.createdDate,
              DateFormat.DATE_FORMAT,
            ),
            approvedDate: stringNullOrEmpty(data.approvedDate)
              ? ""
              : convertUtcToBkkDate(data.approvedDate, DateFormat.DATE_FORMAT),
            requesterNote: stringNullOrEmpty(data.requesterNote)
              ? ""
              : data.requesterNote,
            products: data.products,
          };
        },
      );
      setLstBarcodeDiscount(rows);
      setCheckAll(false);
      //permission
      const userInfo: KeyCloakTokenInfo = getUserInfo();
      if (!objectNullOrEmpty(userInfo) && !objectNullOrEmpty(userInfo.acl)) {
        setUserPermission(
          userInfo.acl["service.posback-campaign"] != null &&
            userInfo.acl["service.posback-campaign"].length > 0
            ? userInfo.acl["service.posback-campaign"]
            : [],
        );
      }
    }
  }, [bdSearchResponse]);

  useEffect(() => {
    handleUpdateBarcodeDiscountPrint(false);
  }, [lstBarcodeDiscount]);

  const genStatusIncludeExpiredCase = (rowData: any) => {
    let status = rowData.status;
    if (
      rowData.products &&
      rowData.products.length > 0 &&
      (Number(BDStatus.APPROVED) == rowData.status ||
        Number(BDStatus.BARCODE_PRINTED) == rowData.status)
    ) {
      let productPassValidation = rowData.products.filter(
        (itPro: any) =>
          itPro.numberOfApproved > 0 &&
          !stringNullOrEmpty(itPro.expiredDate) &&
          moment(itPro.expiredDate).isSameOrAfter(moment(new Date()), "day"),
      );
      if (productPassValidation.length === 0) {
        status = Number(BDStatus.ALREADY_EXPIRED);
      }
    }
    return status;
  };

  const handleUpdateBarcodeDiscountPrint = (closeDetail: boolean) => {
    if (!printInDetail || closeDetail) {
      let lstBarcodeDiscountData = _.cloneDeep(lstBarcodeDiscount);
      let lstBarcodeDiscountChecked = lstBarcodeDiscountData.filter(
        (it: any) => it.checked,
      );
      dispatch(updateBarcodeDiscountPrintState(lstBarcodeDiscountChecked));
      dispatch(updatePrintInDetail(false));
    }
  };

  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    handleUpdateBarcodeDiscountPrint(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const onCheckCell = async (params: GridRenderCellParams, event: any) => {
    await setLstBarcodeDiscount((prevData: any[]) => {
      return prevData.map((d: any) => {
        if (!params.row?.id || d?.id !== params.row?.id) return d;
        return {
          ...d,
          checked: event?.target?.checked,
        };
      });
    });
    let lstUnCheck = lstBarcodeDiscount.filter(
      (it) => !it.checked && BDStatus.APPROVED == it.status,
    );
    if (lstUnCheck != null && lstUnCheck.length > 0) setCheckAll(false);
    else setCheckAll(true);
  };

  const onCheckAll = async (event: any) => {
    setCheckAll(event.target.checked);
    let lstBarcodeDiscountHandle = _.cloneDeep(lstBarcodeDiscount);
    for (let item of lstBarcodeDiscountHandle) {
      if (BDStatus.APPROVED == item.status) {
        item.checked = event.target.checked;
      }
    }
    setLstBarcodeDiscount(lstBarcodeDiscountHandle);
  };

  const renderCell = (value: any) => {
    return (
      <HtmlTooltip title={<React.Fragment>{value}</React.Fragment>}>
        <Typography variant="body2" noWrap>
          {value}
        </Typography>
      </HtmlTooltip>
    );
  };

  const addTwoDecimalPlaces = (value: any) => {
    if (stringNullOrEmpty(value)) return "0.00";
    else return value.toFixed(2);
  };

  const onDisabledCheckAll = () => {
    let disabled = true;
    if (lstBarcodeDiscount != null && lstBarcodeDiscount.length > 0) {
      let lstBarcodeDiscountApproved = lstBarcodeDiscount.filter(
        (it) => BDStatus.APPROVED == it.status,
      );
      disabled =
        lstBarcodeDiscountApproved == null ||
        lstBarcodeDiscountApproved.length == 0;
    }
    return disabled;
  };

  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: t("numberOrder"),
      width: 100,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderHeader: (params) => (
        <FormControl component="fieldset" sx={{ marginLeft: "-15px" }}>
          <FormGroup aria-label="position" row>
            <FormControlLabel
              className={classes.MFormControlLabel}
              value="top"
              control={
                <Checkbox
                  checked={checkAll}
                  onClick={onCheckAll.bind(this)}
                  disabled={onDisabledCheckAll()}
                />
              }
              label={t("selectAll")}
              labelPlacement="top"
            />
          </FormGroup>
        </FormControl>
      ),
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(params.value)}
          disabled={BDStatus.APPROVED != params.row.status}
          onClick={onCheckCell.bind(this, params)}
        />
      ),
    },
    {
      field: "index",
      headerName: t("numberOrder"),
      headerAlign: "center",
      sortable: false,
      minWidth: 80,
      width: 80,
      renderCell: (params) => (
        <Box component="div" sx={{ paddingLeft: "20px" }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: "documentNumber",
      headerName: t("bdDocumentNumber"),
      headerAlign: "center",
      sortable: false,
      minWidth: 170,
    },
    {
      field: "status",
      headerName: t("status"),
      headerAlign: "center",
      align: "center",
      sortable: false,
      minWidth: 140,
      renderCell: (params) => genRowStatus(params),
    },
    {
      field: "totalAmount",
      headerName: t("totalAmount"),
      headerAlign: "center",
      align: "right",
      sortable: false,
      minWidth: 120,
      width: 120,
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" textAlign={"center"} noWrap>
              <b>{"จำนวน"}</b>
            </Typography>
            <Typography variant="body2" textAlign={"center"} noWrap>
              <b>{" (รายการ)"}</b>
            </Typography>
          </div>
        );
      },
    },
    {
      field: "sumOfPrice",
      headerName: t("sumOfPrice"),
      headerAlign: "center",
      align: "right",
      sortable: false,
      minWidth: 135,
      renderCell: (params) =>
        renderCell(numberWithCommas(addTwoDecimalPlaces(params.value))),
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" textAlign={"center"} noWrap>
              <b>{t("headerName.price")}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>
                {t("headerName.total")}
                {env.currency && ` (${env.currency})`}
              </b>
            </Typography>
          </div>
        );
      },
    },
    {
      field: "sumOfCashDiscount",
      headerName: t("sumOfCashDiscount"),
      headerAlign: "center",
      align: "right",
      sortable: false,
      minWidth: 135,
      renderCell: (params) =>
        renderCell(numberWithCommas(addTwoDecimalPlaces(params.value))),
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" textAlign={"center"} noWrap>
              <b>{t("headerName.discount")}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>
                {t("headerName.total")}
                {env.currency && ` (${env.currency})`}
              </b>
            </Typography>
          </div>
        );
      },
    },
    {
      field: "sumOfPriceAfterDiscount",
      headerName: t("sumOfPriceAfterDiscount"),
      headerAlign: "center",
      align: "right",
      sortable: false,
      minWidth: 135,
      renderCell: (params) =>
        renderCell(numberWithCommas(addTwoDecimalPlaces(params.value))),
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" textAlign={"center"} noWrap>
              <b>{t("headerName.priceAfterDiscount")}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>
                {t("headerName.total")}
                {env.currency && ` (${env.currency})`}
              </b>
            </Typography>
          </div>
        );
      },
    },
    {
      field: "branch",
      headerName: t("branch"),
      headerAlign: "center",
      sortable: false,
      minWidth: 150,
      renderCell: (params) => renderCell(params.value),
    },
    {
      field: "createdDate",
      headerName: t("createDate"),
      headerAlign: "center",
      align: "center",
      minWidth: 100,
      sortable: false,
      renderHeader: (params) => {
        return (
          <div style={{ color: "#36C690" }}>
            <Typography variant="body2" noWrap>
              <b>{t("headerName.requestedDate")}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              <b>{t("headerName.discount")}</b>
            </Typography>
          </div>
        );
      },
    },
    {
      field: "approvedDate",
      headerName: t("approvedDate"),
      headerAlign: "center",
      align: "center",
      sortable: false,
      minWidth: 100,
    },
    {
      field: "requesterNote",
      headerName: t("remark"),
      headerAlign: "center",
      sortable: false,
      minWidth: 110,
      renderCell: (params) => renderCell(params.value),
    },
  ];
  const genRowStatus = (params: GridValueGetterParams) => {
    let statusDisplay;
    let status = params.value ? params.value.toString() : "";
    let statusLabel = genColumnValue(
      "label",
      "value",
      status,
      t("lstStatus", { returnObjects: true }),
    );
    switch (status) {
      case BDStatus.DRAFT:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#FBA600",
          backgroundColor: "#FFF0CA",
        });
        break;
      case BDStatus.WAIT_FOR_APPROVAL:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#FBA600",
          backgroundColor: "#FFF0CA",
        });
        break;
      case BDStatus.APPROVED:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#20AE79",
          backgroundColor: "#E7FFE9",
        });
        break;
      case BDStatus.BARCODE_PRINTED:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#4465CD",
          backgroundColor: "#C8E8FF",
        });
        break;
      case BDStatus.REJECT:
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#F54949",
          backgroundColor: "#FFD7D7",
        });
        break;
      case BDStatus.ALREADY_EXPIRED:
        statusLabel = "สินค้าหมดอายุ";
        statusDisplay = genRowStatusValue(statusLabel, {
          color: "#F54949",
          backgroundColor: "#FFD7D7",
        });
        break;
    }
    return statusDisplay;
  };

  const genRowStatusValue = (statusLabel: string, styleCustom: any) => {
    return (
      <HtmlTooltip title={<React.Fragment>{statusLabel}</React.Fragment>}>
        <Typography className={classes.MLabelBDStatus} sx={styleCustom}>
          {statusLabel}
        </Typography>
      </HtmlTooltip>
    );
  };

  const genTotalPrice = (products: BarcodeDiscountProductDetail[]) => {
    return _.sumBy(products, (item: BarcodeDiscountProductDetail) => {
      if (
        stringNullOrEmpty(item.price) ||
        stringNullOrEmpty(item.numberOfDiscounted)
      ) {
        return 0;
      }
      return item.price * item.numberOfDiscounted;
    });
  };

  const genTotalCashDiscount = (
    percentDiscount: boolean,
    products: BarcodeDiscountProductDetail[],
  ) => {
    return _.sumBy(products, (item: BarcodeDiscountProductDetail) => {
      if (
        stringNullOrEmpty(item.price) ||
        stringNullOrEmpty(item.requestedDiscount) ||
        stringNullOrEmpty(item.numberOfDiscounted)
      ) {
        return 0;
      }
      if (percentDiscount)
        return (
          Math.trunc((item.price * item.requestedDiscount) / 100) *
          item.numberOfDiscounted
        );
      else return item.requestedDiscount * item.numberOfDiscounted;
    });
  };

  const genTotalPriceAfterDiscount = (
    percentDiscount: boolean,
    products: BarcodeDiscountProductDetail[],
  ) => {
    let totalPriceAfterDiscount =
      genTotalPrice(products) - genTotalCashDiscount(percentDiscount, products);
    return totalPriceAfterDiscount < 0 ? 0 : totalPriceAfterDiscount;
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    let page: string = (newPage + 1).toString();

    const payloadNewPage: BarcodeDiscountSearchRequest = {
      perPage: pageSize,
      page: page,
      query: payload.query,
      branch: payload.branch,
      status: payload.status,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };

    await dispatch(barcodeDiscountSearch(payloadNewPage));
    await dispatch(saveSearchCriteriaSup(payloadNewPage));
    setLoading(false);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize.toString());
    setLoading(true);
    const payloadNewPage: BarcodeDiscountSearchRequest = {
      perPage: pageSize.toString(),
      page: "1",
      query: payload.query,
      branch: payload.branch,
      status: payload.status,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };

    await dispatch(barcodeDiscountSearch(payloadNewPage));
    await dispatch(saveSearchCriteriaSup(payloadNewPage));
    setLoading(false);
  };

  const barcodeDiscountDetail = useAppSelector(
    (state) => state.barcodeDiscountDetailSlice.barcodeDiscountDetail,
  );
  const currentlySelected = async (params: GridCellParams) => {
    const chkPN = params.colDef.field;
    handleOpenLoading("open", true);
    if (chkPN !== "checked") {
      try {
        await dispatch(getBarcodeDiscountDetail(params.row.documentNumber));
        if (
          barcodeDiscountDetail.data.length > 0 ||
          barcodeDiscountDetail.data
        ) {
          setOpenDetail(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
    handleOpenLoading("open", false);
  };

  return (
    <div>
      <Box mt={2} bgcolor="background.paper">
        <div
          className={classes.MdataGridPaginationTop}
          style={{ height: lstBarcodeDiscount.length >= 10 ? "60vh" : "auto" }}
        >
          <DataGrid
            rows={lstBarcodeDiscount}
            columns={columns}
            disableColumnMenu
            hideFooterSelectedRowCount={true}
            onCellClick={currentlySelected}
            autoHeight={lstBarcodeDiscount.length < 10}
            scrollbarSize={10}
            pagination
            page={currentPage - 1}
            pageSize={parseInt(pageSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            rowCount={bdSearchResponse.total}
            paginationMode="server"
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            rowHeight={45}
          />
        </div>
      </Box>
      {openDetail && (
        <ModalCreateBarcodeDiscount
          isOpen={openDetail}
          onClickClose={handleCloseDetail}
          action={Action.UPDATE}
          setPopupMsg={setPopupMsg}
          setOpenPopup={setOpenPopup}
          onSearchBD={props.onSearch}
          userPermission={userPermission}
        />
      )}
      <SnackbarStatus
        open={openPopup}
        onClose={handleClosePopup}
        isSuccess={true}
        contentMsg={popupMsg}
      />
    </div>
  );
};

export default BarcodeDiscountList;
