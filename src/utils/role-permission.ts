import { env } from "../adapters/environmentConfigs";
import { KeyCloakTokenInfo } from "../models/keycolak-token-info";
import { getUserInfo } from "../store/sessionStore";
import {
  ACTIONS,
  KEYCLOAK_GROUP_ACCOUNTING,
  KEYCLOAK_GROUP_AREA_MANAGER01,
  KEYCLOAK_GROUP_AREA_MANAGER02,
  KEYCLOAK_GROUP_AUDIT,
  KEYCLOAK_GROUP_BRANCH_MANAGER,
  KEYCLOAK_GROUP_BRANCH_MANAGER01,
  KEYCLOAK_GROUP_DC01,
  KEYCLOAK_GROUP_DC02,
  KEYCLOAK_GROUP_DISTRICT_MANAGER,
  KEYCLOAK_GROUP_OC01,
  KEYCLOAK_GROUP_SCM01,
  KEYCLOAK_GROUP_SM,
  MAINMENU,
  PERMISSION_GROUP,
  SUBMENU,
  KEYCLOAK_GROUP_PI,
  KEYCLOAK_GROUP_PCM,
  KEYCLOAK_GROUP_DATA,
  KEYCLOAK_GROUP_ACCOUNTING_MANAGER,
  KEYCLOAK_IT_SUPPORT,
  KEYCLOAK_GROUP_FINANCE,
} from "./enum/permission-enum";

const _ = require("lodash");

export const getUserGroup = (groups: string[]) => {
  const group = groups.length > 0 ? groups[0] : "";
  if (!group) {
    return "";
  }

  if (group === KEYCLOAK_GROUP_DC01 || group === KEYCLOAK_GROUP_DC02) {
    return PERMISSION_GROUP.DC;
  } else if (
    group === KEYCLOAK_GROUP_BRANCH_MANAGER01 ||
    group === KEYCLOAK_GROUP_BRANCH_MANAGER
  ) {
    return PERMISSION_GROUP.BRANCH;
  } else if (group === KEYCLOAK_GROUP_SCM01) {
    return PERMISSION_GROUP.SCM;
  } else if (group === KEYCLOAK_GROUP_OC01) {
    return PERMISSION_GROUP.OC;
  } else if (
    group === KEYCLOAK_GROUP_AREA_MANAGER01 ||
    group === KEYCLOAK_GROUP_AREA_MANAGER02
  ) {
    return PERMISSION_GROUP.AREA_MANAGER;
  } else if (group === KEYCLOAK_GROUP_AUDIT) {
    return PERMISSION_GROUP.AUDIT;
  } else if (group === KEYCLOAK_GROUP_DISTRICT_MANAGER) {
    return PERMISSION_GROUP.DISTRICT_MANAGER;
  } else if (group === KEYCLOAK_GROUP_SM) {
    return PERMISSION_GROUP.SM;
  } else if (group === KEYCLOAK_GROUP_ACCOUNTING) {
    return PERMISSION_GROUP.ACCOUNTING;
  } else if (group === KEYCLOAK_GROUP_PI) {
    return PERMISSION_GROUP.PI;
  } else if (group === KEYCLOAK_GROUP_PCM) {
    return PERMISSION_GROUP.PCM;
  } else if (group === KEYCLOAK_GROUP_DATA) {
    return PERMISSION_GROUP.DATA;
  } else if (group === KEYCLOAK_GROUP_ACCOUNTING_MANAGER) {
    return PERMISSION_GROUP.ACCOUNT_MANAGER;
  } else if (group === KEYCLOAK_IT_SUPPORT) {
    return PERMISSION_GROUP.IT_SUPPORT;
  } else if (group === KEYCLOAK_GROUP_FINANCE) {
    return PERMISSION_GROUP.FINANCE;
  }

  return "";
};

