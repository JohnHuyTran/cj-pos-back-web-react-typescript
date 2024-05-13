import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { CircularProgress, InputAdornment } from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import { featchProvincesListAsync } from "../../../store/slices/master/search-provinces-slice";
import SearchIcon from "@mui/icons-material/Search";
import dateFormat from "dateformat";

interface Props {
  valueProvinces: string;
  onChangeProvinces: (provincesCode: string) => void;
  isClear: boolean;
  disable?: boolean;
}

function ProvincesDropDown({
  valueProvinces,
  onChangeProvinces,
  isClear,
  disable,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [values, setValues] = React.useState<string[]>([]);

  const [flagSearchProvinces, setFlagSearchProvinces] = React.useState(false);
  const provincesList = useAppSelector(
    (state) => state.searchProvincesSlice.provincesList,
  );

  let payload: any = {
    code: "",
    name: "",
  };

  useEffect(() => {
    // console.log('isClear provinces :', isClear, disable);
    if (isClear) setValues([]);

    if (valueProvinces !== "") {
      const provincesFilter: any = provincesList.data.filter(
        (r: any) => r.code === Number(valueProvinces),
      );
      setValues(provincesFilter[0]);
    }

    // if (!localStorage.getItem('provinces')) searchProvinces(payload);
    // else getProvincesList();
    searchProvinces(payload);
  }, [isClear, valueProvinces, flagSearchProvinces]);

  function getProvincesList() {
    const key = "provinces";
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return [];
    }
    const item = JSON.parse(itemStr);
    const strDate = new Date(item.expiry);
    const now = new Date(dateFormat(new Date(), "yyyy-mm-dd"));

    if (now > strDate) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }

  function setProvincesList(value: any) {
    const now = new Date();
    const item = {
      value: value,
      expiry: dateFormat(now, "yyyy-mm-dd"),
    };
    localStorage.setItem("provinces", JSON.stringify(item));
  }

  const searchProvinces = async (payload: any) => {
    await dispatch(featchProvincesListAsync(payload)).then((value) => {
      setFlagSearchProvinces(true);
      setProvincesList(value.payload);
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
        placeholder="กรุณากรอกจังหวัด"
        className={classes.MtextFieldAutocomplete}
        size="small"
        fullWidth
      />
    );
  };

  let options: any =
    provincesList && provincesList.data && provincesList.data.length > 0
      ? provincesList.data
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
      return onChangeProvinces(option?.code ? option?.code : "");
    }
  };

  if (options.length === 1 && values.length === 0 && !isClear) {
    setValues(options[0]);
    handleChangeItem("", options[0], "selectOption");
  }

  const onInputChange = async (event: any, value: string, reason: string) => {
    if (event && event.keyCode && event.keyCode === 13) {
      return false;
    }

    const keyword = value.trim();
    if (keyword.length === 0 && reason !== "reset") {
      return onChangeProvinces("");
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

export default ProvincesDropDown;
