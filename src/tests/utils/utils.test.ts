import {
  getDecodedAccessToken,
  getSdType,
  getSdStatus,
  getDCStatus,
  stringNullOrEmpty,
  objectNullOrEmpty,
  numberWithCommas,
  isOwnBranch,
  getReasonLabel,
  getBranchName,
  formatFileStockTransfer,
  formatFileInvoice,
  getEncodeBarcode,
} from "../../utils/utils";

describe("getDecodedAccessToken", () => {
  const mockAccessToken =
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJqR0hhYkFyYjFENXlnaG11Tl84YkxBTjlnOGZLZlZSUnZzZVlPbDhTR1lJIn0.eyJleHAiOjE2NDkzMDY4NTgsImlhdCI6MTY0OTMwNTA1OCwianRpIjoiNDk1YTkwMDMtZTQ2NS00NDQ3LTk5NmYtZGQ5YmVjODFmODA4IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLWRldi5jamV4cHJlc3MuaW8vYXV0aC9yZWFsbXMvY2pleHByZXNzIiwiYXVkIjpbInNlcnZpY2UucG9zYmFjay1wdXJjaGFzZSIsInNlcnZpY2UucG9zYmFjay1wcm9kdWN0Iiwic2VydmljZS5wb3NiYWNrLXN0b2NrIiwic2VydmljZS5wb3NiYWNrLW9yZGVyIiwic2VydmljZS5wb3NiYWNrLXNhbGUiLCJzZXJ2aWNlLnBvc2JhY2stc2FwLWNvbm5lY3RvciIsInNlcnZpY2UucG9zYmFjay10YXNrIiwic2VydmljZS5wb3NiYWNrLXN1cHBsaWVyIiwic2VydmljZS5wb3NiYWNrLXNjaGVkdWxlciIsInNlcnZpY2UucG9zYmFjay1jYW1wYWlnbiIsInNlcnZpY2UucG9zYmFjay1tYXN0ZXIiLCJzZXJ2aWNlLnBvc2JhY2stYXV0aG9yaXR5Iiwic2VydmljZS5wb3NiYWNrLWhhbmRoZWxkLWFkYXB0ZXIiXSwic3ViIjoiOWMwYzFkZjQtMGQyOC00NzY0LWIxNTktNWNhM2IxZTI4MTgzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLnBvc2JhY2staHEiLCJzZXNzaW9uX3N0YXRlIjoiNzVhYTg0MDItNTc5Mi00Njk1LThhNjItZWYwYjI3ODczZjRmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInNjb3BlIjoic2NvcGUucG9zYmFjay1zYXAtY29ubmVjdG9yIHNjb3BlLnBvc2JhY2stdGFzayBzY29wZS5wb3NiYWNrLWNhbXBhaWduIHNjb3BlLnBvc2JhY2staGFuZGhlbGQtYWRhcHRlciBzY29wZS5wb3NiYWNrLXN1cHBsaWVyIHNjb3BlLnBvc2JhY2stb3JkZXIgcHJvZmlsZSBzY29wZS5wb3NiYWNrLXN0b2NrIHNjb3BlLnBvc2JhY2stc2FsZSBzY29wZS5wb3NiYWNrLXNjaGVkdWxlciBzY29wZS5wb3NiYWNrLXByb2R1Y3Qgc2NvcGUucG9zYmFjay1wdXJjaGFzZSBlbWFpbCBzY29wZS5wb3NiYWNrLW1hc3RlciBzY29wZS5wb3NiYWNrLWF1dGhvcml0eSBzY29wZS5wb3NiYWNrLWJyYW5jaGluZm8iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJicmFuY2gwMDIgc3VyX2JyYW5jaDAwMiIsImdyb3VwcyI6WyIvc2VydmljZS5wb3NiYWNrL2JyYW5jaC1tYW5hZ2VyIl0sInByZWZlcnJlZF91c2VybmFtZSI6InBvc2JybjAwMiIsImFjbCI6eyJzZXJ2aWNlLnBvc2JhY2stcHVyY2hhc2UiOlsicHVyY2hhc2UucG4ubWFuYWdlIiwicHVyY2hhc2UucG4uZXhwb3J0IiwicHVyY2hhc2UuZmlsZS5kb3dubG9hZCIsInB1cmNoYXNlLnBuLnZpZXciLCJwdXJjaGFzZS5wby52aWV3IiwicHVyY2hhc2UucGkuY2xvc2UiLCJwdXJjaGFzZS5waS52aWV3IiwicHVyY2hhc2UucGkuYXBwcm92ZSIsInB1cmNoYXNlLnBpLmV4cG9ydCIsInB1cmNoYXNlLnBpLm1hbmFnZSIsInB1cmNoYXNlLnBuLmFwcHJvdmUiLCJwdXJjaGFzZS5maWxlLnJlbW92ZSJdLCJzZXJ2aWNlLnBvc2JhY2stY2FtcGFpZ24iOlsiY2FtcGFpZ24udG8uY3JlYXRlIiwiY2FtcGFpZ24uYmQucHJpbnQiLCJjYW1wYWlnbi5zdC52aWV3IiwiY2FtcGFpZ24uYmQudmlldyIsImNhbXBhaWduLnRvLmNhbmNlbCIsImNhbXBhaWduLnRvLnZpZXciLCJjYW1wYWlnbi5iZC5jcmVhdGUiXSwic2VydmljZS5wb3NiYWNrLXN1cHBsaWVyIjpbInN1cHBsaWVyLnNlYXJjaCJdLCJzZXJ2aWNlLnBvc2JhY2stc3RvY2siOlsic3RvY2suY2hlY2siLCJzdG9jay5idC5leHBvcnQiLCJzdG9jay5idC52aWV3Iiwic3RvY2suYnQubWFuYWdlIiwic3RvY2sucnQudmlldyIsInN0b2NrLmJ0LnNhdmVfZGMiLCJzdG9jay5tYXN0ZXIiLCJzdG9jay5ydC5zZW5kIiwic3RvY2sucnQubWFuYWdlIl0sInNlcnZpY2UucG9zYmFjay1hdXRob3JpdHkiOlsiYXV0aG9yaXR5LmNoZWNrIl0sInNlcnZpY2UucG9zYmFjay1vcmRlciI6WyJvcmRlci5zZC5tYW5hZ2UiLCJvcmRlci5iby52aWV3Iiwib3JkZXIuc2QuZXhwb3J0Iiwib3JkZXIubGQudmlldyIsIm9yZGVyLnZlci5tYW5hZ2UiLCJvcmRlci5zZC5hcHByb3ZlIiwib3JkZXIuc2QuY2xvc2UiLCJvcmRlci5sZC5tYW5hZ2UiLCJvcmRlci5zZC52aWV3Iiwib3JkZXIudmVyLnZpZXciXSwic2VydmljZS5wb3NiYWNrLW1hc3RlciI6WyJtYXN0ZXIuZmlsZS51cGxvYWQiLCJtYXN0ZXIuZmlsZS5kb3dubG9hZCIsIm1hc3Rlci5zZWFyY2giXSwic2VydmljZS5wb3NiYWNrLXRhc2siOlsidGFzay52aWV3Il0sInNlcnZpY2UucG9zYmFjay1wcm9kdWN0IjpbInByb2R1Y3Quc2VhcmNoIl0sInNlcnZpY2UucG9zYmFjay1zYWxlIjpbInNhbGUuaW52b2ljZS5zYXZlIiwic2FsZS5pbnZvaWNlLmV4cG9ydCIsInNhbGUuaW52b2ljZS52aWV3Il19LCJnaXZlbl9uYW1lIjoiYnJhbmNoMDAyIiwiYnJhbmNoIjoiMDEwMSIsImZhbWlseV9uYW1lIjoic3VyX2JyYW5jaDAwMiJ9.Hc5RK65tJ4rQB8y1xwDsm1OYiXECzZVDQa7Fq225fzz_fO7Jp1LZKw1iGA25azjspV0R6Ub-Hcv5CLbyDOSbjZi8bpI5S362bbbSbFDE06AzvYnRpm4Od_zU9g6lcJP1cr03MFfVvFjCQC6KFZXijMdjgFuCDdp0Ka09POmNlAS6fALnXrhTz9UUoXctDrwEn7PczoJKsjvbADmzILMxrIYb6QDFC5TTGdKryDkteqJGFbLuNPFVjPdtbK1BDA4w8DTfk19rtGJnLLdfRE02xqRqkhBNJgwWliOGF9IKhIdyR1XNm8hy6EmCyDdSudL0H_8VYogjV3B9Osgde2njEw";

  it("decode get name", () => {
    expect(getDecodedAccessToken(mockAccessToken).name).toEqual(
      "branch002 sur_branch002",
    );
  });

  it("decode get preferred_username", () => {
    expect(getDecodedAccessToken(mockAccessToken).preferred_username).toEqual(
      "posbrn002",
    );
  });

  it("decode get branch", () => {
    expect(getDecodedAccessToken(mockAccessToken).branch).toEqual("0101");
  });
});

