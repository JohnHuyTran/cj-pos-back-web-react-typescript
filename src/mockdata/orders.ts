import axios from "axios";
import { ShipmentRequest, ShipmentResponse } from "../models/order-model";
export const orders = {
  ref: "1",
  code: "20000",
  message: "success",
  total: 0,
  page: 1,
  perPage: 10,
  prev: 0,
  next: 0,
  totalPage: 0,
  data: [
    {
      shipmentNo: "LD21093000710345",
      shipmentDate: "05/10/2021",
      status: "1",
      sapDocType: "DO",
      sdNo: "SD2313066956-001",
      sdStatus: 0,
      sdType: 0,
      toteCnt: 10,
      boxCnt: 5,
      entries: [
        {
          deliveryOrderNo: "DO20210001",
          deliveryOrderDate: "05/10/2021",
          Items: [
            {
              productName: "Shelf talker แลกแต้มแทนเงินสด(10/PAC)",
              ItemRefNo: "900001",
              barcode: "8859333712911",
              skuCode: "000000000060002600",
              outOfStockStatus: "1",
              toteCode: "TLGG014881",
              expireDate: "",
              unitFactor: 12,
              unit: {
                code: "PAK",
                name: "แพค",
              },
              quantity: {
                qty: 1,
                qtyAll: 12,
                qtyAllBefore: "900001",
                actualQty: 12,
                qtyDiff: 0,
              },
              comment: "แก้ไข",
            },
            {
              productName: "Shelf Strip 2 Bay Moiz & Face(11/PAC)",
              ItemRefNo: "900002",
              barcode: "9999990180586",
              skuCode: "000000000060002618",
              outOfStockStatus: "900002",
              toteCode: "TDOA66923",
              expireDate: "",
              unitFactor: 12,
              unit: {
                code: "PAK",
                name: "แพค",
              },
              quantity: {
                qty: 1,
                qtyAll: 12,
                qtyAllBefore: "",
                actualQty: 12,
                qtyDiff: 0,
              },
              comment: "แก้ไข",
            },
          ],
        },
      ],
    },
    {
      shipmentNo: "LD21093000710344",
      shipmentDate: "06/10/2021",
      status: "1",
      sapDocType: "DO",
      sdNo: "SD21093000710344",
      sdStatus: 0,
      sdType: 1,
      toteCnt: 10,
      boxCnt: 5,
      entries: [
        {
          deliveryOrderNo: "DO20210002",
          deliveryOrderDate: "06/10/2021",
          Items: [
            {
              productName: "Shelf Strip 2 Bay Moiz & Face(11/PAC)",
              ItemRefNo: "900002",
              barcode: "9999990180586",
              skuCode: "000000000060002618",
              outOfStockStatus: "900002",
              toteCode: "TDOA66923",
              expireDate: "",
              unitFactor: 12,
              unit: {
                code: "PAK",
                name: "แพค",
              },
              quantity: {
                qty: 1,
                qtyAll: 12,
                qtyAllBefore: "",
                actualQty: 12,
                qtyDiff: 0,
              },
              comment: "แก้ไข",
            },
          ],
        },
      ],
    },
  ],
};

export function getOrderList(payload: ShipmentRequest) {
  return new Promise((resolve, reject) => {
    console.log(` getOrderList: ${payload.paramQuery}`);
    if (
      !payload.paramQuery &&
      !payload.sdNo &&
      !payload.sdStatus &&
      !payload.sdType
    ) {
      reject("data not found");
    }

    //const foundOrders = orders;

    axios
      .get<ShipmentResponse>(
        "http://54.255.171.154:30010/api/order/shipment-deliverly",
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { limit: "20", page: "1" },
        },
      )
      .then((response) => {
        console.log(response.data);
        resolve(response.data);
      });

    // setTimeout(() => {
    //   if (foundOrders) {
    //     resolve(foundOrders);
    //   } else {
    //     reject('data not found');
    //   }
    // }, 100);
  });
}
