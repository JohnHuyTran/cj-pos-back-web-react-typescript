import React, { ReactElement } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useStyles } from "../../styles/makeTheme";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { updateAddItemsState } from "../../store/slices/add-items-slice";
import { itemsDetail } from "../../models/order-model";
import { AnyARecord } from "dns";

interface Props {
  open: boolean;
  onClose: () => void;
  updateToteNo: (toteNo: string) => void;
}

export default function AddToteModel({
  open,
  onClose,
  updateToteNo,
}: Props): ReactElement {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [values, setValues] = React.useState("");
  const [newAddItemListArray, setNewAddItemListArray] = React.useState<any[]>(
    [],
  );

  const payloadAddItem = useAppSelector((state) => state.addItems.state);
  const orderDetails = useAppSelector(
    (state) => state.checkOrderDetail.orderDetail,
  );
  const orderDetail: any = orderDetails.data ? orderDetails.data : null;
  let entries: itemsDetail[] = orderDetail.items ? orderDetail.items : [];

  const handleChange = (event: any) => {
    const value = event.target.value;
    setValues(value);
  };

  const handleAddTote = async () => {
    updateToteNo(values);

    if (Object.keys(payloadAddItem).length !== 0) {
      const chkduplicate: any = payloadAddItem.find(
        (r: any) => r.barcode === values,
      );
      if (!chkduplicate) {
        const tote: any = [
          {
            skuCode: "",
            skuType: "",
            barcode: values,
            productName: "",
            unitCode: "",
            unitName: "",
            unitFactor: 0,
            qty: 0,
            qtyRef: 0,
            actualQty: 1,
            qtyDiff: 0,
            comment: "",
            isTote: true,
            toteCode: "",
            deliveryOrderNo: "",
          },
        ];

        if (payloadAddItem.length > 0) {
          const sumAddToteList = [...tote, ...payloadAddItem];
          await dispatch(updateAddItemsState(sumAddToteList));
          setValues("");
        }
      }
    }

    onClose();
  };

  const handleClose = () => {
    updateToteNo("");
    setValues("");
    onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        sx={{ minWidth: 500 }}
      >
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ color: "#263238" }}
          >
            <Box sx={{ display: "flex" }}>
              <Box pt={1.5} sx={{ flex: 4 }}>
                เลข Tote :
              </Box>
              <Box sx={{ flex: 7 }}>
                <TextField
                  name="orderShipment"
                  size="small"
                  value={values}
                  onChange={handleChange}
                  className={classes.MtextField}
                  fullWidth
                  placeholder="เลข Tote"
                />
              </Box>
              <Box ml={1} sx={{ flex: 4 }}>
                <Button
                  id="btnCancle"
                  variant="contained"
                  color="secondary"
                  className={classes.MbtnSearch}
                  sx={{ borderRadius: 2, width: 80, mr: 2 }}
                  onClick={handleAddTote}
                  disabled={!values}
                >
                  เพิ่ม
                </Button>
              </Box>

              <Box sx={{ flex: 1, ml: 2 }}>
                {handleClose ? (
                  <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: (theme: any) => theme.palette.grey[400],
                    }}
                  >
                    <CancelOutlinedIcon
                      fontSize="large"
                      stroke={"white"}
                      stroke-width={1}
                    />
                  </IconButton>
                ) : null}
              </Box>
            </Box>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
