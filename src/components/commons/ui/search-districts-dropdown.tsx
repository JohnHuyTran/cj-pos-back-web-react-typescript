import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { CircularProgress, InputAdornment } from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import SearchIcon from "@mui/icons-material/Search";
import { featchDistrictsListAsync } from "../../../store/slices/master/search-districts-slice";

interface Props {
  valueDistricts: string;
  provinceCode: string;
  onChangeDistricts: (districtsCode: string, provincesCode: string) => void;
  searchDistrictsCode: string;
  isClear: boolean;
  disable?: boolean;
}

function DistrictsDropDown({
  valueDistricts,
  provinceCode,
  onChangeDistricts,
  searchDistrictsCode,
  isClear,
  disable,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [values, setValues] = React.useState<string[]>([]);
  const [flagSearchDistricts, setFlagSearchDistricts] = React.useState(false);
  const districtsList = useAppSelector(
    (state) => state.searchDistrictsSlice.districtsList,
  );

  let payload: any = {
    code: "",
    name: "",
    provinceCode: "",
  };

  useEffect(() => {
    // console.log('isClear districts :', isClear);
    if (isClear) setValues([]);

    if (provinceCode !== "") {
      payload = {
        provinceCode: provinceCode,
      };
      searchDistricts(payload);
    }

    if (searchDistrictsCode !== "") {
      payload = {
        code: searchDistrictsCode,
      };
      searchDistricts(payload);
    }

    if (valueDistricts) {
      const districtsFilter: any = districtsList.data.filter(
        (r: any) => r.code === Number(valueDistricts),
      );
      setValues(districtsFilter[0]);
    }

    // if (districtsList.data.length === 0) searchDistricts(payload);
  }, [isClear, provinceCode, searchDistrictsCode, flagSearchDistricts]); //districtsList

  const searchDistricts = async (payload: any) => {
    await dispatch(featchDistrictsListAsync(payload)).then(() => {
      setFlagSearchDistricts(true);
    });
  };

  const [loading, setLoading] = React.useState(false);
  const autocompleteRenderInput = (params: any) => {
    return (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {/* {params.InputProps.endAdornment} */}
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            </React.Fragment>
          ),
        }}
        placeholder="กรุณากรอกเขต / อำเภอ"
        className={classes.MtextFieldAutocomplete}
        variant="outlined"
        size="small"
        fullWidth
      />
    );
  };

  let options: any =
    districtsList && districtsList.data && districtsList.data.length > 0
      ? districtsList.data
      : [];
  const filterOptions = createFilterOptions({
    stringify: (option: any) => option.nameTH,
  });

  const autocompleteRenderListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.code}>
        {option.nameTH}
      </li>
    );
  };

  const handleChangeItem = async (event: any, option: any, reason: string) => {
    if (option && reason === "selectOption") {
      return onChangeDistricts(
        option?.code ? option?.code : "",
        option?.provinceCode ? option?.provinceCode : "",
      );
    }
  };

  if (options !== undefined && values !== undefined) {
    if (options.length === 1 && values.length === 0 && !isClear) {
      setValues(options[0]);
      handleChangeItem("", options[0], "selectOption");
    }
  }

  const onInputChange = async (event: any, value: string, reason: string) => {
    if (event && event.keyCode && event.keyCode === 13) {
      return false;
    }

    const keyword = value.trim();
    if (keyword.length === 0 && reason !== "reset") {
      return onChangeDistricts("", "");
    }
  };

  return (
    <Autocomplete
      id="selAddItem"
      value={values}
      fullWidth
      freeSolo
      loadingText="กำลังโหลด..."
      loading={loading}
      options={options}
      filterOptions={filterOptions}
      renderOption={autocompleteRenderListItem}
      onChange={handleChangeItem}
      onInputChange={onInputChange}
      getOptionLabel={(option) => (option.nameTH ? option.nameTH : "")}
      isOptionEqualToValue={(option, value) => option.nameTH === value.nameTH}
      renderInput={autocompleteRenderInput}
      disabled={disable ? true : false}
    />
  );
}

export default DistrictsDropDown;
