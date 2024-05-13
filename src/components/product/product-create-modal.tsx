import React, { useState } from "react";
import {
  Grid,
  Button,
  Box,
  TextField,
  Typography,
  FormControl,
  IconButton,
  Snackbar,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import ModalUnstyled from "@mui/core/ModalUnstyled";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";

import { createProductStyles } from "../../pages/products/product-create-css";

import { useAppDispatch } from "../../store/store";
import {
  fetchCreateProduct,
  fetchGetProductList,
} from "../../store/slices/productSlice";

export interface DialogProps {
  open: boolean;
  onClose: (value: boolean) => void;
}
export interface initialFormValuesState {
  name: string;
  price: string;
  barcode: string;
}

const initialFormValues: initialFormValuesState = {
  name: "",
  price: "",
  barcode: "",
};

const StyledModal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled("div")`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const style = {
  width: 550,
  bgcolor: "background.paper",
  p: 2,
  px: 4,
  pb: 3,
  boxShadow: 24,
};

function ProductCreateModal(props: DialogProps) {
  const { onClose, open } = props;
  const classes = createProductStyles();
  const dispatch = useAppDispatch();

  const handleClose = () => {
    onClose(false);
  };

  const [valuesForm, setValuesForm] = useState(initialFormValues);
  const handleChange = (prop: any) => (event: any) => {
    setValuesForm({ ...valuesForm, [prop]: event.target.value });
  };
  const handleClickConfirm = () => {
    const data = {
      name: valuesForm.name,
      price: parseInt(valuesForm.price),
      barcode: valuesForm.barcode,
    };

    const res = dispatch(fetchCreateProduct(data));
    if (res != null) {
      dispatch(fetchGetProductList());
      setValuesForm(initialFormValues);
      onClose(false);
      setOpenSnackBar(true);
    }
  };

  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const handleCloseSnackBar = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    function Alert(props, ref) {
      return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    },
  );

  const actionSnackBar = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnackBar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
      >
        <Box sx={style} component="form">
          <h2 id="unstyled-modal-title">Create</h2>
          <Grid
            container
            spacing={0}
            direction="row"
            alignItems="center"
            className={classes.marginBottom}
          >
            <Grid item xs={6}>
              <Typography>Products Name: </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="productName"
                label="Products Name"
                variant="outlined"
                size="small"
                value={valuesForm.name}
                onChange={handleChange("name")}
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
            <Grid item xs={6}>
              <Typography>Products Price: </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                id="productPrice"
                label="Product Price"
                variant="outlined"
                size="small"
                value={valuesForm.price}
                onChange={handleChange("price")}
              />
            </Grid>
          </Grid>
          <Grid container spacing={0} direction="row" alignItems="center">
            <Grid item xs={6}>
              <Typography>Products Barcode: </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="productBarcode"
                label="Products Barcode"
                variant="outlined"
                size="small"
                value={valuesForm.barcode}
                onChange={handleChange("barcode")}
              />
            </Grid>
          </Grid>
          <Box mt={5}>
            <Grid
              container
              spacing={2}
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              <Grid item>
                <Button
                  variant="contained"
                  size="large"
                  color="inherit"
                  onClick={handleClose}
                >
                  CANCLE
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  type="submit"
                  onClick={handleClickConfirm}
                >
                  CREATE
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </StyledModal>

      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={handleCloseSnackBar}
        action={actionSnackBar}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Create Success
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ProductCreateModal;
