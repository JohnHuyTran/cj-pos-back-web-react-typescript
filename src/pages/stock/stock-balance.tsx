import Container from "@mui/material/Container";
import { Box } from "@mui/material";
import TitleHeader from "../../components/title-header";
import StockBalanceSearch from "../../components/stock/stock-outstanding-search";

const StockBalance = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title="สินค้าคงคลัง" />
      <Box mt={3}>
        <StockBalanceSearch />
      </Box>
    </Container>
  );
};

export default StockBalance;
