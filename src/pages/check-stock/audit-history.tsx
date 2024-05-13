import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import AuditHistorySearch from "../../components/check-stock/audit-history/audit-history-search";

const AuditHistory = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"ประวัตินับสต๊อก"} />
      <AuditHistorySearch />
    </Container>
  );
};

export default AuditHistory;
