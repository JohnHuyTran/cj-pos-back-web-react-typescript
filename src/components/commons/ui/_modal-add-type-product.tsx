import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { Box } from "@mui/system";
import { useStyles } from "../../../styles/makeTheme";
import SearchIcon from "@mui/icons-material/Search";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import CloseIcon from "@mui/icons-material/Close";
import _ from "lodash";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { objectNullOrEmpty, stringNullOrEmpty } from "../../../utils/utils";
import {
  clearSearchAllProductAsync,
  searchAllProductAsync,
  searchAllProductTypeAsync,
} from "../../../store/slices/search-type-product-slice";
import { updateAddTypeAndProductState } from "../../../store/slices/add-type-product-slice";
import LoadingModal from "./loading-modal";
import { getAllProductByType } from "../../../services/common";
import { setCheckEdit } from "../../../store/slices/sale-limit-time-slice";

interface Error {
  productTypeExist: string;
  productExist: string;
}

interface State {
  productType: any;
  product: any;
  selectAllProduct: boolean;
  error: Error;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SelectedItemProps {
  label: string;
  onDelete: any;
}

const ModalAddTypeProduct: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [openLoadingModal, setOpenLoadingModal] = React.useState(false);
  const [searchItem, setSearchItem] = React.useState<any | null>(null);
  const [searchProductType, setSearchProductType] = React.useState<any | null>(
    null,
  );
  const [values, setValues] = useState<State>({
    productType: {},
    product: {},
    selectAllProduct: false,
    error: {
      productTypeExist: "",
      productExist: "",
    },
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const productResponse = useAppSelector(
    (state) => state.searchTypeAndProduct.itemList,
  );
  const productTypeResponse = useAppSelector(
    (state) => state.searchTypeAndProduct.productTypeList,
  );
  const payloadAddTypeProduct = useAppSelector(
    (state) => state.addTypeAndProduct.state,
  );

  const onInputChangeProduct = async (
    event: any,
    value: string,
    reason: string,
  ) => {
    if (event && event.keyCode && event.keyCode === 13) {
      return false;
    }

    // console.log('onInputChange', { reason, value });
    if (reason == "reset") {
      clearInput();
    }

    const keyword = value.trim();
    if (keyword.length >= 3 && reason !== "reset") {
      setSearchItem(keyword);
      let productTypeCodes = [];
      if (!objectNullOrEmpty(values.productType)) {
        productTypeCodes.push(values.productType.productTypeCode);
      }
      await dispatch(
        searchAllProductAsync({
          search: keyword,
          productTypeCodes: productTypeCodes,
        }),
      );
    } else {
      clearData();
    }
  };

  const onInputChangeProductType = async (
    event: any,
    value: string,
    reason: string,
  ) => {
    if (event && event.keyCode && event.keyCode === 13) {
      return false;
    }

    // console.log('onInputChange', { reason, value });
    if (reason == "reset") {
      clearInput();
    }

    const keyword = value.trim();
    if (keyword.length >= 3 && reason !== "reset") {
      setSearchProductType(keyword);
      await dispatch(searchAllProductTypeAsync(keyword));
    }
    // else {
    // dispatch(clearSearchAllProductTypeAsync({}));
    // }
  };

  const clearData = async () => {
    dispatch(clearSearchAllProductAsync({}));
  };

  const clearInput = () => {
    // setValues([]);
  };

  let productOptions: any = [];
  if (searchItem)
    productOptions =
      !objectNullOrEmpty(productResponse) &&
      productResponse.data &&
      productResponse.data.length > 0
        ? productResponse.data
        : [];
  const filterProductOptions = createFilterOptions({
    stringify: (option: any) => option.barcodeName + option.barcode,
  });
  const renderProductListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.barcode}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Typography variant="body2">{option.barcodeName}</Typography>
            <Typography color="textSecondary" variant="caption">
              {option.unitName}
            </Typography>
          </Grid>
          <Grid item xs={4} justifyContent={"flex-end"}>
            <Typography variant="body2">{option.barcode}</Typography>
          </Grid>
        </Grid>
      </li>
    );
  };

  let productTypeOptions: any = [];
  if (searchProductType)
    productTypeOptions =
      !objectNullOrEmpty(productTypeResponse) &&
      productTypeResponse.data &&
      productTypeResponse.data.length > 0
        ? productTypeResponse.data
        : [];
  const filterProductTypeOptions = createFilterOptions({
    stringify: (option: any) => option.productTypeCode + option.productTypeName,
  });
  const renderProductTypeListItem = (props: any, option: any) => {
    return (
      <li {...props} key={option.productTypeCode}>
        <Typography variant="body2">{option.productTypeName}</Typography>
      </li>
    );
  };

  const autocompleteProductRenderInput = (params: any) => {
    return (
      <TextField
        {...params}
        error={!stringNullOrEmpty(values.error.productExist)}
        helperText={values.error.productExist}
        FormHelperTextProps={{
          style: {
            textAlign: "right",
            marginRight: 0,
          },
        }}
        data-testid="textfiled-product"
        placeholder={"ค้นหาบาร์โค๊ด / รายละเอียดสินค้า"}
        className={classes.MtextField}
        variant="outlined"
        size="small"
        fullWidth
      />
    );
  };

  const autocompleteProductTypeRenderInput = (params: any) => {
    return (
      <TextField
        {...params}
        error={!stringNullOrEmpty(values.error.productTypeExist)}
        helperText={values.error.productTypeExist}
        FormHelperTextProps={{
          style: {
            textAlign: "right",
            marginRight: 0,
          },
        }}
        data-testid="textfiled-product-type"
        placeholder={"รหัสประเภท/ประเภทสินค้า"}
        className={classes.MtextField}
        variant="outlined"
        size="small"
        fullWidth
      />
    );
  };

  const handleChangeProduct = async (event: any, option: any) => {
    let selectedAddItems = _.cloneDeep(selectedItems);
    if (option) {
      let productExist =
        selectedItems && selectedItems.length > 0
          ? selectedItems.filter(
              (it: any) =>
                it.selectedType === 2 && it.barcode === option.barcode,
            )
          : [];
      if (productExist != null && productExist.length > 0) {
        let error = { ...values.error };
        error.productExist =
          "สินค้านี้ได้ถูกเลือกแล้ว กรุณาลบก่อนทำการเพิ่มใหม่อีกครั้ง";
        setValues({
          ...values,
          error: error,
        });
        return;
      }
      let productItem: any = _.cloneDeep(option);
      productItem.selectedType = 2;
      productItem.productByType = false;
      productItem.showProduct = true;
      selectedAddItems.push(productItem);
    }
    setSelectedItems(selectedAddItems);
    setValues({
      ...values,
      product: {},
      error: {
        productTypeExist: "",
        productExist: "",
      },
    });
    if (!option) {
      clearData();
    }
  };

  const handleChangeProductType = async (event: any, option: any) => {
    setValues({
      ...values,
      productType: objectNullOrEmpty(option) ? {} : option,
      error: {
        productTypeExist: "",
        productExist: "",
      },
    });
    if (objectNullOrEmpty(option)) {
      setValues({
        ...values,
        productType: objectNullOrEmpty(option) ? {} : option,
        selectAllProduct: false,
        error: {
          productTypeExist: "",
          productExist: "",
        },
      });
      clearData();
    }
  };

  const onChangeSelectAllProduct = async (event: any) => {
    if (event) {
      let selectedAddItems = _.cloneDeep(selectedItems);
      if (!objectNullOrEmpty(values.productType)) {
        let productTypeExist =
          selectedItems && selectedItems.length > 0
            ? selectedItems.filter(
                (it: any) =>
                  it.selectedType === 1 &&
                  it.productTypeCode === values.productType.productTypeCode,
              )
            : [];
        if (productTypeExist != null && productTypeExist.length > 0) {
          let error = { ...values.error };
          error.productTypeExist =
            "ประเภทสินค้านี้ได้ถูกเลือกแล้ว กรุณาลบก่อนทำการเพิ่มใหม่อีกครั้ง";
          setValues({
            ...values,
            error: error,
          });
          return;
        }
        //add type to selectedAddItems
        let productTypeItem: any = _.cloneDeep(values.productType);
        productTypeItem.selectedType = 1;
        selectedAddItems.push(productTypeItem);
        //add product by type to selectedAddItems
        let productTypeCode = "";
        if (!objectNullOrEmpty(values.productType)) {
          productTypeCode = values.productType.productTypeCode;
        }
        setOpenLoadingModal(true);
        let res = await getAllProductByType(productTypeCode);
        if (res && res.data && res.data.length > 0) {
          let lstProductByType = res.data;
          for (const item of lstProductByType) {
            let productItem: any = _.cloneDeep(item);
            let productExist = selectedItems.find(
              (it: any) => it.selectedType === 2 && it.barcode === item.barcode,
            );
            if (objectNullOrEmpty(productExist)) {
              productItem.productByType = true;
              productItem.selectedType = 2;
              productItem.showProduct = true;
              selectedAddItems.push(productItem);
            }
          }
        }
        setOpenLoadingModal(false);
      }
      setSelectedItems(selectedAddItems);
      setValues({
        ...values,
        selectAllProduct: false,
        product: {},
        productType: {},
      });
    }
  };

  const SelectedItem = (props: SelectedItemProps) => {
    const { label, onDelete, ...other } = props;
    return (
      <div className="wrapper-item">
        <span>{label}</span>
        <CloseIcon onClick={onDelete} data-testid="icon-delete-item" />
      </div>
    );
  };

  const renderSelectedItems = () => {
    if (selectedItems && selectedItems.length > 0) {
      return selectedItems.map((item: any, index: number) => {
        if (item.selectedType === 1) {
          return (
            <SelectedItem
              label={item.productTypeName}
              onDelete={() => handleDeleteTypeOrProduct(item)}
              key={index}
            />
          );
        } else if (item.selectedType === 2 && !item.productByType) {
          return (
            <SelectedItem
              label={item.barcodeName}
              onDelete={() => handleDeleteTypeOrProduct(item)}
              key={index}
            />
          );
        }
      });
    }
  };

  const handleDeleteTypeOrProduct = (data: any) => {
    if (objectNullOrEmpty(data)) {
      return;
    }
    let selectedItemFilter = _.cloneDeep(selectedItems);
    if (data.selectedType === 1) {
      selectedItemFilter = selectedItems.filter(
        (it: any) =>
          (it.selectedType === data.selectedType &&
            it.productTypeCode !== data.productTypeCode) ||
          (it.selectedType === 2 &&
            data.productTypeCode !== it.productTypeCode),
      );
    } else if (data.selectedType === 2) {
      selectedItemFilter = selectedItems.filter(
        (it: any) => it.selectedType === 1 || it.barcode !== data.barcode,
      );
    }
    setSelectedItems(selectedItemFilter);
  };

  const handleAddProduct = () => {
    setOpenLoadingModal(true);
    let selectedItemEnds = _.cloneDeep(selectedItems);
    if (selectedItemEnds && selectedItemEnds.length > 0) {
      let listTypeCodeProducts = new Set(
        selectedItemEnds
          .map((item: any) => item.productTypeCode)
          .filter((el: any) => el != undefined),
      );
      let listCategoryCode = selectedItemEnds
        .filter((el: any) => el.selectedType === 1)
        .map((item: any) => item.productTypeCode);

      let listTypes = Array.from(listTypeCodeProducts);
      for (let i of listTypes) {
        if (!listCategoryCode.includes(i)) {
          const item = selectedItemEnds.find(
            (el: any) => i === el.productTypeCode,
          );
          selectedItemEnds.push({
            productTypeCode: item.productTypeCode,
            productTypeName: item.productTypeName,
            selectedType: 1,
          });
        }
      }
    }
    if (payloadAddTypeProduct && payloadAddTypeProduct.length > 0) {
      for (const item of payloadAddTypeProduct) {
        if (item.selectedType === 1) {
          let selectedItemFilter = selectedItems.filter(
            (it) =>
              it.selectedType === item.selectedType &&
              it.productTypeCode === item.productTypeCode,
          );
          if (selectedItemFilter && selectedItemFilter.length === 0) {
            selectedItemEnds.push(item);
          }
        } else if (item.selectedType === 2) {
          let selectedItemFilter = selectedItems.filter(
            (it) =>
              it.selectedType === item.selectedType &&
              it.barcode === item.barcode,
          );
          if (selectedItemFilter && selectedItemFilter.length === 0) {
            selectedItemEnds.push(item);
          }
        }
      }
    }
    dispatch(updateAddTypeAndProductState(selectedItemEnds));
    dispatch(setCheckEdit(true));
    setSelectedItems([]);
    setTimeout(() => {
      setOpenLoadingModal(false);
      props.onClose();
    }, 300);
  };

  return (
    <Dialog
      open={props.open}
      PaperProps={{ sx: { width: "1132px", maxWidth: "1132px" } }}
    >
      <Box sx={{ flex: 1, ml: 2 }}>
        {props.onClose ? (
          <IconButton
            aria-label="close"
            onClick={props.onClose}
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
              stroke-width={1}
            />
          </IconButton>
        ) : null}
      </Box>
      <DialogContent sx={{ padding: "52px 28px 42px 100px" }}>
        <Grid container spacing={2}>
          <Grid item xs={5} pr={5.5}>
            <Box>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
                mt={-1.9}
              >
                เพิ่มรายการสินค้า (งด) ขาย
              </Typography>
            </Box>
            <Box>
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                mb={1}
              >
                ประภทสินค้า
              </Typography>
              <Autocomplete
                data-testid="autocomplete-product-type"
                options={productTypeOptions}
                id="combo-box-type"
                popupIcon={<SearchIcon color="primary" />}
                size="small"
                filterOptions={filterProductTypeOptions}
                renderOption={renderProductTypeListItem}
                renderInput={autocompleteProductTypeRenderInput}
                onInputChange={onInputChangeProductType}
                onChange={handleChangeProductType}
                getOptionLabel={(option) =>
                  option.productTypeName ? option.productTypeName : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.productTypeName === value.productTypeName
                }
                noOptionsText={null}
                className={classes.Mautocomplete}
                value={values.productType}
              />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center" }} mt={1}>
                <Typography
                  gutterBottom
                  variant="subtitle1"
                  component="div"
                  mr={3}
                >
                  ค้นหาสินค้า
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.selectAllProduct}
                        disabled={objectNullOrEmpty(values.productType)}
                        data-testid="checkbox-select-all-product"
                      />
                    }
                    onClick={onChangeSelectAllProduct}
                    label={"เลือกสินค้าทั้งหมด"}
                  />
                </FormGroup>
              </Box>
              <Autocomplete
                data-testid="autocomplete-product-option"
                options={productOptions}
                id="combo-box-product"
                popupIcon={<SearchIcon color="primary" />}
                size="small"
                filterOptions={filterProductOptions}
                renderOption={renderProductListItem}
                renderInput={autocompleteProductRenderInput}
                onInputChange={onInputChangeProduct}
                onChange={handleChangeProduct}
                getOptionLabel={(option) =>
                  option.barcodeName ? option.barcodeName : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.barcodeName === value.barcodeName
                }
                noOptionsText={null}
                className={classes.Mautocomplete}
                value={values.product}
              />
            </Box>
            {/* <Box sx={{textAlign: 'right', mt: 3}}>
                              <Button
                                  variant="contained"
                                  color="primary"
                                  className={classes.MbtnSearch}
                                  onClick={handleAddItem}
                                  disabled={!values.btnAddStatus}
                              >
                                  เพิ่ม
                              </Button>
                          </Box> */}
          </Grid>
          <Grid item xs={7}>
            <Box
              className={classes.MWrapperListBranch}
              sx={{
                width: "543px",
                minWidth: "543px",
                minHeight: "270px",
                height: "270px",
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {renderSelectedItems()}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <Grid item xs={12} sx={{ textAlign: "right" }} mr={3} mb={4}>
        <Button
          variant="contained"
          color="info"
          startIcon={<AddCircleOutlineOutlinedIcon />}
          onClick={handleAddProduct}
          disabled={!(selectedItems && selectedItems.length > 0)}
          className={classes.MbtnSearch}
          data-testid="btn-add-product"
        >
          เพิ่มสินค้า
        </Button>
      </Grid>
      <LoadingModal open={openLoadingModal} />
    </Dialog>
  );
};

export default ModalAddTypeProduct;
