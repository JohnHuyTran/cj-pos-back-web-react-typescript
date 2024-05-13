import {
  AccountAccountExpenses,
  CloseSaleShiftInfo,
  CloseSaleShiftResponse,
  DataItem,
  ExpenseInfo,
  ExpensePeriod,
  ItemItem,
  SumItems,
  SumItemsItem,
} from "../models/branch-accounting-model";

export const mockExpenseInfo001: ExpenseInfo = {
  accountNameTh: "ค่าน้ำแข็งหลอด",
  skuCode: "000000700000007",
  approvalLimit1: 2000,
  approvalLimit2: 0,
  isActive: true,
  requiredDocumentTh: "ใบเสร็จ",
  expenseNo: "001",
  isOtherExpense: false,
  typeCode: "",
  accountCode: "",
  typeNameTh: "",
};
export const mockExpenseInfo002: ExpenseInfo = {
  accountNameTh: "ค่าน้ำดื่มชงกาแฟ",
  skuCode: "000000700000007",
  approvalLimit1: 2000,
  approvalLimit2: 0,
  isActive: true,
  requiredDocumentTh: "ใบเสร็จ",
  expenseNo: "002",
  isOtherExpense: false,
  typeCode: "",
  accountCode: "",
  typeNameTh: "",
};
export const mockExpenseInfo003: ExpenseInfo = {
  accountNameTh: "ค่าไช่ไก่",
  skuCode: "000000700000007",
  approvalLimit1: 2000,
  approvalLimit2: 0,
  isActive: true,
  requiredDocumentTh: "ใบเสร็จ",
  expenseNo: "003",
  isOtherExpense: false,
  typeCode: "",
  accountCode: "",
  typeNameTh: "",
};
export const mockExpenseInfo004: ExpenseInfo = {
  accountNameTh: "ค่านม",
  skuCode: "000000700000007",
  approvalLimit1: 2000,
  approvalLimit2: 0,
  isActive: true,
  requiredDocumentTh: "ใบเสร็จ",
  expenseNo: "004",
  isOtherExpense: false,
  typeCode: "",
  accountCode: "",
  typeNameTh: "",
};
export const mockExpenseInfo005: ExpenseInfo = {
  accountNameTh: "ค่าจ่างรายวัน",
  skuCode: "000000700000007",
  approvalLimit1: 2000,
  approvalLimit2: 0,
  isActive: true,
  requiredDocumentTh: "ใบเสร็จ",
  expenseNo: "005",
  isOtherExpense: true,
  typeCode: "",
  accountCode: "",
  typeNameTh: "",
};
export const mockExpenseInfo006: ExpenseInfo = {
  accountNameTh: "สิ้นเปลือง",
  skuCode: "000000700000007",
  approvalLimit1: 2000,
  approvalLimit2: 0,
  isActive: true,
  requiredDocumentTh: "ใบเสร็จ",
  expenseNo: "006",
  isOtherExpense: true,
  typeCode: "",
  accountCode: "",
  typeNameTh: "",
};

const fetchMasterExpense = {
  timestamp: "2022-05-10T04:30:57.797+0000",
  ref: "6279ea81972d0d933de2ab9f",
  code: 20000,
  message: "success",
  data: [
    mockExpenseInfo001,
    mockExpenseInfo002,
    mockExpenseInfo003,
    mockExpenseInfo004,
    mockExpenseInfo005,
    mockExpenseInfo006,
  ],
};

const summaryItem001: SumItemsItem = {
  expenseNo: "001",
  withdrawAmount: 100,
  approvedAmount: 100,
  isOtherExpense: false,
};

const summaryItem002: SumItemsItem = {
  expenseNo: "002",
  withdrawAmount: 200,
  approvedAmount: 200,
  isOtherExpense: false,
};
const summaryItem003: SumItemsItem = {
  expenseNo: "003",
  withdrawAmount: 300,
  approvedAmount: 300,
  isOtherExpense: false,
};
const summaryItem004: SumItemsItem = {
  expenseNo: "004",
  withdrawAmount: 400,
  approvedAmount: 400,
  isOtherExpense: false,
};
const summaryItem005: SumItemsItem = {
  expenseNo: "005",
  withdrawAmount: 500,
  approvedAmount: 500,
  isOtherExpense: false,
};

