import { makeStyles } from "@mui/styles";
import bgImage from "../../assets/images/blur-supermarket-aisle-with-empty-red-shopping-cart.png";
import logoImage from "../../assets/images/CJlogo.jpeg";
import theme from "../../styles/theme";

const loginFormStyle = makeStyles({
  wrapLogin: {
    minWidth: "100vw",
    minHeight: "100vh",
  },
  bgLogin: {
    textAlign: "center",
    backgroundImage: `url(${bgImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    display: "flex",
    flexFlow: "column nowrap",
    justifyContent: "center",
    height: "100vh",
  },
  textField: {
    width: "25ch",
    "& .MuiIconButton-root": {
      marginRight: 0,
    },
    "& .MuiInputBase-root input": {
      "-webkit-box-shadow": "0 0 0 30px white inset !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "5px",
    },
  },
  welcomeLabel: {
    fontStyle: "normal",
    minWidth: 400,
    minHeight: 50,
  },
  mainBox: {
    padding: "20px",
    margin: "0 auto",
    minWidth: 400,
    maxWidth: 400,
    minHeight: 450,
    background: theme.palette.background.default,
    boxShadow:
      "-15px -15px 15px rgba(130, 158, 201, 0.05), 15px 15px 15px rgba(130, 158, 201, 0.05)",
    borderRadius: "8px",
    "& div>.MuiFormControl-root": {
      marginBottom: 0,
    },
  },
  logo: {
    // backgroundImage: `url(${logoImage})`,
    height: "40px",
    width: "40px",
    left: "656px",
    top: "229px",
    borderRadius: "0px",
    alignSelf: "center",
  },
  labelLoginBtn: {
    color: "white",
  },
  loginBtn: {
    "&.MuiButton-root": {
      // position: 'absolute',
      // width: "textField",
      height: "40px",
      borderRadius: "5px",
    },
  },
});

export { loginFormStyle };
