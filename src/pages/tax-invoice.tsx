import Container from "@mui/material/Container";
import { Box } from "@mui/material";
import TitleHeader from "../components/title-header";
import TaxInvoice from "../components/tax-invoice/tax-invoice-search";

const StockTransferRt = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title="ใบเสร็จ/ใบกำกับฉบับเต็ม" />
      <Box mt={3}>
        <TaxInvoice />
      </Box>
    </Container>
  );
};

export default StockTransferRt;
