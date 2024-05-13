import React, { ReactElement, useEffect, useRef } from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  createFilterOptions,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
// import { useTranslation } from 'react-i18next';
import SearchIcon from "@mui/icons-material/Search";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CloseIcon from "@mui/icons-material/Close";
import _ from "lodash";

import { useStyles } from "../../../styles/makeTheme";
import {
  ItemProps,
  ListBranches,
} from "../../../models/search-branch-province-model";
import {
  fetchProvinceListAsync,
  fetchBranchProvinceListAsync,
  updatePayloadBranches,
  fetchTotalBranch,
} from "../../../store/slices/search-branches-province-slice";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import { paramsConvert } from "../../../utils/utils";
interface Props {
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export default function SearchBranch(props: Props): ReactElement {
  const { error, helperText, disabled } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  // const { t } = useTranslation(['common']);
  const [province, setProvince] = React.useState<any | null>(null);
  const [branch, setBranch] = React.useState<any | null>(null);
  const [listBranch, setListBranch] = React.useState<ListBranches>({
    branches: [],
    provinces: [],
  });
  const [checked, setChecked] = React.useState<boolean>(false);
  const [allBranches, setAllBranches] = React.useState<boolean>(true);
  const [errorProvince, setErrorProvince] = React.useState<string | null>();
  const [errorBranch, setErrorBranch] = React.useState<string | null>();
  const [value, setValue] = React.useState<string>("");
  const [checkSelectBranch, setCheckSelectBranch] =
    React.useState<boolean>(false);
  const provinceList = useAppSelector(
    (state) => state.searchBranchProvince.provinceList,
  );
  const branchList = useAppSelector(
    (state) => state.searchBranchProvince.branchList,
  );
  const totalBranches = useAppSelector(
    (state) => state.searchBranchProvince.totalBranches,
  );
  const payloadBranches = useAppSelector(
    (state) => state.searchBranchProvince.payloadBranches,
  );
  const searchDebouceRef = useRef<any>();

  const dispatch = useAppDispatch();
  const autocompleteRenderListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.code}>
        <Box sx={{ display: "flex", width: "100%" }}>
          <Typography variant="body2">
            {option.code}-{option.name}
          </Typography>
        </Box>
      </li>
    );
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

  useEffect(() => {
    if (open) {
      if (provinceList === null || provinceList.data.length == 0)
        dispatch(fetchProvinceListAsync());
      dispatch(fetchTotalBranch());
      dispatch(fetchBranchProvinceListAsync("limit=1000"));
    }
  }, [open]);

  useEffect(() => {
    setBranch(null);
  }, [checkSelectBranch]);

  useEffect(() => {
    try {
      const payload = {
        // ...(!!branch && { name: branch.name }),
        ...(!!province && { province: province.name }),
        // limit: '10',
      };
      const params = paramsConvert(payload);
      if (open) {
        dispatch(fetchBranchProvinceListAsync(params));
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [province]);

  useEffect(() => {
    setAllBranches(payloadBranches.isAllBranches);
    setListBranch({
      provinces: payloadBranches.appliedBranches.province,
      branches: payloadBranches.appliedBranches.branchList,
    });
  }, [payloadBranches]);
  useEffect(() => {
    if (payloadBranches.isAllBranches && payloadBranches.saved) {
      setValue(`สาขาทั้งหมด (${totalBranches} สาขา)`);
    } else {
      const stringProvince = payloadBranches.appliedBranches["province"]
        .map((item: any) => `สาขาจังหวัด${item.name}`)
        .join(", ");
      const stringBranch = payloadBranches.appliedBranches["branchList"]
        .map((item: any) => `${item.code}-${item.name}`)
        .join(", ");
      const stringList =
        !!stringProvince && !!stringBranch
          ? stringProvince.concat(", ", stringBranch)
          : stringProvince.concat("", stringBranch);
      setValue(stringList);
    }
  }, [payloadBranches, totalBranches]);

  const handleCloseModal = () => {
    setOpen(false);
    clearInput();
    setListBranch({
      branches: payloadBranches.appliedBranches["branchList"],
      provinces: payloadBranches.appliedBranches["province"],
    });
    setAllBranches(payloadBranches.isAllBranches);
  };

  const clearInput = () => {
    setProvince(null);
    setBranch(null);
    setErrorProvince(null);
    setErrorBranch(null);
    setChecked(false);
  };
  const handleClickSearch = () => {
    setOpen(true);
  };

  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllBranches(JSON.parse(event.target.value.toLowerCase()));
  };

  const handleCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    // event.target.checked && setBranch(null);
    const existProvince = listBranch["provinces"].some(
      (item: any) => item.code == province.code,
    );
    if (!existProvince) {
      const preData = [...listBranch["provinces"], province];
      const newBranches = listBranch["branches"].filter(
        (item: any) => item.province.code !== province.code,
      );
      const checkArrays = _.difference(listBranch["branches"], newBranches);
      if (checkArrays.length > 0) {
        setListBranch({
          ...listBranch,
          branches: newBranches,
          provinces: preData,
        });
      } else {
        setListBranch({
          ...listBranch,
          provinces: preData,
        });
      }
    }
    setChecked(false);
  };

  const onInputChange = (event: any, value: string) => {
    if (!!province) return;
    searchDebouceRef.current?.cancel();
    searchDebouceRef.current = _.debounce(() => {
      if (event?.keyCode === 13) return;
      const keyword = value.trim();
      const payload: { [key: string]: any } = {
        name: keyword,
        code: keyword,
        limit: "10",
      };
      if (!!province?.name) {
        payload.province = province.name;
      }
      const params = paramsConvert(payload);
      try {
        dispatch(fetchBranchProvinceListAsync(params));
      } catch (error) {
        console.error(error);
      }
    }, 300);
    searchDebouceRef.current();
  };

  const handleCloseBranch = (event: React.SyntheticEvent, reason: string) => {
    try {
      const payload = {
        ...(!!province && { province: province.name }),
        limit: "10",
      };
      const params = paramsConvert(payload);
      dispatch(fetchBranchProvinceListAsync(params));
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleSelectBranch = (e: any) => {
    setBranch(e);
    setCheckSelectBranch(!checkSelectBranch);
    if (e) {
      const existBranch = listBranch["branches"].some(
        (item: any) => item.id == e.id,
      );
      const existInProvince = listBranch["provinces"].some(
        (item: any) => item.code == e.province.code,
      );
      if (!existBranch && !existInProvince) {
        const preData = [...listBranch["branches"], e];
        setListBranch({ ...listBranch, branches: preData });
      }
    }
  };

  const handleDeleteBranch = (code: string) => {
    const newList = listBranch["branches"].filter(
      (item: any) => item.code !== code,
    );
    setListBranch({ ...listBranch, branches: newList });
  };

  const handleDeleteProvinceBranch = (code: string) => {
    const newList = listBranch["provinces"].filter(
      (item: any) => item.code !== code,
    );
    setListBranch({ ...listBranch, provinces: newList });
  };

  const handleAddForm = () => {
    const payload = {
      isAllBranches: allBranches,
      appliedBranches: {
        branchList: listBranch["branches"],
        province: listBranch["provinces"],
      },
      saved: true,
    };
    dispatch(updatePayloadBranches(payload));
    setOpen(false);
  };

  const handleClearForm = () => {
    if (props.disabled) return;
    const payload = {
      isAllBranches: true,
      appliedBranches: {
        branchList: [],
        province: [],
      },
      saved: false,
    };
    dispatch(updatePayloadBranches(payload));
  };

  const filterOptions = createFilterOptions({
    stringify: (option: any) => option.name + option.code,
  });

  return (
    <div>
      <TextField
        fullWidth
        className={`${classes.MtextFieldNumber} ${classes.MSearchBranchInput}`}
        sx={{ textAlign: "left" }}
        InputProps={{
          endAdornment: (
            <SearchIcon color="primary" sx={{ marginRight: "12px" }} />
          ),
          inputProps: {
            style: { textAlignLast: "start" },
          },
        }}
        style={{ backgroundColor: disabled ? "#f1f1f1" : "transparent" }}
        onClick={handleClickSearch}
        value={value}
        error={error}
        helperText={helperText}
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
        <Box sx={{ flex: 1, ml: 2 }}>
          {handleCloseModal ? (
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme: any) => theme.palette.grey[400],
              }}
              data-testid="iconCloseModal"
            >
              <CancelOutlinedIcon
                fontSize="large"
                stroke={"white"}
                strokeWidth={1}
              />
            </IconButton>
          ) : null}
        </Box>
        <DialogContent sx={{ padding: "45px 24px 32px 100px" }}>
          <Grid container spacing={2}>
            <Grid item xs={5} pr={4}>
              <FormControl sx={{ marginBottom: "15px" }}>
                <RadioGroup
                  aria-labelledby="branch-radio-buttons-group-label"
                  value={allBranches}
                  name="radio-buttons-group"
                  onChange={handleChangeRadio}
                >
                  <FormControlLabel
                    value={true}
                    control={<Radio />}
                    label={`เลือกสาขาทั้งหมด (${totalBranches} สาขา)`}
                    disabled={disabled}
                  />
                  <FormControlLabel
                    disabled={disabled}
                    value={false}
                    control={<Radio />}
                    label="เลือกสาขาเอง"
                  />
                </RadioGroup>
              </FormControl>
              {!allBranches && (
                <Box>
                  <Box mb={1}>
                    <Typography
                      gutterBottom
                      variant="subtitle1"
                      component="div"
                    >
                      จังหวัด
                    </Typography>
                    <Autocomplete
                      options={provinceList.data}
                      id="combo-box-province"
                      popupIcon={<SearchIcon color="primary" />}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          FormHelperTextProps={{
                            style: {
                              textAlign: "right",
                              marginRight: 0,
                            },
                          }}
                          error={!!errorProvince}
                          helperText={errorProvince}
                          placeholder="ค้นหาจังหวัด"
                        />
                      )}
                      size="small"
                      disabled={disabled}
                      className={classes.MSearchBranch}
                      getOptionLabel={(option) => option.name}
                      onChange={(event: any, newValue: any) => {
                        setProvince(newValue);
                        !newValue && setChecked(false);
                      }}
                      value={province}
                    />
                  </Box>
                  <Box sx={{ marginBottom: "20px" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        gutterBottom
                        variant="subtitle1"
                        component="div"
                        mr={3}
                      >
                        ค้นหาสาขา
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          disabled={
                            !province ||
                            listBranch["provinces"].some(
                              (item: any) => item.code == province.code,
                            )
                          }
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={handleCheckBox}
                            />
                          }
                          label="เลือกสาขาทั้งหมด"
                        />
                      </FormGroup>
                    </Box>
                    <Autocomplete
                      options={branchList.data}
                      id="combo-box-branch"
                      popupIcon={<SearchIcon color="primary" />}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errorBranch}
                          helperText={errorBranch}
                          FormHelperTextProps={{
                            style: {
                              textAlign: "right",
                              marginRight: 0,
                            },
                          }}
                          placeholder="ค้นหาจากรหัสสาขา / ชื่อสาขา"
                        />
                      )}
                      size="small"
                      className={classes.MSearchBranch}
                      getOptionLabel={(option) => option.name}
                      renderOption={autocompleteRenderListItem}
                      onChange={(event: any, newValue: any) => {
                        handleSelectBranch(newValue);
                      }}
                      onInputChange={onInputChange}
                      disabled={disabled}
                      value={branch}
                      filterOptions={filterOptions}
                      onClose={handleCloseBranch}
                    />
                  </Box>
                  {/* <Box sx={{ textAlign: 'right' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.MbtnSearch}
                      disabled={!branch && !checked}
                      onClick={handleAddBranch}
                    >
                      {t('button.add')}
                    </Button>
                  </Box> */}
                </Box>
              )}
            </Grid>
            <Grid item xs={7} pr={5} mt={5}>
              <Box className={classes.MWrapperListBranch}>
                {allBranches ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    <BranchItem
                      label={`สาขาทั้งหมด (${totalBranches} สาขา)`}
                      onDelete={() => {}}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    {listBranch["provinces"].map((item: any, index: number) => (
                      <BranchItem
                        label={`สาขาจังหวัด${item.name}`}
                        onDelete={() => handleDeleteProvinceBranch(item.code)}
                        key={index}
                      />
                    ))}
                    {listBranch["branches"].map((item: any, index: number) => (
                      <BranchItem
                        label={`${item.code}-${item.name}`}
                        onDelete={() => handleDeleteBranch(item.code)}
                        key={index}
                      />
                    ))}
                  </Box>
                )}
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
                data-testid="buttonClear"
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
                  (!allBranches &&
                    listBranch["branches"].length === 0 &&
                    listBranch["provinces"].length === 0) ||
                  disabled
                }
                data-testid="buttonAdd"
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
