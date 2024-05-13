import {
  getStockTransferStatusInfo,
  getStockTransferStatusList,
} from "../../../utils/enum/stock-transfer-enum";

describe("getStockTransferStatusInfo", () => {
  it("status is บันทึก ", () => {
    expect(getStockTransferStatusInfo("DRAFT")).toEqual(
      expect.objectContaining({ key: "DRAFT" }),
    );
  });
});

describe("getStockTransferStatusList", () => {
  it("status is บันทึก ", () => {
    expect(getStockTransferStatusList("BT")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "COMPLETED" }),
        expect.objectContaining({ key: "TRANSFERING" }),
      ]),
    );
  });
});
