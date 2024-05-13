import { FileType } from "./common-model";

//master Expense
export interface ExpenseInfo {
  typeCode: string;
  typeNameTh: string;
  expenseNo: string;
  accountCode: string;
  accountNameTh: string;
  skuCode: string;
  approvalLimit1: number;
  approvalLimit2: number;
  isActive: boolean;
  isOtherExpense: boolean;
  requiredDocumentTh: string;
}

export interface ExpenseMasterResponseType {
  data: ExpenseInfo[];
  ref: string;
  code: number;
  message: string;
}

// response inq

export interface ExpenseDetailResponseType {
  data: AccountAccountExpenses | null | [];
  ref: string;
  code: number;
  message: string;
}

export interface ExpenseSaveRequest {
  id?: string;
  branchCode?: string;
  docNo?: string;
  type?: string;
  month?: number;
  year?: number;
  expensePeriod?: ExpensePeriod | null;
  status?: string;
  attachFiles?: FileType[];
  editAttachFiles?: FileType[];
  approvalAttachFiles?: FileType[];
  sumItems?: SumItemsItem[];
  items?: DataItem[];
  comment?: string;
  expenseDate?: string;
  approvedDate?: string;
  nextApprover?: string;
  auditLogs?: AuditLog[];
  createdBy?: string;
  lastModifiedBy?: string;
  createdDate?: string;
  lastModifiedDate?: string;
  today?: string;
  route?: string;
}

export interface AccountAccountExpenses {
  id?: string;
  branchCode?: string;
  docNo?: string;
  type: string;
  month?: number;
  year?: number;
  expensePeriod?: ExpensePeriod;
  status?: string;
  attachFiles?: FileType[];
  editAttachFiles?: FileType[];
  approvalAttachFiles?: FileType[];
  sumItems?: SumItems;
  items?: DataItem[];
  comments?: Comment[];
  expenseDate?: string;
  approvedDate?: string;
  nextApprover?: string;
  auditLogs?: AuditLog[];
  createdBy?: string;
  lastModifiedBy?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}
export interface ExpensePeriod {
  period: number; //งวด 1,2
  startDate: string;
  endDate: string;
}

export interface DataItem {
  expenseDate: string;
  items: ItemItem[];
  totalAmount?: number;
}

export interface ItemItem {
  expenseNo: string;
  amount: number;
  isOtherExpense: boolean;
}

export interface SumItems {
  items: SumItemsItem[];
  sumWithdrawAmount?: number;
  sumApprovalAmount?: number;
}

export interface SumItemsItem {
  expenseNo: string;
  withdrawAmount?: number;
  approvedAmount?: number;
  isOtherExpense: boolean;
}
export interface Comment {
  username: string;
  status: string;
  commentDate: string;
  comment: string;
}
export interface Differ {
  type: string;
  path: any[];
  from: string;
  to: string;
}

export interface AuditLog {
  activity: string;
  comment?: string;
  editBy: string;
  editByName: string;
  editDate: string;
  differ?: Differ[];
}
export interface payLoadAdd {
  id: number;
  key: string;
  value: string | number;
  title: string;
  isOtherExpense?: boolean;
}
export interface ExpensePeriodTypeResponse {
  ref: string;
  code: number;
  message: string;
  data: PeriodInfo | null | [];
}

export interface PeriodInfo {
  period: number;
  startDate: string;
  endDate: string;
}

// Search request
export interface ExpenseSearchRequest {
  limit: string;
  page: string;
  sortBy?: string;
  sortDirection?: string;
  type: string;
  branchCode: string;
  status: string;
  month: number;
  year: number;
  period?: number;
}

export interface ExpenseSearch {
  limit: string;
  page: string;
  type: string;
  status: string;
  branchCode: string;
  month: number;
  year: number;
  period: number;
}

// Search response
export interface ExpenseSearchResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: ExpenseSearchInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface ExpenseSearchInfo {
  branchCode: string;
  branchName: string;
  docNo: string;
  type: string;
  expensePeriod: ExpensePeriod[];
  status: string;
  sumWithdrawAmount: number;
  sumApprovalAmount: number;
  expenseDate: string;
  approvedDate: string;
}

export interface ExpensePeriod {
  period: number;
  startDate: string;
  endDate: string;
}

export interface SummarizeRequest {
  type: string;
  year: number;
  month: number;
  period?: number;
}
export interface Summarize {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: SummarizeInfo | null | [];
}

export interface SummarizeInfo {
  total: number;
  sumApprovedAmount: number;
  sumItems: SummarizeSumItems;
}

export interface SummarizeSumItems {
  expenseNo: string;
  approvedAmount: number;
}

// Search config request
export interface ExpenseSearchCofigRequest {
  limit: string;
  page: string;
  sortBy?: string;
  sortDirection?: string;
  type: string;
  isActive?: string | boolean;
}

export interface ExpenseSearchCofigResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: ExpenseSearchConfigInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface ExpenseSearchConfigInfo {
  typeCode: string;
  typeNameTh: string;
  expenseNo: string;
  accountCode: string;
  accountNameTh: string;
  skuCode: string;
  skuName: string;
  approvalLimit1: number;
  approvalLimit2: number;
  isActive: boolean;
  isOtherExpense: boolean;
}

