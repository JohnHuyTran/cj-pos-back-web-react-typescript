import React, { ReactElement, useEffect } from "react";
import moment from "moment";
import { useAppSelector } from "../../store/store";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  DialogTitle,
  Grid,
  IconButton,
  Input,
  TextField,
} from "@mui/material";
import { ControlPoint, HighlightOff, Tune } from "@mui/icons-material";
import SaveIcon from "@mui/icons-material/Save";

import { useStyles } from "../../styles/makeTheme";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { useAppDispatch } from "../../store/store";
import SnackbarStatus from "../commons/ui/snackbar-status";
import LoadingModal from "../commons/ui/loading-modal";
import AlertError from "../commons/ui/alert-error";
import ConfirmModelExit from "../commons/ui/confirm-exit-model";
import StepperBar from "./steppers";
import SearchBranch from "../commons/ui/search-branch";
import ImportAppIcon from "@mui/icons-material/ExitToApp";
import STProductTypeItems from "./ST-product-type-item";
import STProductItems from "./ST-product-item";
// import ModalAddTypeProduct from '../commons/ui/modal-add-type-product';
import ModalAddTypeProducts from "../commons/ui/modal-add-type-products";
import { updateAddTypeAndProductState } from "../../store/slices/add-type-product-slice";
import {
  fetchTotalBranch,
  updateExcludeSelectBranches,
  updatePayloadBranches,
} from "../../store/slices/search-branches-province-slice";
import TextBoxComment from "../commons/ui/textbox-comment";
import {
  cancelST,
  getStartSaleLimitTime,
  saveDraftST,
  importST,
} from "../../services/sale-limit-time";
import { DateFormat } from "../../utils/enum/common-enum";
import {
  setCheckEdit,
  setProductList,
  updatesaleLimitTimeState,
} from "../../store/slices/sale-limit-time-slice";
import ModelConfirm from "./modal-confirm";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DatePickerComponent from "./date-picker-detail";
import { objectNullOrEmpty } from "../../utils/utils";
import ModalConfirmCopy from "./modalConfirmCopy";
import { getAllProductByType } from "../../services/common";
import { styled } from "@mui/material/styles";
import ModalValidateImport from "./modal-validate-import";
import SelectExcludeBranch from "../commons/ui/modal-select-exclude-branch";
interface State {
  description: string;
  startDate: any | Date | number | string;
  endDate: any | Date | number | string;
  startTime: string | null;
  endTime: string | null;
  comment: string;
  stStartTime: any;
  stEndTime: any;
}

interface Props {
  type: string;
  isAdmin: boolean;
  isOpen: boolean;
  setOpenPopup: (openPopup: boolean) => void;
  setPopupMsg?: any;
  onClickClose: () => void;
  onSearch: () => void;
}
export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}
const _ = require("lodash");

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

