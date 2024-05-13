import React, { useState } from "react";
import clsx from "clsx";
import logoImage from "assets/images/CJlogo.jpeg";
import { loginFormStyle } from "./loginForm-css";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  FormControl,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useTranslation } from "react-i18next";

// Call api and store
import { useAppSelector, useAppDispatch } from "store/store";
import { loginKeyCloakAsync } from "store/slices/authSlice";
import { loginForm } from "models/user-interface";
import BranchListDropDownLogin from "../commons/ui/branch-list-dropdown";
import { BranchListOptionType } from "../../models/branch-model";
import { getBranchName } from "../../utils/utils";
import { initialState } from "../../tests/mockStore";

interface State {
  userId: string;
  password: string;
  showPassword: boolean;
}

function LoginForm() {
  // Set variable
  const classes = loginFormStyle();
  const version = process.env.REACT_APP_POS_BACK_VERSION;
  const dispatch = useAppDispatch();
  const { t } = useTranslation(["error", "common"]);
  const { error } = useAppSelector((state) => state.auth);
  const branchList = initialState.searchBranchSlice;

  // Set state data
  const [isOpenLoading, setIsOpenLoading] = useState(false);
  const [groupBranch, setGroupBranch] = useState(false);
  const [ownBranch, setOwnBranch] = useState("B005");
  const branchFrom = getBranchName(branchList, ownBranch);
  const branchFromMap: BranchListOptionType = {
    code: ownBranch,
    name: branchFrom ? branchFrom : "",
  };
  const [isValidate, setIsValidate] = useState(false);
  const [values, setValues] = useState<State>({
    password: "",
    userId: "",
    showPassword: false,
    branchCode: "",
    dateFrom: "",
    dateTo: "",
    status: "ALL",
  });

  const [valuebranchFrom, setValuebranchFrom] =
    React.useState<BranchListOptionType | null>(
      groupBranch ? branchFromMap : null,
    );

  // Handle function
  const handleChange = (prop: any) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleChangeBranchFrom = (branchCode: string) => {
    if (branchCode !== null) {
      let codes = JSON.stringify(branchCode);
      setValues({ ...values, branchCode: JSON.parse(codes) });
    } else {
      setValues({ ...values, branchCode: "" });
    }
  };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const onClickLogin = async () => {
    setIsValidate(true);
    if (values.userId && values.password) {
      const form: loginForm = {
        userId: values.userId,
        password: values.password,
      };
      setIsValidate(false);
      setIsOpenLoading(true);
      await dispatch(loginKeyCloakAsync(form));
      setIsOpenLoading(false);
    }
  };

  return (
    <Box className={classes.wrapLogin}>
      <Box className={classes.bgLogin}>
        <Typography variant="h5" className={classes.welcomeLabel}>
          ยินดีต้อนรับ
        </Typography>
        <Box className={classes.mainBox}>
          <Box id="logo" sx={{ display: "flex" }}>
            <img src={logoImage} alt="" width="50" />
          </Box>
          <Box
            id="errorMessage"
            sx={{
              width: "255px",
              margin: "15px auto",
              minHeight: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {(error || isValidate) && (
              <Typography color="error" variant="caption">
                {isValidate ? "กรุณากรอกรหัสของท่านให้ถูกต้อง" : error}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              mb: "55px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormControl
              sx={{ m: 0 }}
              className={clsx(classes.textField)}
              variant="outlined"
            >
              <FormHelperText id="OutlinedUserIdText" sx={{ ml: 0 }}>
                รหัสผู้ใช้งาน
              </FormHelperText>
              <OutlinedInput
                id="txtUserid"
                value={values.userId}
                error={!values.userId && isValidate}
                disabled={isOpenLoading}
                onChange={handleChange("userId")}
                onKeyPress={(e) => e.key === "Enter" && onClickLogin()}
                aria-describedby="outlined-user-id-text"
                sx={{ height: "38px" }}
                inputProps={{
                  "aria-label": "weight",
                }}
              />
            </FormControl>
            <FormControl
              sx={{ m: "30px 0 0" }}
              className={clsx(classes.textField)}
              variant="outlined"
            >
              <FormHelperText id="OutlinedPasswordText" sx={{ ml: 0 }}>
                รหัสผ่าน
              </FormHelperText>
              <OutlinedInput
                id="txtPassword"
                type={values.showPassword ? "text" : "password"}
                value={values.password}
                error={!values.password && isValidate}
                disabled={isOpenLoading}
                onChange={handleChange("password")}
                onKeyPress={(e) => e.key === "Enter" && onClickLogin()}
                sx={{ height: "38px" }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {values.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <FormControl
              sx={{ m: "30px 0 0" }}
              className={clsx(classes.textField)}
              variant="outlined"
            >
              <FormHelperText id="OutlinedPasswordText" sx={{ ml: 0 }}>
                รหัสผ่าน
              </FormHelperText>
              <BranchListDropDownLogin
                valueBranch={valuebranchFrom}
                sourceBranchCode={"B005"}
                onChangeBranch={handleChangeBranchFrom}
                isClear={false}
                disable={false}
              />
            </FormControl>
          </Box>
          <Box>
            <LoadingButton
              id="btnConfirm"
              variant="contained"
              color="primary"
              loading={isOpenLoading}
              className={classes.loginBtn}
              loadingIndicator={
                <Typography component="span" sx={{ fontSize: "11px" }}>
                  กรุณารอสักครู่ <CircularProgress color="inherit" size={15} />
                </Typography>
              }
              sx={{ borderRadius: 2, width: 260 }}
              onClick={onClickLogin}
            >
              เข้าสู่ระบบ
            </LoadingButton>
            <Box sx={{ marginTop: "20px", color: "#AEAEAE" }}>
              <Typography sx={{ fontSize: "10px", position: "relative" }}>
                version: {version}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginForm;
