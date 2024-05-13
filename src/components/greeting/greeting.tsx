import Typography from "@mui/material/Typography";
import dateFormat from "dateformat";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";

type GreetingPropsType = {
  userName: string;
};

export default function Greeting(props: GreetingPropsType) {
  const theme = useTheme();

  const useStyles = makeStyles({
    root: {
      display: "flex",
      flexDirection: "column",
    },
    greetingText: {
      color: theme.palette.primary.main,
    },
  });

  const classes = useStyles();
  const now = new Date();

  return (
    <div className={classes.root}>
      <Typography variant="subtitle1" style={{ alignSelf: "center" }}>
        {dateFormat(now, "dddd, dS mmmm")}
      </Typography>
      <Typography
        variant="h6"
        className={classes.greetingText}
        style={{ alignSelf: "center" }}
      >
        สวัสดีตอนบ่าย, คุณ {props.userName}
      </Typography>
    </div>
  );
}