export interface ExpenseApprove3ByDocNos {
  expenseDate?: string;
  approvedDate?: string;
  docNos?: any[];
}

export interface ExpenseApprove3All {
  expenseDate?: string;
  approvedDate?: string;
  criteria?: ExpenseApprove3AllCriteria;
}
export interface ExpenseApprove3AllCriteria {
  type: string;
  month: number;
  year: number;
  period: number;
}
export interface ExpenseConfigCreateRequest {
  types: any;
  isOtherExpense?: boolean;
  accountCode: string;
  accountNameTh: string;
  skuCode: string;
  approvalLimit1: number;
  approvalLimit2: number;
  isActive: boolean;
  requiredDocumentTh?: string;
}

export interface ExpenseConfigUpdateRequest {
  isActive: boolean;
  accountCode: string;
  accountNameTh: string;
  skuCode: string;
  approvalLimit1: number;
  approvalLimit2: number;
  requiredDocumentTh: string;
}

export interface CloseSaleShiftRequest {
  shiftDate?: string;
  branchCode?: string;
  status?: string;
  bypassStatus?: string;
  page?: number;
  limit?: number;
}
export interface CloseSaleShiftResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: CloseSaleShiftInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface CloseSaleShiftInfo {
  branchCode: string;
  shiftCode: string;
  shiftKey: string;
  shiftDate: string;
  shiftAmount: number | null;
  billAmount: number | null;
  confirmAmount: number | null;
  noOfSaleBill: number;
  noOfReturnBill: number;
  status: string;
  posCode: string;
  posUser: string;
  bypass?: bypassInfo | null;
}
export interface bypassInfo {
  status: string;
  remark: string;
  shiftAmount: number;
}

export interface ExternalIncomeItemInfo {
  code: string;
  name: string;
  amount: number;
  noItem: boolean;
}

export interface CashStatementEditRequest {
  id: string;
  cashDate: string;
  cashOver: number;
  cashShort: number;
}

export interface CashStatementSearchRequest {
  limit: string;
  page: string;
  status: string;
  branchCode: string;
  dateFrom: any;
  dateTo: any;
  clearSearch?: boolean;
}

export interface CashStatementSearchResponse {
  ref: string;
  code: number;
  message: string;
  data: CashStatementInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}

export interface CashStatementInfo {
  branchCode: BranchCodeInfo | null;
  id: string;
  salesDate: any;
  cashDate: any;
  cashOver: any;
  cashShort: any;
  status: string;
}
export interface BranchCodeInfo {
  code: string;
  name: string;
}

//open-end
export interface OpenEndSearchRequest {
  limit: string;
  page: string;
  status: string;
  branchCode: string;
  dateFrom: any;
  dateTo: any;
}
export interface OpenEndSearchResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: OpenEndSearchInfo[];
  total: number;
  page: number;
  perPage: number;
  prev: number;
  next: number;
  totalPage: number;
}
export interface OpenEndSearchInfo {
  branchCode: string;
  branchName: string;
  docNo: string;
  shiftDate: any;
  noOfSaleBill: number;
  dailyIncomeAmount: number;
  depositeAmount: number;
  diffDepositeAmount: number;
  status: string;
  comment: string;
  bypass: string;
}
export interface ViewOpenEndResponse {
  timestamp: string;
  ref: string;
  code: number;
  message: string;
  data: ViewOpenEndInfo | null;
}
export interface ViewOpenEndInfo {
  branchCode: string;
  branchName: string;
  docNo: string;
  shiftDate: string;
  noOfSaleBill: number;
  bypass: string;
  settlementFiles: FilesSettlement | null;
  summarizeCashDeposite: SummarizeCashDeposite;
  income: Income;
  externalIncome: ExternalIncome;
  cashPayment: CashPayment;
  shiftCodes: [];
  status: string;
  comment: string;
}
export interface FilesSettlement {
  fileKey: string;
  fileName: string;
  mimeType: string;
  branchCode: string;
}
export interface SummarizeCashDeposite {
  dailyIncomeAmount: number;
  cashOverShortAmount: number;
  totalCashAmount: number;
  cdmAmount: number;
  totalPayAmount: number;
  depositeAmount: number;
  nextCDMAmount: number;
  diffDepositeAmount: number;
}
export interface Income {
  totalIncomeAmount: number;
  cashAmount: number;
  diffAmount: number;
  paymentTypeItems: Item[];
  totalTypeAmount: number;
  typeItems: Item[];
  totalAmount: number;
  netAmount: number;
  netAmountNonVat: number;
}
export interface ExternalIncome {
  totalExIncomeAmount: number;
  items: Item[];
}
export interface Item {
  code: string;
  name: string;
  amount: number;
  noItem?: boolean;
  isSettlementFile?: boolean;
}

export interface CashPayment {
  totalPayAmount: number;
  iceAmount: number;
  yakultAmount: number;
  coffeeExpenseAmount: number;
  frontExpenseAmount: number;
}

export interface BypassPayload {
  branchCode?: string;
  shiftCode?: string;
  remark?: string;
  payload?: string;
}
