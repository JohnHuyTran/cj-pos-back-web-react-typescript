import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Step, StepLabel, Stepper } from "@mui/material";
import { Box } from "@mui/system";
import { useStyles } from "../../styles/makeTheme";
import { getStockTransferStatusList } from "../../utils/enum/stock-transfer-enum";

interface Props {
  status: string;
  type: string;
}

function Steppers({ status, type }: Props): ReactElement {
  const { t } = useTranslation(["stockTransfer", "common"]);
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [steps, setSteps] = React.useState([]);
  const stepsList: any = [];

  useEffect(() => {
    getStockTransferStatusList(type).map((item, index: number) => {
      if (item.stepperGrp === 1 && item.value === status) {
        stepsList.push(t(`status.${item.value}`));
        stepsList.push("อยู่ระหว่างดำเนินการ: -");
        handleStepApproved(type);
      } else if (item.stepperGrp === 2 && item.value === status) {
        handleStepDraft(type);
        stepsList.push("อยู่ระหว่างดำเนินการ: " + t(`status.${item.value}`));
        handleStepApproved(type);
      } else if (item.stepperGrp === 3 && item.value === status) {
        handleStepDraft(type);
        stepsList.push("อยู่ระหว่างดำเนินการ: -");
        stepsList.push(t(`status.${item.value}`));
      }

      //setSteps
      setSteps(stepsList);
      if (item.value === status) setActiveStep(item.stepperGrp);
    });
  }, [open, status]);

  const handleStepDraft = (type: string) => {
    if (type === "RT") stepsList.push(t(`status.DRAFT`));
    else if (type === "BT") stepsList.push(t(`status.CREATED`));
  };

  const handleStepApproved = (type: string) => {
    if (type === "RT") stepsList.push(t(`status.APPROVED`));
    else if (type === "BT") stepsList.push(t(`status.COMPLETED`));
  };

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
