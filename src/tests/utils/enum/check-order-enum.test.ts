import {
  getShipmentStatusText,
  getShipmentTypeText,
  getShipmentStatusTextEn,
  formatFileNam,
  getorderReceiveThStatus,
} from "../../../utils/enum/check-order-enum";

describe("getShipmentStatusText", () => {
  it("is status บันทึก", () => {
    expect(getShipmentStatusText("DRAFT")).toEqual("บันทึก");
  });
});

describe("getShipmentTypeText", () => {
  it("is type สินค้าภายในTote", () => {
    expect(getShipmentTypeText(1)).toEqual("สินค้าภายในTote");
  });
});

describe("getShipmentStatusTextEn", () => {
  it("is status Draft", () => {
    expect(getShipmentStatusTextEn("DRAFT")).toEqual("Draft");
  });
});

describe("formatFileNam", () => {
  it("file name is ", () => {
    expect(formatFileNam("BT22040101-000003", "DRAFT")).toEqual(
      "BT22040101-000003-Draft.pdf",
    );
  });
});

describe("getorderReceiveThStatus", () => {
  it("status is บันทึก ", () => {
    expect(getorderReceiveThStatus("0")).toEqual("บันทึก");
  });
});
