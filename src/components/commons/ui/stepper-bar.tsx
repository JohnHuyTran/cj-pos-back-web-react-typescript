import * as React from "react";
import { ReactElement } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useStyles } from "../../../styles/makeTheme";
import { stringNullOrEmpty } from "../../../utils/utils";
import { StepItem } from "../../../models/step-item-model";

interface Props {
  activeStep: any;
  rejectStep?: any;
  steps: Array<StepItem>;
  style: any;
}

export default function StepperBar({
  activeStep,
  rejectStep,
  steps,
  style,
}: Props): ReactElement {
  const [activeStepBar, setActiveStepBar] = React.useState(0);
  React.useEffect(() => {
    let activeIndex = 0;
    if (stringNullOrEmpty(rejectStep)) {
      activeIndex = steps.findIndex((it: StepItem) => it.value === activeStep);
    } else {
      activeIndex = steps.findIndex(
        (it: StepItem) => it.valueReject === rejectStep,
      );
    }
    setActiveStepBar(activeIndex + 1);
  }, [activeStep, open]);

  const classes = useStyles();
  return (
    <div className={classes.MStepper} style={{ paddingBottom: 5 }}>
      <Box sx={style}>
        <Stepper activeStep={activeStepBar} alternativeLabel>
          {steps.map((step: StepItem) => {
            const labelProps: any = {};
            let label: string | undefined = step.label;
            if (
              !stringNullOrEmpty(step.rejected) &&
              step.rejected &&
              !stringNullOrEmpty(rejectStep) &&
              step.valueReject === rejectStep
            ) {
              labelProps.error = true;
              label = step.labelReject;
            }
            return (
              <Step key={step.value}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </div>
  );
}
