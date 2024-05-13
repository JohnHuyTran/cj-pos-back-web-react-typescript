import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import { Autocomplete } from "@mui/material";
import { useStyles } from "../../../styles/makeTheme";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import { featchBranchListAsync } from "../../../store/slices/search-branches-slice";
import { BranchInfo } from "../../../models/search-branch-model";
import { BranchListOptionType } from "../../../models/branch-model";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { featchAuthorizedBranchListAsync } from "../../../store/slices/authorized-branch-slice";
interface Props {
  valueBranch?: BranchListOptionType | null;
  sourceBranchCode: string | null | undefined | "";
  onChangeBranch: (branchCode: string) => void;
  isClear: boolean;
  disable?: boolean;
  filterOutDC?: boolean;
  isFilterAuthorizedBranch?: boolean;
  placeHolder?: string;
  superviseBranch?: boolean;
  error?: boolean;
}

function BranchListDropDown({
  valueBranch,
  sourceBranchCode,
  onChangeBranch,
  isClear,
  disable,
  filterOutDC,
  isFilterAuthorizedBranch,
  placeHolder,
  superviseBranch,
  error,
}: Props) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [valueBranchList, setValueBranchList] =
    React.useState<BranchListOptionType | null>(null);
  let branchList = useAppSelector((state) => state.searchBranchSlice);
  let authorizedBranchList = useAppSelector(
    (state) => state.authorizedhBranchSlice,
  );
  let superviseBranchList = useAppSelector((state) => state.superviseBranch);
  useEffect(() => {
    if (branchList === null || branchList.branchList.data.length <= 0)
      dispatch(featchBranchListAsync());
    if (
      authorizedBranchList === null ||
      authorizedBranchList.branchList.data?.branches === null ||
      authorizedBranchList.branchList.data?.branches === undefined ||
      authorizedBranchList.branchList.data?.branches.length <= 0
    ) {
      dispatch(featchAuthorizedBranchListAsync());
    }

    if (valueBranch) setValueBranchList(valueBranch);
    else setValueBranchList(null);
  }, [isClear, branchList]);
  const filterDC = (branch: BranchInfo) => {
    return filterOutDC && branch.isDC ? false : true;
  };
  const filterAuthorizedBranch = (branch: BranchInfo) => {
    if (!isFilterAuthorizedBranch) {
      return true;
    }
    return authorizedBranchList.branchList.data?.branches.some(
      (item: BranchInfo) => {
        return branch.code === item.code;
      },
    );
  };
  const getOptionsBranch = () => {
    const branchListFilter: any = branchList.branchList.data.filter(
      (branch: BranchInfo) => {
        return (
          branch.code !== sourceBranchCode &&
          filterAuthorizedBranch(branch) &&
          filterDC(branch)
        );
      },
    );

    if (superviseBranch) {
      const superviseItem: any = [];
      superviseBranchList.branchList.data?.branches.forEach(
        (supervise: any) => {
          superviseItem.push(supervise);
        },
      );
      const superviseList = [...branchListFilter, ...superviseItem];
      return superviseList;
    }

    return branchListFilter;
  };
  const defaultPropsBranchList = {
    // options: branchList.branchList.data.filter((branch: BranchInfo) => {
    //   return branch.code !== sourceBranchCode && filterAuthorizedBranch(branch) && filterDC(branch);
    // }),
    options: getOptionsBranch(),
    getOptionLabel: (option: BranchListOptionType) =>
      `${option.code}-${option.name}`,
  };

  const handleChangeBranch = (
    event: any,
    newValue: BranchListOptionType | null,
  ) => {
    setValueBranchList(newValue);
    return onChangeBranch(newValue?.code ? newValue.code : "");
  };

  return (
    <Autocomplete
      data-testid="autocomplete-search-branch-list"
      {...defaultPropsBranchList}
      className={error ? classes.MautocompleteError : classes.Mautocomplete}
      popupIcon={<SearchIcon />}
      noOptionsText="ไม่พบข้อมูล"
      id="selBranchNo"
      value={valueBranchList}
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
          data-testid="textfiled-branch-list"
          {...params}
          placeholder={placeHolder ? placeHolder : "ทั้งหมด"}
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
      // renderInput={(params) => (
      //   <TextField
      //     {...params}
      //     placeholder='ทั้งหมด'
      //     size='small'
      //     className={classes.MtextField}
      //     fullWidth
      //     InputProps={{
      //       ...params.InputProps,
      //       endAdornment: (
      //         <InputAdornment position='end'>
      //           <SearchIcon />
      //         </InputAdornment>
      //       ),
      //     }}
      //   />
      // )}
      disabled={disable ? true : false}
    />
  );
}

export default BranchListDropDown;
