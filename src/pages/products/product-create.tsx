import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Paper, Grid, TextField, Box, Button } from "@mui/material";
import TitleHeader from "../../components/title-header";
import { createProductStyles } from "../products/product-create-css";

const ProductCreate = () => {
  const classes = createProductStyles();

  return (
    <div>
      <Container maxWidth="lg">
        <TitleHeader title="Create Product" />

        <form noValidate autoComplete="off">
          <Paper elevation={4} className={classes.cartContainer}>
            <Grid
              container
              spacing={0}
              direction="row"
              alignItems="center"
              className={classes.marginBottom}
            >
              <Grid item xs={4}>
                <Typography>Products Name: </Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  id="productName"
                  label="Products Name"
                  variant="outlined"
                  // value={values.name}
                  // onChange={handleChange("name")}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={0}
              direction="row"
              alignItems="center"
              className={classes.marginBottom}
            >
              <Grid item xs={4}>
                <Typography>Products Price: </Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  id="productPrice"
                  label="Product Price"
                  variant="outlined"
                  // value={values.price}
                  // onChange={handleChange("price")}
                />
              </Grid>
            </Grid>

            <Grid container spacing={0} direction="row" alignItems="center">
              <Grid item xs={4}>
                <Typography>Products Barcode: </Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  id="productBarcode"
                  label="Products Barcode"
                  variant="outlined"
                  // value={values.barcode}
                  // onChange={handleChange("barcode")}
                />
              </Grid>
            </Grid>

            <Box mt={5}>
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="stretch"
              >
                <Button variant="contained" size="large" color="primary">
                  CREATE
                </Button>
              </Grid>
            </Box>
          </Paper>
        </form>
      </Container>
    </div>
  );
};

export default ProductCreate;
