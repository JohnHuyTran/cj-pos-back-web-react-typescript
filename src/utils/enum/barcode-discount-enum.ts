const reasonForPrint = [
  { key: "1", text: "พิมพ์บาร์โค้ดส่วนลดสินค้าใกล้หมดอายุตามเกณฑ์" },
  { key: "2", text: "พิมพ์บาร์โค้ดส่วนลดทดแทนที่ชำรุด" },
  { key: "3", text: "พิมพ์บาร์โค้ดส่วนลดทดแทนที่สูญหาย" },
];

export const getReasonForPrintText = (key: string) =>
  reasonForPrint.find((item) => item.key === key)?.text;
