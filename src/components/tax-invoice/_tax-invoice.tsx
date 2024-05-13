import React from "react";
import { Grid } from "@mui/material";
import { Box } from "@mui/material";
import { useStyles } from "../../styles/makeTheme";
import { Button } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ModalCustomerDetails from "./_customer-details";

export default function TaxInvoice() {
  const classes = useStyles();

  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const currentlySelected = () => {
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  return (
    <>
      <Box>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 7 }}>
          <Grid
            item
            container
            xs={12}
            sx={{ mt: 3 }}
            justifyContent="flex-end"
            direction="row"
            alignItems="flex-end"
          >
            <Button
              id="btnCreateSupplierModal"
              variant="contained"
              onClick={currentlySelected}
              sx={{ minWidth: "15%" }}
              className={classes.MbtnClear}
              startIcon={<Search />}
              color="secondary"
            >
              view
            </Button>
          </Grid>
        </Grid>
      </Box>

      <ModalCustomerDetails
        isOpen={openDetailModal}
        onClickClose={handleCloseDetailModal}
      />
    </>
  );
}
