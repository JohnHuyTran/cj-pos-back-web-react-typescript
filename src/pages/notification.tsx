import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import React from "react";
import { Button, Grid } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useStyles } from "../styles/makeTheme";
import { Box } from "@mui/system";
import FeedbackIcon from "@mui/icons-material/Feedback";
import NotificationTask from "../components/notifications/notification-task";
import NotificationReminder from "../components/notifications/notification-reminder";
import NotificationAnnouncement from "../components/notifications/notification-announcement";

export default function Notification() {
  const classes = useStyles();
  const [refresh, setRefresh] = React.useState(false);
  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ height: "80vh", minWidth: "1100px" }}>
        <Box display={"flex"} mt={3} justifyContent={"space-between"}>
          <Typography variant="h6" paddingBottom="40px">
            {" "}
            แจ้งเตือน{" "}
          </Typography>
          <Button
            id="btnRefresh"
            variant="contained"
            sx={{ mt: 2 }}
            className={classes.MbtnRefresh}
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={6}>
          <Grid item xs={5} height={"78vh"}>
            <Typography sx={{ borderBottom: "1px solid #EAEBEB", mb: 1 }}>
              <span style={{ fontWeight: 700, fontSize: "17px" }}>ประกาศ </span>{" "}
              <FeedbackIcon
                sx={{ color: "#F54949", fontSize: "20px", ml: "3px" }}
              />
            </Typography>
            <NotificationAnnouncement refresh={refresh} />
          </Grid>
          {/* <Grid item xs={1}></Grid> */}
          <Grid item xs={7} height={"75vh"}>
            <Box height={"34vh"}>
              <Typography
                sx={{
                  borderBottom: "1px solid #EAEBEB",
                  fontWeight: 700,
                  fontSize: "17px",
                  marginTop: "2px",
                  mb: 1,
                }}
              >
                งานของฉัน
              </Typography>
              <NotificationTask refresh={refresh} />
            </Box>
            <Box height={"34vh"} mt={6}>
              <Typography
                sx={{
                  borderBottom: "1px solid #EAEBEB",
                  fontWeight: 700,
                  fontSize: "17px",
                  mb: 1,
                }}
              >
                แจ้งเตือน
              </Typography>
              <NotificationReminder refresh={refresh} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
