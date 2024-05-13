import React, { ReactElement, useEffect } from "react";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import { useStyles } from "../../styles/makeTheme";
import { ContentPaste, HighlightOff, Save, Sync } from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  DialogTitle,
  FormHelperText,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store/store";
import ProvincesDropDown from "../commons/ui/search-provinces-dropdown";
import DistrictsDropDown from "../commons/ui/search-districts-dropdown";
import SubDistrictsDropDown from "../commons/ui/search-subDistricts-dropdown";
import {
  Address,
  Customer,
  SaveInvoiceRequest,
} from "../../models/tax-invoice-model";
import {
  saveInvoice,
  savePrintInvoice,
  searchMemberInformation,
} from "../../services/sale";
import SnackbarStatus from "../commons/ui/snackbar-status";
import LoadingModal from "../commons/ui/loading-modal";
import AlertWarning from "../commons/ui/alert-warning";
import ConfirmModelExit from "../commons/ui/confirm-exit-model";
import TaxInvoiceHistory from "./tax-invoice-history";
import { featchTaxInvoicePrintHistoryAsync } from "../../store/slices/sale/tax-invoice-print-history-slice";
import AccordionUploadFile from "../commons/ui/accordion-upload-file";
// import { clearUploadFileState, uploadFileState } from '../../store/slices/upload-file-slice';
import ModalShowFile from "../commons/ui/modal-show-file";
import { formatFileInvoice } from "../../utils/utils";
import AlertError from "../commons/ui/alert-error";

interface Props {
  isOpen: boolean;
  onClickClose: () => void;
  reloadRequestTaxInvoice: () => void;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
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

function customerDetails({
  isOpen,
  onClickClose,
  reloadRequestTaxInvoice,
}: Props): ReactElement {
  const [open, setOpen] = React.useState(isOpen);
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const taxInvoiceDetail = useAppSelector(
    (state) => state.taxInvoiceSearchDetail.detail.data,
  );
  let fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);

  const taxInvoicePrintHistory = useAppSelector(
    (state) => state.taxInvoicePrintHistory.detail,
  );
  const historyDetail: any = taxInvoicePrintHistory.data
    ? taxInvoicePrintHistory.data
    : [];

  const [status, setStatus] = React.useState("");
  const [billNo, setBillNo] = React.useState("");
  const [invoiceNo, setInvoiceNo] = React.useState("-");
  const [memberNo, setMemberNo] = React.useState("");

  const [disabledBtnEdit, setDisabledBtnEdit] = React.useState(true);
  const [editMode, setEditMode] = React.useState(false);

  const [disabledBtnPreview, setDisabledBtnPreview] = React.useState(true);
  const [disabledBtnClear, setDisabledBtnClear] = React.useState(false);
  const [disabledBtnSave, setDisabledBtnSave] = React.useState(false);
  const [disabledBtnUpload, setDisabledBtnUpload] = React.useState(false);

  const [flagSave, setFlagSave] = React.useState(false);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const handleExitModelConfirm = async () => {
    setFlagSave(false);
    handleClose();
  };

  const handleChange = () => {
    if (!flagSave) setFlagSave(true);
  };

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    if (value.length > 13) {
      let taxNoSub = value.substring(0, 13);
      setValue("taxNo", taxNoSub);
    }
    // const p = value.replace(/\+|-/gi, '');

