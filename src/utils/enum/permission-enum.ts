export enum ACTIONS {
  PURCHASE_PN_EXPORT = "purchase.pn.export",
  PURCHASE_PI_CLOSE = "purchase.pi.close",
  PURCHASE_PI_EXPORT = "purchase.pi.export",
  PURCHASE_PI_DRAFT = "purchase.pi.draft",
  PURCHASE_FILE_DOWNLOAD = "purchase.file.download",
  PURCHASE_PN_VIEW = "purchase.pn.view",
  PURCHASE_PO_VIEW = "purchase.po.view",
  PURCHASE_PN_DRAFT = "purchase.pn.draft",
  PURCHASE_PN_EDIT = "purchase.pn.edit",
  PURCHASE_PI_VIEW = "purchase.pi.view",
  PURCHASE_PI_APPROVE = "purchase.pi.approve",
  PURCHASE_PI_EDIT = "purchase.pi.edit",
  PURCHASE_PN_APPROVE = "purchase.pn.approve",
  PURCHASE_FILE_REMOVE = "purchase.file.remove",
  CAMPAIGN_BD_PRINT = "campaign.bd.print",
  CAMPAIGN_BD_VIEW = "campaign.bd.view",
  CAMPAIGN_BD_CREATE = "campaign.bd.create",
  CAMPAIGN_BD_APPROVE = "campaign.bd.approve",
  CAMPAIGN_TO_VIEW = "campaign.to.view",
  CAMPAIGN_TO_CREATE = "campaign.to.create",
  CAMPAIGN_TO_APPROVE = "campaign.to.approve",
  CAMPAIGN_TO_CANCEL = "campaign.to.cancel",
  SUPPLIER_SEARCH = "supplier.search",
  PURCHASE_BR_VIEW = "purchase.br.view",
  PURCHASE_BR_MANAGE = "purchase.br.manage",

  STOCK_RT_VIEW = "stock.rt.view",
  STOCK_RT_MANAGE = "stock.rt.manage",
  STOCK_RT_SEND = "stock.rt.send",
  STOCK_RT_APPROVE = "stock.rt.approve",
  STOCK_RT_REJECT = "stock.rt.reject",

  STOCK_BT_VIEW = "stock.bt.view",
  STOCK_BT_MANAGE = "stock.rt.manage",
  STOCK_BT_SAVEDC = "stock.bt.save_dc",
  STOCK_BT_EXPORT = "stock.bt.export",
  STOCK_BT_WAITDC = "stock.bt.wait_dc",
  STOCK_BL_SKU = "stock.balance.view",
  STOCK_BL_LOCATION = "stock.balance.view",
  STOCK_MOVEMENT_VIEW = "stock.movement.view",

  STOCK_SC_MANAGE = "stock.sc.manage",
  STOCK_SC_VIEW = "stock.sc.view",

  STOCK_SA_MANAGE = "stock.sa.manage",
  STOCK_SA_VIEW = "stock.sa.view",

  AUTHORITY_CHECK = "authority.check",
  ORDER_RO_DRAFT = "order.ro.draft",
  ORDER_RO_APPROVE = "order.ro.approve",
  ORDER_RO_CLOSE = "order.ro.close",
  ORDER_RO_EDIT = "order.ro.edit",
  ORDER_RO_VIEW = "order.ro.view",
  ORDER_SD_EXPORT = "order.sd.export",
  ORDER_DC_VERIFY = "order.dc.verify",
  ORDER_DC_VIEW = "order.dc.view",
  PRODUCT_SEARCH = "product.search",

  ORDER_VER_VIEW = "order.ver.view",
  ORDER_VER_MANAGE = "order.ver.manage",
  ORDER_VER_APPROVE_ALL = "order.ver.manage",

  SALE_TAX_INVOICE_VIEW = "sale.tax.view",
  SALE_TAX_INVOICE_REQUEST = "sale.tax.view",

  ACCOUNTING_CONFIG_VIEW = "account.config.view",
  ACCOUNTING_VIEW = "account.ex.view",
  ACCOUNTING_MANAGE = "account.config.manage",
  ACCOUNTING_APPROVE3 = "account.ex.approve3",
  ACCOUNTING_REJECT3 = "account.ex.reject3",

  ACCOUNTING_CS_IMPORT = "account.cs.import",
  ACCOUNTING_CS_APPROVE = "account.cs.approve",
  ACCOUNTING_CS_EXPORT = "account.cs.export",
  ACCOUNTING_CS_MANAGE = "account.cs.manage",
  ACCOUNTING_CS_VIEW = "account.cs.view",
  SALE_SHIFT_VIEW = "sale.shift.view",
  SALE_SHIFT_MANAGE = "sale.shift.manage",
}

