import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import StockCountSearch from "../../components/check-stock/stock-count/stock-count-search";

const StockCount = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"ตรวจนับสต๊อก (SC)"} />
      <StockCountSearch />
    </Container>
  );
};

export default StockCount;
