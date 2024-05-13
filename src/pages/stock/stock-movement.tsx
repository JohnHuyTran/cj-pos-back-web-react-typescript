import { Box, Container } from "@mui/material";
import StockMovementSearch from "../../components/stock/stock-movement/stock-movement-search";
import TitleHeader from "../../components/title-header";

function StockMovement() {
  return (
    <Container maxWidth="xl">
      <TitleHeader title="ความเคลื่อนไหวของสินค้า" />
      <Box mt={3}>
        <StockMovementSearch />
      </Box>
    </Container>
  );
}

export default StockMovement;
