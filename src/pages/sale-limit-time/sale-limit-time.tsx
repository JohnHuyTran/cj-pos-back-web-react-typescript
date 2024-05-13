import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import SaleLimitTimeSearch from "./sale-limit-time-search";

const BarcodeDiscount = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"กำหนดเวลา (งด) ขายสินค้า"} />
      <SaleLimitTimeSearch />
    </Container>
  );
};

export default BarcodeDiscount;
