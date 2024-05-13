export enum ShipmentDeliveryStatusCodeEnum {
  STATUS_APPROVE = "APPROVED",
  STATUS_DRAFT = "DRAFT",
  STATUS_CLOSEJOB = "CLOSED",
  STATUS_WAITAPPROVEL_1 = "WAIT_FOR_APPROVAL_1",
  STATUS_REJECT_APPROVAL_1 = "REJECT_APPROVAL_1",
}

export const shipmentStatus = [
  { key: ShipmentDeliveryStatusCodeEnum.STATUS_DRAFT },
  { key: ShipmentDeliveryStatusCodeEnum.STATUS_REJECT_APPROVAL_1 },
  { key: ShipmentDeliveryStatusCodeEnum.STATUS_WAITAPPROVEL_1 },
  { key: ShipmentDeliveryStatusCodeEnum.STATUS_APPROVE },
  { key: ShipmentDeliveryStatusCodeEnum.STATUS_CLOSEJOB },
];

const shipmentType = [
  { key: 0, text: "ลังกระดาษ /Tote" },
  { key: 1, text: "สินค้าภายในTote" },
  { key: 2, text: "โอนลอย" },
];

const orderReceiveThStatus = [
  { key: "0", text: "บันทึก" },
  { key: "1", text: "อนุมัติ" },
  { key: "2", text: "ปิดงาน" },
];

export const getShipmentTypeText = (key: number) =>
  shipmentType.find((item) => item.key === key)?.text;

export const formatFileName = (sdNo: string, statusLabel: string) => {
  return `${sdNo}-${statusLabel}.pdf`;
};

export const getorderReceiveThStatus = (key: string) =>
  orderReceiveThStatus.find((item) => item.key === key)?.text;
