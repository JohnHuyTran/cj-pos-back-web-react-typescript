import { Fragment, useState } from "react";
import { useStyles } from "styles/makeTheme";
import {
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import { useAppDispatch } from "store/store";

// Components
import LoadingModal from "components/commons/ui/loading-modal";
import ModalSettingExpense from "./modal-settings-expense";

// Call API
import {
  clearDataSearchBranchAccountingConfig,
  featchBranchAccountingConfigListAsync,
} from "store/slices/accounting/accounting-search-config-slice";
import { ExpenseSearchCofigRequest } from "models/branch-accounting-model";
import { saveExpenseConfigSearch } from "store/slices/accounting/save-accounting-search-config-slice";

interface SearchReservesProps {
  onClickSearch: (value: any) => void;
}
export default function SearchReserves(props: SearchReservesProps) {
  const { onClickSearch } = props;
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const types = [
    { key: "ALL", text: "ทั้งหมด" },
    { key: "COFFEE", text: "ค่าใช้จ่ายร้านกาแฟ" },
    { key: "STOREFRONT", text: "ค่าใช้จ่ายหน้าร้าน" },
  ];
  const statusList = [
    { key: "ALL", text: "ทั้งหมด" },
    { key: "true", text: "ใช้งาน" },
    { key: "false", text: "ไม่ได้ใช้งาน" },
  ];

  const initialSearchState = {
    type: "ALL",
    isActive: "ALL",
  };

  // Set state data
  const [search, setSearch] = useState(initialSearchState);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenLoading, setIsOpenLoading] = useState(false);
  const [isStatus, setIsStatus] = useState("");

  // Handle function
  const handleClearSearch = async () => {
    setSearch(initialSearchState);
    await dispatch(clearDataSearchBranchAccountingConfig());
    onClickSearch(false);
  };

  const handleSearchExpense = async () => {
    setIsOpenLoading(true);
    // const isActive = search.status !== 'All' ? search.status : null
    const payload: ExpenseSearchCofigRequest = {
      limit: "10",
      page: "1",
      ...search,
    };
    try {
      onClickSearch(false);
      await dispatch(featchBranchAccountingConfigListAsync(payload));
      await dispatch(saveExpenseConfigSearch(payload));
      setIsOpenLoading(false);
      onClickSearch(true);
    } catch (errors) {
      console.error(errors);
    }
  };

  const handleAddList = () => {
    setIsStatus("Create");
    setIsOpenModal(true);
  };

  return (
    <Fragment>
      <Grid container rowSpacing={1} columnSpacing={7}>
        <ModalSettingExpense
          isOpen={isOpenModal}
          isStatus={isStatus}
          onClickClose={() => setIsOpenModal(false)}
        />
        <Grid item md={4} sm={4} xs={6}>
          <Typography variant="subtitle1" component="div" mb={1}>
            ประเภท
          </Typography>
          <FormControl id="SearchType" className={classes.Mselect} fullWidth>
            <Select
              id="Type"
              name="type"
              value={search.type}
              disabled={isOpenLoading}
              onChange={(e) => setSearch({ ...search, type: e.target.value })}
              inputProps={{ "aria-label": "Without label" }}
            >
              {types.map((item, index: number) => (
                <MenuItem key={index} value={item.key}>
                  {item.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item md={4} sm={4} xs={6}>
          <Typography variant="subtitle1" component="div" mb={1}>
            สถานะ
          </Typography>
          <FormControl id="SearchType" className={classes.Mselect} fullWidth>
            <Select
              id="Status"
              name="status"
              value={search.isActive}
              disabled={isOpenLoading}
              onChange={(e) =>
                setSearch({ ...search, isActive: e.target.value })
              }
              inputProps={{ "aria-label": "Without label" }}
            >
              {statusList.map((item, index: number) => (
                <MenuItem key={index} value={item.key}>
                  {item.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item mt={10} mb={5} xs={12} sx={{ textAlign: "right" }}>
          <Button
            id="btnCoffee"
            variant="contained"
            color="primary"
            disabled={isOpenLoading}
            onClick={handleAddList}
            startIcon={<AddCircleOutline />}
            sx={{
              width: "170.42px",
              mr: 2,
              background: "#5468ff",
              ":hover": { boxShadow: 6, background: "#3e4cb8" },
            }}
            className={classes.MbtnSearch}
          >
            เพิ่มรายการ
          </Button>
          <Button
            id="btnClear"
            variant="contained"
            disabled={isOpenLoading}
            onClick={handleClearSearch}
            sx={{ width: "170.42px" }}
            className={classes.MbtnClear}
            color="cancelColor"
          >
            เคลียร์
          </Button>
          <Button
            id="btnSearch"
            variant="contained"
            color="primary"
            disabled={isOpenLoading}
            onClick={handleSearchExpense}
            sx={{ width: "170.42px", ml: 2 }}
            className={classes.MbtnSearch}
          >
            ค้นหา
          </Button>
        </Grid>
        <LoadingModal open={isOpenLoading} />
      </Grid>
    </Fragment>
  );
}
