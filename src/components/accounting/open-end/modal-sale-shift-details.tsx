import {
  ReactNode,
  ReactElement,
  Fragment,
  useState,
  useEffect,
  useRef,
} from "react";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import { useStyles } from "styles/makeTheme";
import {
  Grid,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { ArrowForwardIos, CheckCircleOutline, Save } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/store";

// Util and global functions
// import { formatFileStockTransfer } from 'utils/utils'
const number = (value: any) => {
  // function comvert number
  return +("" + value).replaceAll(",", "");
};

// Components
import CardHeader from "components/card-header";
import AccordionUploadFile from "components/commons/ui/accordion-upload-file";
import ModalDetailCash from "components/accounting/open-end/modal-detail-cash";
import AlertError from "components/commons/ui/alert-error";
import ModalShowFile from "components/commons/ui/modal-show-file";
import SnackbarStatus from "components/commons/ui/snackbar-status";
import ModalConfirmApproval from "./confirm/modal-confirm-approval";
import ModalConfirmApproved from "./confirm/modal-confirm-approved";

// Hooks function
import useScrollTop from "hooks/useScrollTop";

// API call
import {
  saveOpenEnd,
  submitApproveOpenEnd,
  approvedOpenEnd,
  getPathReportPayIn,
} from "services/accounting";
import { featchSearchOpenEndAsync } from "store/slices/accounting/open-end/open-end-search-slice";

interface ModalSaleShiftDetailsProps {
  open: boolean;
  onClose: () => void;
}

interface InputNumberLayoutProps {
  title: string;
  id?: string;
  name?: string;
  color?: string;
  value: string | number;
  decimal?: number;
  children?: ReactNode;
  disabled?: boolean;
  native?: boolean;
  validate?: boolean;
  onChange: (value: any) => void;
}

interface DetailsProps {
  detailsData: any;
  settlementFiles: any;
  paymentTypeItems: any;
  isDisabledUploadFile: boolean;
  setSettlementFiles: (value: any) => void;
}

export default function ModalSaleShiftDetails(
  props: ModalSaleShiftDetailsProps,
): ReactElement {
  // Props
  const { open, onClose } = props;

  // Custom style
  const classes = useStyles();
  const TopLine = {
    mt: "30px",
    borderTop: "2px solid #EAEBEB",
    paddingTop: "15px",
  };

  // Set valiable
  const dispatch = useAppDispatch();
  const viewOpenEndResponse = useAppSelector(
    (state) => state.viewOpenEndSlice.viewOpenEnd,
  );
  const { payloadOpenEndSearch, openEndSearchList } = useAppSelector(
    (state) => state.searchOpenEndSlice,
  );
  const data: any = viewOpenEndResponse.data || null;
  const fileUploadList = useAppSelector((state) => state.uploadFileSlice.state);
  const initialDetailsState = {
    docNo: data?.docNo,
    branchName: data?.branchName,
    shiftDate: data?.shiftDate,
    bypass: data?.bypass,
  };
  const initialFormInputState = {
    summarizeCashDeposite: {
      dailyIncomeAmount: "",
      cashOverShortAmount: "",
      totalCashAmount: "",
      cdmAmount: "",
      totalPayAmount: "",
      depositeAmount: "",
      nextCDMAmount: "",
      diffDepositeAmount: "",
      comment: "",
    },
    externalIncome: {
      totalExIncomeAmount: "",
    },
    externalIncomeList: [],
    cashPayment: {
      totalPayAmount: "",
      iceAmount: "",
      yakultAmount: "",
      coffeeExpenseAmount: "",
      frontExpenseAmount: "",
    },
    settlementFiles: [],
  };
  let initailStepStatus = 0;
  switch (data?.status) {
    case "DRAFT":
      initailStepStatus = 1;
      break;
    case "REQUEST_APPROVE":
      initailStepStatus = 2;
      break;
    case "APPROVED":
      initailStepStatus = 3;
      break;
    default:
      0;
      break;
  }

  // Set state data
  const CardContent = useRef<HTMLElement>(null);
  const [summarizeCashDeposite, setSummarizeCashDeposite] = useState(
    initialFormInputState.summarizeCashDeposite,
  );
  const [externalIncome, setExternalIncome] = useState(
    initialFormInputState.externalIncome,
  );
  const [externalIncomeList, setExternalIncomeList] = useState<any[]>(
    initialFormInputState.externalIncomeList,
  );
  const [cashPayment, setCashPayment] = useState(
    initialFormInputState.cashPayment,
  );
  const [settlementFiles, setSettlementFiles] = useState<any[]>(
    initialFormInputState.settlementFiles,
  );
  const [textError, setTextError] = useState("");
  const [contentMsg, setContentMsg] = useState("");
  const [stepStatus, setStepStatus] = useState(initailStepStatus);
  const [isSaveOpenLoading, setIsSaveOpenLoading] = useState(false);
  const [isSubmitOpenLoading, setIsSubmitOpenLoading] = useState(false);
  const [isApprovedOpenLoading, setIsApprovedOpenLoading] = useState(false);
  const [openModalCashDetail, setOpenModalCashDetail] = useState(false);
  const [isOpenModalConfirmApproval, setIsOpenModalConfirmApproval] =
    useState(false);
  const [isOpenModalConfirmApproved, setIsOpenModalConfirmApproved] =
    useState(false);
  const [isOpenModelPrintDoc, setIsOpenModelPrintDoc] = useState(false);
  const [isOpenAlert, setIsOpenAlert] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [isStatusSanckBar, setIsStatusSanckBar] = useState(false);
  const [isAmountNull, setIsAmountNull] = useState(false);
  const [scrollDown, scrollProps] = useScrollTop();

  // handle function
  const goTopModal = () => {
    CardContent.current?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };

  const calculate = () => {
    // รายการเงินสดรับภายนอก (รวม) bussiness logic
    const totalExIncomeAmountCal = externalIncomeList.reduce(
      (total, num) => total + num.amount,
      0,
    );

    //ยอดรวมเงินสดร้านค้า bussiness logic
    const { cashAmount, diffAmount } = data.income;
    const totalCashAmountCal =
      number(cashAmount) + number(totalExIncomeAmountCal) + number(diffAmount);

    // ยอดเงินที่ต้องนำฝาก business logic
    const { cashOverShortAmount, cdmAmount, totalPayAmount } =
      summarizeCashDeposite;
    const depositeAmountCal =
      number(totalCashAmountCal) +
      number(cashOverShortAmount) +
      (number(cdmAmount) - number(totalPayAmount));

    // Set data after calculate
    setExternalIncome({
      ...externalIncome,
      totalExIncomeAmount: totalExIncomeAmountCal,
    });
    setSummarizeCashDeposite({
      ...summarizeCashDeposite,
      totalCashAmount: "" + totalCashAmountCal,
      depositeAmount: "" + depositeAmountCal,
    });
  };

  const handleExternalIncomeList = (value: any, code: number) => {
    setExternalIncomeList((prevState) => {
      const newState = prevState.map((obj) => {
        if (obj.code === code) {
          if (Object.keys(value)[0] === "amount") {
            return { ...obj, amount: number(value.amount) };
          }
          if (Object.keys(value)[0] === "noItem") {
            if (value.noItem) {
              // ถ้า checked amount = 0
              return { ...obj, amount: 0, noItem: value.noItem };
            }
            return { ...obj, noItem: value.noItem };
          }
        }
        return obj;
      });
      return newState;
    });
  };

  const handleSave = async () => {
    // บันทึก
    const payload = {
      docNo: data?.docNo,
      settlementFiles: settlementFiles,
      items: externalIncomeList,
    };
    setIsSaveOpenLoading(true);
    try {
      const res = await saveOpenEnd(payload, fileUploadList);
      setContentMsg("บันทึกข้อมูล เรียบร้อยแล้ว");
      setIsStatusSanckBar(true);
      setStepStatus(1);
      updateOpenEndData();
    } catch (error) {
      setContentMsg(error.message);
      setIsStatusSanckBar(false);
    } finally {
      setOpenSnackBar(true);
      setIsSaveOpenLoading(false);
    }
  };

  const handleApproval = async (isConfirm: boolean) => {
    // ขออนุมัติ
    const isSettlementReq =
      data?.income?.paymentTypeItems?.filter((e: any) => {
        return e.isSettlementFile && e.amount > 0;
      }).length > 0;
    const isUploadSettlements =
      settlementFiles.length <= 0 &&
      fileUploadList.length <= 0 &&
      isSettlementReq;
    if (isUploadSettlements) {
      setTextError("กรุณาแนบเอกสาร Settlement");
      setIsOpenAlert(true);
    } else {
      if (isConfirm) {
        setIsOpenModalConfirmApproval(false);
        const payload = {
          settlementFiles: settlementFiles,
          items: externalIncomeList,
        };
        setIsSubmitOpenLoading(true);
        try {
          const res = await submitApproveOpenEnd(
            data?.docNo,
            payload,
            fileUploadList,
          );
          setContentMsg("ขออนุมัติ เรียบร้อยแล้ว");
          setIsStatusSanckBar(true);
          setStepStatus(2);
          updateOpenEndData();
          handleClose();
        } catch (error) {
          setContentMsg(error.message);
          setIsStatusSanckBar(false);
        } finally {
          setOpenSnackBar(true);
          setIsSubmitOpenLoading(false);
        }
      } else {
        setIsOpenModalConfirmApproval(true);
      }
    }
  };

  const handleApproved = async (isConfirm: boolean, approvedForm: any) => {
    // อนุมัติ
    if (isConfirm) {
      setIsOpenModalConfirmApproved(false);
      const payload = {
        items: externalIncomeList,
        ...approvedForm,
      };
      setIsApprovedOpenLoading(true);
      try {
        const res = await approvedOpenEnd(data?.docNo, payload);
        setContentMsg("ยืนยันการอนุมัติสำเร็จ");
        setIsStatusSanckBar(true);
        setStepStatus(3);
        updateOpenEndData();
      } catch (error) {
        setContentMsg(error.message);
        setIsStatusSanckBar(false);
      } finally {
        setOpenSnackBar(true);
        setIsApprovedOpenLoading(false);
      }
    } else {
      setIsOpenModalConfirmApproved(true);
    }
  };

  const handleClose = () => {
    setSummarizeCashDeposite(initialFormInputState.summarizeCashDeposite);
    setExternalIncome(initialFormInputState.externalIncome);
    setCashPayment(initialFormInputState.cashPayment);
    setSettlementFiles(initialFormInputState.settlementFiles);
    onClose();
  };

  const updateOpenEndData = async () => {
    const searchOpenEndPayload = {
      branchCode: payloadOpenEndSearch.branchCode,
      status: payloadOpenEndSearch.status,
      dateFrom: payloadOpenEndSearch.dateFrom,
      dateTo: payloadOpenEndSearch.dateTo,
      limit: "" + openEndSearchList.perPage,
      page: "1",
    };
    await dispatch(featchSearchOpenEndAsync(searchOpenEndPayload));
  };

  useEffect(() => {
    if (data) {
      const {
        externalIncome,
        summarizeCashDeposite,
        cashPayment,
        settlementFiles,
        comment,
      } = data;
      setSummarizeCashDeposite({
        ...initialFormInputState.summarizeCashDeposite,
        ...summarizeCashDeposite,
        comment: comment,
      });
      setExternalIncome({
        ...initialFormInputState.externalIncome,
        ...externalIncome,
      });
      setCashPayment({ ...initialFormInputState.cashPayment, ...cashPayment });
      settlementFiles &&
        setSettlementFiles([
          ...initialFormInputState.settlementFiles,
          ...settlementFiles,
        ]);
      if (externalIncome?.items && externalIncome?.items.length > 0) {
        setExternalIncomeList([
          ...initialFormInputState.externalIncomeList,
          ...externalIncome.items,
        ]);
      }
    }
  }, [data]);

  useEffect(() => {
    if (data && externalIncomeList.length > 0) {
      calculate();
      // check amount null
      const isAmountNull =
        externalIncomeList.findIndex(
          (e: any) => (e.amount === null || e.amount === 0) && !e.noItem,
        ) >= 0;
      isAmountNull ? setIsAmountNull(true) : setIsAmountNull(false);
    }
  }, [externalIncomeList]);

  return (
    <Fragment>
      <Dialog
        id="ModalSaveCloseShiftKey"
        open={open}
        fullWidth={true}
        maxWidth="lg"
      >
        <Box id="Card">
          <CardHeader
            onClose={handleClose}
            scrollDown={scrollDown}
            isLoading={isSaveOpenLoading || isSubmitOpenLoading}
            steps={["บันทึก", "ขออนุมัติ", "อนุมัติ"]}
            actionStep={stepStatus}
          >
            <b>รายละเอียดปิดรอบการขาย</b>
          </CardHeader>
          <DialogContent
            id="CardContent"
            {...(typeof scrollProps === "object" ? scrollProps : {})}
            sx={{ maxHeight: "calc(100vh - 230px)", padding: 0 }}
          >
            <Box
              ref={CardContent}
              sx={{
                display: "flex",
                flexDirection: "column",
                padding: "20px 24px",
              }}
            >
              <Box id="DetailsSection">
                <Details
                  detailsData={{
                    ...initialDetailsState,
                    stepStatus: stepStatus,
                  }}
                  paymentTypeItems={data?.income?.paymentTypeItems}
                  settlementFiles={settlementFiles}
                  setSettlementFiles={(value: any) =>
                    setSettlementFiles([...value])
                  }
                  isDisabledUploadFile={
                    isSaveOpenLoading || isSubmitOpenLoading
                  }
                />
                <DialogActions
                  sx={{
                    justifyContent: stepStatus < 3 ? "right" : "left",
                    marginTop: "10px",
                  }}
                >
                  {stepStatus < 2 && (
                    <Fragment>
                      <LoadingButton
                        id="btnSave"
                        variant="contained"
                        color="warning"
                        disabled={isAmountNull || isSubmitOpenLoading}
                        startIcon={<Save />}
                        loading={isSaveOpenLoading}
                        loadingIndicator={
                          <Typography
                            component="span"
                            sx={{ fontSize: "11px" }}
                          >
                            กรุณารอสักครู่{" "}
                            <CircularProgress color="inherit" size={15} />
                          </Typography>
                        }
                        sx={{ borderRadius: 2, height: 40, width: 110 }}
                        onClick={handleSave}
                      >
                        บันทึก
                      </LoadingButton>
                      <LoadingButton
                        id="btnApprove"
                        variant="contained"
                        color="primary"
                        disabled={isAmountNull || isSaveOpenLoading}
                        startIcon={<CheckCircleOutline />}
                        loading={isSubmitOpenLoading}
                        loadingIndicator={
                          <Typography
                            component="span"
                            sx={{ fontSize: "11px" }}
                          >
                            กรุณารอสักครู่{" "}
                            <CircularProgress color="inherit" size={15} />
                          </Typography>
                        }
                        sx={{ borderRadius: 2, height: 40, width: 110 }}
                        onClick={() => handleApproval(false)}
                      >
                        ขออนุมัติ
                      </LoadingButton>
                    </Fragment>
                  )}
                  {stepStatus === 2 && (
                    <Fragment>
                      <LoadingButton
                        id="btnApproved"
                        variant="contained"
                        color="primary"
                        disabled={isAmountNull}
                        startIcon={<CheckCircleOutline />}
                        loading={isApprovedOpenLoading}
                        loadingIndicator={
                          <Typography
                            component="span"
                            sx={{ fontSize: "11px" }}
                          >
                            กรุณารอสักครู่{" "}
                            <CircularProgress color="inherit" size={15} />
                          </Typography>
                        }
                        sx={{ borderRadius: 2, height: 40, width: 110 }}
                        onClick={() => handleApproved(false, "")}
                      >
                        อนุมัติ
                      </LoadingButton>
                    </Fragment>
                  )}
                  {stepStatus === 3 && (
                    <Fragment>
                      <LoadingButton
                        id="btnPayInPrint"
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2, height: 40, width: 125, mt: 7 }}
                        onClick={() => setIsOpenModelPrintDoc(true)}
                      >
                        พิมพ์ใบ Pay-IN
                      </LoadingButton>
                    </Fragment>
                  )}
                </DialogActions>
              </Box>

              <Box id="SummarizeCashDepositeSection" sx={TopLine}>
                <Typography component="label" sx={{ fontSize: "18px" }}>
                  <b>สรุปยอดเงินที่ต้องนำฝาก</b>
                </Typography>
                <Grid container rowSpacing={1} columnSpacing={7} mt={"10px"}>
                  <InputNumberLayout
                    id={"DailyIncomeAmount"}
                    name={"dailyIncomeAmount"}
                    title="มูลค่ายอดประจำวัน"
                    disabled
                    value={summarizeCashDeposite.dailyIncomeAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        dailyIncomeAmount: value,
                      })
                    }
                  >
                    <LoadingButton
                      id="BtnDetails"
                      variant="contained"
                      color="secondary"
                      sx={{ borderRadius: 2, width: 110 }}
                      onClick={() => setOpenModalCashDetail(true)}
                    >
                      ดูรายละเอียด
                    </LoadingButton>
                  </InputNumberLayout>
                  <InputNumberLayout
                    id={"CashOverShortAmount"}
                    name={"cashOverShortAmount"}
                    title="เงินฝากขาดเกินจากทางการเงิน"
                    disabled
                    value={summarizeCashDeposite.cashOverShortAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        cashOverShortAmount: value,
                      })
                    }
                  ></InputNumberLayout>
                  <InputNumberLayout
                    id={"TotalCashAmount"}
                    name={"totalCashAmount"}
                    title="ยอดรวมเงินสดร้านค้า"
                    disabled
                    value={summarizeCashDeposite.totalCashAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        totalCashAmount: value,
                      })
                    }
                  >
                    <Typography color="#AEAEAE">
                      (เงินสดรับ + เงินสดจากร้านค้าภายนอก)
                    </Typography>
                  </InputNumberLayout>
                  <InputNumberLayout
                    id={"CdmAmount"}
                    name={"cdmAmount"}
                    title="เงินสะสมรอฝากตู้ CDM"
                    disabled
                    value={summarizeCashDeposite.cdmAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        cdmAmount: value,
                      })
                    }
                  >
                    <Typography color="#AEAEAE">
                      (เงินสะสมจากวันก่อนหน้า)
                    </Typography>
                  </InputNumberLayout>
                  <InputNumberLayout
                    id={"SummarizeCashDepositeTotalPayAmount"}
                    name={"summarizeCashDepositetotalPayAmount"}
                    title="รวมเงินสดจ่าย"
                    disabled
                    value={summarizeCashDeposite.totalPayAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        totalPayAmount: value,
                      })
                    }
                  ></InputNumberLayout>
                  <InputNumberLayout
                    id={"DepositeAmount"}
                    name={"depositeAmount"}
                    color="#BEEDC2"
                    title="ยอดเงินที่ต้องนำฝาก"
                    disabled
                    value={summarizeCashDeposite.depositeAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        depositeAmount: value,
                      })
                    }
                  >
                    <Typography color="#AEAEAE">
                      (ยอดรวมเงินสดร้านค้า + เงินฝากขาด + เงินสะสมรอฝากตู้ CDM -
                      เงินสดจ่าย)
                    </Typography>
                  </InputNumberLayout>
                  <InputNumberLayout
                    id={"NextCDMAmount"}
                    name={"nextCDMAmount"}
                    color="#E7FFE9"
                    title="เงินรอฝาก CDM วันถัดไป"
                    disabled
                    value={summarizeCashDeposite.nextCDMAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        nextCDMAmount: value,
                      })
                    }
                  >
                    <Typography color="#AEAEAE">(สำหรับวันถัดไป)</Typography>
                  </InputNumberLayout>
                  <InputNumberLayout
                    id={"DiffDepositeAmount"}
                    name={"diffDepositeAmount"}
                    title="ส่วนต่างเงินฝาก"
                    disabled
                    value={summarizeCashDeposite.diffDepositeAmount}
                    onChange={(value) =>
                      setSummarizeCashDeposite({
                        ...summarizeCashDeposite,
                        diffDepositeAmount: value,
                      })
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        ml: "110px",
                      }}
                    >
                      <Typography sx={{ width: "100px" }} component="label">
                        หมายเหตุ :{" "}
                      </Typography>
                      <TextField
                        id="Comment"
                        name="comment"
                        size="small"
                        disabled
                        value={summarizeCashDeposite.comment}
                        onChange={(e) =>
                          setSummarizeCashDeposite({
                            ...summarizeCashDeposite,
                            comment: e.target.value,
                          })
                        }
                        className={classes.MtextField}
                        fullWidth
                        sx={{ ml: 4 }}
                      />
                    </Box>
                  </InputNumberLayout>
                </Grid>
              </Box>

              <Box id="ExternalIncomeSection" sx={TopLine}>
                <Typography component="label" sx={{ fontSize: "18px" }}>
                  <b>รายการเงินสดรับภายนอก</b>
                </Typography>
                <Grid container rowSpacing={1} columnSpacing={7} mt={"10px"}>
                  <InputNumberLayout
                    id={"result"}
                    name={"result"}
                    title="รวม"
                    disabled
                    value={externalIncome.totalExIncomeAmount}
                    onChange={(value) =>
                      setExternalIncome({
                        ...externalIncome,
                        totalExIncomeAmount: value,
                      })
                    }
                  />
                  {externalIncomeList.length > 0 &&
                    externalIncomeList.map((item: any, index: number) => (
                      <Fragment key={item.code}>
                        <InputNumberLayout
                          id={item.name}
                          name={item.name}
                          native={false}
                          title={item.name}
                          validate={
                            externalIncomeList[index]["amount"] === null ||
                            externalIncomeList[index]["amount"] === 0
                          }
                          disabled={
                            externalIncomeList[index]["noItem"] ||
                            stepStatus === 3 ||
                            isSaveOpenLoading ||
                            isSubmitOpenLoading ||
                            isApprovedOpenLoading
                          }
                          value={externalIncomeList[index]["amount"]}
                          onChange={(value) =>
                            handleExternalIncomeList(
                              { amount: value },
                              item.code,
                            )
                          }
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                id={item.name}
                                name={item.name}
                                checked={externalIncomeList[index]["noItem"]}
                                disabled={
                                  stepStatus === 3 ||
                                  isSaveOpenLoading ||
                                  isSubmitOpenLoading ||
                                  isApprovedOpenLoading
                                }
                                onChange={(e) =>
                                  handleExternalIncomeList(
                                    { noItem: e.target.checked },
                                    item.code,
                                  )
                                }
                              />
                            }
                            label="ไม่มีรายการ"
                          />
                        </InputNumberLayout>
                      </Fragment>
                    ))}
                </Grid>
              </Box>

              <Box id="CashPaymentSection" sx={TopLine} mb={"20px"}>
                <Typography component="label" sx={{ fontSize: "18px" }}>
                  <b>รายการเงินสดจ่าย</b>
                </Typography>
                <Grid container rowSpacing={1} columnSpacing={7} mt={"10px"}>
                  <InputNumberLayout
                    id={"CashPaymentTotalPayAmount"}
                    name={"cashPaymentTotalPayAmount"}
                    title="รวม"
                    disabled
                    value={cashPayment.totalPayAmount}
                    onChange={(value) =>
                      setCashPayment({ ...cashPayment, totalPayAmount: value })
                    }
                  />
                  <InputNumberLayout
                    id={"IceAmount"}
                    name={"iceAmount"}
                    title="ค่าน้ำแข็ง"
                    disabled
                    value={cashPayment.iceAmount}
                    onChange={(value) =>
                      setCashPayment({ ...cashPayment, iceAmount: value })
                    }
                  />
                  <InputNumberLayout
                    id={"YakultAmount"}
                    name={"yakultAmount"}
                    title="ค่ายาคูลท์"
                    disabled
                    value={cashPayment.yakultAmount}
                    onChange={(value) =>
                      setCashPayment({ ...cashPayment, yakultAmount: value })
                    }
                  />
                  <InputNumberLayout
                    id={"CoffeeExpenseAmount"}
                    name={"coffeeExpenseAmount"}
                    title="เงินอนุมัติสำรองร้านกาแฟ"
                    disabled
                    value={cashPayment.coffeeExpenseAmount}
                    onChange={(value) =>
                      setCashPayment({
                        ...cashPayment,
                        coffeeExpenseAmount: value,
                      })
                    }
                  />
                  <InputNumberLayout
                    id={"FrontExpenseAmount"}
                    name={"frontExpenseAmount"}
                    title="เงินอนุมัติสำรองหน้าร้าน"
                    disabled
                    value={cashPayment.frontExpenseAmount}
                    onChange={(value) =>
                      setCashPayment({
                        ...cashPayment,
                        frontExpenseAmount: value,
                      })
                    }
                  />
                </Grid>
              </Box>

              {scrollDown && (
                <DialogActions
                  sx={{
                    display: "grid",
                    position: "absolute",
                    right: "40px",
                    bottom: "15px",
                  }}
                >
                  <IconButton
                    sx={{ width: "fit-content", margin: "auto" }}
                    onClick={goTopModal}
                  >
                    <ArrowForwardIos
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
                  <Typography fontSize="13px" onClick={goTopModal}>
                    กลับขึ้นด้านบน
                  </Typography>
                </DialogActions>
              )}
              {openModalCashDetail && (
                <ModalDetailCash
                  isOpen={openModalCashDetail}
                  onClose={() => setOpenModalCashDetail(false)}
                />
              )}
              {isOpenModalConfirmApproval && (
                <ModalConfirmApproval
                  open={isOpenModalConfirmApproval}
                  docNo={data.docNo}
                  onClose={() => setIsOpenModalConfirmApproval(false)}
                  onConfirm={(isConfirm: boolean) => handleApproval(isConfirm)}
                />
              )}
              {isOpenModalConfirmApproved && (
                <ModalConfirmApproved
                  open={isOpenModalConfirmApproved}
                  data={summarizeCashDeposite}
                  onClose={() => setIsOpenModalConfirmApproved(false)}
                  onConfirm={(isConfirm: boolean, approvedForm: any) =>
                    handleApproved(isConfirm, approvedForm)
                  }
                />
              )}
              {isOpenModelPrintDoc && (
                <ModalShowFile
                  open={isOpenModelPrintDoc}
                  onClose={() => setIsOpenModelPrintDoc(false)}
                  url={getPathReportPayIn(data?.docNo) || ""}
                  statusFile={1}
                  sdImageFile={""}
                  fileName={`${data?.docNo}-${data?.status}.pdf`}
                  btnPrintName="พิมพ์เอกสาร"
                  landscape={false}
                />
              )}
              <AlertError
                open={isOpenAlert}
                onClose={() => setIsOpenAlert(false)}
                textError={textError}
              />
              <SnackbarStatus
                open={openSnackBar}
                onClose={() => setOpenSnackBar(false)}
                isSuccess={isStatusSanckBar}
                contentMsg={contentMsg}
              />
            </Box>
          </DialogContent>
        </Box>
      </Dialog>
    </Fragment>
  );
}

