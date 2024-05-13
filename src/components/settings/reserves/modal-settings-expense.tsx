import { useState, Fragment, useEffect } from "react";
import {
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Save } from "@mui/icons-material";
import { useStyles } from "styles/makeTheme";
import {
  expenseTypesSetting,
  getExpenseTypesSetting,
} from "utils/enum/setting-reserve-expense-enum";
import NumberFormat from "react-number-format";

//Components
import TexboxSearchSku from "components/commons/ui/texbox-search-sku";
import { BootstrapDialogTitle } from "components/commons/ui/dialog-title";
import AlertError from "components/commons/ui/alert-error";
import SnackbarStatus from "components/commons/ui/snackbar-status";
import LoadingModal from "components/commons/ui/loading-modal";

//api
import { expenseCreateConfig, expenseUpdateConfig } from "services/accounting";
import {
  ExpenseConfigCreateRequest,
  ExpenseConfigUpdateRequest,
} from "models/branch-accounting-model";
import { ApiError } from "models/api-error-model";
import { useAppSelector, useAppDispatch } from "store/store";
import { featchBranchAccountingConfigListAsync } from "store/slices/accounting/accounting-search-config-slice";

const initialStateForm: any = {
  isActive: "true",
  type: [],
  typeOther: [],
  skuCode: "",
  accountNameTh: "",
  accountCode: "",
  requiredDocumentTh: "",
  approvalLimit1: "",
  approvalLimit2: "",
};
interface Props {
  isOpen: boolean;
  onClickClose: () => void;
  isStatus?: string;
  dataSelect?: any;
}

