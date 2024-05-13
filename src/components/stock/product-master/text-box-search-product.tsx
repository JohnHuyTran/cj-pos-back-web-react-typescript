import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useStyles } from "../../../styles/makeTheme";
import SearchIcon from "@mui/icons-material/Search";
import { searchProductItem } from "../../../services/product-master";
import { debounce } from "lodash";

interface Props {
  onSelectItem: (value: any) => void;
  isClear: boolean;
  disable: boolean;
  onChange: (e: any) => void;
  onKeyDown: (value: any) => void;
}

function TextBoxSearchProduct({
  onSelectItem,
  isClear,
  disable,
  onChange,
  onKeyDown,
}: Props) {
  const classes = useStyles();
  const [value, setValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searchItem, setSearchItem] = React.useState<any | null>(null);
  const [itemsList, setItemList] = React.useState([]);
  let options: any = [];
  if (searchItem) options = itemsList && itemsList.length > 0 ? itemsList : [];

  const filterOptions = createFilterOptions({
    stringify: (option: any) =>
      option.barcodeName + option.barcode + option.skuCode,
  });

  const autocompleteRenderListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.barcode + option.skuCode}>
        <div>
          <Typography variant="body2">{option.barcodeName}</Typography>
          <Typography color="textSecondary" variant="caption">
            {option.barcode} / {option.skuCode}
          </Typography>
        </div>
      </li>
    );
  };

  // const autocompleteRenderInput = (params: any) => {
  //   return (
  //     <TextField
  //       {...params}
  //       InputProps={{
  //         ...params.InputProps,
  //         params.InputProps.onKeyPress = handleKeyPress,
  //         endAdornment: (
  //           <React.Fragment>
  //             {loading ? <CircularProgress color="inherit" size={20} /> : null}
  //             {params.InputProps.endAdornment}
  //           </React.Fragment>
  //         ),
  //       }}
  //       placeholder="รหัสสินค้า/ชื่อสินค้า/บาร์โค้ด"
  //       className={classes.MtextField}
  //       variant="outlined"
  //       size="small"
  //       fullWidth
  //     />
  //   );
  // };

  const handleKeyDown = (event: any) => {
    if (event.code === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      if (event.target.value.length > 0) {
        setValue(event.target.value);
        onKeyDown(value);
      }
    }
  };

  const handleChangeItem = async (event: any, option: any, reason: string) => {
    setValue(option);
    onSelectItem(option);
  };

  const onInputChange = async (event: any, value: string, reason: string) => {
    debouncedSearch(event, value, reason);
  };

  const debouncedSearch = debounce(async function (
    event: any,
    value: string,
    reason: string,
  ) {
    if (event && event.keyCode && event.keyCode === 13) {
      setValue(value);
    } else {
      const keyword = value.trim();
      if (keyword.length >= 3 && reason !== "reset") {
        setLoading(true);
        setSearchItem(keyword);
        try {
          const rs = await searchProductItem(keyword);
          if (rs) {
            if (rs.data.length === 1) {
              handleChangeItem("", rs.data[0], "");
              setItemList([]);
            } else {
              setItemList(rs.data);
            }
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      }
    }
  }, 500);

  useEffect(() => {
    if (isClear) {
      setValue("");
    }
  }, [isClear]);

  return (
    <Autocomplete
      id="selAddItem"
      popupIcon={<SearchIcon color="primary" />}
      value={value}
      fullWidth
      // freeSolo
      disabled={disable}
      loadingText="กำลังโหลด..."
      loading={loading}
      options={options}
      filterOptions={filterOptions}
      renderOption={autocompleteRenderListItem}
      onChange={handleChangeItem}
      onInputChange={onInputChange}
      getOptionLabel={(option) =>
        option.barcodeName ? option.barcodeName : ""
      }
      isOptionEqualToValue={(option, value) =>
        option.barcodeName === value.barcodeName
      }
      renderInput={(params: any) => {
        params.inputProps.onKeyDown = handleKeyDown;
        return (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
            placeholder="รหัสสินค้า/ชื่อสินค้า/บาร์โค้ด"
            className={classes.MtextField}
            variant="outlined"
            size="small"
            fullWidth
          />
        );
      }}
      size="small"
      className={classes.Mautocomplete}
      noOptionsText=""
    />
  );
}

export default TextBoxSearchProduct;
