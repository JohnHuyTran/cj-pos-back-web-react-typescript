import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";
export interface loadingModalProps {
  open: boolean;
}

export default function LoadingModal(props: loadingModalProps) {
  const { open } = props;

  return (
    <div>
      <Backdrop
        sx={{ color: "#FFF", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={open}
      >
        <div style={{ marginRight: "15px" }}>กรุณารอสักครู่</div>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
