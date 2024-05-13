export enum EXPENSE_TYPE_SETTING {
  COFFEE = "COFFEE",
  STOREFRONT = "STOREFRONT",
}

export const expenseTypesSetting = [
  { key: "COFFEE", text: "ค่าใช้จ่ายร้านกาแฟ" },
  { key: "STOREFRONT", text: "ค่าใช้จ่ายหน้าร้าน" },
];

export const getExpenseTypesSetting = (key: string) =>
  expenseTypesSetting.find((item) => item.key === key)?.text;