const summary: SumItems = {
  items: [
    summaryItem001,
    summaryItem002,
    summaryItem003,
    summaryItem004,
    summaryItem005,
  ],
  sumWithdrawAmount: 606,
  sumApprovalAmount: 900,
};

const item001: ItemItem = {
  expenseNo: "001",
  amount: 100,
  isOtherExpense: false,
};

const item002: ItemItem = {
  expenseNo: "002",
  amount: 200,
  isOtherExpense: false,
};

const item003: ItemItem = {
  expenseNo: "003",
  amount: 300,
  isOtherExpense: false,
};

const item004: ItemItem = {
  expenseNo: "004",
  amount: 400,
  isOtherExpense: false,
};

const item005: ItemItem = {
  expenseNo: "005",
  amount: 500,
  isOtherExpense: false,
};

const expenseByDay01: DataItem = {
  expenseDate: "01/07/2565",
  items: [item001, item002, item003, item004, item005],
  totalAmount: 1000,
};
const expenseByDay02: DataItem = {
  expenseDate: "02/07/2565",
  items: [item001, item002, item003, item004, item005],
  totalAmount: 200,
};
const expenseByDay03: DataItem = {
  expenseDate: "03/07/2565",
  items: [item001, item002, item003, item004, item005],
  totalAmount: 9000,
};

export const periodMockData: ExpensePeriod = {
  period: 1,
  startDate: "2022-06-30T17:00:00Z",
  endDate: "2022-07-15T16:59:59.999999999Z",
};
const accountExpense: AccountAccountExpenses = {
  id: "",
  branchCode: "0101",
  docNo: "BA0001",
  type: "COFFEE",
  month: 0,
  year: 0,
  expensePeriod: periodMockData,
  status: "DRAFT",
  attachFiles: [],
  editAttachFiles: [],
  approvalAttachFiles: [],
  sumItems: summary,
  items: [expenseByDay01, expenseByDay02, expenseByDay03],
  comments: [],
  expenseDate: "",
  approvedDate: "",
  nextApprover: "",
  auditLogs: [],
  createdBy: "",
  lastModifiedBy: "",
  createdDate: "",
  lastModifiedDate: "",
};

const rsExpenseDetail = {
  timestamp: "2022-05-10T04:30:57.797+0000",
  ref: "6279ea81972d0d933de2ab9f",
  code: 20000,
  message: "success",
  data: accountExpense,
};

export function featchMasterExpenseListAsyncMockup() {
  return new Promise((resolve, reject) => {
    resolve(fetchMasterExpense);
  });
}

export function featchExpenseDetailAsyncMockup() {
  return new Promise((resolve, reject) => {
    resolve(rsExpenseDetail);
  });
}

const closeSaleShiftInfo: CloseSaleShiftInfo = {
  posUser: "CJG",
  posCode: "001",
  shiftCode: "20220707-006",
  status: "CORRECT",
  shiftAmount: 300,
  billAmount: 300,
  noOfSaleBill: 10,
  noOfReturnBill: 10,
  shiftDate: "2022-07-16T17:00:00Z",
  confirmAmount: 100,
  branchCode: "0101",
  shiftKey: "skfjksdf",
};

const closeSaleShiftRs: CloseSaleShiftResponse = {
  timestamp: "",
  ref: "",
  code: 2000,
  message: "success",
  data: [closeSaleShiftInfo],
  total: 4,
  page: 1,
  perPage: 10,
  totalPage: 1,
  prev: 0,
  next: 0,
};

export function featchCloseSaleShiftRsMockup() {
  return new Promise((resolve, reject) => {
    resolve(closeSaleShiftRs);
  });
}

