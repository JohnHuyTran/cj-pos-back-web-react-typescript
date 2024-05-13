import React, { ReactElement, useEffect } from "react";
import { Step, StepLabel, Stepper } from "@mui/material";
import { Box } from "@mui/system";
import { useStyles } from "../../../styles/makeTheme";

interface Props {
  status: number;
  stepsList: any;
}

// const steps = ['บันทึก', 'อนุมัติ'];

function Steppers({ status, stepsList }: Props): ReactElement {
  const [activeStep, setActiveStep] = React.useState(0);

  const [steps, setSteps] = React.useState([]);

  useEffect(() => {
    setActiveStep(status + 1);

    setSteps(stepsList);
  }, [open]);

  const classes = useStyles();
  return (
    <div className={classes.MStepper} style={{ paddingBottom: 5 }}>
      <Box
        data-testid="boxStepper"
        sx={{ width: "45%", margin: "auto", marginTop: "-1em" }}
      >
        <Stepper data-testid="stepper" activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </div>
  );
}

export default Steppers;