describe("getSdType", () => {
  it("codeType = 0", () => {
    expect(getSdType(0)).toEqual("ลังกระดาษ /Tote");
  });
  it("codeType = 1", () => {
    expect(getSdType(1)).toEqual("สินค้าภายใน Tote");
  });

  it("codeType != 0, codeType != 1", () => {
    expect(getSdType(2)).toEqual("undefined");
  });
});

describe("getSdStatus", () => {
  it("codeStatus = 0", () => {
    expect(getSdStatus(0)).toEqual("บันทึก");
  });
  it("codeStatus = 1", () => {
    expect(getSdStatus(1)).toEqual("อนุมัติ");
  });

  it("codeStatus != 0, codeStatus != 1", () => {
    expect(getSdStatus(2)).toEqual("undefined");
  });
});

describe("getDCStatus", () => {
  it("codeStatus = 0", () => {
    expect(getDCStatus(0)).toEqual("รอการตรวจสอบ");
  });
  it("codeStatus = 1", () => {
    expect(getDCStatus(1)).toEqual("ตรวจสอบแล้ว");
  });

  it("codeStatus != 0, codeStatus != 1", () => {
    expect(getDCStatus(2)).toEqual("-");
  });
});

describe("stringNullOrEmpty", () => {
  it("value Empty", () => {
    expect(stringNullOrEmpty(null)).toEqual(true);
  });
  it("value = null", () => {
    expect(stringNullOrEmpty(null)).toEqual(true);
  });
  it("value = undefined", () => {
    expect(stringNullOrEmpty(undefined)).toEqual(true);
  });
  it("value = Invalid date", () => {
    expect(stringNullOrEmpty("Invalid date")).toEqual(true);
  });
});

