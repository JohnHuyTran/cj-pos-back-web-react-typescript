export interface SnackbarProps {
  open: boolean;
  onClose: () => void;
  isSuccess: boolean;
  contentMsg: string;
}
