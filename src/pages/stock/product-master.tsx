import { Box, Container } from "@mui/material";
import ProductMasterSearch from "../../components/stock/product-master/product-master-search";

import TitleHeader from "../../components/title-header";

function ProductMaster() {
  return (
    <Container maxWidth="xl">
      <TitleHeader title="รายละเอียดสินค้า" />
      <Box mt={3}>
        <ProductMasterSearch />
      </Box>
    </Container>
  );
}

export default ProductMaster;
