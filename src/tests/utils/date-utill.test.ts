import {
  dateToStringCriteria,
  dateToStringMonthCriteria,
  dateTimeToDateOnlyString,
  dateStringToTagCriteria,
  dateStringToMonthTagCriteria,
  formatDateStartOfDay,
  formatDateEndOfDay,
  getDateFromString,
  convertBkkToUtc,
  convertUtcToBkk,
  convertUtcToBkkDate,
  convertUtcToBkkWithZ,
} from "../../utils/date-utill";
import moment from "moment";
import { DateFormat } from "../../utils/enum/common-enum";

const date = new Date();
const dateStr = date.toISOString();
const timeZone = 7;
const YMD_FORMAT = "YYYY-MM-DD";

describe("dateToStringCriteria", () => {
  it("start date of day", () => {
    expect(dateToStringCriteria(date, true)).toEqual(
      moment(date).startOf("day").toISOString(),
    );
  });

  it("end date of day", () => {
    expect(dateToStringCriteria(date, false)).toEqual(
      moment(date).endOf("day").toISOString(),
    );
  });
});

describe("dateToStringMonthCriteria", () => {
  it("start date of month", () => {
    expect(dateToStringMonthCriteria(date, true)).toEqual(
      moment(date).startOf("month").add(timeZone, "hours").toISOString(),
    );
  });

  it("end date of month", () => {
    expect(dateToStringMonthCriteria(date, false)).toEqual(
      moment(date).endOf("month").add(timeZone, "hours").toISOString(),
    );
  });
});

describe("dateTimeToDateOnlyString", () => {
  it("date format", () => {
    expect(dateTimeToDateOnlyString(date)).toEqual(
      moment(date).format("YYYY-MM-DD"),
    );
  });
});

describe("dateStringToTagCriteria", () => {
  it("date format", () => {
    const d = moment(date, [DateFormat.DATE_FORMAT, moment.ISO_8601]);
    expect(dateStringToTagCriteria(dateStr)).toEqual(
      d.format(DateFormat.DATE_FORMAT),
    );
  });
});

describe("dateStringToMonthTagCriteria", () => {
  it("month format", () => {
    const d = moment(date, [DateFormat.MONTH_FORMAT, moment.ISO_8601]);
    expect(dateStringToMonthTagCriteria(dateStr)).toEqual(
      d.format(DateFormat.MONTH_FORMAT),
    );
  });
});

describe("formatDateStartOfDay", () => {
  it("format Start Of Day", () => {
    const d = date;
    const dd = moment(d).endOf("day").format("YYYY-MM-DDT00:00:00");
    expect(formatDateStartOfDay(d, DateFormat.DATE_TIME_FORMAT)).toEqual(dd);
  });
});

describe("formatDateEndOfDay", () => {
  it("format End Of Day", () => {
    expect(formatDateEndOfDay(date, DateFormat.DATE_TIME_FORMAT)).toEqual(
      moment(date).endOf("day").format(DateFormat.DATE_TIME_FORMAT),
    );
  });
});

describe("getDateFromString", () => {
  it("get Date", () => {
    expect(getDateFromString(dateStr, YMD_FORMAT)).toEqual(
      moment(dateStr, YMD_FORMAT).toDate(),
    );
  });
});

describe("convertBkkToUtc", () => {
  it("bkk to utc", () => {
    const datetime = moment(dateStr);
    let utcDate = datetime
      .add(-timeZone, "hours")
      .format(DateFormat.DATE_TIME_NONO_SEC);
    utcDate = `${utcDate}Z`;
    expect(convertBkkToUtc(dateStr)).toEqual(utcDate);
  });
});

describe("convertUtcToBkk", () => {
  it("utc to bkk", () => {
    const datetime = moment(dateStr);
    const bkkDate = datetime.utcOffset(7).format(DateFormat.DATE_TIME_FORMAT);
    expect(convertUtcToBkk(dateStr, DateFormat.DATE_TIME_FORMAT)).toEqual(
      bkkDate,
    );
  });
});

describe("convertUtcToBkkDate", () => {
  it("convert bkk date", () => {
    const datetime = moment(dateStr).add(543, "year");
    const bkkDate = datetime.utcOffset(7).format(DateFormat.DATE_TIME_FORMAT);
    expect(convertUtcToBkkDate(dateStr, DateFormat.DATE_TIME_FORMAT)).toEqual(
      bkkDate,
    );
  });
});

describe("convertUtcToBkkWithZ", () => {
  it("convert bkk date with Z", () => {
    const datetime = moment(dateStr);
    const bkkDate = datetime.add(7, "hours").toISOString();
    expect(convertUtcToBkkWithZ(dateStr)).toEqual(bkkDate);
  });
});
