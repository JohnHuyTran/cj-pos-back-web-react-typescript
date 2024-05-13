import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import AuditPlanSearch from "../../components/check-stock/audit-plan/audit-plan-search";

const AuditPlan = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"สร้างแผนตรวจนับสต๊อก"} />
      <AuditPlanSearch />
    </Container>
  );
};

export default AuditPlan;
