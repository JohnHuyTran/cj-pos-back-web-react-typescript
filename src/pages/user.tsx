import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";

export default function User() {
  return (
    <>
      <Box
        sx={{
          display: "inline-flex",
          justifyContent: "space-between",
          width: "500px",
          marginBottom: "4px",
        }}
      >
        <Box>
          <InputLabel htmlFor="shipmentNo">เลขที่เอกสาร LD</InputLabel>
          <TextField id="shipmentNo" />
        </Box>
        <Box>
          <InputLabel htmlFor="sdNo">เลขที่เอกสาร SD</InputLabel>
          <TextField id="sdNo" />
        </Box>
      </Box>
      <Box
        sx={{
          display: "inline-flex",
          justifyContent: "space-between",
          width: "500px",
          marginBottom: "4px",
        }}
      >
        <Box>
          <InputLabel htmlFor="sdType">ประเภท</InputLabel>
          <Select id="sdType">
            <MenuItem value={0}>ลังกระดาษ/Tote</MenuItem>
            <MenuItem value={1}>สินค้าภายในTote</MenuItem>
          </Select>
        </Box>
        <Box>
          <InputLabel htmlFor="sdStatus">สถานะ</InputLabel>
          <Select id="sdStatus">
            <MenuItem value={0}>Draft</MenuItem>
            <MenuItem value={1}>Approved</MenuItem>
          </Select>
        </Box>
      </Box>
    </>
  );
}
