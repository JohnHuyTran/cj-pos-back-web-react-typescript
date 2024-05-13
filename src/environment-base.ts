export const environment = {
  product: {
    url: "/api/product",
    headers: {
      "Content-Type": "application/json",
    },
  },
  orders: {
    shipment: {
      fetchOrder: {
        url: "/order/shipment-delivery",
      },
      detail: {
        url: "/order/shipment-delivery",
      },
      fetchOrderSD: {
        url: "/order/sd",
      },
      saveDraft: {
        url: "/order/stock-diff/{sdNo}/draft",
      },
      approve: {
        url: "/order/stock-diff/{sdNo}/approve",
      },
      approveOC: {
        url: "/order/stock-diff/{sdNo}/approve-oc",
      },
      rejectOC: {
        url: "/order/stock-diff/{sdNo}/reject-oc",
      },
      closejob: {
        url: "/order/stock-diff/{sdNo}/close",
      },
      printFormShipmentDeliverly: {
        url: "/order/stock-diff/{sdNo}/export",
      },
      search: {
        url: "/order/shipment/search",
      },
      approveOrderReceive: {
        url: "/order/shipment/submit",
      },
    },
    dcCheckOrder: {
      fetchOrder: {
        url: "/order/stock-diff/verifies",
      },
      generateBO: {
        url: "/order/stock-diff/{sdNo}/approve",
      },
      searchBranch: {
        url: "/order/master/branches",
      },
      detailDC: {
        url: "/order/stock-diff/verify/view",
      },
      verifyBT: {
        url: "/order/stock-diff/verify/bt/{sdNo}",
      },
      verifyLD: {
        url: "/order/stock-diff/verify/ld/{sdNo}",
      },
      verifyList: {
        url: "/order/stock-diff/verifyList",
      },
    },
    tote: {
      searchTote: {
        url: "/order/tote/",
      },
      submitTote: {
        url: "/order/submitTote",
      },
    },
  },
  task: {
    notification: {
      tasks: {
        url: "/task/notifications/tasks",
      },
      reminders: {
        url: "/task/notifications/reminders",
      },
      announcements: {
        url: "/task/notifications/announcements",
      },
      read: {
        url: "/task/notifications/{id}",
      },
    },
  },
  withDraw: {
    transferOut: {
      search: {
        url: "/campaign/transfer-out",
      },
      save: {
        url: "/campaign/transfer-out",
      },
      sendForApproval: {
        url: "/campaign/transfer-out/{id}/waiting-approve",
      },
      cancel: {
        url: "/campaign/transfer-out/{id}",
      },
      detail: {
        url: "/campaign/transfer-out",
      },
      approve: {
        url: "/campaign/transfer-out/approve-transfer/{id}",
      },
      reject: {
        url: "/campaign/transfer-out/reject/{id}",
      },
      end: {
        url: "/campaign/transfer-out/close/{id}",
      },
      getExpiredProduct: {
        url: "/campaign/expired-products",
      },
      approveRM: {
        url: "/campaign/transfer-out/approve-transfer-rm/{id}",
      },
      requisitionSummary: {
        url: "/campaign/transfer-out/requisitionSummary/exportFile?branchCode={branchCode}&fromDate={fromDate}&toDate={toDate}",
      },
    },
  },
  sell: {
    barcodeDiscount: {
      search: {
        url: "/campaign",
      },
      detail: {
        url: "/campaign/detail-barcode",
      },
      save: {
        url: "/campaign",
      },
      update: {
        url: "/campaign/{id}",
      },
      sendForApproval: {
        url: "/campaign/{id}/waiting-approve",
      },
      approve: {
        url: "/campaign/approve-barcode/{id}",
      },
      reject: {
        url: "/campaign/barcode/reject?id={id}&reason={reason}",
      },
      print: {
        url: "/print/bd-barcode",
        saveLogPrintBarcodeDiscountHistoryURL: "/campaign/print-barcode",
      },
      cancel: {
        url: "/campaign/{id}",
      },
      upload: {
        url: "/campaign/upload",
      },
    },
    saleLimitTime: {
      detail: {
        url: "/campaign/sale-limit",
      },
      save: {
        url: "/campaign/sale-limit",
      },
      update: {
        url: "/campaign/sale-limit/{id}",
      },
      start: {
        url: "/campaign/sale-limit/start/{id}",
      },
      startMultipe: {
        url: "/campaign/sale-limit/start",
      },
      cancel: {
        url: "/campaign/sale-limit/cancel",
      },
      upload: {
        url: "/campaign/sale-limit/upload",
      },
    },
  },
  purchase: {
    supplierOrder: {
      search: {
        url: "/purchase/purchase-invoice",
      },
      detail: {
        url: "/purchase/purchase-invoice",
        // url: '/purchase/pi',
      },
      saveDraft: {
        url: "/purchase/purchase-invoice/{piNo}/draft",
        // url: '/purchase/purchase/{piNo}/draft',
      },
      approve: {
        url: "/purchase/purchase-invoice/{piNo}/approve",
        // url: '/purchase/purchase/{piNo}/approve',
      },
      detailPI: {
        url: "/purchase/purchase-order",
      },
      saveDraftPI: {
        url: "/purchase/purchase-invoice/draft",
      },
      approvePI: {
        url: "/purchase/purchase-invoice/approve",
      },
      searchSupplier: {
        url: "/supplier",
      },
      searchSupplierPO: {
        url: "/purchase/receivable-purchase-order",
      },
      calculatePI: {
        url: "/purchase/purchase-invoice/calculate",
      },
      supplierFile: {
        url: "/purchase/getUrl",
      },
      exportFile: {
        url: "/purchase/purchase-invoice/{piNo}/export",
      },
      delFileHuawei: {
        url: "/purchase/remove-file",
      },
      deletePI: {
        url: "/purchase/purchase-invoice/{piNo}/delete",
      },
    },
    purchaseNote: {
      detail: {
        url: "/purchase/purchase-note/{piNo}",
      },
      save: {
        url: "/purchase/purchase-note/{piNo}/save",
      },
      approve: {
        url: "/purchase/purchase-note/approve/{pnNo}",
      },
      exportFile: {
        url: "/purchase/purchase-note/export/{pnNo}",
      },
      deletePN: {
        url: "/purchase/purchase-note/{pnNo}/delete",
      },
    },
    purchaseBranchRequest: {
      search: {
        url: "/purchase/purchase-branch-request",
      },
      detail: {
        url: "/purchase/purchase-branch-request/{docNo}",
      },
      save: {
        url: "/purchase/purchase-branch-request/save",
      },
      delete: {
        url: "/purchase/purchase-branch-request/{docNo}/delete",
      },
      send: {
        url: "/purchase/purchase-branch-request/{docNo}/send",
      },
    },
  },
  products: {
    type: {
      search: {
        url: "/products/type/all",
      },
      productByType: {
        url: "/products/barcode/type",
      },
      productBySKUCodes: {
        url: "/products/sku-by-codes",
      },
    },
    addItem: {
      allitemsList: {
        url: "/products/barcode/all",
      },
      productsBySupplierCode: {
        url: "/products/{supplierCode}",
      },
      itemByBarcode: {
        url: "/products/barcode/",
      },
    },
    sku: {
      productMaster: {
        search: {
          url: "/products/sku/product-master",
        },
        searchItem: {
          url: "products/product/find",
        },
        findProductSKU: {
          url: "products/skus",
        },
      },
    },
  },
  stock: {
    searchStockTransfer: {
      url: "/stock/stock-transfer",
      searchRT: {
        url: "/stock/stock-request",
      },
    },
    transferReasonsList: {
      url: "/stock/master-transfer-reasons",
    },
    branchTransfer: {
      search: {
        url: "/stock/stock-transfer",
      },
      detail: {
        url: "/stock/stock-transfer/{btNo}",
      },
      save: {
        url: "/stock/stock-transfer/save",
      },
      sendDC: {
        url: "/stock/stock-transfer/save-to-dc",
      },
      reportBO: {
        url: "/stock/stock-transfer/export/branch-out/{btNo}",
      },
      reportBT: {
        url: "/stock/stock-transfer/export/{btNo}",
      },
      reportReCall: {
        url: "/stock/stock-transfer/export/recall/{btNo}",
      },
      reportPaperBox: {
        url: "/stock/stock-transfer/export/bt-cover-sheet/{btNo}",
      },
      sendToPickup: {
        url: "/stock/stock-transfer/save-wait-dc",
      },
      submitTransfer: {
        url: "/stock/stock-transfer/submit-transfer",
      },
    },
    stockRequest: {
      detail: {
        url: "/stock/stock-request/{rtNo}",
      },
      save: {
        url: "/stock/stock-request/draft",
      },
      submit: {
        url: "/stock/stock-request/submit/{rtNo}",
      },
      approve1: {
        url: "/stock/stock-request/approve1/{rtNo}",
      },
      approve2: {
        url: "/stock/stock-request/approve2/{rtNo}",
      },
      approve2BySCM: {
        url: "/stock/stock-request/submit/approve/{rtNo}",
      },
      approve2MultipleBySCM: {
        url: "/stock/stock-request/approve2",
      },
      reject1: {
        url: "/stock/stock-request/reject1/{rtNo}",
      },
      reject2: {
        url: "/stock/stock-request/reject2/{rtNo}",
      },
      remove: {
        url: "/stock/stock-request/remove/{rtNo}",
      },
      downloadTemplate: {
        url: "/stock/stock-request/download/template",
      },
      importStockRequest: {
        url: "/stock/stock-request/import",
      },
    },
    stockBalanceCheck: {
      url: "/stock/stock-balance-check",
    },
    stockBalance: {
      stockBalanceBySKU: {
        url: "/stock/stock-balance/check-by-sku-codes",
      },
    },
    outStanding: {
      stockBalance: {
        searchByStore: {
          url: "/stock/stock-balance/search-by-store",
        },
        searchByLocation: {
          url: "/stock/stock-balance/search-by-location",
        },
        searchByNegative: {
          url: "/stock/stock-balance/search-negative-balance",
        },
      },
      stockMovement: {
        search: {
          url: "/stock/stock-movement",
        },
      },
    },
  },
  checkStock: {
    auditPlan: {
      save: {
        url: "/stock/audit-planning",
      },
      detail: {
        url: "/stock/audit-planning",
      },
      confirm: {
        url: "/stock/audit-planning/confirm/{id}",
      },
      counting: {
        url: "/stock/stock-count",
      },
      cancel: {
        url: "/stock/audit-planning/cancel/{id}",
      },
      upload: {
        url: "/stock/audit-planning/upload",
      },
    },
    stockCount: {
      search: {
        url: "/stock/stock-count",
      },
      detail: {
        url: "/stock/stock-count",
      },
      confirm: {
        url: "/stock/stock-count/confirm",
      },
      cancel: {
        url: "/stock/stock-count/{id}",
      },
    },
    stockAdjustment: {
      search: {
        url: "/stock/stock-adjust",
      },
      tempStockSearch: {
        url: "/stock/stock-adjust/has-temp-stock",
      },
      getSkuCode: {
        url: "/stock/stock-adjust/get-sku",
      },
      saveDraft: {
        url: "/stock/stock-adjust",
      },
      detail: {
        url: "/stock/stock-adjust",
      },
      calculate: {
        skuTab: {
          url: "/stock/stock-adjust/skus",
        },
        barcodeTab: {
          url: "/stock/stock-adjust/barcodes",
        },
      },
      statsSku: {
        url: "/stock/stock-adjust/stats/{id}",
      },
      confirm: {
        url: "/stock/stock-adjust/confirm",
      },
      cancel: {
        url: "/stock/stock-adjust/{id}",
      },
    },
    auditHistory: {
      search: {
        url: "/stock/audit-history",
      },
    },
  },
  master: {
    branch: {
      province: {
        url: "/master/branch/province",
      },
      searchBranch: {
        url: "/master/branch/search",
      },
      allBranch: {
        url: "/master/branches",
      },
      branchTotal: {
        url: "/master/branch/branch-total",
      },
    },
    file: {
      huawei: {
        pathFile: {
          url: "/master/getUrl",
        },
      },
    },
    provinces: {
      url: "/master/provinces",
    },
    districts: {
      url: "/master/districts",
    },
    subDistricts: {
      url: "/master/sub-districts",
    },
    stock: {
      movementType: {
        url: "/master/stock-movement-types",
      },
    },
    percentages: {
      url: "master/branch-config/get-percentages",
    },
    reason: {
      verifyOrder: {
        disapprove: {
          url: "master/disapproval-reasons",
        },
      },
    },
    expense: {
      retrive: {
        url: "accounting/expense-config",
      },
    },
  },
  authority: {
    authorizedBranch: {
      url: "/authority/authorized-branches",
    },
    superviseBranch: {
      url: "/authority/authorized-branches/supervise",
    },
  },
  sale: {
    taxInvoice: {
      search: {
        url: "/sale/tax-invoices",
      },
      detail: {
        url: "/sale/tax-invoices/{billNo}",
      },
      saveInvoice: {
        url: "/sale/tax-invoices",
      },
      requestTaxInvoice: {
        url: "/sale/tax-invoices/{billNo}/request-hq",
      },
      printHistory: {
        url: "/sale/tax-invoices/{billNo}/print-history",
      },
      printInvoice: {
        url: "/sale/tax-invoices/{billNo}/print",
      },
    },
    member: {
      searchMemberInformation: {
        url: "/sale/members/{memberNo}",
      },
    },
  },
  tote: {
    inquiryTote: {
      url: "/webtote/toteinquiry",
    },
  },
  branchAccounting: {
    expense: {
      search: {
        url: "accounting/expense",
      },
      searchConfig: {
        url: "accounting/expense-config/search",
      },
      save: {
        url: "accounting/expense",
      },
      detail: {
        url: "accounting/expense/{docNo}",
      },
      approve: {
        branch: {
          url: "accounting/expense/submit/{docNo}",
        },
        ocArea: {
          url: "accounting/expense/approve1-2",
        },
        account: {
          url: "accounting/expense/approve-by-acc/{docNo}",
        },
        accountManager: {
          url: "accounting/expense/approve3/{docNo}",
        },
      },
      approve3: {
        byNo: {
          url: "accounting/expense/approve3-by-no",
        },
        byCriteria: {
          url: "accounting/expense/approve3-by-criteria",
        },
      },
      reject: {
        ocArea: {
          url: "accounting/expense/reject1-2/{docNo}",
        },
        account: {
          url: "accounting/expense/reject-by-acc/{docNo}",
        },
        accountManager: {
          url: "accounting/expense/reject3/{docNo}",
        },
      },
      periodType: {
        url: "accounting/expense-period/{type}",
      },
      summarize: {
        byNo: {
          url: "accounting/expense/summarize-by-no",
        },
        byCriteria: {
          url: "accounting/expense/summarize-by-criteria",
        },
      },
    },
    expenseConfig: {
      createExpenseConfig: {
        url: "accounting/expense-config",
      },
      updateExpenseConfig: {
        url: "accounting/expense-config/{expenseNo}",
      },
    },
    closeSaleShift: {
      search: {
        url: "sale/shift-closes",
      },
      shiftClose: {
        url: "sale/shift-closes/end",
      },
      updateConfirmShiftCloses: {
        url: "sale/shift-closes/confirm/{shiftCode}",
      },
      checkInfo: {
        url: "sale/shift-closes/check-info",
      },
      byPassByBranch: {
        url: "sale/shift-closes/bypass",
      },
      byPassBySupport: {
        url: "sale/shift-closes/bypass/confirm",
      },
    },
    cashStatement: {
      search: {
        url: "accounting/cash-statement/cash",
      },
      edit: {
        url: "accounting/cash-statement/edit",
      },
      downloadTemplate: {
        url: "accounting/cash-statement/download-template",
      },
      import: {
        url: "accounting/cash-statement/import",
      },
      delete: {
        url: "accounting/cash-statement/delete/{id}",
      },
      approve: {
        url: "accounting/cash-statement/approve-list",
      },
    },
    openEnd: {
      search: {
        url: "accounting/open-end",
      },
      save: {
        url: "accounting/open-end",
      },
      submitApprove: {
        url: "accounting/open-end/submit/{docNo}",
      },
      approved: {
        url: "accounting/open-end/approve/{docNo}",
      },
      exportPayInFile: {
        url: "accounting/open-end/export/pay-in/{OENo}",
      },
      view: {
        url: "accounting/open-end/{docNo}",
      },
    },
  },
};
