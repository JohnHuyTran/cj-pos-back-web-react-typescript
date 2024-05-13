import Container from "@mui/material/Container";
import TitleHeader from "../../components/title-header";
import TORawMasterialSearch from "./transfer-out-raw-masterial-search";

const TORawMasterial = () => {
  return (
    <Container maxWidth="xl">
      <TitleHeader title={"ขอใช้วัตถุดิบร้านบาว"} />
      <TORawMasterialSearch />
    </Container>
  );
};

export default TORawMasterial;
