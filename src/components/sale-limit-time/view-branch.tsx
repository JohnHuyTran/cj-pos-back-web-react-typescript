import {
  Autocomplete,
  Button,
  Checkbox,
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
import React, { useEffect } from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useStyles } from "../../styles/makeTheme";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { fetchTotalBranch } from "../../store/slices/search-branches-province-slice";
interface Props {
  values: any;
}
interface ItemProps {
  label: string;
}
export default function ViewBranch({ values }: Props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState<boolean>(false);
  const allBranches = values.isAllBranches;
  const branches = values.appliedBranches.branchList || [];
  const province = values.appliedBranches.province || [];
  const excludeBranches = values.appliedBranches.excludedBranchList || [];
  const excludeProvinces = values.appliedBranches.excludedProvinceList || [];
  const totalBranches = useAppSelector(
    (state) => state.searchBranchProvince.totalBranches,
  );
  const { t } = useTranslation(["common"]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      dispatch(fetchTotalBranch());
    }
  }, [open]);

  const BranchItem = (props: ItemProps) => {
    const { label } = props;
    return (
      <div className="wrapper-item">
        <span>{label}</span>
      </div>
    );
  };

  const handleOpenModal = () => {
    setOpen(true);
  };
  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      {values.appliedBranches &&
      branches.length == 1 &&
      province.length == 0 ? (
        <Typography variant="body2">
          {branches[0].code}-{branches[0].name}
        </Typography>
      ) : (
        <>
          <Button
            style={{ color: "#446EF2", textDecoration: "underline" }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal();
            }}
          >
            {allBranches &&
            excludeProvinces.length == 0 &&
            excludeBranches.length == 0
              ? "ทุกสาขา"
              : "หลายสาขา"}
          </Button>
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
                >
                  <FormControlLabel
                    value={true}
                    control={<Radio />}
                    label={`เลือกสาขาทั้งหมด (${totalBranches} สาขา)`}
                    disabled={true}
                  />
                  <FormControlLabel
                    disabled={true}
                    value={false}
                    control={<Radio />}
                    label="เลือกสาขาเอง"
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
                              options={[]}
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
                                  placeholder="ค้นหาจังหวัด"
                                />
                              )}
                              size="small"
                              disabled={true}
                              className={classes.MSearchBranch}
                              fullWidth
                            />
                          </Box>

                          <Box width={"37%"} ml={2}>
                            <Autocomplete
                              options={[]}
                              id="combo-box-branch"
                              popupIcon={<SearchIcon color="primary" />}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
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
                              disabled={true}
                              fullWidth
                            />
                          </Box>
                          <Box mt={2} ml={2}>
                            <FormGroup>
                              <FormControlLabel
                                disabled={true}
                                control={<Checkbox checked={false} />}
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
                            />
                          </Box>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                            {province.map((item: any, index: number) => (
                              <BranchItem
                                label={`สาขาจังหวัด${item.name}`}
                                key={index}
                              />
                            ))}
                            {branches.map((item: any, index: number) => (
                              <BranchItem
                                label={`${item.code}-${item.name}`}
                                key={index}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    {(!!allBranches || province.length > 0) && (
                      <>
                        <Grid item xs={12} pr={1} mb={0.5} mt={2.5}>
                          <Typography fontWeight={400} color={"#000000"}>
                            สาขาที่ยกเว้น
                          </Typography>
                        </Grid>
                        <Grid item xs={12} display={"flex"}>
                          <Box width={"37%"}>
                            <Autocomplete
                              options={[]}
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
                                  placeholder="ค้นหาจังหวัด"
                                />
                              )}
                              size="small"
                              disabled={true}
                              className={classes.MSearchBranch}
                              fullWidth
                            />
                          </Box>

                          <Box width={"37%"} ml={2}>
                            <Autocomplete
                              options={[]}
                              id="combo-box-branch"
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
                                  placeholder="ค้นหาสาขา"
                                />
                              )}
                              size="small"
                              className={classes.MSearchBranch}
                              disabled={true}
                              fullWidth
                            />
                          </Box>
                          <Box mt={2} ml={2}>
                            <FormGroup>
                              <FormControlLabel
                                disabled={true}
                                control={<Checkbox checked={false} />}
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
                              {excludeProvinces.map(
                                (item: any, index: number) => (
                                  <BranchItem
                                    label={`สาขาจังหวัด${item.name}`}
                                    key={index}
                                  />
                                ),
                              )}
                              {excludeBranches.map(
                                (item: any, index: number) => (
                                  <BranchItem
                                    label={`${item.code}-${item.name}`}
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
                    disabled={true}
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
                    disabled={true}
                    data-testid="buttonAdd"
                    sx={{ width: "126px" }}
                  >
                    เลือกสาขา
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
