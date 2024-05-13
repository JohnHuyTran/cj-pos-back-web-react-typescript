import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  Mdatepicker: {
    "& .MuiOutlinedInput-input": {
      // padding: "6px 0px !important",
      padding: "0px !important",
      fontFamily: "Kanit",
    },
    "& .MuiIconButton-root": {
      color: "#CBD4DB !important",
      // padding: "5px !important",
    },
    "& .MuiOutlinedInput-adornedEnd": {
      paddingRight: "0px !important",
    },
    "& .MuiOutlinedInput-adornedStart": {
      paddingLeft: "0px !important",
    },
  },
  MdatepickerV2: {
    "& .MuiOutlinedInput-input": {
      // padding: "6px 0px !important",
      fontFamily: "Kanit",
    },
    "& .MuiIconButton-root": {
      color: "#CBD4DB !important",
      // padding: "5px !important",
    },
    "& .MuiOutlinedInput-adornedEnd": {
      paddingRight: "0px !important",
    },
    "& .MuiOutlinedInput-adornedStart": {
      paddingLeft: "0px !important",
    },
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
      height: "38px !important",
    },
  },
  MdatepickerDetail: {
    "& .MuiOutlinedInput-input": {
      padding: "0px !important",
      fontFamily: "Kanit",
    },
    "& .MuiIconButton-root": {},
    "& .MuiOutlinedInput-adornedEnd": {
      paddingRight: "0px !important",
    },
    "& .MuiOutlinedInput-adornedStart": {
      paddingLeft: "0px !important",
    },
    "& .MuiInputBase-input.Mui-disabled": {
      color: "rgba(0, 0, 0, 0.87) !important",
    },
    "& .MuiFormHelperText-root.Mui-error": {
      display: "none",
    },
  },
  MdatepickerError: {
    "& .MuiOutlinedInput-input": {
      // padding: "6px 0px !important",
      fontFamily: "Kanit",
    },
    "& .MuiIconButton-root": {
      color: "#CBD4DB !important",
      // padding: "5px !important",
    },
    "& .MuiOutlinedInput-adornedEnd": {
      paddingRight: "0px !important",
    },
    "& .MuiOutlinedInput-adornedStart": {
      paddingLeft: "0px !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "red !important",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "red !important",
    },
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
      height: "38px !important",
    },
  },
  MdatepickerMulti: {
    "& .rmdp-container": {
      width: "100%",
      maxWidth: "100%",

      "& > .rmdp-input": {
        fontFamily: "Kanit",
        fontSize: "16px",
        width: "100%",
        border: "1px solid #CBD4DB",
        borderRadius: "5px",
        height: "40px",
        paddingLeft: "38px",
        cursor: "pointer",
        background:
          "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAABlCAMAAAAVmG92AAAAOVBMVEUAAADK1drK0tnHz9/K1NrPz8/L1NzK1NrM1tnL09vI09vL1NvK09rL1dvL09zL1dvKz9rPz9/L1NsZA7LtAAAAEnRSTlMA36AgYBDvkFBAcMWQf6+vMBCNayWVAAAA5ElEQVRo3u3ZbQuCMBSG4Z29lW+l5///2GZsmRgocU5ZPvfHMS6G4Aab+XwnKp0F5s2zXPJb58GGfVA7dFeailyKtGhtXnP17lm2LFv3oHti6Sgv3RHLR+FuE2vUjLRnnZSWXeyKcwp2zTkFu2WlZv9t7SS6vLS9kcjChn04O5JEcWELBhv24Wycl7Bh79le3Oesj22z3xuDDRt2KrhS2Dq2i/0ENux/tnFewoa9PxvnJWzY37VbxfvYmmf9zJvXEFknk+o4p2APxBpRopW+eHkw9lGe7pOr8xrdODNVWTme2mokbx5UJLPg2tGKAAAAAElFTkSuQmCC) 8px 50% no-repeat",

        backgroundSize: "auto 18px",
        margin: "0px 0px",
        padding: "18px 5px",
      },
    },
    "& .rmdp-arrow": {
      border: "solid #686b6d",
      borderWidth: "0 2px 2px 0",
    },
    "& .rmdp-arrow-container:hover": {
      backgroundColor: "#d6d8da",
    },
    "& .rmdp-week-day": {
      color: "#36C690",
    },
    "& .rmdp-day.rmdp-today span": {
      background: "#fff",
      border: "1px solid #36C690",
      color: "#36C690",
    },
    "& .rmdp-day.rmdp-selected span": {
      background: "#36C690",
      color: "#fff",
    },
    "& .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover": {
      color: "#36C690",
      backgroundColor: "#E7FFE9",
    },
  },
});

export { useStyles };
