import React, { useEffect, useRef } from "react";

//CSS & UI
import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  TextField,
  Typography,
} from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import SearchIcon from "@mui/icons-material/Search";

//API
import { findProductSKU } from "../../../services/product-master";

import _ from "lodash";

interface Props {
  skuTypes: string;
  onSelectItem: (value: any) => void;
  disabled?: boolean;
  isClear: boolean;
  skuCode?: string;
  skuName?: string;
}

export default function TexboxSearchSku({
  skuTypes,
  onSelectItem,
  isClear,
  disabled,
  skuCode,
  skuName,
}: Props) {
  const classes = useStyles();

  const [value, setValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searchItem, setSearchItem] = React.useState<any | null>(null);
  const [itemsList, setItemList] = React.useState([]);
  let options: any = [];
  if (searchItem) options = itemsList && itemsList.length > 0 ? itemsList : [];

  const filterOptions = createFilterOptions({
    stringify: (option: any) => option.skuType + option.skuCode,
  });

  const handleChangeItem = async (event: any, option: any, reason: string) => {
    setValue(option);
    onSelectItem(option);
  };

  const onInputChange = async (event: any, value: string, reason: string) => {
    debouncedSearch(event, value, reason);
  };

  const debouncedSearch = _.debounce(async function (
    event: any,
    value: string,
    reason: string,
  ) {
    if (event && event.keyCode && event.keyCode === 13) {
      return false;
    }
    const keyword = value.trim();
    let payload: any;

    if (keyword.length >= 3 && reason !== "reset") {
      setLoading(true);
      setSearchItem(keyword);

      payload = {
        skuCode: keyword,
        skuTypes: skuTypes,
      };

      try {
        const rs = await findProductSKU(payload);
        if (rs) {
          setItemList(rs.data);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    }
  }, 500);

  useEffect(() => {
    if (isClear) {
      setValue("");
    }
  }, [isClear]);

  useEffect(() => {
    if (skuCode || skuName) {
      const testValue: any = {
        productNamePrime: skuName,
        productNameSecnd: skuName,
        skuCode: skuCode,
        skuType: "",
      };
      handleChangeItem("", testValue, "");
    }
  }, [skuCode]);

  const autocompleteRenderListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.skuCode}>
        <div>
          <Typography variant="body2">{option.productNamePrime}</Typography>
          <Typography color="textSecondary" variant="caption">
            {option.skuCode}
          </Typography>
        </div>
      </li>
    );
  };
  const autocompleteRenderInput = (params: any) => {
    return (
      <TextField
        data-testid="textfiled-search"
        {...params}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {loading ? <CircularProgress color="inherit" size={18} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
        disabled={disabled}
        placeholder="รหัสสินค้า"
        className={classes.MtextFieldAutoComplete}
        variant="outlined"
        size="small"
        fullWidth
        multiline
      />
    );
  };
  return (
    <Autocomplete
      data-testid="autocomplete-search"
      id="selSearchProd"
      popupIcon={<SearchIcon color="primary" />}
      value={value}
      fullWidth
      loadingText="กำลังโหลด..."
      loading={loading}
      options={options}
      filterOptions={filterOptions}
      renderOption={autocompleteRenderListItem}
      onChange={handleChangeItem}
      onInputChange={onInputChange}
      getOptionLabel={(option) =>
        option.skuCode ? `${option.productNamePrime} \n${option.skuCode}` : ""
      }
      isOptionEqualToValue={(option, value) => option.skuCode === value.skuCode}
      renderInput={autocompleteRenderInput}
      size="small"
      disabled={disabled}
      className={classes.MautocompleteAddProduct}
      noOptionsText=""
    />
  );
}