const viewOpenEndRs = {
  timestamp: "2022-08-02T04:10:31.965+0000",
  ref: "62e8a3b7f3948986e2d51bdc",
  code: 20000,
  message: "success",
  data: {
    branchCode: "B005",
    branchName: "สำนักงานใหญ่สีลม Operation",
    docNo: "OE22080101-012",
    shiftDate: "2022-07-20T17:00:00Z",
    noOfSaleBill: 5,
    bypass: "NONE",
    settlementFiles: [
      {
        fileKey: "OpenEnd/OE2208M04C-003-01.pdf",
        fileName: "BT22020002-000009-Box.pdf",
        mimeType: "application/pdf",
        branchCode: "M04C",
      },
      {
        fileKey: "OpenEnd/OE2208M04C-003-02.pdf",
        fileName: "BT22020002-000010-Box.pdf",
        mimeType: "application/pdf",
        branchCode: "M04C",
      },
    ],
    summarizeCashDeposite: {
      dailyIncomeAmount: 33850.5,
      cashOverShortAmount: 50,
      totalCashAmount: 350,
      cdmAmount: 25,
      totalPayAmount: 0,
      depositeAmount: 100515,
      nextCDMAmount: 15,
      diffDepositeAmount: -66664.5,
    },
    income: {
      totalIncomeAmount: 15000,
      cashAmount: 0,
      diffAmount: 0,
      paymentTypeItems: [
        {
          code: "01",
          name: "บัตรประชารัฐ(KTB)",
          amount: 100,
        },
        {
          code: "02",
          name: "บัตรประชารัฐ E-Money",
          amount: 34,
        },
        {
          code: "05",
          name: "บัตรเครดิตey",
          amount: 300,
          isSettlementFile: true,
        },
        {
          code: "11",
          name: "บัตรประชารัฐ(KTB)",
          amount: 100,
        },
        {
          code: "12",
          name: "บัตรประชารัฐ E-Money",
          amount: 34,
        },
        {
          code: "15",
          name: "บัตรเครดิตey",
          amount: 300,
          isSettlementFile: true,
        },
        {
          code: "21",
          name: "บัตรประชารัฐ(KTB)",
          amount: 100,
        },
        {
          code: "22",
          name: "บัตรประชารัฐ E-Money",
          amount: 34,
        },
        {
          code: "25",
          name: "บัตรเครดิตey",
          amount: 300,
          isSettlementFile: true,
        },
      ],
      totalTypeAmount: 0,
      typeItems: [
        {
          code: "07",
          name: "ค่าเดินทาง",
          amount: 54,
        },
      ],
      totalAmount: 0,
      netAmount: 0,
      netAmountNonVat: 0,
    },
    externalIncome: {
      totalExIncomeAmount: 350,
      items: [
        {
          code: "03",
          name: "Center Topping",
          amount: 350,
          noItem: false,
        },
        {
          code: "02",
          name: "บุญเติม",
          amount: null,
          noItem: false,
        },
        {
          code: "01",
          name: "AJ เติมสบาย",
          amount: 0,
          noItem: true,
        },
      ],
    },
    cashPayment: {
      totalPayAmount: 4750,
      iceAmount: 150,
      yakultAmount: 100,
      coffeeExpenseAmount: 1500,
      frontExpenseAmount: 3000,
    },
    shiftCodes: null,
    status: "DRAFT",
    comment: "comment test",
  },
};
const responsSuccess = {
  timestamp: "2022-08-02T04:10:31.965+0000",
  ref: "62e8a3b7f3948986e2d51bdc",
  code: 20000,
  message: "success",
};

const responsFail = {
  timestamp: "2022-08-02T04:10:31.965+0000",
  ref: "62e8a3b7f3948986e2d51bdc",
  code: 40001,
  message: "error",
};

export function featchViewOpenEndRsMockup() {
  return new Promise((resolve, reject) => {
    resolve(viewOpenEndRs);
  });
}

export function byPassByBranchMock() {
  return new Promise((resolve, reject) => {
    // resolve(responsSuccess);
    reject(responsFail);
  });
}
