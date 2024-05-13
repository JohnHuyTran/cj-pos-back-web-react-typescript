import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useStyles } from "../../styles/makeTheme";
import { stringNullOrEmpty } from "../../utils/utils";
import { BootstrapDialogTitle } from "../commons/ui/dialog-title";

interface Props {
  isOpen: boolean;
  onChangeTaxNo: (value: string) => void;
  onClose: () => void;
  onRequest: () => void;
}

function RequestTaxInvoice({
  isOpen,
  onChangeTaxNo,
  onClose,
  onRequest,
}: Props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(isOpen);
  const [taxNo, setTaxNo] = React.useState("");
  const [errorLabel, setErrorLabel] = React.useState("");
  const handleChange = (event: any) => {
    const value = event.target.value;
    setTaxNo(value);
    return onChangeTaxNo(value);
  };
  const onClickRequest = () => {
    if (stringNullOrEmpty(taxNo) || taxNo.length < 6) {
      setErrorLabel("กรุณาระบุเลขเอกสารอย่างน้อย 6 หลัก");
    } else {
      setErrorLabel("");
      return onRequest();
    }
  };
  React.useEffect(() => {
    setOpen(isOpen);
    setErrorLabel("");
    setTaxNo("");
  }, [isOpen]);
  return (
    <React.Fragment>
      <Dialog open={open} maxWidth="sm" fullWidth={true}>
        <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
          <Typography sx={{ fontWeight: "bold" }}>
            ค้นหาใบเสร็จจาก สนง.ใหญ่
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 4 }}>
            <Grid item xs={12}>
              {" "}
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                เลขที่ใบเสร็จ(ย่อ)
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="txtTaxNo"
                name="taxNo"
                size="small"
                value={taxNo}
                onChange={handleChange}
                className={classes.MtextField}
                fullWidth
                placeholder=""
                autoComplete="off"
                error={stringNullOrEmpty(errorLabel) ? false : true}
                helperText={errorLabel}
              />
            </Grid>
            <Grid item>
              <Button
                id="btnSearch"
                variant="contained"
                onClick={onClickRequest}
                sx={{ width: "200", ml: 1 }}
                className={classes.MbtnPrint}
                fullWidth={true}
                color="info"
              >
                ค้นหา
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default RequestTaxInvoice;
