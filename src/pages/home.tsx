import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Box, Button, Grid } from "@mui/material";
import NotificationAnnouncement from "../components/notifications/notification-announcement";
import NotificationTask from "../components/notifications/notification-task";
import NotificationReminder from "../components/notifications/notification-reminder";
import { useStyles } from "../styles/makeTheme";
import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import FeedbackIcon from "@mui/icons-material/Feedback";

export default function Home() {
  const classes = useStyles();
  const [refresh, setRefresh] = React.useState(false);
  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ mb: 2, minWidth: "1050px" }}>
        <Box display={"flex"} mt={1} justifyContent={"space-between"}>
          <Typography variant="h6" paddingBottom="40px">
            {" "}
            หน้าหลัก{" "}
          </Typography>
          <Button
            id="btnRefresh"
            variant="contained"
            className={classes.MbtnRefresh}
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={5}>
            <Typography sx={{ borderBottom: "1px solid #EAEBEB", mb: 1 }}>
              <span style={{ fontWeight: 700, fontSize: "17px" }}>ประกาศ </span>{" "}
              <FeedbackIcon
                sx={{ color: "#F54949", fontSize: "20px", ml: "3px" }}
              />
            </Typography>
            <NotificationAnnouncement refresh={refresh} />
          </Grid>
          {/* <Grid item xs={1}></Grid> */}
          <Grid item xs={7}>
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
