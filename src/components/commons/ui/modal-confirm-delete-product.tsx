import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";

interface ProductInfo {
  barcodeName: string;
  skuCode: string;
  barcode: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productInfo: ProductInfo;
}

export default function ModelConfirmDeleteProduct({
  open,
  onClose,
  onConfirm,
  productInfo,
}: Props): ReactElement {
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { minWidth: 450, minHeight: 241 } }}
      >
        <DialogContent sx={{ pl: 1, pr: 1 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
              ต้องการลบสินค้า
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4} sx={{ textAlign: "right" }}>
                สินค้า{" "}
                <label style={{ color: "#AEAEAE", margin: "0 5px" }}>|</label>
              </Grid>
              <Grid item xs={8} sx={{ pl: 2 }}>
                <label style={{ color: "#36C690" }}>
                  <b>{productInfo.barcodeName}</b>
                  <br />
                  <label
                    style={{
                      color: "#AEAEAE",
                      fontSize: 14,
                    }}
                  >
                    {productInfo.skuCode}
                  </label>
                </label>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "right" }}>
                บาร์โค้ด{" "}
                <label style={{ color: "#AEAEAE", margin: "0 5px" }}>|</label>
              </Grid>
              <Grid item xs={8} sx={{ pl: 1 }}>
                <label style={{ color: "#36C690" }}>
                  <b>{productInfo.barcode}</b>
                </label>
              </Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button
            id="btnCancel"
            variant="contained"
            color="cancelColor"
            sx={{ borderRadius: 2, width: 90, mr: 2 }}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button
            id="btnConfirm"
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, width: 90 }}
            onClick={onConfirm}
          >
            ลบสินค้า
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
