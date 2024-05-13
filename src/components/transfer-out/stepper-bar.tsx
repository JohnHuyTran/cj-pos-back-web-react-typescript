import * as React from "react";
import { ReactElement } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useStyles } from "../../styles/makeTheme";
import { TOStatus } from "../../utils/enum/common-enum";

interface Props {
  activeStep: any;
  setActiveStep: (activeStep: string) => void;
}

const steps = [
  TOStatus.DRAFT,
  TOStatus.WAIT_FOR_APPROVAL,
  TOStatus.APPROVED,
  TOStatus.CLOSED,
];

export default function StepperBar({
  activeStep,
  setActiveStep,
}: Props): ReactElement {
  const [rejected, setRejected] = React.useState<boolean>(false);
  const [activeStepBar, setActiveStepBar] = React.useState(0);

  React.useEffect(() => {
    if (TOStatus.REJECTED === activeStep) {
      setRejected(true);
      setActiveStepBar(3);
    } else {
      setActiveStepBar(steps.indexOf(activeStep) + 1);
    }
  }, [activeStep, open]);

  const classes = useStyles();
  return (
    <div className={classes.MStepper} style={{ paddingBottom: 5 }}>
      <Box sx={{ width: "45%", margin: "auto", marginTop: "-1em" }}>
        <Stepper activeStep={activeStepBar} alternativeLabel>
          {steps.map((status, index) => {
            const labelProps: any = {};
            let label: string = "";
            switch (index) {
              case 0:
                label = "บันทึก";
                break;
              case 1:
                label = "รออนุมัติ";
                break;
              case 2:
                label = "อนุมัติ";
                break;
              case 3:
                label = "ปิดงาน";
                break;
            }
            if (index === 2 && rejected) {
              label = "ไม่อนุมัติ";
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
