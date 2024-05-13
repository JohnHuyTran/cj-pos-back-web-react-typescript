import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useStyles } from "../../styles/makeTheme";
import { ReactElement } from "react";
import { BDStatus } from "../../utils/enum/common-enum";

interface Props {
  activeStep: number;
  setActiveStep: (activeStep: number) => void;
}
const steps = ["บันทึก", "รออนุมัติ", "อนุมัติ", "พิมพ์บาร์โค้ดแล้ว"];

export default function StepperBar({
  activeStep,
  setActiveStep,
}: Props): ReactElement {
  const [rejected, setRejected] = React.useState<boolean>(false);
  const [expired, setExpired] = React.useState<boolean>(false);
  const [activeStepBar, setActiveStepBar] = React.useState(0);

  React.useEffect(() => {
    if (activeStep === Number(BDStatus.REJECT)) {
      setRejected(true);
      setActiveStepBar(3);
    } else if (activeStep === Number(BDStatus.ALREADY_EXPIRED)) {
      setExpired(true);
      setActiveStepBar(4);
    } else {
      setActiveStepBar(activeStep);
    }
  }, [activeStep, open]);

  const classes = useStyles();
  return (
    <div className={classes.MStepper} style={{ paddingBottom: 5 }}>
      <Box sx={{ width: "45%", margin: "auto", marginTop: "-1em" }}>
        <Stepper activeStep={activeStepBar} alternativeLabel>
          {steps.map((label, index) => {
            const labelProps: any = {};
            if (index === 2 && rejected) {
              label = "ไม่อนุมัติ";
              labelProps.error = true;
            }
            if (index === 3 && expired) {
              label = "สินค้าหมดอายุ";
              labelProps.error = true;
            }

            return (
              <Step key={label}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </div>
  );
}
