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
  ListAllBranches,
} from "../../../models/search-branch-province-model";
import {
  setListAllBranch,
  updateExcludeSelectBranches,
} from "../../../store/slices/search-branches-province-slice";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import theme from "../../../styles/theme";
import { getAllBranch } from "../../../services/sale-limit-time";
interface Props {
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}
function getUnique(array: Object[], key: any) {
  if (typeof key !== "function") {
    const property = key;
    key = function (item: any) {
      return item[property];
    };
  }
  return Array.from(
    array
      .reduce(function (map: any, item: any) {
        const k = key(item);
        if (!map.has(k)) map.set(k, item);
        return map;
      }, new Map())
      .values(),
  );
}

export default function SelectExcludeBranch(props: Props): ReactElement {
  const { error, helperText, disabled } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  // const { t } = useTranslation(['common']);
  const [province, setProvince] = React.useState<any | null>(null);
  const [excludeProvince, setExcludeProvince] = React.useState<any | null>(
    null,
  );
  const [branch, setBranch] = React.useState<any | null>(null);
  const [excludeBranch, setExcludeBranch] = React.useState<any | null>(null);
  const [values, setValues] = React.useState<ListAllBranches>({
    branches: [],
    provinces: [],
    excludeProvinces: [],
    excludeBranches: [],
  });
  const [checked, setChecked] = React.useState<boolean>(false);
  const [excludeChecked, setExcludeChecked] = React.useState<boolean>(false);
  const [allBranches, setAllBranches] = React.useState<boolean | null>(null);
  const [errorProvince, setErrorProvince] = React.useState<string | null>();
  const [errorBranch, setErrorBranch] = React.useState<string | null>();
  const [value, setValue] = React.useState<string>("");
  const [checkSelectBranch, setCheckSelectBranch] =
    React.useState<boolean>(false);
  // const branchList = useAppSelector((state) => state.searchBranchProvince.listAllBranch);
  const branchList = useAppSelector((state) => state.searchBranchSlice)
    .branchList.data;

  const provincesTemporary = !!branchList
    ? branchList.map((item: any) => item.province)
    : [];
  const provinceList = getUnique(provincesTemporary, "code");

  const totalBranches = useAppSelector(
    (state) => state.searchBranchProvince.totalBranches,
  );
  const payloadBranches = useAppSelector(
    (state) => state.searchBranchProvince.excludeSelectBranch,
  );
  const [listBranchSelect, setListBranchSelect] = React.useState<
    Object[] | any
  >([]);
  const [listExcludeBranchSelect, setListExcludeBranchSelect] = React.useState<
    Object[] | any
  >([]);
  const [listExcludeProvinceSelect, setListExcludeProvinceSelect] =
    React.useState<Object[] | any>([]);

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
    if (open && payloadBranches.saved) {
      setAllBranches(payloadBranches.isAllBranches);
      setValues({
        provinces: payloadBranches.appliedBranches.province,
        branches: payloadBranches.appliedBranches.branchList,
        excludeBranches: payloadBranches.appliedBranches.excludedBranchList,
        excludeProvinces: payloadBranches.appliedBranches.excludedProvinceList,
      });
    }
  }, [open]);

  useEffect(() => {
    if (province) {
      let newList = !!branchList
        ? branchList.filter((el: any) => el.province.code == province.code)
        : [];
      setListBranchSelect(newList);
    } else {
      setListBranchSelect(branchList);
    }
  }, [province]);

  useEffect(() => {
    if (!!allBranches) {
      setListExcludeProvinceSelect(provinceList);
    } else if (!!!allBranches && allBranches !== null) {
      setListExcludeProvinceSelect(values.provinces);
    }
    if (values.provinces.length > 0 && !!!allBranches && allBranches != null) {
      values.provinces.map((item: any) => {
        let newList = !!branchList
          ? branchList.filter((el: any) => el.province.code == item.code)
          : [];
        let listSelect = listExcludeBranchSelect.concat(newList);
        setListExcludeBranchSelect(listSelect);
      });
    } else if (!!allBranches) {
      setListExcludeBranchSelect(branchList);
    } else {
      setListExcludeBranchSelect([]);
    }
  }, [allBranches, values.provinces]);

  useEffect(() => {
    if (excludeProvince) {
      let newList = !!branchList
        ? branchList.filter(
            (el: any) => el.province.code == excludeProvince.code,
          )
        : [];
      setListExcludeBranchSelect(newList);
    } else {
      setListExcludeBranchSelect(branchList);
    }
  }, [excludeProvince]);

  useEffect(() => {
    setBranch(null);
    setExcludeBranch(null);
  }, [checkSelectBranch]);

  useEffect(() => {
    setAllBranches(payloadBranches.isAllBranches);
    setValues({
      provinces: payloadBranches.appliedBranches.province,
      branches: payloadBranches.appliedBranches.branchList,
      excludeBranches: payloadBranches.appliedBranches.excludedBranchList,
      excludeProvinces: payloadBranches.appliedBranches.excludedProvinceList,
    });
    if (payloadBranches.isAllBranches == null) {
      setValue("");
      return;
    }
    if (payloadBranches.isAllBranches && payloadBranches.saved) {
      setValue(`สาขาทั้งหมด (${totalBranches} สาขา)`);
    } else {
      const stringProvince = !!payloadBranches.appliedBranches["province"]
        .length
        ? payloadBranches.appliedBranches["province"]
            .map((item: any) => `สาขาจังหวัด${item.name}`)
            .join(", ")
        : "";

      const stringBranch = !!payloadBranches.appliedBranches["branchList"]
        .length
        ? payloadBranches.appliedBranches["branchList"]
            .map((item: any) => `${item.code}-${item.name}`)
            .join(", ")
        : "";
      const stringList =
        !!stringProvince && !!stringBranch
          ? stringProvince.concat(", ", stringBranch)
          : stringProvince.concat("", stringBranch);
      setValue(stringList);
    }
  }, [payloadBranches]);

  const handleCloseModal = () => {
    setOpen(false);
    clearInput();
    if (!payloadBranches.saved) {
      setAllBranches(null);
    }
  };

  const clearInput = () => {
    setErrorProvince(null);
    setExcludeBranch(null);
    setProvince(null);
    setErrorProvince(null);
    setErrorBranch(null);
    setExcludeProvince(null);
  };
  const handleClickSearch = async () => {
    if (branchList.length == 0) {
      try {
        const rs = await getAllBranch("limit=1000");
        if (rs && rs.data) {
          dispatch(setListAllBranch(rs.data));
        }
      } catch (error) {}
    }
    setOpen(true);
  };

  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllBranches(JSON.parse(event.target.value.toLowerCase()));
    setValues({
      branches: [],
      provinces: [],
      excludeProvinces: [],
      excludeBranches: [],
    });
    setExcludeProvince(null);
    setProvince(null);
  };

  const handleCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    // event.target.checked && setBranch(null);
    const existProvince = values["provinces"].some(
      (item: any) => item.code == province.code,
    );
    if (!existProvince) {
      const preData = [...values["provinces"], province];
      const newBranches = values["branches"].filter(
        (item: any) => item.province.code !== province.code,
      );
      const checkArrays = _.difference(values["branches"], newBranches);
      if (checkArrays.length > 0) {
        setValues({
          ...values,
          branches: newBranches,
          provinces: preData,
        });
      } else {
        setValues({
          ...values,
          provinces: preData,
        });
      }
    }
    setChecked(false);
    setProvince(null);
  };

  const handleExcludeCheckBox = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setExcludeChecked(event.target.checked);
    // event.target.checked && setBranch(null);
    const existProvince = values["excludeProvinces"].some(
      (item: any) => item.code == excludeProvince.code,
    );
    if (!existProvince) {
      const preData = [...values["excludeProvinces"], excludeProvince];
      const newBranches = values["excludeBranches"].filter(
        (item: any) => item.province.code !== excludeProvince.code,
      );
      const checkArrays = _.difference(values["excludeBranches"], newBranches);
      if (checkArrays.length > 0) {
        setValues({
          ...values,
          excludeBranches: newBranches,
          excludeProvinces: preData,
        });
      } else {
        setValues({
          ...values,
          excludeProvinces: preData,
        });
      }
    }
    setExcludeChecked(false);
    setExcludeProvince(null);
  };

  const onInputChange = (event: any, value: string) => {};

  const handleSelectBranch = (e: any) => {
    setBranch(e);
    setCheckSelectBranch(!checkSelectBranch);
    if (e) {
      const existBranch = values["branches"].some(
        (item: any) => item.id == e.id,
      );
      const existInProvince = values["provinces"].some(
        (item: any) => item.code == e.province.code,
      );
      if (!existBranch && !existInProvince) {
        const preData = [...values["branches"], e];
        setValues({ ...values, branches: preData });
      }
    }
  };

  const handleExcludeBranch = (e: any) => {
    setExcludeBranch(e);
    setCheckSelectBranch(!checkSelectBranch);
    if (e) {
      const existBranch = values["excludeBranches"].some(
        (item: any) => item.id == e.id,
      );
      const existInProvince = values["excludeProvinces"].some(
        (item: any) => item.code == e.province.code,
      );
      if (!existBranch && !existInProvince) {
        const preData = [...values["excludeBranches"], e];
        setValues({ ...values, excludeBranches: preData });
      }
    }
  };

  const handleDeleteBranch = (code: string) => {
    const newList = values["branches"].filter(
      (item: any) => item.code !== code,
    );
    setValues({ ...values, branches: newList });
  };

  const handleDeleteProvinceBranch = (code: string) => {
    const newList = values["provinces"].filter(
      (item: any) => item.code !== code,
    );
    const newListExcludeBranch = !!values["excludeBranches"].length
      ? values["excludeBranches"].filter(
          (item: any) => item.province.code !== code,
        )
      : [];
    setValues({
      ...values,
      provinces: newList,
      excludeBranches: newListExcludeBranch,
    });
    setListExcludeBranchSelect([]);
    setProvince(null);
  };

  const handleDeleteExcludeBranch = (code: string) => {
    const newList = values["excludeBranches"].filter(
      (item: any) => item.code !== code,
    );
    setValues({ ...values, excludeBranches: newList });
  };

  const handleDeleteExcludeProvinceBranch = (code: string) => {
    const newList = values["excludeProvinces"].filter(
      (item: any) => item.code !== code,
    );
    setValues({ ...values, excludeProvinces: newList });
    setExcludeProvince(null);
  };

  const handleAddForm = () => {
    const payload = {
      isAllBranches: allBranches,
      appliedBranches: {
        branchList: values["branches"],
        province: values["provinces"],
        excludedBranchList: values["excludeBranches"],
        excludedProvinceList: values["excludeProvinces"],
      },
      saved: true,
    };
    dispatch(updateExcludeSelectBranches(payload));
    setOpen(false);
    clearInput();
  };

  const handleClearForm = () => {
    if (props.disabled) return;
    setAllBranches(null);
    const payload = {
      isAllBranches: null,
      appliedBranches: {
        branchList: [],
        province: [],
        excludedBranchList: [],
        excludedProvinceList: [],
      },
      saved: false,
    };
    dispatch(updateExcludeSelectBranches(payload));
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
      {(!!payloadBranches.appliedBranches.excludedBranchList.length ||
        !!payloadBranches.appliedBranches.excludedProvinceList.length) && (
        <Box textAlign="right" fontSize={"13px"}>
          *มีสาขายกเว้นตามที่ระบุ
        </Box>
      )}
      <Dialog maxWidth="md" fullWidth open={open}>
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
        <DialogContent
          sx={{ padding: "45px 24px 32px 60px", minHeight: "438px" }}
        >
          <FormControl sx={{ marginBottom: "5px" }}>
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
                sx={{
                  color: !!allBranches
                    ? theme.palette.primary.main
                    : theme.palette.cancelColor.main,
                }}
              />
              <FormControlLabel
                disabled={disabled}
                value={false}
                control={<Radio />}
                label="เลือกสาขาเอง"
                sx={{
                  color:
                    !!!allBranches && allBranches != null
                      ? theme.palette.primary.main
                      : theme.palette.cancelColor.main,
                }}
              />
            </RadioGroup>
          </FormControl>
          <Grid container spacing={1} mb={7}>
            {allBranches != null && (
              <>
                <Grid item xs={12} pr={1} mb={0.5}>
                  <Typography fontWeight={400} color={"#000000"}>
                    สาขาที่เลือก
                  </Typography>
                </Grid>
                {!allBranches && (
                  <>
                    <Grid item xs={12} display={"flex"}>
                      <Box width={"37%"}>
                        <Autocomplete
                          options={provinceList}
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
                              className={classes.MtextField}
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
                          fullWidth
                        />
                      </Box>

                      <Box width={"37%"} ml={2}>
                        <Autocomplete
                          options={listBranchSelect}
                          id="combo-box-branch"
                          popupIcon={<SearchIcon color="primary" />}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={!!errorBranch}
                              helperText={errorBranch}
                              className={classes.MtextField}
                              FormHelperTextProps={{
                                style: {
                                  textAlign: "right",
                                  marginRight: 0,
                                },
                              }}
                              placeholder="ค้นหาสาขา"
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
                          fullWidth
                        />
                      </Box>
                      <Box mt={2} ml={2}>
                        <FormGroup>
                          <FormControlLabel
                            disabled={
                              !province ||
                              values["provinces"].some(
                                (item: any) => item.code == province.code,
                              )
                            }
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={handleCheckBox}
                              />
                            }
                            label={
                              <Typography
                                fontWeight={400}
                                fontSize={"14px"}
                                mt={0.7}
                                color={"#000000"}
                              >
                                เลือกสาขาทั้งหมด
                              </Typography>
                            }
                          />
                        </FormGroup>
                      </Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} pr={5}>
                  <Box className={classes.MWrapperListBranchForm}>
                    {allBranches ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                        <BranchItem
                          label={`สาขาทั้งหมด (${totalBranches} สาขา)`}
                          onDelete={() => {}}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                        {values["provinces"].map((item: any, index: number) => (
                          <BranchItem
                            label={`สาขาจังหวัด${item.name}`}
                            onDelete={() =>
                              handleDeleteProvinceBranch(item.code)
                            }
                            key={index}
                          />
                        ))}
                        {values["branches"].map((item: any, index: number) => (
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
                {(!!allBranches || values.provinces.length > 0) && (
                  <>
                    <Grid item xs={12} pr={1} mb={0.5} mt={2.5}>
                      <Typography fontWeight={400} color={"#000000"}>
                        สาขาที่ยกเว้น
                      </Typography>
                    </Grid>
                    <Grid item xs={12} display={"flex"}>
                      <Box width={"37%"}>
                        <Autocomplete
                          options={listExcludeProvinceSelect}
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
                              className={classes.MtextField}
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
                            setExcludeProvince(newValue);
                            !newValue && setExcludeChecked(false);
                          }}
                          value={excludeProvince}
                          fullWidth
                        />
                      </Box>

                      <Box width={"37%"} ml={2}>
                        <Autocomplete
                          options={listExcludeBranchSelect}
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
                              className={classes.MtextField}
                              placeholder="ค้นหาสาขา"
                            />
                          )}
                          size="small"
                          className={classes.MSearchBranch}
                          getOptionLabel={(option) => option.name}
                          renderOption={autocompleteRenderListItem}
                          onChange={(event: any, newValue: any) => {
                            handleExcludeBranch(newValue);
                          }}
                          onInputChange={onInputChange}
                          disabled={disabled}
                          value={excludeBranch}
                          filterOptions={filterOptions}
                          fullWidth
                        />
                      </Box>
                      <Box mt={2} ml={2}>
                        <FormGroup>
                          <FormControlLabel
                            disabled={
                              !(
                                !!allBranches &&
                                !!excludeProvince &&
                                !values["excludeProvinces"].some(
                                  (item: any) =>
                                    item.code == excludeProvince.code,
                                )
                              )
                            }
                            control={
                              <Checkbox
                                checked={excludeChecked}
                                onChange={handleExcludeCheckBox}
                              />
                            }
                            label={
                              <Typography
                                fontWeight={400}
                                fontSize={"14px"}
                                mt={0.7}
                                color={"#000000"}
                              >
                                เลือกสาขาทั้งหมด
                              </Typography>
                            }
                          />
                        </FormGroup>
                      </Box>
                    </Grid>

                    <Grid item xs={12} pr={5}>
                      <Box className={classes.MWrapperListBranchForm}>
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                          {values["excludeProvinces"].map(
                            (item: any, index: number) => (
                              <BranchItem
                                label={`สาขาจังหวัด${item.name}`}
                                onDelete={() =>
                                  handleDeleteExcludeProvinceBranch(item.code)
                                }
                                key={index}
                              />
                            ),
                          )}
                          {values["excludeBranches"].map(
                            (item: any, index: number) => (
                              <BranchItem
                                label={`${item.code}-${item.name}`}
                                onDelete={() =>
                                  handleDeleteExcludeBranch(item.code)
                                }
                                key={index}
                              />
                            ),
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </>
                )}
              </>
            )}
            <Grid
              item
              xs={12}
              sx={{
                position: "absolute",
                right: "50px",
                bottom: "30px",
                height: "43px",
                marginTop: "30px",
              }}
            >
              <Button
                variant="contained"
                color="cancelColor"
                className={classes.MbtnSearch}
                size="large"
                onClick={handleClearForm}
                sx={{ marginRight: "15px", width: "126px" }}
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
                    values["branches"].length === 0 &&
                    values["provinces"].length === 0) ||
                  disabled
                }
                data-testid="buttonAdd"
                sx={{ width: "126px" }}
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
