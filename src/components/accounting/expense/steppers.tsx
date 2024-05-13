import React, { ReactElement, useEffect } from "react";
import { Step, StepLabel, Stepper } from "@mui/material";
import { Box } from "@mui/system";
import { useStyles } from "../../../styles/makeTheme";
import { expenseStatusList, STATUS } from "../../../utils/enum/accounting-enum";

interface Props {
  status: string;
}

function Steppers({ status }: Props): ReactElement {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [steps, setSteps] = React.useState([]);
  const stepsList: any = [];

  useEffect(() => {
    expenseStatusList.map((item: any, index: number) => {
      if (item.stepperGrp === 1 && item.key === status) {
        if (status === STATUS.DRAFT) {
          stepsList.push("บันทึก");
        } else {
          stepsList.push(`บันทึก: ${item.text}`);
        }

        stepsList.push("สาขา");
        stepsList.push("บัญชี");
        stepsList.push("อนุมัติ");
      } else if (item.stepperGrp === 2 && item.key === status) {
        stepsList.push("บันทึก");
        stepsList.push(`สาขา: ${item.text}`);
        stepsList.push("บัญชี");
        stepsList.push("อนุมัติ");
      } else if (item.stepperGrp === 3 && item.key === status) {
        stepsList.push("บันทึก");
        stepsList.push(`สาขา`);
        stepsList.push(`บัญชี: ${item.text}`);
        stepsList.push("อนุมัติ");
      } else if (item.stepperGrp === 4 && item.key === status) {
        stepsList.push("บันทึก");
        stepsList.push(`สาขา`);
        stepsList.push("บัญชี");
        stepsList.push("อนุมัติ");
      }

      //setSteps
      setSteps(stepsList);
      if (item.key === status) setActiveStep(item.stepperGrp);
    });
  }, [open, status]);

  // const handleStepDraft = (type: string) => {
  //   if (type === 'RT') stepsList.push(t(`status.DRAFT`));
  //   else if (type === 'BT') stepsList.push(t(`status.CREATED`));
  // };

  // const handleStepApproved = (type: string) => {
  //   if (type === 'RT') stepsList.push(t(`status.APPROVED`));
  //   else if (type === 'BT') stepsList.push(t(`status.COMPLETED`));
  // };

  return (
    <div className={classes.MStepper} style={{ paddingBottom: 5 }}>
      <Box sx={{ width: "50%", margin: "auto", marginTop: "-1em" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
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
