import { Fragment, useEffect, useState } from "react";
import {
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  // CircularProgress,
  FormHelperText,
  Box,
} from "@mui/material";
// import { LoadingButton } from '@mui/lab';
import { useStyles } from "styles/makeTheme";
import { Upload, AddCircleOutline } from "@mui/icons-material";
import { expenseTypes, expenseStatusList } from "utils/enum/accounting-enum";
import { PERMISSION_GROUP } from "utils/enum/permission-enum";
import DatePickerMonth from "components/commons/ui/date-picker-month";
import { useAppSelector, useAppDispatch } from "store/store";
import ModalSelectPeriod from "components/accounting/expense/modal-select-period";
import ExpenseDetail from "components/accounting/expense/expense-detail";
import LoadingModal from "components/commons/ui/loading-modal";

// Import File ที่เกี่ยวข้องกับ Business Logic Select สาขา
import BranchListDropDown from "components/commons/ui/branch-list-dropdown";
import { getUserInfo, setInit } from "store/sessionStore";
import { isGroupBranch } from "utils/role-permission";
import { getBranchName } from "utils/utils";
import { BranchListOptionType } from "models/branch-model";
import { env } from "adapters/environmentConfigs";

// Call API
import {
  clearDataSearchBranchAccounting,
  featchBranchAccountingListAsync,
} from "store/slices/accounting/accounting-search-slice";
import {
  ExpenseSearchRequest,
  ExpensePeriod,
  SummarizeRequest,
  ExpenseApprove3ByDocNos,
  ExpenseApprove3All,
  ExpenseApprove3AllCriteria,
} from "models/branch-accounting-model";
import {
  clearDataExpensePeriod,
  featchExpensePeriodTypeAsync,
} from "store/slices/accounting/accounting-period-type-slice";
import ExpenseSearchList from "./expense-search-list";
import ModelConfirmSearch from "./confirm/modal-confirm-search";
import { saveExpenseSearch } from "store/slices/accounting/save-accounting-search-slice";
import {
  expenseApprove3All,
  expenseApprove3ByDocNos,
  getSummarizeByCriteria,
  getSummarizeByNo,
} from "services/accounting";
import { ApiError, ErrorDetailResponse, Header } from "models/api-error-model";
import AlertError from "components/commons/ui/alert-error";
import {
  addNewItem,
  addSummaryItem,
  initialItems,
  updateItemRows,
  updateSummaryRows,
  updateToInitialState,
} from "store/slices/accounting/accounting-slice";
import SnackbarStatus from "components/commons/ui/snackbar-status";

interface FormSelectProps {
  title: string;
  dataList: any[];
  value: any;
  setValue: (value: any) => void;
  defaultValue?: string;
  isValidate?: boolean;
  isRequest?: boolean;
  isDisabled?: boolean;
}

