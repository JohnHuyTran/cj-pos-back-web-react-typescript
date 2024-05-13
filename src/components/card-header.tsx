import { ReactNode } from "react";
import { HighlightOff } from "@mui/icons-material";
import { IconButton, Box, DialogContent, Typography } from "@mui/material";
import Steppers from "components/steppers";

interface CardHeaderProps {
  isLoading: boolean;
  scrollDown?: any;
  steps?: any;
  actionStep?: number;
  children: ReactNode;
  onClose: () => void;
}

export default function CardHeader(props: CardHeaderProps) {
  const {
    onClose,
    children,
    isLoading,
    scrollDown,
    steps,
    actionStep = 0,
  } = props;

  return (
    <Box
      id="CardHeader"
      sx={{
        boxShadow: scrollDown ? "0 0 10px rgba(0,0,0,0.4)" : "none",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 1,
        transition: "all 0.5s linear",
      }}
    >
      <DialogContent
        id="Topic"
        sx={{
          padding: 0,
          display: "flex",
          marginBottom: !steps ? "25px" : "0",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: "24px", m: "20px 0 0 24px" }}
        >
          {children}
        </Typography>
        <IconButton
          ria-label="close"
          onClick={onClose}
          disabled={isLoading}
          sx={{ color: "#bdbdbd" }}
        >
          <HighlightOff fontSize="large" />
        </IconButton>
      </DialogContent>
      {steps && (
        <Box
          id="Steppers"
          sx={{ width: "50%", margin: "20px auto 0", padding: "0 0 30px" }}
        >
          <Steppers steps={steps} actionStep={actionStep} />
        </Box>
      )}
    </Box>
  );
}