export default function ExpenseSettingDetail({
  isOpen,
  onClickClose,
  isStatus,
  dataSelect,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const payloadSearch = useAppSelector(
    (state) => state.saveExpenseConfigSearchRequest.searchExpenseConfig,
  );

  const [isOpenLoading, setIsOpenLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [textError, setTextError] = useState("");
  const [values, setValues] = useState<any>(initialStateForm);

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues({ ...values, [event.target.name]: value });
  };

  const handleChangType = (event: any) => {
    const value = event.target.value;
    if (value === "OTHER") {
      setValues({ ...values, type: value });
    } else if (value !== "OTHER") {
      setValues({ ...values, type: value, typeOther: [] });
    }
  };

  const handleChangeMultiType = (event: any) => {
    const value = event.target.value;
    if (values.type !== "OTHER") {
      alert("test");
    }
    setValues({
      ...values,
      typeOther: value === "string" ? value.split(",") : value,
    });
  };

  const handleChangeProduct = (value: any) => {
    if (value) {
      setValues({ ...values, skuCode: value.skuCode });
    } else {
      setValues({ ...values, skuCode: "" });
    }
  };

  const handleValidatRegEx = (e: any) => {
    const reg = e.target.value.replace(/[^-()A-Za-z0-9_ก-๏]/g, "");
    setValues({ ...values, [e.target.name]: reg });
  };

  const handleChangeApprovalLimit = (event: any) => {
    const value = event.target.value;
    const removeCommar = value.replace(/\,/g, "");
    setValues({ ...values, [event.target.name]: removeCommar });
  };

  const validateForm = () => {
    if (
      values.type.length === 0 ||
      values.skuCode === "" ||
      values.accountNameTh === "" ||
      values.accountCode === "" ||
      values.approvalLimit1 === "" ||
      values.approvalLimit2 === ""
    ) {
      setOpenAlert(true);
      setTextError("กรุณากรอกข้อมูลให้ครบ");
      return false;
    } else if (values.type === "OTHER" && values.typeOther.length === 0) {
      setOpenAlert(true);
      setTextError("กรุณาเลือกประเภทร้านที่แสดง");
      return false;
    } else if (Number(values.approvalLimit1) >= Number(values.approvalLimit2)) {
      setOpenAlert(true);
      setTextError("วงเงินอนุมัติ ผจก.OC ต้องมีค่ามากกว่า ผจก.ส่วน");
      return false;
    } else {
      return true;
    }
  };

  const handleAddButton = async () => {
    setIsOpenLoading(true);
    const isValidate: boolean = validateForm();

    if (isValidate) {
      if (isStatus === "Create") {
        const conditionTypeOther = values.type === "OTHER";

        const payloadAdd: ExpenseConfigCreateRequest = {
          types: conditionTypeOther ? values.typeOther : [values.type],
          isOtherExpense: conditionTypeOther ? true : false,
          accountCode: values.accountCode,
          accountNameTh: values.accountNameTh,
          skuCode: values.skuCode,
          approvalLimit1: Number(values.approvalLimit1),
          approvalLimit2: Number(values.approvalLimit2),
          isActive: values.isActive === "true" ? true : false,
          requiredDocumentTh: values.requiredDocumentTh
            ? values.requiredDocumentTh
            : "",
        };

        await expenseCreateConfig(payloadAdd)
          .then((value) => {
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("บันทึกข้อมูลเรียบร้อยแล้ว");

            setTimeout(() => {
              setShowSnackBar(false);
              onClickClose();
              setValues(initialStateForm);
            }, 500);
          })
          .catch((error: ApiError) => {
            setOpenAlert(true);
            setTextError(error.message);
          });

        await dispatch(featchBranchAccountingConfigListAsync(payloadSearch));

        setIsOpenLoading(false);
      } else if (isStatus === "Update") {
        const payloadUpdate: ExpenseConfigUpdateRequest = {
          isActive: values.isActive === "true" ? true : false,
          accountCode: values.accountCode,
          accountNameTh: values.accountNameTh,
          skuCode: values.skuCode,
          approvalLimit1: Number(values.approvalLimit1),
          approvalLimit2: Number(values.approvalLimit2),
          requiredDocumentTh: values.requiredDocumentTh
            ? values.requiredDocumentTh
            : "",
        };

        await expenseUpdateConfig(dataSelect.expenseNo, payloadUpdate)
          .then((value) => {
            setShowSnackBar(true);
            setSnackbarIsStatus(true);
            setContentMsg("บันทึกข้อมูลเรียบร้อยแล้ว");

            setTimeout(() => {
              setShowSnackBar(false);
              onClickClose();
              setValues(initialStateForm);
            }, 500);
          })
          .catch((error: ApiError) => {
            setOpenAlert(true);
            setTextError(error.message);
          });

        await dispatch(featchBranchAccountingConfigListAsync(payloadSearch));
      }
    }

    setTimeout(() => {
      setIsOpenLoading(false);
    }, 500);
  };

  const handleOnClose = () => {
    onClickClose();
    setValues(initialStateForm);
  };

  //alert Errormodel
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  //snackbar
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [contentMsg, setContentMsg] = useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const mapDataSelect = () => {
    const isotherExpense = dataSelect.isOtherExpense === true;
    setValues({
      isActive: dataSelect.isActive.toString(),
      type: isotherExpense ? "OTHER" : dataSelect.typeCode,
      typeOther: isotherExpense ? [dataSelect.typeCode] : [],
      skuCode: dataSelect.skuCode,
      accountNameTh: dataSelect.accountNameTh,
      accountCode: dataSelect.accountCode,
      requiredDocumentTh: dataSelect.requiredDocumentTh,
      approvalLimit1: dataSelect.approvalLimit1,
      approvalLimit2: dataSelect.approvalLimit2,
    });
  };

  useEffect(() => {
    if (isStatus === "Update") {
      mapDataSelect();
    }
  }, [isOpen]);

  return (
    <Fragment>
      <Dialog open={isOpen} maxWidth="lg" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleOnClose}
        >
          <Typography sx={{ ml: "15px", fontSize: 24, fontWeight: 400 }}>
            รายละเอียดตั้งค่ารายการค่าใช้จ่าย
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ p: "40px" }}>
          <Grid
            container
            rowSpacing={1}
            columnSpacing={7}
            mb={2}
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="body2">สถานะ :</Typography>
            </Grid>
            <Grid item xs={10}>
              <FormControl>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="isActive"
                  value={values.isActive}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="ใช้งาน"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="ไม่ใช้งาน"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" mb={2}>
                ประเภท<span style={{ color: "#F54949" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth className={classes.Mselect} sx={{ mb: 3 }}>
                <Select
                  id="selType"
                  name="type"
                  disabled={isStatus === "Update"}
                  value={values.type}
                  onChange={handleChangType}
                  displayEmpty
                  renderValue={
                    values.type.length !== 0
                      ? undefined
                      : () => <div style={{ color: "#CBD4DB" }}>กรุณาเลือก</div>
                  }
                  inputProps={{ "aria-label": "Without label" }}
                >
                  {expenseTypesSetting.map((item, index: number) => (
                    <MenuItem key={index} value={item.key}>
                      {item.text}
                    </MenuItem>
                  ))}
                  <MenuItem value={"OTHER"}>อื่นๆ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" mb={2}>
                ประเภทร้านที่แสดง<span style={{ color: "#F54949" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth className={classes.Mselect}>
                <Select
                  id="selTypeOther"
                  multiple
                  value={values.typeOther}
                  onChange={handleChangeMultiType}
                  displayEmpty
                  renderValue={
                    values.typeOther.length !== 0
                      ? (selected) =>
                          selected
                            .map((v: any) => getExpenseTypesSetting(v))
                            .join(", ")
                      : () => <div style={{ color: "#CBD4DB" }}>กรุณาเลือก</div>
                  }
                  disabled={values.type !== "OTHER" || isStatus === "Update"}
                >
                  {expenseTypesSetting.map((item, index: number) => (
                    <MenuItem key={index} value={item.key}>
                      <Checkbox
                        checked={values.typeOther.indexOf(item.key) > -1}
                      />
                      {item.text}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText sx={{ textAlign: "right" }}>
                  เลือกได้มากกว่า 1 ประเภท
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" mt={5} mb={3}>
            รายการค่าใช้จ่าย
          </Typography>

          <Grid
            container
            rowSpacing={1}
            columnSpacing={7}
            mb={2}
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="body2" mb={2}>
                สินค้า<span style={{ color: "#F54949" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={4} mb={3}>
              <TexboxSearchSku
                skuTypes="3,7"
                skuCode={dataSelect ? dataSelect.skuCode : ""}
                skuName={dataSelect ? dataSelect.skuName : ""}
                onSelectItem={handleChangeProduct}
                isClear={false}
              />
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2" mb={2}>
                ชื่อบัญชี<span style={{ color: "#F54949" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <TextField
                  name="accountNameTh"
                  size="small"
                  value={values.accountNameTh}
                  onChange={handleValidatRegEx}
                  className={classes.MtextField}
                  fullWidth
                  inputProps={{ maxLength: 20 }}
                  autoComplete="off"
                />
                <FormHelperText sx={{ textAlign: "right" }}>
                  [ก-ฮ ,A-Z,a-z,0-9,(),-,_] {values.accountNameTh.length}/20
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={2}>
              <Typography variant="body2" mb={2}>
                รหัสบัญชี<span style={{ color: "#F54949" }}>*</span> :
              </Typography>
            </Grid>
            <Grid item xs={4} mb={3}>
              <NumberFormat
                name="accountCode"
                value={values.accountCode}
                className={classes.MtextField}
                customInput={TextField}
                onChange={handleChange}
                fullWidth
                type="text"
                allowNegative={false}
              />
            </Grid>
            <Grid item xs={2} mb={2}>
              <Typography variant="body2">เอกสารที่ต้องส่ง :</Typography>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <TextField
                  name="requiredDocumentTh"
                  size="small"
                  value={values.requiredDocumentTh}
                  onChange={handleValidatRegEx}
                  className={classes.MtextField}
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
                <FormHelperText sx={{ textAlign: "right" }}>
                  [ก-ฮ ,A-Z,a-z,0-9,(),-,_] {values.requiredDocumentTh.length}
                  /50
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={2}>
              <Typography variant="body2">
                วงเงินอนุมัติ ผจก.ส่วน
                <span style={{ color: "#F54949" }}> * </span> :
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <NumberFormat
                name="approvalLimit1"
                value={String(values.approvalLimit1)}
                thousandSeparator={true}
                decimalScale={2}
                className={classes.MtextFieldNumber}
                customInput={TextField}
                onChange={handleChangeApprovalLimit}
                fullWidth
                fixedDecimalScale
                allowNegative={false}
                type="text"
              />
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body2">
                วงเงินอนุมัติ ผจก.OCไม่เกิน
                <span style={{ color: "#F54949" }}> * </span> :
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <NumberFormat
                name="approvalLimit2"
                value={String(values.approvalLimit2)}
                thousandSeparator={true}
                decimalScale={2}
                className={classes.MtextFieldNumber}
                customInput={TextField}
                onChange={handleChangeApprovalLimit}
                fullWidth
                fixedDecimalScale
                type="text"
                allowNegative={false}
              />
            </Grid>
          </Grid>

          <Grid
            item
            container
            xs={12}
            sx={{ mt: 5, justifyContent: "flex-end" }}
          >
            <LoadingButton
              id="btnSave"
              variant="contained"
              color="warning"
              startIcon={<Save />}
              loading={isOpenLoading}
              loadingIndicator={
                <Typography component="span" sx={{ fontSize: "11px" }}>
                  กรุณารอสักครู่ <CircularProgress color="inherit" size={15} />
                </Typography>
              }
              sx={{ borderRadius: 2, width: "12%", height: 43 }}
              onClick={handleAddButton}
            >
              บันทึก
            </LoadingButton>
          </Grid>
        </DialogContent>
      </Dialog>

      <AlertError
        open={openAlert}
        onClose={handleCloseAlert}
        textError={textError}
      />

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />

      <LoadingModal open={isOpenLoading} />
    </Fragment>
  );
}
