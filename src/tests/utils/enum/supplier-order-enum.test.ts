import {
  formatFileNam,
  getShipmentStatusText,
  getShipmentStatusTextEn,
  getShipmentTypeText,
} from "../../../utils/enum/supplier-order-enum";
describe("getShipmentStatusText", () => {
  it("is status บันทึก", () => {
    expect(getShipmentStatusText(0)).toEqual("บันทึก");
  });
});

describe("getShipmentTypeText", () => {
  it("is type สินค้าภายในTote", () => {
    expect(getShipmentTypeText(1)).toEqual("สินค้าภายในTote");
  });
});

describe("getShipmentStatusTextEn", () => {
  it("is status Draft", () => {
    expect(getShipmentStatusTextEn(0)).toEqual("Draft");
  });
});

describe("formatFileNam", () => {
  it("file name is ", () => {
    expect(formatFileNam("BT22040101-000003", 0)).toEqual(
      "BT22040101-000003-Draft.pdf",
    );
  });
});
