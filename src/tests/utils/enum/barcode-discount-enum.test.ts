import { getReasonForPrintText } from "../../../utils/enum/barcode-discount-enum";

describe("getReasonForPrintText", () => {
  it("is status บันทึก", () => {
    expect(getReasonForPrintText("1")).toEqual(
      "พิมพ์บาร์โค้ดส่วนลดสินค้าใกล้หมดอายุตามเกณฑ์",
    );
  });
});
