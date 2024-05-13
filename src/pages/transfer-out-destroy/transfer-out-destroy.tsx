import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import TransferOutDestroySearch from "./transfer-out-destroy-search";

const TransferOut = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"ทำลาย"} />
      <TransferOutDestroySearch />
    </Container>
  );
};

export default TransferOut;
