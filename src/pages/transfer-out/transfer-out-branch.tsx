import React, { ReactElement, useEffect, useRef } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import _ from "lodash";
import { useStyles } from "../../styles/makeTheme";
import { ItemProps } from "../../models/search-branch-province-model";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { BranchListOptionType } from "../../models/branch-model";
import { isGroupBranch } from "../../utils/role-permission";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getUserInfo } from "../../store/sessionStore";
import { getBranchName, objectNullOrEmpty } from "../../utils/utils";
import { BranchInfo } from "../../models/search-branch-model";
import { featchBranchListAsync } from "../../store/slices/search-branches-slice";
import { featchAuthorizedBranchListAsync } from "../../store/slices/authorized-branch-slice";
import { KeyCloakTokenInfo } from "../../models/keycolak-token-info";

interface Props {
  disabled?: boolean;
  listSelect: BranchListOptionType[];
  setListSelect: (item: BranchListOptionType[]) => void;
}

export default function SelectBranch(props: Props): ReactElement {
  const { disabled } = props;
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [value, setValue] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;
  const userInfo: KeyCloakTokenInfo = getUserInfo();
  const [ownBranch, setOwnBranch] = React.useState(
    getUserInfo().branch
      ? getBranchName(branchList, getUserInfo().branch)
        ? getUserInfo().branch
        : ""
      : "",
  );
  const [branch, setBranch] = React.useState<any | null>(null);
  const [checkSelectBranch, setCheckSelectBranch] =
    React.useState<boolean>(false);
  const userPermission =
    !objectNullOrEmpty(userInfo) &&
    !objectNullOrEmpty(userInfo.acl) &&
    userInfo.acl["service.posback-campaign"] != null &&
    userInfo.acl["service.posback-campaign"].length > 0
      ? userInfo.acl["service.posback-campaign"]
      : [];

  const [listBranchSelect, setBranchListSelect] = React.useState<
    BranchListOptionType[]
  >([]);
  const branchName = getBranchName(branchList, ownBranch);
  let authorizedBranchList = useAppSelector(
    (state) => state.authorizedhBranchSlice,
  );
  useEffect(() => {
    if (branchList === null || branchList.length <= 0)
      dispatch(featchBranchListAsync());
    if (
      authorizedBranchList === null ||
      authorizedBranchList.branchList.data?.branches === null ||
      authorizedBranchList.branchList.data?.branches === undefined ||
      authorizedBranchList.branchList.data?.branches.length <= 0
    ) {
      dispatch(featchAuthorizedBranchListAsync());
    }
    if (isGroupBranch()) {
      setOwnBranch(
        userInfo.branch
          ? getBranchName(branchList, userInfo.branch)
            ? userInfo.branch
            : ""
          : "",
      );
    }
    if (!!(props.disabled && branchName && ownBranch)) {
      setValue(`${ownBranch} - ${branchName}`);
    }
  }, [branchList]);
  useEffect(() => {
    if (open) {
      setBranchListSelect(props.listSelect);
    }
    if (!!(props.disabled && branchName && ownBranch)) {
      setValue(`${ownBranch} - ${branchName}`);
    }
  }, [open, props.disabled]);

  useEffect(() => {
    if (props.listSelect.length === 0) {
      let text = listBranchSelect
        .map((item: any) => `${item.code}-${item.name}`)
        .join(", ");
      setValue(text);
    }
  }, [props.listSelect]);

  useEffect(() => {
    setBranch(null);
  }, [checkSelectBranch]);

  const filterAuthorizedBranch = (branch: BranchInfo) => {
    authorizedBranchList.branchList.data?.branches.some((item: BranchInfo) => {
      return branch.code === item.code;
    });
  };
  const BranchItem = (props: ItemProps) => {
    const { label, onDelete, ...other } = props;
    return (
      <div className="wrapper-item">
        <span>{label}</span>
        {!disabled && <CloseIcon onClick={onDelete} />}
      </div>
    );
  };

  const handleClickSearch = () => {
    if (props.disabled) return;
    setOpen(true);
  };
  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleAddForm = () => {
    setOpen(false);
    let text = listBranchSelect
      .map((item: any) => `${item.code}-${item.name}`)
      .join(", ");
    setValue(text);
    props.setListSelect(listBranchSelect);
    setBranchListSelect([]);
  };

  const handleClearForm = () => {
    setBranchListSelect([]);
  };

  const handleChangeBranch = (
    event: any,
    newValue: BranchListOptionType | null,
  ) => {
    setBranch(newValue);
    setCheckSelectBranch(!checkSelectBranch);
    if (newValue != null && !listBranchSelect.includes(newValue)) {
      let list = [...listBranchSelect];
      list.push(newValue);
      setBranchListSelect(list);
    }
  };

  const handleDeleteBranch = (itemCode: any) => {
    let newList = listBranchSelect.filter(
      (item: any) => item.code !== itemCode,
    );
    setBranchListSelect(newList);
  };
  const filterDC = (branch: BranchInfo) => {
    return branch.isDC ? false : true;
  };

  const defaultPropsBranchList = {
    options: userPermission.includes("campaign.to.create")
      ? branchList.filter((branch: BranchInfo) => {
          return branch.code !== ownBranch && filterDC(branch);
        })
      : !!authorizedBranchList.branchList.data?.branches
        ? authorizedBranchList.branchList.data?.branches
        : [],
    getOptionLabel: (option: BranchListOptionType) =>
      `${option.code}-${option.name}`,
  };
  return (
    <div>
      <TextField
        fullWidth
        className={`${classes.MtextFieldNumber} ${classes.MSearchBranchInput}`}
        sx={{ textAlign: "left" }}
        InputProps={{
          endAdornment: <SearchIcon sx={{ marginRight: "12px" }} />,
          inputProps: {
            style: { textAlignLast: "start" },
          },
        }}
        style={{ backgroundColor: disabled ? "#f1f1f1" : "transparent" }}
        onClick={handleClickSearch}
        value={value}
        FormHelperTextProps={{
          style: {
            textAlign: "right",
            marginRight: 0,
          },
        }}
        placeholder="กรุณาเลือก"
        disabled={disabled}
      />
      <Dialog maxWidth="lg" fullWidth open={open}>
        <DialogTitle>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme: any) => theme.palette.grey[400],
            }}
          >
            <CancelOutlinedIcon
              fontSize="large"
              stroke={"white"}
              strokeWidth={1}
            />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: "45px 24px 32px 100px" }}>
          <Grid container spacing={2}>
            <Grid item xs={5} pr={4} mt={3}>
              <Typography>ค้นหาสาขา</Typography>
              <Autocomplete
                {...defaultPropsBranchList}
                className={classes.Mautocomplete}
                popupIcon={<SearchIcon />}
                noOptionsText="ไม่พบข้อมูล"
                id="selBranchNo"
                value={branch}
                onChange={handleChangeBranch}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.code}>
                      {`${option.code}-${option.name}`}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="ทั้งหมด"
                    size="small"
                    className={classes.MtextField}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={7} pr={5} mt={5}>
              <Box className={classes.MWrapperListBranch}>
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  {listBranchSelect.map((item: any, index: number) => (
                    <BranchItem
                      label={`${item.code}-${item.name}`}
                      onDelete={() => handleDeleteBranch(item.code)}
                      key={index}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                textAlign: "right",
                height: "43px",
                padding: "0 !important",
                marginTop: "30px",
              }}
            >
              <Button
                variant="contained"
                color="cancelColor"
                className={classes.MbtnSearch}
                size="large"
                onClick={handleClearForm}
                sx={{ marginRight: "15px" }}
              >
                เคลียร์
              </Button>
              <Button
                variant="contained"
                color="info"
                className={classes.MbtnSearch}
                size="large"
                onClick={handleAddForm}
                disabled={
                  listBranchSelect.length === 0 && props.listSelect.length === 0
                }
              >
                เลือกสาขา
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        {/* <DialogActions>
          <Button>Ok</Button>
        </DialogActions> */}
      </Dialog>
    </div>
  );
}
