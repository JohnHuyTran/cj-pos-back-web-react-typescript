import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import TransferOutSearch from "./transfer-out-search";

const TransferOut = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"ใช้ในการทำกิจกรรม"} />
      <TransferOutSearch />
    </Container>
  );
};

export default TransferOut;