export const isAllowActionPermission = (key: string) => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  const permissionObj = _.get(permission, userInfo.group);
  return !permissionObj.action.some((_a: string) => {
    return _a === key;
  });
};

export const isAllowMainMenuPermission = (key: string) => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  const permissionObj = _.get(permission, userInfo.group);
  return !permissionObj.menu.mainmenu.some((_a: string) => {
    return _a === key;
  });
};

export const isAllowSubMenuPermission = (key: string) => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  const permissionObj = _.get(permission, userInfo.group);
  return !permissionObj.menu.submenu.some((_a: string) => {
    return _a === key;
  });
};

export const isGroupDC = () => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  return userInfo.group === PERMISSION_GROUP.DC;
};
export const isGroupBranch = () => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  return userInfo.group === PERMISSION_GROUP.BRANCH;
};
export const isGroupOC = () => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  return userInfo.group === PERMISSION_GROUP.OC;
};

export const isGroupBranchParam = (group: string) => {
  return group === PERMISSION_GROUP.BRANCH;
};

export const isGroupAuditParam = (group: string) => {
  return group === PERMISSION_GROUP.AUDIT;
};
export const isGroupSupport = () => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  return userInfo.group === PERMISSION_GROUP.IT_SUPPORT;
};

export const isGroupFinance = () => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  return userInfo.group === PERMISSION_GROUP.FINANCE;
};

export const isPreferredUsername = () => {
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  return userInfo.preferred_username;
};

export const isChannelBranch = () => {
  return env.branch.channel === "branch" ? true : false;
};