    handleChange();
  };

  const handleChkEditClose = () => {
    // if (flagSave || fileUploadList.length > 0) {
    if (flagSave) {
      setConfirmModelExit(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setBillNo("");
    setMemberNo("");
    handleClear();

    reloadRequestTaxInvoice();

    setOpen(false);
    onClickClose();
  };

  const [onSaveEvent, setOnSaveEvent] = React.useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
    setValue,
    clearErrors,
    control,
  } = useForm();

  const onSave = (data: any) => {
    if (data) {
      const address: any = {
        houseNo: data.houseNo,
        building: data.building,
        moo: data.moo,
        soi: data.soi,
        road: data.road,
        subDistrictCode: Number(data.subDistrict),
        districtCode: Number(data.district),
        provinceCode: Number(data.province),
        postcode: data.postcode,
      };
      const customer: any = {
        memberNo: memberNo,
        taxNo: data.taxNo,
        firstName: data.firstName,
        lastName: data.lastName,
        address: address,
      };

      const payload: SaveInvoiceRequest = {
        billNo: billNo,
        customer: customer,
      };

      if (status === "PRINTED") {
        handleSavePrintInvoice(payload);
      } else if (onSaveEvent) {
        setEditMode(true);
        handleSavePrintInvoice(payload);
      } else {
        handleSaveInvoice(payload);
      }
    }
  };

  useEffect(() => {
    setOpen(isOpen);
    handleClear();

    if (isOpen && taxInvoiceDetail) {
      setBillNo(taxInvoiceDetail.billNo);

      if (taxInvoiceDetail.invoiceNo) {
        setInvoiceNo(taxInvoiceDetail.invoiceNo);
      }

      setStatus(taxInvoiceDetail.status);
      if (taxInvoiceDetail.customer.memberNo)
        setMemberNo(taxInvoiceDetail.customer.memberNo);

      if (taxInvoiceDetail.status === "PRINTED") {
        if (historyDetail.length > 0) setDisabledBtnEdit(false);
        else setDisabledBtnPreview(false);

        setEditMode(true);
        setDisabledBtnClear(true);
        setDisabledBtnSave(true);
        setDefaultData(taxInvoiceDetail);

        setDisabledSelProvinces(true);
        setDisabledSelDistricts(true);
        setDisabledSelSubDistricts(true);
      } else {
        setEditMode(false);
        if (taxInvoiceDetail.customer.memberNo)
          handleSearchMember(taxInvoiceDetail.customer.memberNo);
        else setDefaultData(taxInvoiceDetail);
      }
    }

    setConfirmModelExit(false);
  }, [isOpen]);

  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [showSnackBar, setShowSnackBar] = React.useState(false);
  const [contentMsg, setContentMsg] = React.useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = React.useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const [openFailAlert, setOpenFailAlert] = React.useState(false);
  const [textFail, setTextFail] = React.useState("");
  const handleCloseFailAlert = () => {
    setOpenFailAlert(false);
    setTextFail("");
  };

  const [openAlert, setOpenAlert] = React.useState(false);
  const [textError, setTextError] = React.useState("");
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleSearchMember = async (memberNo: string) => {
    setOpenLoadingModal(true);
    await searchMemberInformation(memberNo)
      .then((value) => {
        setValue("taxNo", value.data.taxNo);
        setValue("firstName", value.data.firstName);
        setValue("lastName", value.data.lastName);
        setValue("houseNo", value.data.address.houseNo);
        setValue("building", value.data.address.building);
        setValue("moo", value.data.address.moo);
        setValue("soi", value.data.address.soi);
        setValue("road", value.data.address.road);
        setValue("province", value.data.address.provinceCode);
        setValue("district", value.data.address.districtCode);
        setValue("subDistrict", value.data.address.subDistrictCode);
        setValue("postcode", value.data.address.postcode);

        setProvincesCode(String(value.data.address.provinceCode));
        setDistrictsCode(String(value.data.address.districtCode));
        setSubDistrictsCode(String(value.data.address.subDistrictCode));
        setDisabledSelDistricts(false);
        setDisabledSelSubDistricts(false);
      })
      .catch((error: any) => {
        setOpenFailAlert(true);
        setTextFail(`ไม่พบข้อมูลลูกค้า เลขที่สมาชิก: ${memberNo}`);

        if (taxInvoiceDetail) setDefaultData(taxInvoiceDetail);
      });

    setOpenLoadingModal(false);
  };

  const setDefaultData = (data: any) => {
    setValue("taxNo", data.customer.taxNo);
    setValue("firstName", data.customer.firstName);
    setValue("lastName", data.customer.lastName);
    setValue("houseNo", data.customer.address.houseNo);
    setValue("building", data.customer.address.building);
    setValue("moo", data.customer.address.moo);
    setValue("soi", data.customer.address.soi);
    setValue("road", data.customer.address.road);
    setValue("province", data.customer.address.provinceCode);
    setValue("district", data.customer.address.districtCode);
    setValue("subDistrict", data.customer.address.subDistrictCode);
    setValue("postcode", data.customer.address.postcode);

    setProvincesCode(String(data.customer.address.provinceCode));
    setDistrictsCode(String(data.customer.address.districtCode));
    setSubDistrictsCode(String(data.customer.address.subDistrictCode));

    setDisabledSelDistricts(false);
    setDisabledSelSubDistricts(false);
  };

  const handleSaveInvoice = async (payload: SaveInvoiceRequest) => {
    setOpenLoadingModal(true);
    await saveInvoice(payload)
      .then((value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้บันทึกข้อมูลเรียบร้อยแล้ว");

        setDisabledBtnPreview(false);
        setDisabledBtnClear(true);
        setDisabledBtnSave(true);

        setOnSaveEvent(true);

        if (value.data) {
          setInvoiceNo(value.data);
        }
      })
      .catch((error: any) => {
        setTextError(error.message);
        setOpenAlert(true);
      });

    setOpenLoadingModal(false);
  };

  const [openModelPreviewDocument, setOpenModelPreviewDocument] =
    React.useState(false);
  const [docLayoutLandscape, setDocLayoutLandscape] = React.useState(false);
  const [pathReport, setPathReport] = React.useState<string>("");
  const [counter, setCounter] = React.useState(0);

  const handleModelPreviewDocument = async () => {
    setOpenModelPreviewDocument(false);

    if (status !== "PRINTED") {
      // await setStatus('PRINTED');
      // await setDisabledBtnEdit(false);
      handleClose();
    }
  };

  const handleSavePrintInvoice = async (payload: SaveInvoiceRequest) => {
    setOpenLoadingModal(true);

    let edit = false;
    if (!editMode) edit = true;

    await savePrintInvoice(payload, fileUploadList, edit)
      .then((value) => {
        dispatch(featchTaxInvoicePrintHistoryAsync(payload.billNo)).then(() => {
          setCounter(historyDetail.length + 1);
          setOpenModelPreviewDocument(true);
          setPathReport(value.data);
          setFlagSave(false);
          setOpenLoadingModal(false);

          setEditMode(false);

          // dispatch(uploadFileState([]));
          // fileUploadList = [];
        });
      })
      .catch((error: any) => {
        setTextError(error.message);
        setOpenAlert(true);

        setOpenLoadingModal(false);
      });
    // setOpenLoadingModal(false);
  };

  const [isClearProvinces, setIsClearProvinces] = React.useState(false);
  const [isClearDistricts, setIsClearDistricts] = React.useState(false);
  const [isClearSubDistricts, setIsClearSubDistricts] = React.useState(false);

  const handleClear = () => {
    setIsClearProvinces(true);
    setIsClearDistricts(true);
    setIsClearSubDistricts(true);

    setProvincesCode("");
    setDistrictsCode("");
    setSubDistrictsCode("");
    // setSearchProvincesCode('');
    setSearchDistrictsCode("");
    setSearchPostalCode("");

    reset({
      taxNo: "",
      firstName: "",
      lastName: "",
      houseNo: "",
      building: "",
      moo: "",
      soi: "",
      road: "",
      province: "",
      district: "",
      subDistrict: "",
      postcode: "",
    });
  };

  const [provincesCode, setProvincesCode] = React.useState("");
  const [districtsCode, setDistrictsCode] = React.useState("");
  const [subDistrictsCode, setSubDistrictsCode] = React.useState("");

  // const [searchProvincesCode, setSearchProvincesCode] = React.useState('');
  const [searchDistrictsCode, setSearchDistrictsCode] = React.useState("");
  const [searchPostalCode, setSearchPostalCode] = React.useState("");

  const [disabledSelProvinces, setDisabledSelProvinces] = React.useState(false);
  const [disabledSelDistricts, setDisabledSelDistricts] = React.useState(true);
  const [disabledSelSubDistricts, setDisabledSelSubDistricts] =
    React.useState(true);
  const handleChangeProvinces = (provincesCode: string) => {
    if (provincesCode !== "") {
      setValue("province", provincesCode);
      clearErrors("province");

      setProvincesCode(provincesCode);
      setDisabledSelDistricts(false);
      setIsClearProvinces(false);
    } else if (provincesCode === "") {
      setValue("province", provincesCode);
      setDisabledSelDistricts(true);
    }

    //Clear district, subDistrict, postcode
    setDisabledSelSubDistricts(true);
    setIsClearDistricts(true);
    setIsClearSubDistricts(true);
    setDistrictsCode("");
    setSubDistrictsCode("");
    setSearchDistrictsCode("");
    setSearchPostalCode("");
    reset({
      district: "",
      subDistrict: "",
      postcode: "",
    });
  };

  const handleChangeDistricts = (
    districtsCode: string,
    provincesCode: string,
  ) => {
    setValue("district", districtsCode);

    if (districtsCode !== "") {
      // setValue('district', districtsCode);
      clearErrors("district");
      setDistrictsCode(districtsCode);
      setDisabledSelSubDistricts(false);
    } else if (districtsCode === "") {
      setDisabledSelSubDistricts(true);
    }
    setIsClearDistricts(false);

    //Clear subDistrict, postcode
    setIsClearSubDistricts(true);
    setSubDistrictsCode("");
    setSearchDistrictsCode("");
    setSearchPostalCode("");
    reset({
      subDistrict: "",
      postcode: "",
    });
  };

  const handleChangeSubDistricts = (
    subDistrictsCode: string,
    postalCode: string,
    districtCode: string,
  ) => {
    setValue("subDistrict", subDistrictsCode);

    if (subDistrictsCode !== "") {
      // setValue('subDistrict', subDistrictsCode);
      setValue("postcode", postalCode);
      clearErrors("subDistrict");
      clearErrors("postcode");
    } else if (subDistrictsCode === "") {
      //Clear postcode
      setSearchPostalCode("");
      reset({
        postcode: "",
      });
    }
    setSubDistrictsCode("");
    setIsClearSubDistricts(false);
  };

  const handleEditMode = (type: any) => {
    if (editMode && type === "edit") {
      setOpenLoadingModal(true);
      setTimeout(() => {
        setOpenLoadingModal(false);

        setEditMode(false);
        setDisabledBtnClear(false);
        setDisabledSelProvinces(false);
        setDisabledSelDistricts(false);
        setDisabledSelSubDistricts(false);

        setDisabledBtnUpload(true);
      }, 300);
    } else {
      setOpenLoadingModal(true);
      setTimeout(() => {
        setOpenLoadingModal(false);

        setEditMode(true);
        setDisabledBtnClear(true);
        setDisabledSelProvinces(true);
        setDisabledSelDistricts(true);
        setDisabledSelSubDistricts(true);

        setDisabledBtnUpload(true);
      }, 300);
    }
  };

  const [uploadFileFlag, setUploadFileFlag] = React.useState(false);
  const handleOnChangeUploadFile = (status: boolean) => {
    setUploadFileFlag(status);
    handleChange();
  };

  if (status === "PRINTED" && historyDetail.length >= 1) {
    if (fileUploadList.length > 0 && disabledBtnPreview)
      setDisabledBtnPreview(false);
    else if (fileUploadList.length == 0 && !disabledBtnPreview)
      setDisabledBtnPreview(true);
  }

  return (
    <Dialog open={open} maxWidth="xl" fullWidth={true}>
      <BootstrapDialogTitle
        id="customized-dialog-title"
        onClose={handleChkEditClose}
      >
        <Typography sx={{ fontSize: "1em" }}>รายละเอียดข้อมูลลูกค้า</Typography>
      </BootstrapDialogTitle>

      <DialogContent>
        <Box pl={2} pr={2} mt={2}>
          <Grid container spacing={1}>
            <Grid item xs={2} mb={4}>
              <Typography gutterBottom variant="subtitle1" component="div">
                เลขที่ใบเสร็จ(ย่อ) :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography gutterBottom variant="subtitle1" component="div">
                {billNo}
              </Typography>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2} mb={4}>
              <Typography gutterBottom variant="subtitle1" component="div">
                เลขที่ใบเสร็จ(เต็ม) :
              </Typography>
            </Grid>
            <Grid item xs={2} mb={4}>
              <Typography gutterBottom variant="subtitle1" component="div">
                {invoiceNo}
              </Typography>
            </Grid>

            <Grid item xs={2} mb={4} sx={{ textAlign: "end" }}>
              <Button
                id="btnCreateStockTransferModal"
                variant="contained"
                onClick={() => handleEditMode("print")}
                className={classes.MbtnClear}
                color="secondary"
                sx={{
                  width: 100,
                  mr: 1,
                  display: `${disabledBtnEdit ? "none" : ""}`,
                }}
              >
                พิมพ์ซ้ำ
              </Button>
              <Button
                id="btnCreateStockTransferModal"
                variant="contained"
                onClick={() => handleEditMode("edit")}
                className={classes.MbtnClear}
                color="secondary"
                sx={{ width: 100, display: `${disabledBtnEdit ? "none" : ""}` }}
              >
                แก้ไขข้อมูล
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={1} mb={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: "1em", fontWeight: 600 }}>
                ข้อมูลลูกค้า
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                เลขที่สมาชิก :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtMemberId"
                size="small"
                className={classes.MtextField}
                fullWidth
                value={memberNo}
                disabled={true}
                sx={{ backgroundColor: "#E5E5E5" }}
              />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                เลขประจำตัวผู้เสียภาษี
                <span style={{ color: "#FF0000" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtTaxNo"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกเลขประจำตัวผู้เสียภาษี"
                type="number"
                inputProps={{ maxLength: 13 }}
                {...register("taxNo", {
                  required: true,
                  pattern: /^[0-9]*$/,
                  maxLength: 13,
                  minLength: 13,
                })}
                // onChange={handleChange}
                onChange={(e) => handleInputChange(e)}
                disabled={editMode}
                autoComplete="off"
              />
              {errors.taxNo && (
                <FormHelperText
                  id="component-helper-text"
                  style={{ color: "#FF0000", textAlign: "right" }}
                >
                  กรุณากรอกตัวเลข 13 หลัก
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                ชื่อ / ชื่อบริษัท<span style={{ color: "#FF0000" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtFirstName"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกชื่อ / ชื่อบริษัท"
                {...register("firstName", { required: true })}
                onChange={handleChange}
                disabled={editMode}
                autoComplete="off"
              />
              {errors.firstName && (
                <FormHelperText
                  id="component-helper-text"
                  style={{ color: "#FF0000", textAlign: "right" }}
                >
                  กรุณากรอกรายละเอียด
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                นามสกุล :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtLastName"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกนามสกุล"
                {...register("lastName")}
                onChange={handleChange}
                disabled={editMode}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>

          <Grid container spacing={1} mb={2}>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: "1em", fontWeight: 600 }}>
                ที่อยู่
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                เลขที่<span style={{ color: "#FF0000" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtNumber"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกเลขที่"
                {...register("houseNo", { required: true })}
                onChange={handleChange}
                disabled={editMode}
                autoComplete="off"
              />

              {errors.houseNo && (
                <FormHelperText
                  id="component-helper-text"
                  style={{ color: "#FF0000", textAlign: "right" }}
                >
                  กรุณากรอกรายละเอียด
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                อาคาร :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtBuilding"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกเลขอาคาร"
                {...register("building")}
                onChange={handleChange}
                disabled={editMode}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={1}></Grid>

            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                หมู่ :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtGroup"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกหมู่"
                {...register("moo")}
                onChange={handleChange}
                disabled={editMode}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                ซอย :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtSoi"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกซอย"
                {...register("soi")}
                onChange={handleChange}
                disabled={editMode}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={1}></Grid>

            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                ถนน :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtRoad"
                size="small"
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกถนน"
                {...register("road")}
                onChange={handleChange}
                disabled={editMode}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                จังหวัด<span style={{ color: "#FF0000" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <ProvincesDropDown
                valueProvinces={provincesCode}
                onChangeProvinces={handleChangeProvinces}
                isClear={isClearProvinces}
                disable={disabledSelProvinces}
              />
              <input
                type="text"
                {...register("province", { required: true })}
                style={{ display: "none" }}
              />
              {errors.province && (
                <FormHelperText
                  id="component-helper-text"
                  style={{ color: "#FF0000", textAlign: "right" }}
                >
                  กรุณากรอกรายละเอียด
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={1}></Grid>

            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                เขต / อำเภอ<span style={{ color: "#FF0000" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <DistrictsDropDown
                valueDistricts={districtsCode}
                provinceCode={provincesCode}
                onChangeDistricts={handleChangeDistricts}
                searchDistrictsCode={searchDistrictsCode}
                isClear={isClearDistricts}
                disable={disabledSelDistricts}
              />
              <input
                type="text"
                {...register("district", { required: true })}
                style={{ display: "none" }}
              />

              {errors.district && (
                <FormHelperText
                  id="component-helper-text"
                  style={{ color: "#FF0000", textAlign: "right" }}
                >
                  กรุณากรอกรายละเอียด
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                แขวง / ตำบล<span style={{ color: "#FF0000" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <SubDistrictsDropDown
                valueSubDistricts={subDistrictsCode}
                districtsCode={districtsCode}
                onChangeSubDistricts={handleChangeSubDistricts}
                searchPostalCode={searchPostalCode}
                isClear={isClearSubDistricts}
                disable={disabledSelSubDistricts}
              />
              <input
                type="text"
                {...register("subDistrict", { required: true })}
                style={{ display: "none" }}
              />

              {errors.subDistrict && (
                <FormHelperText
                  id="component-helper-text"
                  style={{ color: "#FF0000", textAlign: "right" }}
                >
                  กรุณากรอกรายละเอียด
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={1}></Grid>

            <Grid item xs={2}>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={2}
              >
                รหัสไปรษณีย์:
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtpostCode"
                size="small"
                className={classes.MtextFieldPostCode}
                fullWidth
                // placeholder='กรุณากรอกรหัสไปรษณีย์'
                {...register("postcode", { maxLength: 5, pattern: /\d+/ })}
                disabled={true}
              />
              {errors.postcode && (
                <FormHelperText
                  id="component-helper-text"
                  style={{ color: "#FF0000", textAlign: "right" }}
                >
                  กรุณากรอกตัวเลข
                </FormHelperText>
              )}
            </Grid>

            <Grid item xs={1}></Grid>
            <Grid item xs={1}>
              {status === "PRINTED" && historyDetail.length > 0 && (
                <Typography
                  gutterBottom
                  variant="subtitle1"
                  component="div"
                  mb={2}
                >
                  แนบไฟล์ :
                </Typography>
              )}
            </Grid>
            <Grid item xs={4}>
              {status === "PRINTED" && historyDetail.length > 0 && (
                <Box ml={2}>
                  <AccordionUploadFile
                    files={[]}
                    isStatus={uploadFileFlag}
                    onChangeUploadFile={handleOnChangeUploadFile}
                    enabledControl={disabledBtnUpload}
                    reMark="แนบไฟล์ใบแทน / สำเนาบัตรประชาชน .pdf/.jpg ขนาดไม่เกิน 5 mb"
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={1}></Grid>
          </Grid>
        </Box>

        <Box pr={2}>
          <Grid container spacing={1} mt={4}>
            <Grid item xs={2} mb={2}>
              <Button
                id="btnCreateStockTransferModal"
                variant="contained"
                onClick={handleSubmit(onSave)}
                sx={{ width: 150 }}
                className={classes.MbtnClear}
                startIcon={<ContentPaste />}
                color="primary"
                disabled={disabledBtnPreview}
              >
                พิมพ์
              </Button>
            </Grid>
            <Grid item xs={10} sx={{ textAlign: "end" }}>
              <Button
                id="btnClear"
                variant="contained"
                startIcon={<Sync />}
                onClick={handleClear}
                sx={{ width: 110, ml: 2 }}
                className={classes.MbtnClear}
                color="cancelColor"
                disabled={disabledBtnClear}
              >
                เคลียร์
              </Button>

              {disabledBtnEdit && (
                <Button
                  id="btnSearch"
                  variant="contained"
                  color="warning"
                  startIcon={<Save />}
                  onClick={handleSubmit(onSave)}
                  sx={{ width: 110, ml: 2 }}
                  className={classes.MbtnSave}
                  disabled={disabledBtnSave}
                >
                  บันทึก
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>

        <Box mt={5} mb={5}>
          <TaxInvoiceHistory />
        </Box>

        <SnackbarStatus
          open={showSnackBar}
          onClose={handleCloseSnackBar}
          isSuccess={snackbarIsStatus}
          contentMsg={contentMsg}
        />

        <LoadingModal open={openLoadingModal} />

        <AlertWarning
          open={openFailAlert}
          onClose={handleCloseFailAlert}
          text={textFail}
        />
        <AlertError
          open={openAlert}
          onClose={handleCloseAlert}
          textError={textError}
        />

        <ConfirmModelExit
          open={confirmModelExit}
          onClose={() => {
            setConfirmModelExit(false);
          }}
          onConfirm={handleExitModelConfirm}
        />

        <ModalShowFile
          open={openModelPreviewDocument}
          onClose={handleModelPreviewDocument}
          url={pathReport}
          sdImageFile=""
          statusFile={2}
          fileName={formatFileInvoice(invoiceNo, counter)}
          btnPrintName="พิมพ์เอกสาร"
          landscape={docLayoutLandscape}
        />
      </DialogContent>
    </Dialog>
  );
}

export default customerDetails;