const InputNumberLayout = (props: InputNumberLayoutProps) => {
  const classes = useStyles();
  const {
    title,
    id,
    name,
    value,
    onChange,
    children,
    validate,
    color,
    disabled = false,
    decimal = 2,
    native,
  } = props;
  return (
    <Grid container item xs={12} sx={{ alignItems: "center" }}>
      <Grid item xs={3} sx={{ textAlign: "right" }}>
        {title}
        {/* { validate && (
          <Typography component='span' color='red'> * </Typography>
        )} */}
        <Typography component="span"> : </Typography>
      </Grid>
      <Grid item xs="auto" sx={{ pl: "40px" }}>
        <NumberFormat
          id={id}
          name={name}
          value={"" + value}
          onChange={(e: any) => onChange(number(e.target.value))}
          decimalScale={decimal}
          className={classes.MtextFieldNumberNotStyleDisable}
          disabled={disabled}
          customInput={TextField}
          fixedDecimalScale
          allowNegative={native}
          autoComplete="off"
          thousandSeparator={true}
          sx={{
            ".MuiOutlinedInput-root": {
              "& input": {
                background: color || "white",
                borderRadius: "3px",
              },
              "& fieldset": {
                borderColor: validate ? "red" : "#0000003b",
              },
            },
          }}
        />
      </Grid>
      <Grid ml={3}>{children}</Grid>
    </Grid>
  );
};

