import { styled } from "@mui/styles";
import { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { Tooltip } from "@mui/material";
import React from "react";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#EAEBEB",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 200,
    fontSize: "12px",
    border: "1px solid #CBD4DB",
    borderRadius: "5px",
    boxShadow:
      "0px 30px 84px rgba(19, 10, 46, 0.08), 0px 8px 32px rgba(19, 10, 46, 0.07), 0px 3px 14px rgba(19, 10, 46, 0.03), 0px 1px 3px rgba(19, 10, 46, 0.13)",
  },
}));

export default HtmlTooltip;
