import {
  Autocomplete,
  CircularProgress,
  createFilterOptions,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef } from "react";
import {
  newSearchAllProductAsync,
  searchAllProductAsync,
} from "../../../store/slices/search-type-product-slice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useStyles } from "../../../styles/makeTheme";
import SearchIcon from "@mui/icons-material/Search";
import {
  FindProductProps,
  FindProductRequest,
} from "../../../models/product-model";
import _ from "lodash";
import { savePayloadSearchList } from "store/slices/tax-invoice-search-list-slice";
import { getAllProductByBarcode } from "services/product-master";

interface Props {
  // skuType?: any[];
  onSelectItem: (value: any) => void;
  isClear: boolean;
  requestBody: FindProductRequest;
}

function TextBoxSearchProduct({ onSelectItem, isClear, requestBody }: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [value, setValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searchItem, setSearchItem] = React.useState<any | null>(null);
  // const itemsList = useAppSelector((state) => state.searchTypeAndProduct.itemList);
  const [itemsList, setItemList] = React.useState([]);
  const searchDebouceRef = useRef<any>();
  let options: any = [];
  if (searchItem) options = itemsList && itemsList.length > 0 ? itemsList : [];
  const filterOptions = createFilterOptions({
    stringify: (option: any) => option.barcodeName + option.barcode,
  });

  const autocompleteRenderListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.barcode}>
        <div>
          <Typography variant="body2">{option.barcodeName}</Typography>
          <Typography color="textSecondary" variant="caption">
            {option.barcode}
          </Typography>
        </div>
      </li>
    );
  };
  const autocompleteRenderInput = (params: any) => {
    return (
      <TextField
        data-testid="textfiled-search"
        autoFocus={true}
        {...params}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
        placeholder="บาร์โค้ด/รายละเอียดสินค้า"
        className={classes.MtextField}
        variant="outlined"
        size="small"
        fullWidth
      />
    );
  };
  const handleChangeItem = async (event: any, option: any, reason: string) => {
    setValue(option);
    onSelectItem(option);
  };

  const clearData = async () => {
    // setValue('');
  };

  const clearInput = () => {};
  const onInputChange = async (event: any, value: string, reason: string) => {
    searchDebouceRef.current?.cancel();
    searchDebouceRef.current = _.debounce(async () => {
      if (event && event.keyCode && event.keyCode === 13) {
        return false;
      }

      const keyword = value.trim();
      if (keyword.length >= 3 && reason !== "reset") {
        setLoading(true);
        setSearchItem(keyword);

        const payload: FindProductProps = {
          search: keyword,
          payload: requestBody,
        };
        try {
          const rs = await getAllProductByBarcode(payload);
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
      } else {
        clearData();
      }
    }, 200);
    searchDebouceRef.current();
  };

  useEffect(() => {
    if (isClear) {
      setValue("");
    }
  }, [isClear]);

  return (
    <Autocomplete
      data-testid="autocomplete-search"
      id="selAddItem"
      popupIcon={<SearchIcon color="primary" />}
      value={value}
      fullWidth
      // freeSolo
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
      renderInput={autocompleteRenderInput}
      size="small"
      className={classes.MautocompleteAddProduct}
      noOptionsText=""
    />
  );
}

export default TextBoxSearchProduct;
