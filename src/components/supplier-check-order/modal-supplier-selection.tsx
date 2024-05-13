import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup, { useRadioGroup } from "@mui/material/RadioGroup";
import FormControlLabel, {
  FormControlLabelProps,
} from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  searchSupplierAsync,
  clearDataFilter,
} from "../../store/slices/search-supplier-selection-slice";
import {
  searchSupplierPOAsync,
  clearDataFilter as clearDataFilterPO,
} from "../../store/slices/search-supplier-selection-po-slice";
import { updateState } from "../../store/slices/supplier-selection-slice";
import { updateItemsState } from "../../store/slices/supplier-add-items-slice";
import SupplierOrderDetail from "./supplier-pi-detail";
import LoadingModal from "../commons/ui/loading-modal";
import theme from "../../styles/theme";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
}));

const useStyles = makeStyles({
  MTextField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      padding: theme.spacing(1.8),
    },
  },
  MBtnAddSupplier: {
    borderRadius: "5px !important",
  },
  textLabelInput: { fontSize: 14, fontWeight: 400 },
  textListSupplier: {
    fontSize: 15,
    fontWeight: 700,
  },
  textItemList: {
    fontSize: 14,
  },
});

interface StyledFormControlLabelProps extends FormControlLabelProps {
  checked: boolean;
}

const StyledFormControlLabel = styled((props: StyledFormControlLabelProps) => (
  <FormControlLabel {...props} />
))(({ theme, checked }) => ({
  ".MuiFormControlLabel-label": checked && {
    color: theme.palette.primary.main,
  },
}));

function ColorFormControlLabel(props: FormControlLabelProps) {
  const radioGroup = useRadioGroup();
  let checked = false;
  if (radioGroup) {
    checked = radioGroup.value === props.value;
  }

  return <StyledFormControlLabel checked={checked} {...props} />;
}

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

