import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Box } from "@mui/material";
import CheckOrderSearch from "../components/check-orders/check-order";
import TitleHeader from "../components/title-header";
const CheckOrder = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title="รับสินค้า" />
      <Box mt={3}>
        <CheckOrderSearch />
      </Box>
    </Container>
  );
};

export default CheckOrder;
