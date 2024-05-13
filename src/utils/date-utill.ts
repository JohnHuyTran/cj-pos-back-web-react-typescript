import { toDate } from "date-fns";
import moment from "moment";
import { DateFormat } from "../utils/enum/common-enum";

export const dateToStringCriteria = (date: Date, isStartDate = true) => {
  if (date === null) {
    return null;
  }

  if (isStartDate) {
    return moment(date).startOf("day").toISOString();
  } else {
    return moment(date).endOf("day").toISOString();
  }
};

export const dateToStringMonthCriteria = (date: Date, isStartDate = true) => {
  const timeZone = 7;
  if (date === null) {
    return null;
  }

  if (isStartDate) {
    return moment(date).startOf("month").add(timeZone, "hours").toISOString();
  } else {
    return moment(date).endOf("month").add(timeZone, "hours").toISOString();
  }
};

export const dateTimeToDateOnlyString = (date: Date) => {
  if (date === null) {
    return null;
  }

  return moment(date).format("YYYY-MM-DD");
};

export const dateStringToTagCriteria = (date: string) => {
  if (!date) {
    return null;
  }

  const d = moment(date, [DateFormat.DATE_FORMAT, moment.ISO_8601]);
  return d.isValid() ? d.format(DateFormat.DATE_FORMAT) : null;
};

export const dateStringToMonthTagCriteria = (date: string) => {
  if (!date) {
    return null;
  }
  const d = moment(date, [DateFormat.MONTH_FORMAT, moment.ISO_8601]).utc();
  return d.isValid() ? d.format(DateFormat.MONTH_FORMAT) : null;
};

export const formatDateStartOfDay = (
  date: Date,
  dateFormat = "YYYY-MM-DDTHH:mm:ss",
) => moment(date).startOf("day").format(dateFormat);

export const formatDateEndOfDay = (
  date: Date,
  dateFormat = "YYYY-MM-DDTHH:mm:ss",
) => moment(date).endOf("day").format(dateFormat);

export const getDateFromString = (dateStr: string, formatFrom = "YYYY-MM-DD") =>
  moment(dateStr, formatFrom).toDate();

export const convertBkkToUtc = (bkkDate: string) => {
  const timeZone = 7;
  let utcDate = null;

  if (bkkDate && bkkDate !== "") {
    const datetime = moment(bkkDate);
    utcDate = datetime
      .add(-timeZone, "hours")
      .format(DateFormat.DATE_TIME_NONO_SEC);
  }
  if (utcDate && !utcDate.endsWith("Z")) {
    utcDate = `${utcDate}Z`;
  }
  return utcDate;
};

export const convertUtcToBkk = (
  utcDate: string,
  format = DateFormat.DATE_TIME_FORMAT,
) => {
  let bkkDate = null;

  if (utcDate && utcDate !== "") {
    if (!utcDate.endsWith("Z")) {
      utcDate = `${utcDate}Z`;
    }
    const datetime = moment(utcDate);
    bkkDate = datetime.utcOffset(7).format(format);
  }

  return bkkDate;
};

export const convertUtcToBkkDate = (
  utcDate: string,
  format = DateFormat.DATE_FORMAT,
) => {
  let bkkDate = utcDate;

  if (utcDate && utcDate !== "") {
    if (!utcDate.endsWith("Z")) {
      utcDate = `${utcDate}Z`;
    }
    const datetime = moment(utcDate).add(543, "year");
    bkkDate = datetime.utcOffset(7).format(format);
  }

  return bkkDate;
};

export const convertUtcToBkkWithZ = (utcDate: string) => {
  let bkkDate = null;

  if (utcDate && utcDate !== "") {
    if (!utcDate.endsWith("Z")) {
      utcDate = `${utcDate}Z`;
    }
    const datetime = moment(utcDate);
    bkkDate = datetime.add(7, "hours").toISOString();
  }

  return bkkDate;
};

export const convertUtcToBkkWithZFromThaiDisplay = (utcDate: string) => {
  let bkkDate = null;

  if (utcDate && utcDate !== "") {
    if (!utcDate.endsWith("Z")) {
      utcDate = `${utcDate}Z`;
    }
    const datetime = moment(utcDate).subtract(543, "year");
    bkkDate = datetime.add(7, "hours").toISOString();
  }

  return bkkDate;
};

export const isOverDate = (fromDate: any, toDate: any, limit: number) => {
  const f = moment(fromDate);
  const t = moment(toDate);
  const diff = t.diff(f, "days");
  return diff > limit;
};

// export const generateDateStringTag = (data: {
//   dateName: string;
//   dateFrom: string;
//   dateTo: string;
//   periodTag?: string;
// }): { dateStringTag: string; dateTag: string } => {
//   const output = { dateStringTag: null, dateTag: null };

//   if (data.dateFrom || data.dateTo) {
//     if (data.dateFrom && data.dateTo) {
//       output.dateStringTag = `${data.dateName}`;
//       output.dateTag = `"${data.dateFrom} - ${data.dateTo}"`;
//     } else if (data.dateFrom) {
//       output.dateStringTag = data.periodTag
//         ? `${data.dateName} (${data.periodTag} From)`
//         : `${data.dateName} (Date From)`;
//       output.dateTag = `"${data.dateFrom}"`;
//     } else if (data.dateTo) {
//       output.dateStringTag = data.periodTag
//         ? `${data.dateName} (${data.periodTag} To)`
//         : `${data.dateName} (Date To)`;
//       output.dateTag = `"${data.dateTo}"`;
//     }
//   }

//   return output;
// };
