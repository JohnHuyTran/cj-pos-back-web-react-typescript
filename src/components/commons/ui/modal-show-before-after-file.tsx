import { Dialog, DialogContent, Grid } from "@mui/material";
import React, { ReactElement, useEffect } from "react";
import ModalShowElementFile from "./modal-show-element-file";
import { BootstrapDialogTitle } from "./dialog-title";

interface ModalShowFileProps {
  open: boolean;
  isPrint?: boolean;
  onClose: () => void;
  onPrint?: () => void;
  attachFileBefore: any[];
  attachFileAfter: any[];
  currentFileOpenKey?: string;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onPrint?: () => void;
}

export default function ModalShowBeforeAfterFile({
  open,
  isPrint,
  onClose,
  attachFileBefore,
  attachFileAfter,
  currentFileOpenKey,
}: ModalShowFileProps): ReactElement {
  const [lstAttachFileBefore, setLstAttachFileBefore] = React.useState<any>([]);
  const [lstAttachFileAfter, setLstAttachFileAfter] = React.useState<any>([]);

  useEffect(() => {
    setLstAttachFileBefore(attachFileBefore);
    setLstAttachFileAfter(attachFileAfter);
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  return (
    <div>
      <Dialog open={open} maxWidth={false} fullWidth>
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        />
        <DialogContent
          sx={{
            textAlign: "center",
            mt: 1,
            height: "85vh",
          }}
        >
          <Grid container mb={2} spacing={2}>
            <Grid item container xs={6}>
              {/*before*/}
              <ModalShowElementFile
                attachFile={lstAttachFileBefore}
                currentFileOpenKey={currentFileOpenKey}
              />
            </Grid>
            <Grid item container xs={6}>
              {/*after*/}
              <ModalShowElementFile
                attachFile={lstAttachFileAfter}
                currentFileOpenKey={currentFileOpenKey}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
}
