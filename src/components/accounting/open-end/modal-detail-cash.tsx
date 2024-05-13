import {
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { BootstrapDialogTitle } from "components/commons/ui/dialog-title";
import { Income, Item } from "models/branch-accounting-model";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { useAppDispatch, useAppSelector } from "store/store";
import { useStyles } from "styles/makeTheme";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function ModalDetailCash({ isOpen, onClose }: Props) {
  const classes = useStyles();
  const viewOpenEndResponse = useAppSelector(
    (state) => state.viewOpenEndSlice.viewOpenEnd,
  );
  const data: any = viewOpenEndResponse.data ? viewOpenEndResponse.data : null;
  const incomes: Income = data ? data.income : null;

  return (
    <Fragment>
      <Dialog open={isOpen} maxWidth="lg" fullWidth={true}>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={onClose}
        ></BootstrapDialogTitle>
        <DialogContent>
          <Grid container spacing={3} padding={2} minWidth={"1000px"}>
            {incomes && incomes.paymentTypeItems.length > 0 && (
              <Grid item mt={1} xs={6}>
                <Grid
                  container
                  spacing={2}
                  mb={3}
                  sx={{
                    border: "1px solid #EAEBEB",
                    borderRadius: "7px",
                    padding: "10px 40px 20px 10px",
                  }}
                >
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      รายรับตามประเภทชำระ
                    </Typography>
                  </Grid>

                  {incomes.paymentTypeItems.map(
                    (element: Item, index: number) => (
                      <Fragment key={index}>
                        <Grid item xs={1}>
                          <Typography></Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography>{element.name}</Typography>
                        </Grid>
                        <Grid item xs={5} justifyContent="flex-end">
                          <NumberFormat
                            value={String(element.amount)}
                            thousandSeparator={true}
                            decimalScale={2}
                            className={classes.MtextFieldNumber}
                            disabled={true}
                            customInput={TextField}
                            fixedDecimalScale
                          />
                        </Grid>
                      </Fragment>
                    ),
                  )}
                </Grid>
              </Grid>
            )}

            <Grid item xs={6} mt={1}>
              <Grid
                container
                height="100%"
                direction="column"
                justifyContent="space-between"
              >
                {incomes && incomes.typeItems.length > 0 && (
                  <Grid item>
                    <Grid
                      sx={{
                        border: "1px solid #EAEBEB",
                        borderRadius: "7px",
                        padding: "10px 40px 20px 10px",
                      }}
                      container
                      spacing={2}
                      mb={3}
                    >
                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          รายรับตามประเภท
                        </Typography>
                      </Grid>

                      {incomes.typeItems.map((element: Item, index: number) => (
                        <Fragment key={index}>
                          <Grid item xs={1}>
                            <Typography></Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography>{element.name}</Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <NumberFormat
                              value={String(element.amount)}
                              thousandSeparator={true}
                              decimalScale={2}
                              className={classes.MtextFieldNumber}
                              disabled={true}
                              customInput={TextField}
                              fixedDecimalScale
                            />
                          </Grid>
                        </Fragment>
                      ))}
                    </Grid>
                  </Grid>
                )}
                {!(incomes && incomes.typeItems.length > 0) && (
                  <Grid item></Grid>
                )}
                <Grid item>
                  <Grid
                    sx={{
                      padding: "0px 40px 20px 10px",
                    }}
                    container
                    spacing={2}
                    mb={3}
                  >
                    <Grid item xs={1}>
                      <Typography></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>รวมยอดขาย(ยกเว้นภาษี)</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <NumberFormat
                        value={String(
                          incomes && incomes.totalAmount
                            ? incomes.totalAmount
                            : 0,
                        )}
                        thousandSeparator={true}
                        decimalScale={2}
                        className={classes.MtextFieldNumber}
                        disabled={true}
                        customInput={TextField}
                        fixedDecimalScale
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <Typography></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>ยอดขายก่อนภาษี</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <NumberFormat
                        value={String(
                          incomes && incomes.netAmount ? incomes.netAmount : 0,
                        )}
                        thousandSeparator={true}
                        decimalScale={2}
                        className={classes.MtextFieldNumber}
                        disabled={true}
                        customInput={TextField}
                        fixedDecimalScale
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <Typography></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>ยอดขายยกเว้นภาษี</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <NumberFormat
                        value={String(
                          incomes && incomes.netAmountNonVat
                            ? incomes.netAmountNonVat
                            : 0,
                        )}
                        thousandSeparator={true}
                        decimalScale={2}
                        className={classes.MtextFieldNumber}
                        disabled={true}
                        customInput={TextField}
                        fixedDecimalScale
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default ModalDetailCash;
