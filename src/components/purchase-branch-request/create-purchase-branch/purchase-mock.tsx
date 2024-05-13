import React from "react";
import { AddCircleOutlineOutlined } from "@mui/icons-material";
import { Box, Button, Grid } from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import ModalPurchaseBranchDetail from "./purchase-branch-detail";
import { useAppDispatch } from "../../../store/store";
import { updateAddItemsState } from "../../../store/slices/add-items-slice";
import LoadingModal from "../../commons/ui/loading-modal";
import {
  clearDataPurchaseBRDetail,
  featchPurchaseBRDetailAsync,
} from "../../../store/slices/purchase/purchase-branch-request-detail-slice";

interface loadingModalState {
  open: boolean;
}

function CreatePurchaseBranch() {
  const dispatch = useAppDispatch();
  const classes = useStyles();

  const [openLoadingModal, setOpenLoadingModal] =
    React.useState<loadingModalState>({
      open: false,
    });
  const handleOpenLoading = (prop: any, event: boolean) => {
    setOpenLoadingModal({ ...openLoadingModal, [prop]: event });
  };

  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const handleOpenDetailModal = async () => {
    handleOpenLoading("open", true);
    await dispatch(updateAddItemsState({}));
    const docNo = "BR2205B005-000003"; //BR2205B005-000001 //BR22050101-000002
    await dispatch(featchPurchaseBRDetailAsync(docNo));
    // .then((value) => {
    //   console.log('value :', JSON.stringify(value.payload));
    //   handleOpenModal();
    // })
    // .catch((error: any) => {
    //   console.log('ไม่พบ BR');
    // });
    handleOpenModal();
    handleOpenLoading("open", false);
  };
  const handleOpenCreateModal = async () => {
    handleOpenLoading("open", true);
    await dispatch(updateAddItemsState({}));

    await dispatch(clearDataPurchaseBRDetail());
    handleOpenModal();
    handleOpenLoading("open", false);
  };

  const handleOpenModal = () => {
    setOpenDetailModal(true);
  };
  const handleCloseModal = () => {
    setOpenDetailModal(false);
  };

  return (
    <>
      <h1>Mock</h1>
      <Box mb={6}>
        <Grid item xs={7}>
          <Button
            id="btnCreateStockTransferModal"
            variant="contained"
            onClick={handleOpenCreateModal}
            sx={{ mr: 3 }}
            className={classes.MbtnClear}
            startIcon={<AddCircleOutlineOutlined />}
            color="secondary"
          >
            สร้างเอกสารใหม่
          </Button>

          <Button
            id="btnCreateStockTransferModal"
            variant="contained"
            onClick={handleOpenDetailModal}
            // sx={{ width: 150, display: `${displayBtnCreate ? 'none' : ''}` }}
            className={classes.MbtnClear}
            startIcon={<AddCircleOutlineOutlined />}
            color="secondary"
          >
            ดูรายละเอียด
          </Button>
        </Grid>
      </Box>
      {openDetailModal && (
        <ModalPurchaseBranchDetail
          isOpen={openDetailModal}
          onClickClose={handleCloseModal}
        />
      )}

      <LoadingModal open={openLoadingModal.open} />
    </>
  );
}

export default CreatePurchaseBranch;
