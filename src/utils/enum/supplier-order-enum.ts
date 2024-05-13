export enum ShipmentDeliveryStatusCodeEnum {
  STATUS_APPROVE = 1,
  STATUS_DRAFT = 0,
  STATUS_CLOSEJOB = 2,
}

const shipmentStatus = [
  { key: 0, text: "บันทึก" },
  { key: 1, text: "อนุมัติ" },
  { key: 2, text: "ปิดงาน" },
];

const shipmentEnStatus = [
  { key: 0, text: "Draft" },
  { key: 1, text: "Approved" },
  { key: 2, text: "Close" },
];

const shipmentType = [
  { key: 0, text: "ลังกระดาษ /Tote" },
  { key: 1, text: "สินค้าภายในTote" },
  { key: 2, text: "โอนลอย" },
];

export const getShipmentStatusText = (key: number) =>
  shipmentStatus.find((item) => item.key === key)?.text;

export const getShipmentTypeText = (key: number) =>
  shipmentType.find((item) => item.key === key)?.text;

export const getShipmentStatusTextEn = (key: number) =>
  shipmentEnStatus.find((item) => item.key === key)?.text;

export const formatFileNam = (sdNo: string, sdStatus: number) => {
  return `${sdNo}-${getShipmentStatusTextEn(sdStatus)}.pdf`;
};