const Details = (props: DetailsProps) => {
  const {
    detailsData,
    settlementFiles,
    paymentTypeItems,
    isDisabledUploadFile,
    setSettlementFiles,
  } = props;
  const isEnableSettlement =
    paymentTypeItems?.filter((e: any) => {
      return e.isSettlementFile && e.amount > 0;
    }).length > 0;

  // Set data upload
  const [attachFiles, setAttachFiles] = useState([]);
  const [uploadFileFlag, setUploadFileFlag] = useState(false);
  const { t } = useTranslation(["openEnd"]);

  // handle function
  const handleDeleteFile = (item: any) => {
    let attachFileData = [...attachFiles];
    let attachFileDataFilter = attachFileData.filter(
      (file: any) => file.fileKey !== item.fileKey,
    );
    setAttachFiles(attachFileDataFilter);
    setSettlementFiles(attachFileDataFilter);
  };

  useEffect(() => {
    // Preview Settlement files
    setAttachFiles(settlementFiles);
  }, [settlementFiles]);

  return (
    <Grid container rowSpacing={3} columnSpacing={7}>
      <Grid container item md={4} sm={12} xs={12}>
        <Grid item xs={4}>
          <b>เลขที่เอกสาร :</b>
        </Grid>
        <Grid item xs={8}>
          {detailsData.docNo || "-"}
        </Grid>
      </Grid>
      <Grid container item md={4} sm={12} xs={12}>
        <Grid item xs={4}>
          <b>สาขา :</b>
        </Grid>
        <Grid item xs={8}>
          {detailsData.branchName || "-"}
        </Grid>
      </Grid>
      <Grid container item md={4} sm={12} xs={12}>
        <Grid item xs={4}>
          <b>วันที่ยอดขาย :</b>
        </Grid>
        <Grid item xs={8}>
          {detailsData.shiftDate
            ? new Date(detailsData.shiftDate).toLocaleDateString("th-TH")
            : "-"}
        </Grid>
      </Grid>
      <Grid container item md={8} sm={12} xs={12}>
        <Grid item xs={3}>
          <b>แนบเอกสาร Settlement :</b>
        </Grid>
        <Grid item xs={6}>
          <AccordionUploadFile
            title="แนบเอกสาร"
            files={attachFiles}
            docNo={"docNo"}
            docType="OE"
            isStatus={uploadFileFlag}
            onChangeUploadFile={(status: boolean) => setUploadFileFlag(status)}
            onDeleteAttachFile={handleDeleteFile}
            enabledControl={
              !isDisabledUploadFile &&
              isEnableSettlement &&
              detailsData.stepStatus < 2
            }
          />
        </Grid>
      </Grid>
      <Grid container item md={4} sm={12} xs={12}>
        <Grid item xs={4}>
          <b>การBypass :</b>
        </Grid>
        <Grid item xs={8}>
          {detailsData.bypass ? t(`statusByPass.${detailsData.bypass}`) : "-"}
        </Grid>
      </Grid>
    </Grid>
  );
};
