import { styled, Stack, Stepper, Step, StepLabel } from "@mui/material";
import { CheckCircle, Brightness1 } from "@mui/icons-material";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";

interface SteppersProps {
  steps: Array<any>;
  actionStep: number;
}

interface QontoStepIconProps {
  active: boolean;
  completed: string;
  className: string;
}

interface QontoStepIconRootProps {
  activeState?: boolean;
}

export default function Steppers(props: SteppersProps) {
  const { steps, actionStep } = props;

  return (
    <Stack sx={{ width: "100%" }} spacing={4}>
      <Stepper
        alternativeLabel
        activeStep={actionStep}
        connector={<QontoConnector />}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}

const QontoStepIcon = (props: QontoStepIconProps) => {
  const { active, completed, className } = props;
  return (
    <QontoStepIconRoot activeState={active} className={className}>
      {completed ? (
        <CheckCircle className="QontoStepIcon-completedIcon" />
      ) : (
        <Brightness1 className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
};

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#36c690",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#36c690",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#EAEBEB",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled("div")<QontoStepIconRootProps>(
  ({ activeState }) => ({
    display: "flex",
    height: 22,
    alignItems: "center",
    "& .QontoStepIcon-completedIcon": {
      zIndex: 1,
      fontSize: 30,
      color: "#36c690",
    },
    "& .QontoStepIcon-circle": {
      zIndex: 1,
      fontSize: 30,
      color: activeState ? "#36c690" : "#EAEBEB",
    },
  }),
);