describe("objectNullOrEmpty", () => {
  it("value = null", () => {
    expect(objectNullOrEmpty(null)).toEqual(true);
  });

  it("value = undefined", () => {
    expect(objectNullOrEmpty(undefined)).toEqual(true);
  });
});

describe("numberWithCommas", () => {
  it("number: 9999999", () => {
    expect(numberWithCommas(9999999)).toEqual("9,999,999");
  });
});

describe("isOwnBranch", () => {
  it("isOwnBranch: false", () => {
    expect(isOwnBranch("0101")).toEqual(false);
  });
});

describe("getReasonLabel", () => {
  const mockReasons = [
    { id: "61dbd0f31a241f241c4ad729", code: "1", name: "โอนสินค้าตามรอบ" },
  ];
  it("get Label text", () => {
    expect(getReasonLabel(mockReasons, "1")).toEqual("โอนสินค้าตามรอบ");
  });

  it("get Label undefined", () => {
    expect(getReasonLabel(mockReasons, "")).toEqual(undefined);
  });
});

describe("getBranchName", () => {
  const mockBranch = [
    { code: "0722", name: "สาขาที่00000 ตลาดทุ่งโพธิ์", isDC: false },
  ];
  it("get Label text", () => {
    expect(getBranchName(mockBranch, "0722")).toEqual(
      "สาขาที่00000 ตลาดทุ่งโพธิ์",
    );
  });

  it("get Label undefined", () => {
    expect(getBranchName(mockBranch, "")).toEqual(undefined);
  });
});

describe("formatFileStockTransfer", () => {
  it("docNo: 'BT22040101-000009', status: 'CREATED, suffix: 'BT", () => {
    expect(
      formatFileStockTransfer("BT22040101-000009", "CREATED", "BT"),
    ).toEqual("BT22040101-000009-BT.pdf");
  });
});

describe("formatFileInvoice", () => {
  it("invoiceNo: 'SI22040022N01-000007', counter: 1", () => {
    expect(formatFileInvoice("SI22040022N01-000007", 1)).toEqual(
      "SI22040022N01-000007-1.pdf",
    );
  });
});

describe("getEncodeBarcode", () => {
  it("barcode:'8850800990016' , price:25.22 -> checkdigit = 5", () => {
    expect(
      getEncodeBarcode({ barcode: "8850800990016", price: 25.22 }),
    ).toEqual("A400252258850800990016");
  });
});
