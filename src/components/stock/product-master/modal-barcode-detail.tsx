import React, { useEffect } from "react";
import {
  Checkbox,
  Dialog,
  DialogContent,
  Grid,
  TextField,
} from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { useStyles } from "../../../styles/makeTheme";
import { BootstrapDialogTitle } from "../../commons/ui/dialog-title";
import SearchIcon from "@mui/icons-material/Search";
import { addTwoDecimalPlaces } from "../../../utils/utils";
import HtmlTooltip from "../../commons/ui/html-tooltip";
interface Props {
  open: boolean;
  onClose: () => void;
  dataDetail: any;
}

const _ = require("lodash");

export const ModalBarcodeDetail = ({ open, onClose, dataDetail }: Props) => {
  const classes = useStyles();
  let textDisplay;
  switch (dataDetail.unitFactor) {
    case "ST":
      textDisplay = "ชิ้น";
      break;
    case "PAK":
      textDisplay = "แพค";
      break;
    case "KAR":
      textDisplay = "ลัง";
      break;
  }

  return (
    <div>
      <Dialog open={open} maxWidth="md" fullWidth>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={() => {
            onClose();
          }}
        ></BootstrapDialogTitle>
        <DialogContent>
          <Grid container pl={2} pr={2}>
            {/*line a*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                บาร์โค้ด
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="barcode"
                  name="barcode"
                  size="small"
                  value={dataDetail.barcode}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
            {/*line b*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                ชื่อสินค้า
              </Grid>
              <Grid item xs={4}>
                <HtmlTooltip
                  title={
                    <React.Fragment>{dataDetail.barcodeName}</React.Fragment>
                  }
                >
                  <TextField
                    id="barcodeName"
                    name="barcodeName"
                    size="small"
                    value={dataDetail.barcodeName}
                    className={classes.MtextField}
                    sx={{
                      backgroundColor: "#EAEBEB",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    fullWidth
                    disabled
                  />
                </HtmlTooltip>
              </Grid>
            </Grid>
            {/*line c*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                หน่วย
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="unitFactor"
                  name="unitFactor"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <SearchIcon
                        color="disabled"
                        sx={{ marginRight: "12px" }}
                      />
                    ),
                  }}
                  value={dataDetail.unitFactor}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={5} pl={2} pr={1}>
                <TextField
                  id="unitFactor"
                  name="unitFactor"
                  size="small"
                  value={textDisplay}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
            {/*line d*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                จำนวนต่อหน่วย
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="barFactor"
                  name="barFactor"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={dataDetail.barFactor}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
            {/*line e*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                ราคาสินค้าต่อหน่วย
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="retailPriceTier1"
                  name="retailPriceTier1"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={addTwoDecimalPlaces(dataDetail.retailPriceTier1)}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={2} pl={2}>
                ราคาซื้อของสด
              </Grid>
              <Grid item xs={3} pr={1}>
                <TextField
                  id="freshLifeBuyPrice"
                  name="freshLifeBuyPrice"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={addTwoDecimalPlaces(dataDetail.freshLifeBuyPrice)}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
            {/*line f*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                แต้ม (แลก)
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="priceType"
                  name="priceType"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={dataDetail.priceType}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
            {/*line g*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                ขนาดสินค้า
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth className={classes.Mselect}>
                  <Select
                    id="pkgSizeType"
                    name="pkgSizeType"
                    value={dataDetail.pkgSizeType}
                    inputProps={{ "aria-label": "Without label" }}
                    disabled
                  >
                    <MenuItem value={"S"}>{"เล็ก"}</MenuItem>
                    <MenuItem value={"M"}>{"กลาง"}</MenuItem>
                    <MenuItem value={"L"}>{"ใหญ่"}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3} pl={2}>
                <Checkbox checked={dataDetail.isAllowBuy} disabled />
                อนุญาต ซื้อ
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "right" }} mt={-1}></Grid>
            </Grid>
            {/*line h*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                น้ำหนัก (กก)
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="pkgWeight"
                  name="pkgWeight"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={dataDetail.pkgWeight}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={3} pl={2}>
                <Checkbox checked={dataDetail.isAllowSale} disabled />
                อนุญาต ขาย
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "right" }} mt={-1}></Grid>
            </Grid>
            {/*line i*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                กว้าง (ซม)
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="pkgWidth"
                  name="pkgWidth"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={addTwoDecimalPlaces(dataDetail.pkgWidth)}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={3} pl={2}>
                <Checkbox checked={dataDetail.isAllowOrder} disabled />
                อนุญาต สั่ง
              </Grid>
              <Grid item xs={2} sx={{ textAlign: "right" }} mt={-1}></Grid>
            </Grid>
            {/*line j*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                ยาว (ซม)
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="pkgLength"
                  name="pkgLength"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={dataDetail.pkgLength}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
              {/*<Grid item xs={3} pl={2}>*/}
              {/*  อนุญาต โอนระหว่างสาขา*/}
              {/*</Grid>*/}
              {/*<Grid item xs={2} sx={{ textAlign: 'right' }} mt={-1}>*/}
              {/*  <Checkbox checked={dataDetail.isAllowBranchTransfer} disabled/>*/}
              {/*</Grid>*/}
            </Grid>
            {/*line k*/}
            <Grid item container mb={1}>
              <Grid item xs={3}>
                สูง (ซม)
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="pkgHeight"
                  name="pkgHeight"
                  size="small"
                  inputProps={{ style: { textAlign: "right" } }}
                  value={dataDetail.pkgHeight}
                  className={classes.MtextField}
                  sx={{ backgroundColor: "#EAEBEB" }}
                  fullWidth
                  disabled
                />
              </Grid>
              {/*<Grid item xs={4} pl={2}>*/}
              {/*  อนุญาต โอนกลับสำนักงานใหญ่*/}
              {/*</Grid>*/}
              {/*<Grid item xs={1} sx={{ textAlign: 'right' }} mt={-1}>*/}
              {/*  <Checkbox checked={dataDetail.isAllowDcTransfer} disabled/>*/}
              {/*</Grid>*/}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModalBarcodeDetail;
