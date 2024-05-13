import React, { ReactElement } from "react";

import Container from "@mui/material/Container";
import { Box } from "@mui/material";
import { BootstrapButton } from "./products-css";
import TitleHeader from "../../components/title-header";
import ProductListComponent from "../../components/product/product-list";
import { createProductStyles } from "../products/product-create-css";
import ProductCreateModal from "../../components/product/product-create-modal";
import { useAppDispatch } from "../../store/store";

interface Props {}

export default function ProductList({}: Props): ReactElement {
  const dispatch = useAppDispatch();
  const classes = createProductStyles();

  const [openModalCreate, setOpenModalCreate] = React.useState(false);
  const handleOpenModalCreate = () => {
    setOpenModalCreate(true);
  };
  const handleCloseModalCreate = () => setOpenModalCreate(false);

  return (
    <div>
      <Container maxWidth="lg">
        <TitleHeader title="สินค้า" />
        <Box mt={3}>
          <BootstrapButton
            variant="contained"
            size="small"
            color="primary"
            onClick={handleOpenModalCreate}
          >
            CREATE
          </BootstrapButton>
        </Box>
        <ProductListComponent />

        <ProductCreateModal
          open={openModalCreate}
          onClose={handleCloseModalCreate}
        />
      </Container>
    </div>
  );
}