function STCreateModal({
  type,
  onSearch,
  isAdmin,
  isOpen,
  onClickClose,
  setOpenPopup,
  setPopupMsg,
}: Props): ReactElement {
  const [open, setOpen] = React.useState(isOpen);
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );
  const payloadBranches = useAppSelector(
    (state) => state.searchBranchProvince.excludeSelectBranch,
  );
  const payLoadSt = useAppSelector((state) => state.saleLimitTime.state);
  const checkEdit = useAppSelector((state) => state.saleLimitTime.checkEdit);
  const [values, setValues] = React.useState<State>({
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: "",
    endTime: "",
    comment: "",
    stStartTime: "",
    stEndTime: "",
  });
  const [checkValue, setCheckValue] = React.useState({
    descriptionError: false,
    startDateError: false,
    endDateError: false,
    startTimeError: "",
    endTimeError: "",
    payloadBranchesError: false,
  });

  const [status, setStatus] = React.useState<number>(0);
  const [createDate, setCreateDate] = React.useState<Date | null>(new Date());
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [remark, setRemark] = React.useState("");
  const [openModalCancel, setOpenModalCancel] = React.useState<boolean>(false);
  const [openModalStart, setOpenModalStart] = React.useState<boolean>(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };
  const [showModalProduct, setShowModalProduct] = React.useState<boolean>(true);
  const [confirmModelExit, setConfirmModelExit] =
    React.useState<boolean>(false);
  const [unSelectAllType, setUnSelectAllType] = React.useState<boolean>(false);
  // detail data
  const saleLimitTimeDetail = useAppSelector(
    (state) => state.saleLimitTimeDetailSlice.saleLimitTimeDetail.data,
  );
  // modal copy
  const [openModalCopy, setOpenModalCopy] = React.useState<boolean>(false);
  const [choiceCopy, setChoiceCopy] = React.useState<boolean>(false);
  //modal vaildate
  const [openModalValidate, setOpenModalValidate] =
    React.useState<boolean>(false);
  const [msgModalValidate, setMsgModalValidate] = React.useState<string>("");
  const [urlModalValidate, setUrlModalValidate] = React.useState<string>("");
  useEffect(() => {
    if (type === "Detail" && !objectNullOrEmpty(saleLimitTimeDetail)) {
      setStatus(saleLimitTimeDetail.status);
      setCreateDate(saleLimitTimeDetail.createdAt);
      dispatch(
        updatesaleLimitTimeState({
          ...payLoadSt,
          id: saleLimitTimeDetail.id,
          documentNumber: saleLimitTimeDetail.documentNumber,
        }),
      );
      setValues({
        ...values,
        description: saleLimitTimeDetail.description,
        comment: saleLimitTimeDetail.remark,
        startDate: moment(saleLimitTimeDetail.stStartTime),
        endDate: moment(saleLimitTimeDetail.stEndTime),
        startTime: moment(saleLimitTimeDetail.stStartTime).format("HH:mm"),
        endTime: moment(saleLimitTimeDetail.stEndTime).format("HH:mm"),
      });
      setRemark(saleLimitTimeDetail.remark);
      let appliedProducts = saleLimitTimeDetail.stDetail.appliedProduct
        .appliedProducts
        ? saleLimitTimeDetail.stDetail.appliedProduct.appliedProducts
        : [];
      let appliedCategories = saleLimitTimeDetail.stDetail.appliedProduct
        .appliedCategories
        ? saleLimitTimeDetail.stDetail.appliedProduct.appliedCategories
        : [];
      let listCategories = appliedCategories.map((item: any) => {
        return {
          productTypeCode: item.code,
          productTypeName: item.name,
          selectedType: 1,
        };
      });
      let listProducts = appliedProducts.map((item: any) => {
        return {
          barcode: item.barcode ? item.barcode : "",
          skuCode: item.skuCode,
          unitName: item.unitName,
          barcodeName: item.name,
          productTypeCode: item.categoryTypeCode,
          selectedType: 2,
          productByType: true,
        };
      });
      dispatch(
        updateAddTypeAndProductState(listProducts.concat(listCategories)),
      );
      dispatch(fetchTotalBranch());
      dispatch(
        updateExcludeSelectBranches({
          isAllBranches: saleLimitTimeDetail.stDetail.isAllBranches,
          appliedBranches: {
            province: saleLimitTimeDetail.stDetail.appliedBranches.province
              ? saleLimitTimeDetail.stDetail.appliedBranches.province
              : [],
            branchList: saleLimitTimeDetail.stDetail.appliedBranches.branchList
              ? saleLimitTimeDetail.stDetail.appliedBranches.branchList
              : [],
            excludedBranchList: saleLimitTimeDetail.stDetail.appliedBranches
              .excludedBranchList
              ? saleLimitTimeDetail.stDetail.appliedBranches.excludedBranchList
              : [],
            excludedProvinceList: saleLimitTimeDetail.stDetail.appliedBranches
              .excludedProvinceList
              ? saleLimitTimeDetail.stDetail.appliedBranches
                  .excludedProvinceList
              : [],
          },
          saved: true,
        }),
      );
    }
  }, [saleLimitTimeDetail]);
  useEffect(() => {
    setShowModalProduct(!!Object.keys(payloadAddTypeProduct).length);
    if (isAdmin && status <= 1) {
      if (!!!Object.keys(payloadAddTypeProduct).length && status === 0) {
        dispatch(setCheckEdit(false));
      }
    }
  }, [payloadAddTypeProduct]);

  useEffect(() => {
    setCheckValue({ ...checkValue, payloadBranchesError: false });
  }, [payloadBranches.saved]);

  useEffect(() => {
    if (values.startDate != null && values.endDate != null) {
      if (values.endDate < values.startDate) {
        setValues({
          ...values,
          endDate: null,
        });
      }
      if (values.startTime != "" && values.endTime != "") {
        let stStartTime = compareDateTime(values.startDate, values.startTime);
        let stEndTime = compareDateTime(values.endDate, values.endTime);
        if (
          stStartTime < moment(new Date(), DateFormat.DATE_TIME_DISPLAY_FORMAT)
        ) {
          if (status <= 1 && isAdmin) {
            setCheckValue({
              ...checkValue,
              startTimeError: "เวลาเริ่มต้นต้องมากกว่าเวลาปัจจุบัน",
            });
          }
        } else if (stStartTime >= stEndTime) {
          if (status <= 1 && isAdmin) {
            setCheckValue({
              ...checkValue,
              endTimeError: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น",
            });
          }
        } else {
          setValues({
            ...values,
            stStartTime: stStartTime,
            stEndTime: stEndTime,
          });
          setCheckValue({
            ...checkValue,
            startTimeError: "",
            endTimeError: "",
          });
        }
      }
    }
  }, [
    values.startDate,
    values.endDate,
    values.startTime,
    values.endTime,
    createDate,
  ]);

  const clearData = async () => {
    dispatch(updatesaleLimitTimeState({}));
    dispatch(updateAddTypeAndProductState([]));
    dispatch(setProductList("รายการสินค้าทั้งหมด"));
    dispatch(
      updateExcludeSelectBranches({
        isAllBranches: null,
        appliedBranches: {
          branchList: [],
          province: [],
          excludedBranchList: [],
          excludedProvinceList: [],
        },
        saved: false,
      }),
    );
  };
  const handleClose = async () => {
    setOpen(false);
    onClickClose();
    clearData();
  };

  const compareDateTime = (date: Date, time: string | null) => {
    let dateAppend = moment(date).format(DateFormat.DATE_FORMAT) + " " + time;
    return moment(dateAppend, DateFormat.DATE_TIME_DISPLAY_FORMAT);
  };

  const topFunction = () => {
    document.getElementById("top-item")?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };

  const handleCheckClose = () => {
    if (checkEdit) {
      setConfirmModelExit(true);
    } else {
      handleClose();
    }
  };

  const handleNotExitModelConfirm = () => {
    setConfirmModelExit(false);
  };

  const handleExitModelConfirm = async () => {
    handleClose();
  };

  const handleChangeDescription = (value: any) => {
    setValues({ ...values, description: value });
    setCheckValue({ ...checkValue, descriptionError: false });
  };

  const handleStartTimePicker = (value: string) => {
    setValues({ ...values, startTime: value });
    setCheckValue({ ...checkValue, startTimeError: "" });
  };

  const handleEndTimePicker = (value: string) => {
    setValues({ ...values, endTime: value });
    setCheckValue({ ...checkValue, endTimeError: "" });
  };

  const handleStartDatePicker = (value: any) => {
    setValues({ ...values, startDate: value });
    setCheckValue({ ...checkValue, startDateError: false });
  };

  const handleEndDatePicker = (value: any) => {
    setValues({ ...values, endDate: value });
    setCheckValue({ ...checkValue, endDateError: false });
  };

  const [openModelAddItems, setOpenModelAddItems] = React.useState(false);
  const handleOpenAddItems = () => {
    setOpenModelAddItems(true);
  };
  const handleCloseModalAddItems = () => {
    setOpenModelAddItems(false);
  };

  const handleChangeRemark = (value: any) => {
    setRemark(value);
  };

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const valiDateData = () => {
    let valiDate: boolean = true;
    let item = { ...checkValue };
    if (values.startDate === null) {
      item.startDateError = true;
      valiDate = false;
    }
    if (values.endDate === null) {
      item.endDateError = true;
      valiDate = false;
    }
    if (values.startTime === "") {
      item.startTimeError = "กรุณาระบุรายละเอียด";
      valiDate = false;
    }
    if (values.endTime === "") {
      item.endTimeError = "กรุณาระบุรายละเอียด";
      valiDate = false;
    }
    if (values.description === "") {
      item.descriptionError = true;
      valiDate = false;
    }
    if (!payloadBranches.saved) {
      item.payloadBranchesError = true;
      valiDate = false;
    }
    if (checkValue.startTimeError != "") valiDate = false;
    if (checkValue.endTimeError != "") valiDate = false;
    setCheckValue(item);
    return valiDate;
  };

  const handleCreateSTDetail = async (getStart: boolean) => {
    if (valiDateData()) {
      try {
        const appliedProduct = {
          appliedProducts: payloadAddTypeProduct
            .filter((el: any) => el.selectedType === 2)
            .map((item: any) => {
              return {
                name: item.barcodeName,
                skuCode: item.skuCode,
                barcode: item.barcode,
                unitName: item.unitName,
                categoryTypeCode: item.productTypeCode,
              };
            }),
          appliedCategories: payloadAddTypeProduct
            .filter((el: any) => el.selectedType === 1)
            .map((item: any) => {
              return {
                name: item.productTypeName,
                code: item.productTypeCode,
              };
            }),
        };
        const body = {
          stStartTime: values.stStartTime.toISOString(true),
          stEndTime: values.stEndTime.toISOString(true),
          remark: remark,
          description: values.description,
          stDetail: {
            isAllBranches: payloadBranches.isAllBranches,
            appliedBranches: payloadBranches.appliedBranches,
            appliedProduct: appliedProduct,
          },
        };

        const bodyPayload = !!payLoadSt.id
          ? {
              ...body,
              id: payLoadSt.id,
              documentNumber: payLoadSt.documentNumber,
            }
          : body;
        const rs = await saveDraftST(bodyPayload);
        if (rs.code === 201) {
          if (!getStart) {
            dispatch(setCheckEdit(false));
            setShowSnackBar(true);
            setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");
            // if (onSearchBD) onSearchBD();
          }
          dispatch(
            updatesaleLimitTimeState({
              ...payLoadSt,
              id: rs.data.id,
              documentNumber: rs.data.documentNumber,
            }),
          );
          setStatus(1);
          if (getStart) {
            handleGetStart(rs.data.id);
          }
        } else {
          setOpenAlert(true);
          setTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
        }
      } catch (error) {
        setOpenAlert(true);
        setTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
      }
    }
  };

  const handleGetStart = async (id: string) => {
    try {
      const rs = await getStartSaleLimitTime(id);

      if (rs.code === 20000) {
        setStatus(2);
        setOpenPopup(true);
        setPopupMsg(
          "คุณได้เริ่มใช้งานการกำหนดเวลา (งด) ขายสินค้าเรียบร้อยแล้ว",
        );
        handleClose();
        if (onSearch) onSearch();
      } else {
        setOpenAlert(true);
        setTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
      }
    } catch (error) {
      setOpenAlert(true);
      setTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
    }
  };

  const handleDeleteDraft = async () => {
    if (status) {
      try {
        const body =
          status > 1
            ? {
                id: payLoadSt.id,
                remark: remark,
              }
            : { id: payLoadSt.id };

        const rs = await cancelST(body);
        if (rs.code === 20000) {
          setOpenPopup(true);
          setPopupMsg("คุณได้ยกเลิกกำหนดเวลา (งด) ขายสินค้า เรียบร้อยแล้ว");
          handleClose();
          if (onSearch) onSearch();
        } else {
          setOpenAlert(true);
          setTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
        }
      } catch (error) {
        setOpenAlert(true);
        setTextError("กรุณาตรวจสอบ \n กรอกข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน");
      }
    } else {
      setOpenPopup(true);
      setPopupMsg("คุณได้ยกเลิกกำหนดเวลา (งด) ขายสินค้า เรียบร้อยแล้ว");
      handleClose();
    }
  };
  const handleCopy = async () => {
    setOpenLoadingModal(true);
    // fist choice copy by all product is the same as the old one
    setStatus(0);
    dispatch(updatesaleLimitTimeState({}));
    setCreateDate(new Date());
    setOpenModalCopy(false);
    if (choiceCopy) {
      // second choice copy by update the information to the current amount
      let listItem = _.cloneDeep(payloadAddTypeProduct);

      let listTypeItem = listItem.filter((el: any) => el.selectedType === 1);

      for (const el of listTypeItem) {
        let res = await getAllProductByType(el.productTypeCode);
        if (res && res.data && res.data.length > 0) {
          let lstProductByType = res.data;
          for (const item of lstProductByType) {
            let productItem: any = _.cloneDeep(item);
            let productExist = listItem.find(
              (it: any) => it.selectedType === 2 && it.barcode === item.barcode,
            );
            if (objectNullOrEmpty(productExist)) {
              productItem.selectedType = 2;
              productItem.showProduct = true;
              listItem.push(productItem);
            }
          }
        }
      }
      if (payloadAddTypeProduct && payloadAddTypeProduct.length > 0) {
        for (const item of payloadAddTypeProduct) {
          if (item.selectedType === 2) {
            let selectedItemFilter = listItem.filter(
              (it: any) =>
                it.selectedType === item.selectedType &&
                it.barcode === item.barcode,
            );
            if (selectedItemFilter && selectedItemFilter.length === 0) {
              listItem.push(item);
            }
          }
        }
      }
      dispatch(updateAddTypeAndProductState(listItem));
    }
    setOpenLoadingModal(false);
  };
  const handleOpenModalCopy = () => {
    setOpenModalCopy(true);
  };

  const handleCloseModalCancel = () => {
    setOpenModalCancel(false);
  };

  const handleOpenCancel = () => {
    setOpenModalCancel(true);
  };
  const handleCloseModalStart = () => {
    setOpenModalStart(false);
  };

  const handleOpenStart = () => {
    if (status === 0) {
      handleCreateSTDetail(true);
    } else {
      valiDateData() && setOpenModalStart(true);
    }
  };
  const handleUnSelectAllType = (showAll: boolean) => {
    setUnSelectAllType(showAll);
  };

  const handleAddProduct = (list: any) => {
    let selectList = list.map((item: any) => {
      return {
        productTypeCode: item.categoryTypeCode,
        productTypeName: item.categoryName,
        barcode: item.barcode,
        unitName: item.unitName,
        barcodeName: item.name,
        selectedType: 2,
        showProduct: true,
        skuCode: item.skuCode,
      };
    });
    let selectedItemEnds = _.cloneDeep(selectList);

    if (selectedItemEnds && selectedItemEnds.length > 0) {
      let listTypeCodeProducts = new Set(
        selectedItemEnds
          .map((item: any) => item.productTypeCode)
          .filter((el: any) => el != undefined),
      );
      let listCategoryCode = selectedItemEnds
        .filter((el: any) => el.selectedType === 1)
        .map((item: any) => item.productTypeCode);

      let listTypes = Array.from(listTypeCodeProducts);
      for (let i of listTypes) {
        if (!listCategoryCode.includes(i)) {
          const item = selectedItemEnds.find(
            (el: any) => i === el.productTypeCode,
          );
          selectedItemEnds.push({
            productTypeCode: item.productTypeCode,
            productTypeName: item.productTypeName,
            selectedType: 1,
          });
        }
      }
    }
    dispatch(updateAddTypeAndProductState(selectedItemEnds));
  };

  const handleImportFile = async (e: any) => {
    try {
      if (e.target.files[0]) {
        const formData = new FormData();
        formData.append("barcode", e.target.files[0]);
        const rs = await importST(formData);
        if (!!rs.data) {
          if (rs.code == 20000) {
            handleAddProduct(rs.data.appliedProducts);
            setUrlModalValidate("");
            setOpenModalValidate(false);
          }
          if (rs.code == 40002) {
            setUrlModalValidate(rs.data.link);
            setOpenModalValidate(true);
          }
        } else {
          setMsgModalValidate(rs.message);
          setUrlModalValidate("");
          setOpenModalValidate(true);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div>
      <Dialog open={open} maxWidth="xl" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleCheckClose}
        >
          <Typography sx={{ fontSize: "1em", mb: 2 }}>
            {"สร้างเอกสารกำหนดเวลา (งด) ขายสินค้าใหม่"}
          </Typography>
          <StepperBar activeStep={status} />
        </BootstrapDialogTitle>

        <DialogContent>
          <Grid container spacing={2} mb={2} mt={2} id="top-item">
            <Grid item xs={2}>
              <Box mb={2}>เลขที่เอกสาร ST :</Box>
              <Box>วันที่สร้างรายการ :</Box>
            </Grid>
            <Grid item xs={3}>
              <Box mb={2}>
                {!!payLoadSt.documentNumber ? payLoadSt.documentNumber : "-"}
              </Box>
              <Box>{moment(createDate).add(543, "y").format("DD/MM/YYYY")}</Box>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              รายละเอียด<b style={{ fontSize: "18px" }}> *</b> :
            </Grid>
            <Grid item xs={3}>
              <TextField
                placeholder=" ความยาวไม่เกิน 50 ตัวอักษร"
                multiline
                fullWidth
                rows={2}
                style={{
                  backgroundColor:
                    status > 1 || !isAdmin ? "#f1f1f1" : "transparent",
                }}
                error={checkValue.descriptionError}
                className={classes.MtextField}
                value={values.description}
                inputProps={{
                  maxLength: "50",
                }}
                variant="outlined"
                onChange={(e) => {
                  handleChangeDescription(e.target.value);
                }}
                disabled={status > 1 || !isAdmin}
              />
              {checkValue.descriptionError && (
                <Box textAlign="right" color="#F54949">
                  กรุณาระบุรายละเอียด
                </Box>
              )}
            </Grid>
          </Grid>
          <Grid container spacing={2} mb={2.5}>
            <Grid item xs={2}>
              วันที่เริ่มงดใช้งาน<b style={{ fontSize: "18px" }}> *</b> :
            </Grid>
            <Grid item xs={3}>
              <DatePickerComponent
                error={checkValue.startDateError}
                disabled={status > 1 || !isAdmin}
                onClickDate={handleStartDatePicker}
                value={values.startDate}
              />
              {checkValue.startDateError && (
                <Box textAlign="right" color="#F54949">
                  กรุณาระบุรายละเอียด
                </Box>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              วันที่สิ้นสุดงดขาย<b style={{ fontSize: "18px" }}> *</b> :
            </Grid>
            <Grid item xs={3}>
              <DatePickerComponent
                error={checkValue.endDateError}
                disabled={status > 1 || !isAdmin}
                onClickDate={handleEndDatePicker}
                value={values.endDate}
                type="TO"
                minDateTo={values.startDate}
              />
              {checkValue.endDateError && (
                <Box textAlign="right" color="#F54949">
                  กรุณาระบุรายละเอียด
                </Box>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={2}>
              เวลาที่เริ่มงดขาย<b style={{ fontSize: "18px" }}> *</b> :
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="time-start"
                type="time"
                fullWidth
                style={{
                  backgroundColor:
                    status > 1 || !isAdmin ? "#f1f1f1" : "transparent",
                }}
                error={!!checkValue.startTimeError}
                className={classes.MtimeTextField}
                value={values.startTime}
                onChange={(e) => handleStartTimePicker(e.target.value)}
                inputProps={{
                  step: 300,
                }}
                disabled={status > 1 || !isAdmin}
              />

              {checkValue.startTimeError && (
                <Box textAlign="right" color="#F54949">
                  {checkValue.startTimeError}
                </Box>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              เวลาที่สิ้นสุดงดขาย<b style={{ fontSize: "18px" }}> *</b> :
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="time-end"
                type="time"
                fullWidth
                error={!!checkValue.endTimeError}
                style={{
                  backgroundColor:
                    status > 1 || !isAdmin ? "#f1f1f1" : "transparent",
                }}
                className={classes.MtimeTextField}
                value={values.endTime}
                onChange={(e) => handleEndTimePicker(e.target.value)}
                inputProps={{
                  step: 300,
                }}
                disabled={status > 1 || !isAdmin}
              />
              {checkValue.endTimeError && (
                <Box textAlign="right" color="#F54949">
                  {checkValue.endTimeError}
                </Box>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={2}>
              สาขา<b style={{ fontSize: "18px" }}> *</b> :
            </Grid>
            <Grid item xs={3}>
              <SelectExcludeBranch
                disabled={status > 1 || !isAdmin}
                error={checkValue.payloadBranchesError}
              />
              {checkValue.payloadBranchesError && (
                <Box textAlign="right" color="#F54949">
                  กรุณาระบุรายละเอียด
                </Box>
              )}
            </Grid>
            <Grid item xs={7}></Grid>
          </Grid>

          <Grid container spacing={2} mt={4} mb={2}>
            <Grid item xs={5}>
              {isAdmin && (
                <>
                  {status < 2 && (
                    <>
                      <Button
                        id="btnAddItem"
                        variant="contained"
                        color="info"
                        className={classes.MbtnPrint}
                        onClick={handleOpenAddItems}
                        startIcon={<ControlPoint />}
                        sx={{ width: 126 }}
                      >
                        เพิ่มสินค้า
                      </Button>
                      <label htmlFor="import-st-button-file">
                        {Object.keys(payloadAddTypeProduct).length === 0 && (
                          <Input
                            id="import-st-button-file"
                            type="file"
                            onChange={handleImportFile}
                            style={{ display: "none" }}
                          />
                        )}
                        <Button
                          id="btnImport"
                          variant="contained"
                          color="primary"
                          className={classes.MbtnPrint}
                          startIcon={
                            <ImportAppIcon
                              sx={{ transform: "rotate(90deg)" }}
                            />
                          }
                          sx={{ width: 126, ml: "19px" }}
                          component="span"
                          disabled={!!Object.keys(payloadAddTypeProduct).length}
                        >
                          Import
                        </Button>
                      </label>
                    </>
                  )}
                </>
              )}
            </Grid>
            <Grid item xs={7} sx={{ textAlign: "end" }}>
              {isAdmin && (
                <>
                  {status < 2 ? (
                    <>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleCreateSTDetail(false)}
                        startIcon={<SaveIcon />}
                        className={classes.MbtnSearch}
                        style={{ display: status > 1 ? "none" : undefined }}
                        disabled={!!!Object.keys(payloadAddTypeProduct).length}
                      >
                        บันทึก
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ margin: "0 17px" }}
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => handleOpenStart()}
                        className={classes.MbtnSearch}
                        disabled={!!!Object.keys(payloadAddTypeProduct).length}
                      >
                        เริ่มใช้งาน
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="info"
                      sx={{ margin: "0 17px" }}
                      startIcon={<ContentCopyIcon />}
                      className={classes.MbtnSearch}
                      onClick={handleOpenModalCopy}
                    >
                      Copy
                    </Button>
                  )}
                  {status < 3 && (
                    <Button
                      variant="contained"
                      color="error"
                      disabled={status < 1}
                      onClick={handleOpenCancel}
                      startIcon={<HighlightOffIcon />}
                      className={classes.MbtnSearch}
                    >
                      ยกเลิก
                    </Button>
                  )}
                </>
              )}
            </Grid>
          </Grid>

          <Box mb={4}>
            <STProductTypeItems
              disabled={status > 1 || !isAdmin}
              unSelectAllType={unSelectAllType}
            />
          </Box>
          <Box mb={4}>
            {showModalProduct && (
              <STProductItems
                disabled={status > 1 || !isAdmin}
                unSelectAllType={handleUnSelectAllType}
              />
            )}
          </Box>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={3}>
              <TextBoxComment
                fieldName="หมายเหตุ :"
                defaultValue={remark}
                maxLength={100}
                onChangeComment={handleChangeRemark}
                isDisable={status > 1 || !isAdmin}
                rowDisplay={4}
              />
            </Grid>
            <Grid item xs={7}></Grid>
            <Grid item xs={2} mt={15} textAlign="center">
              <IconButton onClick={topFunction}>
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
        </DialogContent>
      </Dialog>

      <ModelConfirm
        open={openModalCancel}
        status={status}
        remark={remark}
        setRemark={setRemark}
        onClose={handleCloseModalCancel}
        onConfirm={handleDeleteDraft}
        HQCode={payLoadSt.documentNumber}
        headerTitle={"ต้องการยกเลิกกำหนดเวลา (งด) ขายสินค้า"}
      />

      <ModelConfirm
        open={openModalStart}
        remark={remark}
        status={status}
        setRemark={setRemark}
        onClose={handleCloseModalStart}
        onConfirm={() => handleCreateSTDetail(true)}
        HQCode={payLoadSt.documentNumber}
        headerTitle={"ยืนยันเริ่มใช้งานกำหนดเวลา (งด) ขายสินค้า"}
      />

      <ModalConfirmCopy
        open={openModalCopy}
        onClose={() => setOpenModalCopy(false)}
        onConfirm={handleCopy}
        choiceCopy={choiceCopy}
        setChoiceCopy={setChoiceCopy}
      />

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={true}
        contentMsg={contentMsg}
      />

      {/* <ModalAddTypeProduct open={openModelAddItems} onClose={handleCloseModalAddItems} /> */}
      <ModalAddTypeProducts
        open={openModelAddItems}
        onClose={handleCloseModalAddItems}
        title="เพิ่มรายการสินค้า (งด) ขาย"
        showSearch={true}
        textBtn="เพิ่มสินค้า"
        requestBody={{
          isSellable: true,
          skuTypes: [2],
        }}
      />

      <LoadingModal open={openLoadingModal} />
      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />

      <ConfirmModelExit
        open={confirmModelExit}
        onClose={handleNotExitModelConfirm}
        onConfirm={handleExitModelConfirm}
      />
      <ModalValidateImport
        isOpen={openModalValidate}
        title="ไม่สามารถ import file ได้ "
      >
        <Box sx={{ textAlign: "center" }}>
          {!!urlModalValidate ? (
            <Typography sx={{ color: "#F54949", marginBottom: "34px" }}>
              <a href={urlModalValidate} target="_blank">
                ดาวน์โหลดผลการ import file คลิ๊กที่ link นี้{" "}
              </a>
            </Typography>
          ) : (
            <Typography sx={{ color: "#F54949", marginBottom: "34px" }}>
              {msgModalValidate}
            </Typography>
          )}
          <Button
            id="btnClose"
            variant="contained"
            color="error"
            onClick={() => {
              setOpenModalValidate(false);
            }}
          >
            ปิด
          </Button>
        </Box>
      </ModalValidateImport>
    </div>
  );
}

export default STCreateModal;