interface Props {
  openModal: boolean;
  handleCloseModal: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      <Typography sx={{ fontSize: 24 }} id="titleSupplierModal">
        {children}
      </Typography>
      {onClose ? (
        <IconButton
          id="iconButtonCloseModal"
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.cancelColor.main,
          }}
        >
          <CancelOutlinedIcon
            id="iconCloseModal"
            fontSize="large"
            stroke={"white"}
            strokeWidth={1}
          />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default function ModalSupplierSelection({
  openModal,
  handleCloseModal,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [havePOValue, setHavePOValue] = useState<string>("");
  const [supplier, setSupplier] = useState<any>(null);
  const [poSelection, setPoSelection] = useState<any>(null);
  const [submitDisable, setSubmitDisable] = useState<boolean>(true);

  const resp = useAppSelector(
    (state) => state.searchSupplierSelectionSlice.supplierResp,
  );
  const options = resp.data && resp.data.length > 0 ? resp.data : [];

  const poResp = useAppSelector(
    (state) => state.searchSupplierSelectionPOSlice.supplierPOResp,
  );
  const poData = poResp.data && poResp.data.length > 0 ? poResp.data : [];

  const onInputChange = async (event: any, value: string, reason: string) => {
    if (event && event.keyCode && event.keyCode === 13) {
      // console.log({ reason, value });
      return false;
    }

    const keyword = value.trim();
    if (keyword.length >= 3) {
      await dispatch(searchSupplierAsync(keyword));
    } else {
      clearData();
    }
  };

  const onChange = async (event: any, option: any, reason: string) => {
    setSupplier(null);
    setPoSelection(null);

    if (option && reason === "selectOption") {
      setSupplier(option);

      if (option.isRefPO) {
        setSubmitDisable(true);
        setHavePOValue("มีเอกสาร PO");
        await dispatch(searchSupplierPOAsync(option.code));
      } else {
        setSubmitDisable(false);
        setHavePOValue("ไม่มีเอกสาร PO");
      }
    } else {
      clearData();
    }
  };

  const onRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitDisable(false);
    const code = event.target.value;
    const filter = poData.filter((row) => row.docNo === code);
    filter.length > 0 ? setPoSelection(filter[0]) : setPoSelection(null);
  };

  const onSubmitData = async () => {
    setOpenLoadingModal(true);
    const payload = { supplier, poSelection };

    if (poSelection) {
      // console.log('poSelection OK');
      await dispatch(updateItemsState(poSelection.items));
    } else {
      // console.log('poSelection Noooo');
      await dispatch(updateItemsState({}));
    }

    await dispatch(updateState(payload));
    setOpenPIDetail(true);
    clearData();
    handleCloseModal();
    await setOpenLoadingModal(false);
  };

  const onCloseModal = () => {
    clearData();
    handleCloseModal();
  };

  const clearData = async () => {
    setSubmitDisable(true);
    setHavePOValue("");
    await dispatch(clearDataFilter());
    await dispatch(clearDataFilterPO());
  };

  const filterOptions = createFilterOptions({
    stringify: (option: any) => option.name + option.code,
  });

  const autocompleteRenderListItem = (props: any, option: any) => {
    return (
      <List {...props} sx={{ width: "100%" }} key={option.code}>
        <ListItem alignItems="flex-start" disablePadding>
          <ListItemText primary={option.name} secondary={option.code} />
        </ListItem>
      </List>
    );
  };

  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [openPIDetail, setOpenPIDetail] = React.useState(false);
  const isClosModalPIDetail = () => {
    setOpenPIDetail(false);
  };

  return (
    <div>
      <BootstrapDialog
        // onClose={onCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        open={openModal}
        fullWidth
        maxWidth="sm"
        id="addSupplierModal"
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={onCloseModal}
        >
          เพิ่มผู้จำหน่าย
        </BootstrapDialogTitle>

        <DialogContent id="addSupplierContentModal">
          <Box sx={{ display: "flex" }}>
            <Box sx={{ flex: 3 }}>
              <label className={classes.textLabelInput} id="titleSupplierLabel">
                ผู้จำหน่าย
              </label>

              <Autocomplete
                id="searchSupplierModal"
                fullWidth
                freeSolo
                loadingText="กำลังโหลด..."
                sx={{ mt: 1, width: "100%" }}
                options={options}
                filterOptions={filterOptions}
                renderOption={autocompleteRenderListItem}
                onChange={onChange}
                onInputChange={onInputChange}
                getOptionLabel={(option) => (option.name ? option.name : "")}
                isOptionEqualToValue={(option, value) =>
                  option.name === value.name
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="รหัสผู้จำหน่าย/ชื่อผู้จำหน่าย"
                    className={classes.MTextField}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: 2, ml: 2 }}>
              <label className={classes.textLabelInput} id="titlePOTypeLabel">
                ประเภทผู้จำหน่าย
              </label>
              <TextField
                id="supplierPOTypeModal"
                sx={{ mt: 1 }}
                className={classes.MTextField}
                value={havePOValue}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
          </Box>
          {poData.length === 0 && <Box sx={{ mt: 4, height: 100 }} />}
          {poData.length > 0 && (
            <Box sx={{ mt: 4, maxHeight: 250 }}>
              <label className={classes.textListSupplier} id="listPOModal">
                รายการเอกสารใบสั่งซื้อ PO
              </label>
              <RadioGroup
                name="use-radio-group"
                defaultValue="first"
                id="listSupplierDocPO"
                onChange={onRadioChange}
              >
                {poData.map((row, index) => (
                  <ColorFormControlLabel
                    id={`item-po-${index}`}
                    value={row.docNo}
                    label={row.docNo}
                    control={<Radio />}
                    key={row.docNo}
                  />
                ))}
              </RadioGroup>
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row-reverse",
              p: 1,
            }}
          >
            <Button
              id="btnAddSupplier"
              variant="contained"
              color="secondary"
              onClick={onSubmitData}
              className={classes.MBtnAddSupplier}
              disabled={submitDisable}
            >
              เพิ่มผู้จำหน่าย
            </Button>
          </Box>
        </DialogContent>
      </BootstrapDialog>

      <LoadingModal open={openLoadingModal} />
      {openPIDetail && (
        <SupplierOrderDetail
          isOpen={openPIDetail}
          onClickClose={isClosModalPIDetail}
        />
      )}
    </div>
  );
}
