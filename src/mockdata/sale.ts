const invoiceList = {
  ref: "1",
  code: "20000",
  message: "success",
  total: 3,
  page: 1,
  perPage: 10,
  prev: 0,
  next: 0,
  totalPage: 3,
  data: [
    {
      billNo: "S22010022N01-000012",
      docDate: "2022-03-08T17:00:00Z",
      status: "PRINTED",
      invoiceNo: "SI22030022N01-000016",
      totalPrint: 1,
      lastPrintedDate: "2022-03-08T17:00:00Z",
    },

    {
      billNo: "S222222",
      docDate: "2022-03-08T17:00:00Z",
      status: "PRINTED",
      invoiceNo: "S2222222",
      totalPrint: 1,
      lastPrintedDate: "2022-03-08T17:00:00Z",
    },
    {
      billNo: "S333333",
      docDate: "2022-03-08T17:00:00Z",
      status: "CANCELLED",
      invoiceNo: "S3333333",
      totalPrint: 1,
      lastPrintedDate: "2022-03-08T17:00:00Z",
    },
  ],
};

const invoiceDetail = {
  invoiceNo: "SI22030022N01-000016",
  billNo: "S22010022N01-000012",
  status: "PRINTED",
  customer: {
    memberNo: "M000001x",
    taxNo: "1102000829712",
    firstName: "fnamex",
    lastName: "lnamex",
    address: {
      houseNo: "599/723x",
      building: "คอนโด เดอะ ไลน์",
      moo: "18",
      subDistrictCode: "111x",
      districtCode: "11x",
      provinceCode: "1x",
      postcode: "10200",
    },
  },
};

const invoiceDetailNoAddress = {
  billNo: "S22010022N03-002641",
  status: "CANCELLED",
  customer: {
    address: {},
  },
};

const invoiceDetailIsMember = {
  billNo: "S22010022N03-002641",
  customer: {
    memberNo: "Mxxxxx",
    address: {},
  },
};

const invoiceRequest = {
  ref: "1",
  code: "20000",
  message: "success",
  // total: 3,
  // page: 1,
  // perPage: 10,
  // prev: 0,
  // next: 0,
  // totalPage: 3,
  data: {
    billNo: "S22010022N01-000012",
    docDate: "2022-03-08T17:00:00Z",
    status: "PRINTED",
    invoiceNo: "SI22030022N01-000016",
    totalPrint: 1,
    lastPrintedDate: "2022-03-08T17:00:00Z",
  },
};

export function getInvoiceRequest() {
  return new Promise((resolve, reject) => {
    resolve(invoiceRequest);
  });
}
export function getInvoiceList() {
  return new Promise((resolve, reject) => {
    resolve(invoiceList);
  });
}

export function getInvoiceDetail() {
  return new Promise((resolve, reject) => {
    resolve(invoiceDetail);
  });
}
