import Container from "@mui/material/Container";
import { Box } from "@mui/material";
import TitleHeader from "../components/title-header";
import DCCheckOrderSearch from "../components/dc-check-orders/dc-check-order";
import DCOrderDetail from "../components/dc-check-orders/dc-ckeck-order-detail";

const DCCheckOrder = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title="ตรวจสอบผลต่างการรับสินค้า" />
      <Box mt={3}>
        <DCCheckOrderSearch />
      </Box>
    </Container>
  );
};

export default DCCheckOrder;
