import { makeStyles } from "@mui/styles";
import theme from "../../styles/theme";

export const createProductStyles = makeStyles({
  root: {},
  cartContainer: {
    maxWidth: 550,
    padding: theme.spacing(4),
    margin: "auto",
    marginTop: theme.spacing(5),
  },
  margin: {
    margin: "auto",
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  textField: {
    width: "25ch",
  },
  mainBox: {
    position: "absolute",
    marginTop: "-8px",
    padding: "10px 20px",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    background: theme.palette.background.default,
    width: "450px",
    height: "241px",
    left: "458px",
    top: "267px",
    boxShadow:
      "-15px -15px 15px rgba(130, 158, 201, 0.05), 15px 15px 15px rgba(130, 158, 201, 0.05)",
    borderRadius: "10px",
  },
  btnConfirm: {
    position: "absolute",
    width: "126.14px",
    height: "40px",
    // left: "697px",
    // top: "429px",
    background: theme.palette.primary.main,
    color: "white",
    borderRadius: "5px",
  },
  btnCancel: {
    // position: "absolute",
    width: "126.14px",
    height: "40px",
    // left: "542px",
    // top: "429px",
    background: "#AEAEAE",
    color: "white",
    borderRadius: "5px",
  },
  StyledModalOverlay: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    display: "flex",
    justify: "center",
    align: "center",
    background: "rgba(0, 0, 0, 0.5)",
  },
});
