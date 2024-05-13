import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import AuditPlanSearch from "../../components/check-stock/stock-adjustment/stock-adjustment-search";

const StockAdjustment = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"ตรวจนับสต๊อกรวม (SA)"} />
      <AuditPlanSearch />
    </Container>
  );
};

export default StockAdjustment;
