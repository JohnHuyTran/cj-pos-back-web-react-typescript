import React, { ReactElement, FC } from "react";

import { Grid, Typography, styled, Icon } from "@mui/material";

import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

interface Props {
  title: string;
}

const TitleHeader: FC<Props> = ({ title }): ReactElement => {
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      mt={2}
      sx={{ borderBottom: "1px solid #EAEBEB" }}
    >
      <Grid item>
        <Typography
          sx={{ fontSize: 18, fontWeight: "bold", fontStyle: "normal" }}
        >
          {title}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default TitleHeader;
