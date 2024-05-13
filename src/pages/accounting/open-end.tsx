import { Box, Button, Container } from "@mui/material";
import React, { useEffect } from "react";
import TitleHeader from "../../components/title-header";

import { useTranslation } from "react-i18next";
import OpenEndSearch from "../../components/accounting/open-end/open-end-search";

export default function OpenEnd() {
  const { t } = useTranslation(["openEnd", "common"]);
  return (
    <Container maxWidth="xl">
      <TitleHeader title={t("documentTitle")} />
      <Box mt={3}>
        <OpenEndSearch />
      </Box>
    </Container>
  );
}
