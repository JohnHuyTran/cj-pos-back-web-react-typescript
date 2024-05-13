import Container from "@mui/material/Container";
import { Box } from "@mui/material";
import TitleHeader from "../components/title-header";
import StockTransferSearch from "../components/stock-transfer/stock-transfer";

const StockTransfer = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title="โอนสินค้าระหว่างสาขา/คลัง" />
      <Box mt={3}>
        <StockTransferSearch />
      </Box>
    </Container>
  );
};

export default StockTransfer;
