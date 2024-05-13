import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useStyles } from "../../styles/makeTheme";
import { ReactElement } from "react";

interface Props {
  activeStep: number;
}
const steps = ["บันทึก", "เริ่มใช้งาน", "ครบกำหนด"];

export default function StepperBar({ activeStep }: Props): ReactElement {
  const [cancel, setCancel] = React.useState<boolean>(false);
  const [step, setStep] = React.useState(activeStep);

  React.useEffect(() => {
    if (activeStep === 4) {
      setCancel(true);
      setStep(2);
    } else if (activeStep === 0) {
      setCancel(false);
      setStep(activeStep);
    } else {
      setStep(activeStep);
    }
  }, [activeStep, open]);

  const classes = useStyles();
  return (
    <div className={classes.MStepper} style={{ paddingBottom: 5 }}>
      <Box sx={{ width: "45%", margin: "auto", marginTop: "-1em" }}>
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label, index) => {
            const labelProps: any = {};
            if (index === 1 && cancel) {
              label = "ยกเลิก";
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
