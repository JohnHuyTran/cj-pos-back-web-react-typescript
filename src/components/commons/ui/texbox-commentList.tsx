import { Card, Typography } from "@mui/material";

import React from "react";
import { useTranslation } from "react-i18next";
import { convertUtcToBkkDate } from "utils/date-utill";
import { DateFormat } from "utils/enum/common-enum";
interface Props {
  filedLabel: string;
  payload: any;
}

function TextBoxComentList({ filedLabel, payload }: Props) {
  const { t } = useTranslation(["expense", "common"]);
  return (
    <React.Fragment>
      <Typography variant="body2" sx={{ mb: "5px" }}>
        {filedLabel}
      </Typography>
      <Card
        variant="outlined"
        style={{
          width: "500px",
          height: "150px",
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "10px",
          paddingBottom: "10px",
          overflow: "scroll",
        }}
      >
        {payload &&
          payload.length > 0 &&
          payload.map((e: any) => {
            const statusLabel = t(`status.${e.status}`);
            return (
              <>
                <Typography variant="body2">
                  <span style={{ fontWeight: "bold" }}>{e.username} : </span>
                  <span style={{ color: "#AEAEAE" }}>
                    {statusLabel}:{" "}
                    {convertUtcToBkkDate(
                      e.commentDate,
                      DateFormat.DATE_TIME_DISPLAY_FORMAT,
                    )}
                  </span>
                </Typography>
                <Typography variant="body2"> {e.comment}</Typography>
              </>
            );
          })}
      </Card>
    </React.Fragment>
  );
}

export default TextBoxComentList;