const permission = {
  scm: {
    menu: {
      mainmenu: [MAINMENU.STOCK_TRANSFER, MAINMENU.PRODUCT_INFO],
      submenu: [SUBMENU.ST_REQUEST, SUBMENU.PI_PRODUCT_MASTER],
    },
    action: [
      ACTIONS.STOCK_RT_APPROVE,
      ACTIONS.STOCK_RT_REJECT,
      ACTIONS.STOCK_RT_VIEW,
      ACTIONS.STOCK_RT_MANAGE,
    ],
  },
  oc: {
    menu: {
      mainmenu: [
        MAINMENU.ORDER_RECEIVE,
        MAINMENU.STOCK_TRANSFER,
        MAINMENU.PRODUCT_INFO,
        MAINMENU.PURCHASE_BRANCH,
        MAINMENU.EXPENSE,
      ],
      submenu: [
        SUBMENU.OR_ORDER_RECEIVE,
        SUBMENU.ST_REQUEST,
        SUBMENU.PI_STOCK_BALANCE,
        SUBMENU.PI_STOCK_MOVEMENT,
        SUBMENU.PI_PRODUCT_MASTER,
        SUBMENU.PR_CREATE_PURCHASE_BRANCH,
        SUBMENU.EX_EXPENSE,
      ],
    },
    action: [
      ACTIONS.STOCK_RT_VIEW,
      ACTIONS.STOCK_RT_APPROVE,
      ACTIONS.STOCK_RT_REJECT,
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
      ACTIONS.PURCHASE_BR_VIEW,
    ],
  },
  dc: {
    menu: {
      mainmenu: [MAINMENU.STOCK_TRANSFER, MAINMENU.ORDER_RECEIVE],
      submenu: [SUBMENU.OR_DIFF, SUBMENU.OR_ORDER_RECEIVE, SUBMENU.ST_TRANSFER],
    },
    action: [
      ACTIONS.STOCK_BT_VIEW,
      ACTIONS.STOCK_BT_EXPORT,
      ACTIONS.ORDER_VER_VIEW,
      ACTIONS.ORDER_VER_MANAGE,
    ],
  },
  branch: {
    menu: {
      mainmenu: [
        MAINMENU.SALE,
        MAINMENU.STOCK_TRANSFER,
        MAINMENU.ORDER_RECEIVE,
        MAINMENU.TRANSFER_OUT,
        MAINMENU.PRODUCT_INFO,
        MAINMENU.PURCHASE_BRANCH,
        MAINMENU.EXPENSE,
      ],
      submenu: [
        SUBMENU.SALE_DISCOUNT,
        SUBMENU.SALE_SALE_LIMIT,
        SUBMENU.SALE_TAX_INVOICE,
        SUBMENU.OR_ORDER_RECEIVE,
        SUBMENU.OR_DIFF,
        SUBMENU.OR_SUPPLIER,
        SUBMENU.ST_REQUEST,
        SUBMENU.ST_TRANSFER,
        SUBMENU.TO_DESTROY,
        SUBMENU.TO_STORE_USE,
        SUBMENU.PI_STOCK_BALANCE,
        SUBMENU.PI_STOCK_MOVEMENT,
        SUBMENU.PI_PRODUCT_MASTER,
        SUBMENU.PR_CREATE_PURCHASE_BRANCH,
        SUBMENU.EX_EXPENSE,
        SUBMENU.EX_CLOSE_SALE_SHIFT,
        SUBMENU.EX_OPEN_END,
      ],
    },
    action: [
      ACTIONS.STOCK_RT_VIEW,
      ACTIONS.STOCK_RT_MANAGE,
      ACTIONS.STOCK_RT_SEND,
      ACTIONS.STOCK_RT_APPROVE,
      ACTIONS.STOCK_RT_REJECT,
      ACTIONS.STOCK_BT_VIEW,
      ACTIONS.STOCK_BT_MANAGE,
      ACTIONS.STOCK_BT_SAVEDC,
      ACTIONS.STOCK_BT_EXPORT,
      ACTIONS.ORDER_VER_VIEW,
      ACTIONS.ORDER_VER_MANAGE,
      ACTIONS.ORDER_SD_EXPORT,
      ACTIONS.SALE_TAX_INVOICE_VIEW,
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
      ACTIONS.PURCHASE_BR_VIEW,
      ACTIONS.PURCHASE_BR_MANAGE,
      ACTIONS.SALE_SHIFT_MANAGE,
      ACTIONS.SALE_SHIFT_VIEW,
    ],
  },
  areaManager: {
    menu: {
      mainmenu: [
        MAINMENU.SALE,
        MAINMENU.TRANSFER_OUT,
        MAINMENU.PRODUCT_INFO,
        MAINMENU.PURCHASE_BRANCH,
        MAINMENU.EXPENSE,
      ],
      submenu: [
        SUBMENU.SALE_DISCOUNT,
        SUBMENU.SALE_SALE_LIMIT,
        SUBMENU.TO_DESTROY,
        SUBMENU.TO_STORE_USE,
        SUBMENU.PI_STOCK_BALANCE,
        SUBMENU.PI_STOCK_MOVEMENT,
        SUBMENU.PI_PRODUCT_MASTER,
        SUBMENU.PR_CREATE_PURCHASE_BRANCH,
        SUBMENU.EX_EXPENSE,
      ],
    },
    action: [
      ACTIONS.STOCK_RT_VIEW,
      ACTIONS.STOCK_RT_MANAGE,
      ACTIONS.STOCK_RT_SEND,
      ACTIONS.STOCK_RT_APPROVE,
      ACTIONS.STOCK_RT_REJECT,
      ACTIONS.STOCK_BT_VIEW,
      ACTIONS.STOCK_BT_MANAGE,
      ACTIONS.STOCK_BT_SAVEDC,
      ACTIONS.STOCK_BT_EXPORT,
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
      ACTIONS.PURCHASE_BR_VIEW,
    ],
  },
  storeManagement: {
    menu: {
      mainmenu: [MAINMENU.PRODUCT_INFO],
      submenu: [
        SUBMENU.PI_STOCK_BALANCE,
        SUBMENU.PI_STOCK_MOVEMENT,
        SUBMENU.PI_PRODUCT_MASTER,
      ],
    },
    action: [
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
    ],
  },
  audit: {
    menu: {
      mainmenu: [MAINMENU.TRANSFER_OUT, MAINMENU.PRODUCT_INFO],
      submenu: [
        SUBMENU.TO_DESTROY,
        SUBMENU.TO_STORE_USE,
        SUBMENU.PI_STOCK_BALANCE,
        SUBMENU.PI_PRODUCT_MASTER,
        SUBMENU.PI_STOCK_MOVEMENT,
      ],
    },
    action: [
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
    ],
  },
  districtManager: {
    menu: {
      mainmenu: [MAINMENU.PRODUCT_INFO],
      submenu: [
        SUBMENU.PI_STOCK_BALANCE,
        SUBMENU.PI_STOCK_MOVEMENT,
        SUBMENU.PI_PRODUCT_MASTER,
      ],
    },
    action: [
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
    ],
  },
  accounting: {
    menu: {
      mainmenu: [MAINMENU.SALE, MAINMENU.EXPENSE],
      submenu: [SUBMENU.SALE_SALE_LIMIT, SUBMENU.EX_EXPENSE],
    },
  },
  accountManager: {
    menu: {
      mainmenu: [MAINMENU.EXPENSE, MAINMENU.APP_CONFIG],
      submenu: [SUBMENU.EX_EXPENSE, SUBMENU.EX_CONFIG],
    },
    action: [
      ACTIONS.ACCOUNTING_VIEW,
      ACTIONS.ACCOUNTING_CONFIG_VIEW,
      ACTIONS.ACCOUNTING_MANAGE,
      ACTIONS.ACCOUNTING_APPROVE3,
      ACTIONS.ACCOUNTING_REJECT3,
    ],
  },
  operationProcess: {
    menu: {
      mainmenu: [MAINMENU.PRODUCT_INFO, MAINMENU.PURCHASE_BRANCH],
      submenu: [
        SUBMENU.PI_STOCK_BALANCE,
        SUBMENU.PI_STOCK_MOVEMENT,
        SUBMENU.PI_PRODUCT_MASTER,
        SUBMENU.PR_CREATE_PURCHASE_BRANCH,
      ],
    },
    action: [
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.PURCHASE_BR_VIEW,
    ],
  },
  procurement: {
    menu: {
      mainmenu: [MAINMENU.PRODUCT_INFO, MAINMENU.PURCHASE_BRANCH],
      submenu: [SUBMENU.PI_PRODUCT_MASTER, SUBMENU.PR_CREATE_PURCHASE_BRANCH],
    },
    action: [
      ACTIONS.STOCK_BL_SKU,
      ACTIONS.STOCK_MOVEMENT_VIEW,
      ACTIONS.STOCK_BL_LOCATION,
      ACTIONS.PURCHASE_BR_VIEW,
    ],
  },
  data: {
    menu: {
      mainmenu: [MAINMENU.SALE],
      submenu: [SUBMENU.SALE_SALE_LIMIT],
    },
    action: [ACTIONS.CAMPAIGN_TO_VIEW],
  },
  itSupport: {
    menu: {
      mainmenu: [MAINMENU.EXPENSE],
      submenu: [SUBMENU.EX_CLOSE_SALE_SHIFT],
    },
    action: [ACTIONS.SALE_SHIFT_VIEW],
  },
  finance: {
    menu: {
      mainmenu: [MAINMENU.EXPENSE],
      submenu: [SUBMENU.CASH_STATEMENT, SUBMENU.EX_OPEN_END],
    },
    action: [
      ACTIONS.ACCOUNTING_CS_IMPORT,
      ACTIONS.ACCOUNTING_CS_APPROVE,
      ACTIONS.ACCOUNTING_CS_EXPORT,
      ACTIONS.ACCOUNTING_CS_MANAGE,
      ACTIONS.ACCOUNTING_CS_VIEW,
    ],
  },
};