export default function SearchExpense() {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Business Logic Select สาขา
  const groupBranch = isGroupBranch();
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const ownBranch = getUserInfo().branch
    ? getBranchName(branchList, getUserInfo().branch)
      ? getUserInfo().branch
      : env.branch.code
    : env.branch.code;
  const branchFrom = getBranchName(branchList, ownBranch);
  const branchFromMap: BranchListOptionType = {
    code: ownBranch,
    name: branchFrom ? branchFrom : "",
  };
  const valuebranchFrom = groupBranch ? branchFromMap : null;

  // Check role
  const isBranchRole = getUserInfo().group === PERMISSION_GROUP.BRANCH;
  const isAreaManagerRole =
    getUserInfo().group === PERMISSION_GROUP.AREA_MANAGER;
  const isOCRole = getUserInfo().group === PERMISSION_GROUP.OC;
  const isAccountRole = getUserInfo().group === PERMISSION_GROUP.ACCOUNTING;
  const isAccountManagerRole =
    getUserInfo().group === PERMISSION_GROUP.ACCOUNT_MANAGER;

  // Check default select status by role
  let defaultStatus = "";
  switch (true) {
    case isAreaManagerRole:
      defaultStatus = "WAITTING_APPROVAL1";
      break;
    case isOCRole:
      defaultStatus = "WAITTING_APPROVAL2";
      break;
    case isAccountRole:
      defaultStatus = "WAITTING_ACCOUNTING";
      break;
    case isAccountManagerRole:
      defaultStatus = "WAITTING_APPROVAL3";
      break;
    default:
      defaultStatus = "ALL";
      break;
  }

  // Initial sate
  const initialSearchState = {
    type: "",
    branchCode: "",
    status: defaultStatus,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    period: "",
  };

  // Set state data
  const [search, setSearch] = useState(initialSearchState);
  const [expensePeriodList, setexpensePeriodList] = useState<object[]>([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isValidate, setIsValidate] = useState(false);
  const [branchFromCode, setBranchFromCode] = useState("");
  const [isOpenLoading, setIsOpenLoading] = useState(false);
  const [openFailAlert, setOpenFailAlert] = useState(false);
  const [clearBranchDropDown, seClearBranchDropDown] = useState(false);
  const [textFail, setTextFail] = useState("");
  const [payloadError, setPayloadError] =
    useState<ErrorDetailResponse | null>();

  const items = useAppSelector((state) => state.searchBranchAccounting);
  const branchAccountingList = items.branchAccountingList.data
    ? items.branchAccountingList.data
    : [];
  const [flagBtnApproveAll, setFlagBtnApproveAll] = useState(true);

  // Lifecycle hooks
  useEffect(() => {
    if (groupBranch) {
      setBranchFromCode(ownBranch);
      setSearch({ ...search, branchCode: ownBranch });
    }

    dispatch(clearDataSearchBranchAccounting());
  }, []);

  useEffect(() => {
    // Select งวดเบิก
    if (isAccountRole || isAccountManagerRole) {
      if (search.type === "STOREFRONT") {
        // ถ้าเป็นค่าใช้จ่ายหน้าร้าน
        setSearch({ ...search, period: "1" });
        setexpensePeriodList([{ key: "1", text: "รายเดือน" }]);
      } else {
        setSearch({ ...search, period: "" });
        setexpensePeriodList([
          // ถ้าเป็นค่าใช้จ่ายร้านกาแฟ
          { key: "1", text: "ครึ่งเดือนแรก" },
          { key: "2", text: "ครึ่งเดือนหลัง" },
        ]);
      }
    }
  }, [search.type]);

  // Handle function
  const handleClearSearch = async () => {
    setIsOpenLoading(true);
    setSearch({ ...initialSearchState });
    if (groupBranch) {
      // หากเข้ามาเป็น Branch ไม่ต้องเคลียร์ DropDown
      setBranchFromCode(ownBranch);
      setSearch({ ...initialSearchState, branchCode: ownBranch });
    } else {
      // หากเป็น HQ ให้เคลียร์ DropDown
      seClearBranchDropDown(!clearBranchDropDown);
    }
    setIsValidate(false);
    setIsSearch(false);

    setFlagBtnApproveAll(true);
    await dispatch(clearDataSearchBranchAccounting());
    setIsOpenLoading(false);
  };

  const handleSearchExpense = async () => {
    let isPeriodValidate = false;
    if (isAccountRole || isAccountManagerRole) {
      isPeriodValidate = search.period === "" ? true : false;
    }

    setIsValidate(true);
    if (search.type && !isPeriodValidate) {
      setIsSearch(true);
      setIsOpenLoading(true);
      setFlagBtnApproveAll(true);
      const payload: ExpenseSearchRequest = {
        limit: "10",
        page: "1",
        ...search,
        period: +search.period,
      };

      await dispatch(featchBranchAccountingListAsync(payload)).then((res) => {
        setTimeout(() => {
          setIsValidate(false);
          const payload: any = res.payload ? res.payload : [];

          if (search.status === "WAITTING_APPROVAL3") {
            summarizeByCriteria("search");
            if (payload.data.length > 0)
              setFlagBtnApproveAll(!flagBtnApproveAll);
          }
        }, 300);
      });
      await dispatch(saveExpenseSearch(payload));
      setIsSearch(true);
      setIsOpenLoading(false);
    }
  };

  const handleExport = () => {};

  const [approveType, setApproveType] = useState("");
  const [summarizList, setSummarizList] = useState(null);
  const [summarizTotal, setSummarizTotal] = useState(0);
  const [summarizTitle, setSummarizTitle] = useState("");
  const summarizeByCriteria = async (type?: string) => {
    const payload: SummarizeRequest = {
      type: search.type,
      year: search.year,
      month: search.month,
      period: +search.period,
    };

    await getSummarizeByCriteria(payload)
      .then((value) => {
        if (Number(value.data.total) > Number(summarizTotal)) {
          setSummarizTitle(
            `${value.data.total} สาขา (จำนวนสาขาที่อนุมัติได้ล่าสุด มีการเปลี่ยนแปลง)`,
          );
        } else {
          setSummarizTitle(`${value.data.total} สาขา`);
        }

        setSummarizList(value.data);
        setSummarizTotal(value.data.total);
      })
      .catch((error: ApiError) => {
        console.log("error:", error);
      });
  };
  const summarizeByNo = async (docNos: any) => {
    const payload: any = {
      docNos: docNos,
    };
    await getSummarizeByNo(payload)
      .then((value) => {
        setSummarizTitle(`${value.data.total} สาขา`);
        setSummarizList(value.data);
        setSummarizTotal(value.data.total);
      })
      .catch((error: ApiError) => {
        console.log("error:", error);
      });
  };

  const handleApprove = () => {
    setIsOpenLoading(true);
    setApproveType("byNo");
    const docNos: any[] = [];
    selectRowsList.map((item: any) => {
      docNos.push(item.docNo);
    });

    summarizeByNo(docNos);
    handleOpenModelConfirm();
    setIsOpenLoading(false);
  };

  const handleApproveAll = async () => {
    setIsOpenLoading(true);
    setApproveType("all");
    if (search.status === "WAITTING_APPROVAL3") await summarizeByCriteria();
    handleOpenModelConfirm();
    setIsOpenLoading(false);
  };

  const handleCloseFailAlert = () => {
    setOpenFailAlert(false);
    setTextFail("");
  };

  //modal select period
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openSelectPeriod, setOpenSelectPeriod] = useState(false);
  const [types, setType] = useState("");
  const [dataSelect, setDataSelect] = useState<ExpensePeriod>({
    period: 0,
    startDate: "",
    endDate: "",
  });
  const handleOpenSelectPeriodModal = async (type: string) => {
    setIsOpenLoading(true);
    setType(type);
    await dispatch(clearDataExpensePeriod());
    await dispatch(featchExpensePeriodTypeAsync(type))
      .then((value) => {
        const p: any = value.payload;
        const data = p.data;

        if (data.length !== 0) {
          setOpenSelectPeriod(true);
        } else {
          setOpenFailAlert(true);
          setTextFail("ทำรายการเบิกครบแล้ว");
        }

        setIsOpenLoading(false);
      })
      .catch((error: ApiError) => {
        setIsOpenLoading(false);
        console.log(error);
      });
    await dispatch(updateToInitialState());
    await dispatch(updateSummaryRows([]));
    await dispatch(updateItemRows([]));
    await dispatch(initialItems([]));
    await dispatch(addNewItem(null));
    await dispatch(addSummaryItem(null));
  };
  const handleCloseSelectPeriodModal = async () => {
    setOpenSelectPeriod(false);
  };
  const handleDataSelectPeriod = (value: ExpensePeriod) => {
    setDataSelect(value);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  const [selectRowsList, setSelectRowsList] = useState<Array<any>>([]);
  const handleSelectRows = async (list: any) => {
    setSelectRowsList(list);
  };

  const [openModelConfirm, setOpenModelConfirm] = useState(false);
  const handleOpenModelConfirm = () => {
    setOpenModelConfirm(true);
  };

  const handleCloseModelConfirm = () => {
    setOpenModelConfirm(false);
  };

  const handleConfirm = (periodData: any) => {
    if (approveType === "byNo") {
      approveAccountExpenseManay(
        periodData.period.startDate,
        periodData.period.endDate,
      );
    } else if (approveType === "all") {
      approveAccountExpenseAll(
        periodData.period.startDate,
        periodData.period.endDate,
      );
    }
  };

  const payloadSearch = useAppSelector(
    (state) => state.saveExpenseSearchRequest.searchExpense,
  );
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [contentMsg, setContentMsg] = useState("");
  const [snackbarIsStatus, setSnackbarIsStatus] = useState(false);
  const handleCloseSnackBar = () => {
    setShowSnackBar(false);
  };

  const approveAccountExpenseManay = async (startDate: any, endDate: any) => {
    setIsOpenLoading(true);
    const docNos: any[] = [];
    selectRowsList.map((item: any) => {
      docNos.push(item.docNo);
    });

    const payload: ExpenseApprove3ByDocNos = {
      expenseDate: startDate,
      approvedDate: endDate,
      docNos: docNos,
    };

    await expenseApprove3ByDocNos(payload)
      .then((value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้อนุมัติเรียบร้อยแล้ว");

        dispatch(featchBranchAccountingListAsync(payloadSearch));
      })
      .catch((error: ApiError) => {
        if (String(error.code) === "40020") {
          const header: Header = {
            field1: false,
            field2: false,
            field3: true,
            field4: false,
          };
          const payload: ErrorDetailResponse = {
            header: header,
            error_details: error.error_details,
          };
          setOpenFailAlert(true);
          setTextFail(error.message);
          setPayloadError(payload);
        } else {
          setOpenFailAlert(true);
          setTextFail(error.message);
          setPayloadError(null);
        }
      });

    setIsOpenLoading(false);
  };

  const approveAccountExpenseAll = async (startDate: any, endDate: any) => {
    setIsOpenLoading(true);
    const payloadCriteria: ExpenseApprove3AllCriteria = {
      type: search.type,
      year: search.year,
      month: search.month,
      period: +search.period,
    };

    const payload: ExpenseApprove3All = {
      expenseDate: startDate,
      approvedDate: endDate,
      criteria: payloadCriteria,
    };

    await expenseApprove3All(payload)
      .then((value) => {
        setShowSnackBar(true);
        setSnackbarIsStatus(true);
        setContentMsg("คุณได้อนุมัติเรียบร้อยแล้ว");

        dispatch(featchBranchAccountingListAsync(payloadSearch));
      })
      .catch((error: ApiError) => {
        if (String(error.code) === "40020") {
          const header: Header = {
            field1: false,
            field2: false,
            field3: true,
            field4: false,
          };
          const payload: ErrorDetailResponse = {
            header: header,
            error_details: error.error_details,
          };
          setOpenFailAlert(true);
          setTextFail(error.message);
          setPayloadError(payload);
        } else {
          setOpenFailAlert(true);
          setTextFail(error.message);
          setPayloadError(null);
        }
      });

    setIsOpenLoading(false);
  };

  return (
    <Fragment>
      <Grid container rowSpacing={1} columnSpacing={7}>
        <Grid item md={4} sm={4} xs={6}>
          <FormSelect
            title="ประเภท"
            isRequest
            dataList={expenseTypes}
            value={search.type}
            isDisabled={isOpenLoading}
            isValidate={isValidate}
            setValue={(e) => setSearch({ ...search, type: e.target.value })}
          />
        </Grid>
        <Grid item md={4} sm={4} xs={6}>
          <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
            สาขา
          </Typography>
          <BranchListDropDown
            valueBranch={valuebranchFrom}
            sourceBranchCode={branchFromCode}
            onChangeBranch={(value) =>
              setSearch({ ...search, branchCode: value })
            }
            isClear={clearBranchDropDown}
            disable={groupBranch || isOpenLoading}
            isFilterAuthorizedBranch={groupBranch ? false : true}
          />
        </Grid>
        <Grid item md={4} sm={4} xs={6}>
          <FormSelect
            title="สถานะ"
            dataList={expenseStatusList}
            value={search.status}
            isDisabled={isOpenLoading}
            setValue={(e) => setSearch({ ...search, status: e.target.value })}
          />
        </Grid>
        <Grid item md={4} sm={4} xs={6}>
          <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
            เดือน
          </Typography>
          <DatePickerMonth
            value={new Date(`${search.year}-${search.month}`)}
            isDisabled={isOpenLoading}
            onClickDate={(value: any) =>
              setSearch({
                ...search,
                month: value.month.number,
                year: value.year - 543,
              })
            }
          />
        </Grid>
        {(isAccountRole || isAccountManagerRole) && (
          <Grid item md={4} sm={4} xs={6}>
            <FormSelect
              title="งวดเบิก"
              isRequest
              dataList={expensePeriodList}
              value={search.period}
              isValidate={isValidate && search.type !== ""}
              isDisabled={isOpenLoading || !search.type}
              setValue={(e) => setSearch({ ...search, period: e.target.value })}
            />
          </Grid>
        )}
      </Grid>
      <Grid container rowSpacing={1} columnSpacing={8} mt={10}>
        <Grid item md={5} sm={5} xs={12}>
          {isAccountManagerRole && (
            <Fragment>
              <Button
                id="btnExport"
                variant="contained"
                color="primary"
                onClick={handleExport}
                sx={{ width: 110, mr: 2 }}
                startIcon={<Upload />}
                className={classes.MbtnSearch}
                disabled={true}
              >
                EXPORT
              </Button>
              <Fragment>
                <Button
                  id="btnSearch"
                  variant="contained"
                  color="primary"
                  onClick={handleApprove}
                  sx={{ width: 110, mr: 2 }}
                  className={classes.MbtnSearch}
                  disabled={selectRowsList.length === 0}
                >
                  อนุมัติ
                </Button>
                <Button
                  id="btnSearch"
                  variant="contained"
                  color="secondary"
                  disabled={flagBtnApproveAll}
                  onClick={handleApproveAll}
                  sx={{ width: 110 }}
                  className={classes.MbtnSearch}
                >
                  อนุมัติทั้งหมด
                </Button>
              </Fragment>
            </Fragment>
          )}
        </Grid>
        <Grid item md={7} sm={7} xs={12} sx={{ textAlign: "right" }}>
          {isBranchRole && (
            <Fragment>
              <Button
                id="btnCoffee"
                variant="contained"
                color="primary"
                onClick={() => handleOpenSelectPeriodModal("COFFEE")}
                startIcon={<AddCircleOutline />}
                sx={{
                  width: 160,
                  mr: 2,
                  background: "#5468ff",
                  ":hover": { boxShadow: 6, background: "#3e4cb8" },
                }}
                className={classes.MbtnSearch}
              >
                ค่าใช้จ่ายร้านกาแฟ
              </Button>
              <Button
                id="btnStorefront"
                variant="contained"
                color="warning"
                onClick={() => handleOpenSelectPeriodModal("STOREFRONT")}
                sx={{ width: 160, mr: 2 }}
                startIcon={<AddCircleOutline />}
                className={classes.MbtnSearch}
              >
                ค่าใช้จ่ายหน้าร้าน
              </Button>
            </Fragment>
          )}
          <Button
            id="btnClear"
            variant="contained"
            disabled={isOpenLoading}
            onClick={handleClearSearch}
            sx={{ width: 110 }}
            className={classes.MbtnClear}
            color="cancelColor"
          >
            เคลียร์
          </Button>
          <Button
            id="btnSearch"
            variant="contained"
            color="primary"
            disabled={isOpenLoading}
            onClick={handleSearchExpense}
            // loading={isOpenLoading}
            // loadingIndicator={
            //   <Typography component="span" sx={{ fontSize: '11px' }}>
            //     กรุณารอสักครู่ <CircularProgress color="inherit" size={15} />
            //   </Typography>
            // }
            sx={{ width: 110, ml: 2 }}
            className={classes.MbtnSearch}
          >
            ค้นหา
          </Button>
        </Grid>
      </Grid>
      <LoadingModal open={isOpenLoading} />

      {openSelectPeriod && (
        <ModalSelectPeriod
          open={openSelectPeriod}
          onClose={handleCloseSelectPeriodModal}
          type={types}
          onConfirm={handleDataSelectPeriod}
        />
      )}

      {openDetailModal && (
        <ExpenseDetail
          isOpen={openDetailModal}
          onClickClose={handleCloseDetailModal}
          type={types}
          edit={false}
          periodProps={dataSelect}
        />
      )}

      {isSearch && (
        <div>
          {branchAccountingList.length > 0 && (
            <ExpenseSearchList onSelectRows={handleSelectRows} />
          )}
          {branchAccountingList.length === 0 && (
            <Grid item container xs={12} justifyContent="center">
              <Box color="#CBD4DB" sx={{ mt: 5 }}>
                <h2>ไม่มีข้อมูล</h2>
              </Box>
            </Grid>
          )}
        </div>
      )}

      <ModelConfirmSearch
        open={openModelConfirm}
        onClose={handleCloseModelConfirm}
        onConfirm={handleConfirm}
        items={branchAccountingList}
        summarizTitle={summarizTitle}
        summarizList={summarizList}
      />
      <AlertError
        open={openFailAlert}
        onClose={handleCloseFailAlert}
        textError={textFail}
        payload={payloadError}
      />

      <SnackbarStatus
        open={showSnackBar}
        onClose={handleCloseSnackBar}
        isSuccess={snackbarIsStatus}
        contentMsg={contentMsg}
      />
    </Fragment>
  );
}

const FormSelect = ({
  title,
  value,
  setValue,
  dataList,
  isValidate,
  isRequest,
  isDisabled,
}: FormSelectProps) => {
  const classes = useStyles();
  return (
    <Fragment>
      <Typography gutterBottom variant="subtitle1" component="div" mb={1}>
        {title}{" "}
        {isRequest && (
          <Typography component="span" color="red">
            *
          </Typography>
        )}
      </Typography>
      <FormControl
        id="SearchType"
        className={classes.Mselect}
        fullWidth
        error={value === "" && isValidate}
      >
        <Select
          id="type"
          name="type"
          value={value}
          disabled={isDisabled}
          onChange={(e) => setValue(e)}
          displayEmpty
          renderValue={
            value !== ""
              ? undefined
              : () => (
                  <div style={{ color: "#CBD4DB" }}>{`กรุณาเลือก${title}`}</div>
                )
          }
          inputProps={{ "aria-label": "Without label" }}
        >
          {dataList.map((item, index: number) => (
            <MenuItem key={index} value={item.key}>
              {item.text}
            </MenuItem>
          ))}
        </Select>
        {value === "" && isValidate && (
          <FormHelperText sx={{ ml: 0 }}>{`กรุณาเลือก${title}`}</FormHelperText>
        )}
      </FormControl>
    </Fragment>
  );
};
