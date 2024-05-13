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
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store/store";
import ProvincesDropDown from "../commons/ui/search-provinces-dropdown";
import DistrictsDropDown from "../commons/ui/search-districts-dropdown";
import SubDistrictsDropDown from "../commons/ui/search-subDistricts-dropdown";
import {
  Address,
  Customer,
  SaveInvoiceRequest,
} from "../../models/tax-invoice-model";
import { saveInvoice, searchMemberInformation } from "../../services/sale";
import SnackbarStatus from "../commons/ui/snackbar-status";
import LoadingModal from "../commons/ui/loading-modal";
import AlertError from "../commons/ui/alert-warning";
import { featchTaxInvoiceListAsync } from "../../store/slices/tax-invoice-search-list-slice";
import ConfirmModelExit from "../commons/ui/confirm-exit-model";

interface Props {
  isOpen: boolean;
  onClickClose: () => void;
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

function customerDetails({ isOpen, onClickClose }: Props): ReactElement {
  const [open, setOpen] = React.useState(isOpen);
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const payloadSearch = useAppSelector(
    (state) => state.taxInvoiceSearchList.payloadSearchList,
  );
  const taxInvoiceDetail = useAppSelector(
    (state) => state.taxInvoiceSearchDetail.detail.data,
  );
  // console.log('taxInvoiceDetail:', JSON.stringify(taxInvoiceDetail));

  const [flagSave, setFlagSave] = React.useState(false);
  const [confirmModelExit, setConfirmModelExit] = React.useState(false);
  const handleExitModelConfirm = async () => {
    setFlagSave(false);
    handleClose();
  };

  const handleChange = async () => {
    if (!flagSave) setFlagSave(true);
  };

  const handleChkEditClose = async () => {
    if (flagSave) {
      setConfirmModelExit(true);
    } else {
      handleClose();
    }
  };

  const handleClose = async () => {
    setBillNo("");
    setMemberNo("");
    handleClear();

    dispatch(featchTaxInvoiceListAsync(payloadSearch));

    setOpen(false);
    onClickClose();
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
    setValue,
    clearErrors,
  } = useForm();

  const onSave = (data: any) => {
    if (data) {
      const address: any = {
        houseNo: data.houseNo,
        building: data.building,
        moo: data.moo,
        subDistrictCode: data.subDistrict,
        districtCode: data.district,
        provinceCode: data.province,
        postcode: data.postcode,
      };
      const customer: any = {
        memberNo: "",
        taxNo: data.taxNo,
        firstName: data.firstName,
        lastName: data.lastName,
        address: address,
      };

      const payload: SaveInvoiceRequest = {
        billNo: billNo,
        customer: customer,
      };

      // console.log('payload:', JSON.stringify(payload));
      handleSaveInvoice(payload);
    }
  };

  const [status, setStatus] = React.useState("");
  const [billNo, setBillNo] = React.useState("");
  const [invoiceNo, setInvoiceNo] = React.useState("-");
  const [memberNo, setMemberNo] = React.useState("");
  const [disabledBtnPreview, setDisabledBtnPreview] = React.useState(true);
  const [disabledBtnClear, setDisabledBtnClear] = React.useState(false);
  const [disabledBtnSave, setDisabledBtnSave] = React.useState(false);

  useEffect(() => {
    setOpen(isOpen);
    handleClear();

    if (isOpen && taxInvoiceDetail) {
      setBillNo(taxInvoiceDetail.billNo);
      if (taxInvoiceDetail.invoiceNo) {
        setDisabledBtnPreview(false);
        setInvoiceNo(taxInvoiceDetail.invoiceNo);
      }

      setStatus(taxInvoiceDetail.status);
      setMemberNo(taxInvoiceDetail.customer.memberNo);

      if (taxInvoiceDetail.status === "PRINTED") {
        setDisabledBtnClear(true);
        setDisabledBtnSave(true);
        setDefaultData(taxInvoiceDetail);

        setDisabledSelProvinces(true);
        setDisabledSelDistricts(true);
        setDisabledSelSubDistricts(true);
      } else {
        if (taxInvoiceDetail.customer.memberNo)
          handleSearchMember(taxInvoiceDetail.customer.memberNo);
        else setDefaultData(taxInvoiceDetail);
      }
    }
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
      })
      .catch((error: any) => {
        setShowSnackBar(true);
        setContentMsg(error.message);
      });

    setOpenLoadingModal(false);
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
      province: "",
      district: "",
      subDistrict: "",
      postcode: "",
    });
  };

  const [provincesCode, setProvincesCode] = React.useState("");
  const [districtsCode, setDistrictsCode] = React.useState("");
  const [subDistrictsCode, setSubDistrictsCode] = React.useState("");

  const [provincesName, setProvincesName] = React.useState("");
  const [districtsName, setDistrictsName] = React.useState("");
  const [subDistrictsName, setSubDistrictsName] = React.useState("");

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

      if (searchPostalCode === "") {
        setDistrictsCode("");
        setSubDistrictsCode("");
        setSearchDistrictsCode("");
        setSearchPostalCode("");
        setSearchPostalCode("");

        // setDisabledSelDistricts(true);
        setDisabledSelSubDistricts(true);

        setValue("district", "");
        setValue("subDistrict", "");
        setValue("postcode", "");

        setIsClearDistricts(true);
        setIsClearSubDistricts(true);
      }
    }
  };

  const handleChangeDistricts = (
    districtsCode: string,
    provincesCode: string,
  ) => {
    if (districtsCode !== "") {
      setValue("district", districtsCode);
      clearErrors("district");
      setDistrictsCode(districtsCode);
      setDisabledSelSubDistricts(false);
    }

    if (searchPostalCode != "") {
      // setSearchProvincesCode(provincesCode);
      setProvincesCode("");
      setDisabledSelProvinces(false);
    }

    setIsClearDistricts(false);
  };

  const handleChangeSubDistricts = (
    subDistrictsCode: string,
    postalCode: string,
    districtCode: string,
  ) => {
    if (subDistrictsCode !== "") {
      setValue("subDistrict", subDistrictsCode);
      setValue("postcode", postalCode);
      clearErrors("subDistrict");
      clearErrors("postcode");
    }

    if (searchPostalCode != "") {
      setSearchDistrictsCode(districtCode);
      setDistrictsCode("");
      setDisabledSelDistricts(false);
    }

    setSubDistrictsCode("");
    setIsClearSubDistricts(false);
  };

  const handleChangePostalCode = (e: any) => {
    const keySearch = e.target.value.trim();
    setFlagSave(true);

    if (keySearch.length >= 5) {
      setSearchPostalCode(keySearch);
      setProvincesCode("");
      setDistrictsCode("");
      setDisabledSelSubDistricts(false);
      setDisabledSelProvinces(true);
    } else if (keySearch.length === 0) {
      setProvincesCode("");
      setDistrictsCode("");
      setSubDistrictsCode("");

      // setSearchProvincesCode('');
      setSearchPostalCode("");
      setSearchDistrictsCode("");

      setDisabledSelDistricts(true);
      setDisabledSelSubDistricts(true);
      setDisabledSelProvinces(false);

      setIsClearProvinces(true);
      setIsClearDistricts(true);
      setIsClearSubDistricts(true);
    }
  };

  return (
    <Dialog open={open} maxWidth="xl" fullWidth={true}>
      <BootstrapDialogTitle
        id="customized-dialog-title"
        onClose={handleChkEditClose}
      >
        <Typography sx={{ fontSize: "1em" }}>รายละเอียดข้อมูลลูกค้า</Typography>
      </BootstrapDialogTitle>

      <DialogContent>
        <Box pl={2} pr={2}>
          <Grid container spacing={1}>
            <Grid item xs={2} mb={3}>
              <Typography gutterBottom variant="subtitle1" component="div">
                เลขที่ใบเสร็จ(ย่อ) :
              </Typography>
            </Grid>
            <Grid item xs={4} mb={2}>
              <Typography gutterBottom variant="subtitle1" component="div">
                {billNo}
              </Typography>
            </Grid>
            <Grid item xs={2} mb={3}>
              <Typography gutterBottom variant="subtitle1" component="div">
                เลขที่ใบเสร็จ(เต็ม) :
              </Typography>
            </Grid>
            <Grid item xs={4} mb={2}>
              <Typography gutterBottom variant="subtitle1" component="div">
                {invoiceNo}
              </Typography>
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
                inputProps={{ maxLength: 13 }}
                {...register("taxNo", { required: true, maxLength: 13 })}
                onChange={handleChange}
                disabled={status === "PRINTED"}
              />
              {errors.taxNo && (
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
                disabled={status === "PRINTED"}
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
                disabled={status === "PRINTED"}
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
                disabled={status === "PRINTED"}
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
                disabled={status === "PRINTED"}
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
                disabled={status === "PRINTED"}
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
                รหัสไปรษณีย์ :
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                id="txtpostCode"
                size="small"
                // type="number"
                inputProps={{ maxLength: 5 }}
                className={classes.MtextField}
                fullWidth
                placeholder="กรุณากรอกรหัสไปรษณีย์"
                {...register("postcode", { maxLength: 5, pattern: /\d+/ })}
                onChange={(e) => {
                  handleChangePostalCode(e);
                }}
                disabled={status === "PRINTED"}
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
            <Grid item xs={7}></Grid>
          </Grid>
        </Box>

        <Box pl={2} pr={2}>
          <Grid container spacing={1} mt={4}>
            <Grid item xs={2} mb={2}>
              <Button
                id="btnCreateStockTransferModal"
                variant="contained"
                // onClick={handleOpenCreateModal}
                // sx={{ width: 150, display: `${displayBtnPreview ? 'none' : ''}` }}
                sx={{ width: 220 }}
                className={classes.MbtnClear}
                startIcon={<ContentPaste />}
                color="primary"
                disabled={disabledBtnPreview}
              >
                Preview ใบเสร็จ / ใบกำกับ
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
            </Grid>
          </Grid>
        </Box>

        <SnackbarStatus
          open={showSnackBar}
          onClose={handleCloseSnackBar}
          isSuccess={snackbarIsStatus}
          contentMsg={contentMsg}
        />

        <LoadingModal open={openLoadingModal} />

        <AlertError
          open={openFailAlert}
          onClose={handleCloseFailAlert}
          text={textFail}
        />

        <ConfirmModelExit
          open={confirmModelExit}
          onClose={() => {
            setConfirmModelExit(false);
          }}
          onConfirm={handleExitModelConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}

export default customerDetails;
