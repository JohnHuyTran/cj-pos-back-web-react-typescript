import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import { useTranslation } from "react-i18next";
import BarcodeDiscountSearch from "./barcode-discount-search";

const BarcodeDiscount = () => {
  const { t } = useTranslation("common");

  return (
    <Container maxWidth="xl">
      <TitleHeader title={t("menu.productDiscount")} />
      <BarcodeDiscountSearch />
    </Container>
  );
};

export default BarcodeDiscount;
