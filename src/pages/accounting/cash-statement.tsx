import { Box, Container } from "@mui/material";
import TitleHeader from "../../components/title-header";
import CashStatementSearch from "../../components/accounting/cash-statement/cash-statement-search";
import { useTranslation } from "react-i18next";

export default function EashStatement() {
  const { t } = useTranslation(["cashStatement", "common"]);
  // const dispatch = useAppDispatch();
  // const classes = useStyles();
  // const [open, setOpen] = React.useState(false);

  return (
    <Container maxWidth="xl">
      <TitleHeader title={t("documentTitle")} />

      <Box mt={3}>
        <CashStatementSearch />
      </Box>
    </Container>
  );
}