export enum MAINMENU {
  SALE = "sale",
  ORDER_RECEIVE = "orderReceive",
  STOCK_TRANSFER = "stockTransfer",
  TRANSFER_OUT = "transferOut",
  PRODUCT_INFO = "productInfo",
  PURCHASE_BRANCH = "purchaseBranch",
  EXPENSE = "expense",
  APP_CONFIG = "appConfig",
}

export enum SUBMENU {
  SALE_DISCOUNT = "sale.discount",
  SALE_SALE_LIMIT = "sale.saleLimit",
  SALE_TAX_INVOICE = "sale.taxinvoice",
  OR_ORDER_RECEIVE = "orderReceive.orderReceive",
  OR_DIFF = "orderReceive.stockDiff",
  OR_SUPPLIER = "orderReceive.supplier",
  ST_REQUEST = "stockTransfer.stockRequest",
  ST_TRANSFER = "stockTransfer.stockTransfer",
  TO_DESTROY = "transferOut.destroy",
  TO_STORE_USE = "transferOut.storeUse",
  PI_STOCK_BALANCE = "productInfo.stockOutstanding",
  PI_STOCK_MOVEMENT = "productInfo.stockMovement",
  PI_PRODUCT_MASTER = "productInfo.productMaster",
  PR_CREATE_PURCHASE_BRANCH = "purchasebranch.createPurchaseBranch",
  EX_EXPENSE = "account.expense",
  EX_CONFIG = "account.config",
  EX_CLOSE_SALE_SHIFT = "account.closeSaleShift",
  CASH_STATEMENT = "cash.statement",
  EX_OPEN_END = "account.openEnd",
}

export enum PERMISSION_GROUP {
  DC = "dc",
  SCM = "scm",
  OC = "oc",
  BRANCH = "branch",
  AREA_MANAGER = "areaManager",
  AUDIT = "audit",
  DISTRICT_MANAGER = "districtManager",
  SM = "storeManagement",
  ACCOUNTING = "accounting",
  ACCOUNT_MANAGER = "accountManager",
  PI = "operationProcess",
  PCM = "procurement",
  RTC = "readyToClear",
  DATA = "data",
  IT_SUPPORT = "itSupport",
  FINANCE = "finance",
}

export const KEYCLOAK_GROUP_DC01 = "/service.posback/D001";
export const KEYCLOAK_GROUP_DC02 = "/service.posback/D002";
export const KEYCLOAK_GROUP_SCM01 = "/service.posback/scm01";
export const KEYCLOAK_GROUP_OC01 = "/service.posback/oc01";
export const KEYCLOAK_GROUP_BRANCH_MANAGER01 =
  "/service.posback/branch-manager";
export const KEYCLOAK_GROUP_BRANCH_MANAGER = "/service.posback/manager";
export const KEYCLOAK_GROUP_AREA_MANAGER01 = "/service.posback/area-manager01";
export const KEYCLOAK_GROUP_AREA_MANAGER02 = "/service.posback/area-manager02";
export const KEYCLOAK_GROUP_AUDIT = "/service.posback/audit";
export const KEYCLOAK_GROUP_DISTRICT_MANAGER =
  "/service.posback/district-manager";
export const KEYCLOAK_GROUP_SM = "/service.posback/sm";
export const KEYCLOAK_GROUP_ACCOUNTING = "/service.posback/accounting";
export const KEYCLOAK_GROUP_PI = "/service.posback/pi";
export const KEYCLOAK_GROUP_PCM = "/service.posback/pcm";
export const KEYCLOAK_GROUP_RTC = "/service.posback/rtc";
export const KEYCLOAK_GROUP_DATA = "/service.posback/data";
export const KEYCLOAK_GROUP_ACCOUNTING_MANAGER =
  "/service.posback/account-manager";
export const KEYCLOAK_IT_SUPPORT = "/service.posback/it-support";
export const KEYCLOAK_GROUP_FINANCE = "/service.posback/finance";
