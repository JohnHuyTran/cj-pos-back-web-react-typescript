import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  MtextField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      // padding: "2x 2px 2px 6px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      fontSize: "14px",
    },
    "& .css-wufqwl-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      // opacity: 0,
      color: "#263238 !important",
      "-webkit-text-fill-color": "rgb(0 0 0 / 100%)",
    },
    "& .Mui-disabled": {
      backgroundColor: "#EAEBEB",
    },
  },
  MtextFieldAutoComplete: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      fontSize: "12px",
      // padding: "2x 2px 2px 6px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      fontSize: "14px",
    },
    "& .css-wufqwl-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      // opacity: 0,
      color: "#263238 !important",
      "-webkit-text-fill-color": "rgb(0 0 0 / 100%)",
    },
    "& .Mui-disabled": {
      backgroundColor: "#EAEBEB",
    },
  },
  MtextFieldDetail: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      minHeight: "20px !important",
      padding: "0px 0px 0px 5px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      fontSize: "14px",
    },
  },
  MtextFieldNumber: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      fontSize: "14px",
      "& input": {
        textAlign: "right !important",
        "&.Mui-disabled": {
          backgroundColor: "#EAEBEB",
          color: "#263238",
          "-webkit-text-fill-color": "#263238",
        },
      },
    },
  },
  MtextFieldNumberNotStyleDisable: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      fontSize: "14px",
      "& input": {
        textAlign: "right !important",
      },
    },
  },
  MtextFieldNumberError: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      fontSize: "14px",
      textAlignLast: "end !important",
      "& fieldset": {
        borderColor: "red",
      },
      "&:hover fieldset": {
        borderColor: "red",
      },
      "&.Mui-focused fieldset": {
        borderColor: "red",
      },
    },
    "& .css-wufqwl-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      color: "#263238 !important",
      "-webkit-text-fill-color": "rgb(0 0 0 / 100%)",
    },
  },
  MtextFieldDate: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      paddingLeft: "10px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      fontSize: "14px",
    },
    "& .Mui-disabled": {
      // backgroundColor: '#EAEBEB',
      color: "#263238 !important",
    },
  },
  MtextUpLoadFile: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      border: "1px dashed #36C690 !important",
      height: "2.3em !important",
      // maxWidth: '90% !important',
    },
  },
  MtextFieldAutoChangeSize: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      // padding: "2x 2px 2px 6px",
      fontSize: screen.width < 1500 ? "13px" : "auto",
      paddingLeft: "5px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      fontSize: screen.width < 1500 ? "13px" : "auto",
    },
    "& .css-wufqwl-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      // opacity: 0,
      color: "#263238 !important",
      "-webkit-text-fill-color": "rgb(0 0 0 / 100%)",
    },
    "& .Mui-disabled": {
      backgroundColor: "#EAEBEB",
    },
  },
  MtimeTextField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      padding: "6px 6px 6px 20px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      fontSize: "14px",
    },
    "& .css-ieen6m-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      // opacity: 0,
      color: "rgba(0, 0, 0, 0.87) !important",
      "-webkit-text-fill-color": "rgba(0, 0, 0, 0.87)",
    },
  },
  MtextFieldAutocomplete: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      padding: "2px 0 2px !important",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      fontSize: "14px",
    },
  },
  Mselect: {
    "& .css-y4ygc1-MuiInputBase-root-MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      // padding: "4px 4px 4px 8px",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
    },
    "& .Mui-disabled": {
      background: "#EAEBEB",
    },
  },
  MdataGridDetail: {
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#36C690",
      textAlign: "center",
      // overflow: 'unset !important',
      textOverflow: "clip !important",
      whiteSpace: "break-spaces !important",
      lineHeight: "initial",
      fontWeight: "600 !important",
      wordWrap: "break-word !important",
    },
    "& .MuiDataGrid-root": {
      color: "#263238",
      fontFamily: "Kanit",
      borderRadius: "20px !important",
      display: "flex !important",
      flexDirection: "column-reverse",
      "& .MuiDataGrid-main": {
        top: -16,
      },
      "& .MuiDataGrid-columnsContainer": {
        justifyContent: "center",
      },
      "& .MuiDataGrid-row": {
        maxHeight: "none !important",
      },
      "& .MuiDataGrid-cell": {
        cursor: "pointer",
        display: "flex",
        padding: "5px",
        overflowWrap: "anywhere",
        alignItems: "center",
        lineHeight: "120% !important",
        maxHeight: "none !important",
        whiteSpace: "unset !important",
        overflow: "unset !important",
      },
      "& .MuiDataGrid-cell--textRight": {
        justifyContent: "flex-end",
      },
      "& .MuiDataGrid-cell--textLeft": {
        justifyContent: "flex-start",
      },
      "& .MuiDataGrid-cell:focus-within,& .MuiDataGrid-cell:focus,& .MuiDataGrid-columnHeader:focus-within,& .MuiDataGrid-columnHeader:focus":
        {
          outline: "none",
        },
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px",
      fontSize: "14px",
    },
    "& .MuiTablePagination-toolbar": {
      color: "#AEAEAE",
      "& .MuiTypography-body2": {
        fontFamily: "Kanit",
      },
    },
    "& .MuiDataGrid-footerContainer": {
      color: "#AEAEAE",
      "& MuiDataGrid-selectedRowCount": {
        fontFamily: "Kanit !important",
      },
    },
  },

  MdataGridNoPagination: {
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#36C690",
      textAlign: "center",
      textOverflow: "clip !important",
      whiteSpace: "break-spaces !important",
      lineHeight: "initial",
      fontWeight: "600 !important",
    },
    "& .MuiDataGrid-root": {
      fontFamily: "Kanit",
      borderRadius: "10px !important",
      display: "flex !important",
      flexDirection: "column-reverse",
      "& .MuiDataGrid-columnsContainer": {
        justifyContent: "center",
      },
      "& .MuiDataGrid-row": {
        maxHeight: "none !important",
        "& .MuiDataGrid-cell": {
          padding: "5px",
          overflowWrap: "anywhere",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          lineHeight: "120% !important",
          maxHeight: "none !important",
          whiteSpace: "unset !important",
          overflow: "unset !important",
        },
        "&:last-child": {
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "&.Mui-selected": {
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
          },
        },
      },
      "& .MuiDataGrid-cell:focus-within,& .MuiDataGrid-cell:focus,& .MuiDataGrid-columnHeader:focus-within,& .MuiDataGrid-columnHeader:focus":
        {
          outline: "none",
        },
    },
    "& .MuiCheckbox-colorPrimary.Mui-checked": {
      color: "#36C690",
    },
  },

  MdataGridPaginationTop: {
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#36C690",
      textAlign: "center",
      textOverflow: "clip !important",
      whiteSpace: "break-spaces !important",
      lineHeight: "initial",
      fontWeight: "600 !important",
    },
    "& .MuiDataGrid-root": {
      fontFamily: "Kanit",
      borderRadius: "10px !important",
      display: "flex !important",
      flexDirection: "column-reverse",
      "& .MuiDataGrid-columnsContainer": {
        justifyContent: "center",
      },
      "& .MuiDataGrid-row": {
        maxHeight: "none !important",
        "& .MuiDataGrid-cell": {
          // padding: '5px',
          overflowWrap: "anywhere",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          lineHeight: "120% !important",
          maxHeight: "none !important",
          whiteSpace: "unset !important",
          overflow: "unset !important",
        },
        "& .MuiDataGrid-cell--textRight": {
          justifyContent: "flex-end",
        },
        "& .MuiDataGrid-cell--textLeft": {
          justifyContent: "flex-start",
        },
      },
      "& .MuiDataGrid-cell:focus-within,& .MuiDataGrid-cell:focus,& .MuiDataGrid-columnHeader:focus-within,& .MuiDataGrid-columnHeader:focus":
        {
          outline: "none",
        },
    },
    "& .MuiDataGrid-footerContainer": {
      borderBottom: "1px solid #E5E5E5 !important",
      // height: '50px',
    },
    "& .MuiTablePagination-toolbar": {
      color: "#AEAEAE",
    },

    "& .MuiCheckbox-colorPrimary.Mui-checked": {
      color: "#36C690",
    },

    // '& .MuiDataGrid-renderingZone': {
    //   maxHeight: 'none !important',
    // },
    // "& .MuiDataGrid-cell": {
    //   lineHeight: "unset !important",
    //   maxHeight: "none !important",
    //   whiteSpace: "unset !important",
    //   overflow: "unset !important",
    // },
    // "& .MuiDataGrid-row": {
    //   maxHeight: "none !important",
    // },
    //column wrap text
    // "& .MuiDataGrid-columnHeaderTitleContainer": {
    //   lineHeight: "normal !important",
    //   whiteSpace: "unset !important",
    //   overflow: "unset !important",
    // },
  },
  MdataGridPaginationTopStock: {
    "& .MuiDataGrid-columnHeaderTitle": {
      // color: '#36C690',
      fontWeight: "600 !important",
      whiteSpace: "unset !important",
      // overflow: "unset !important",
    },
    "& .MuiDataGrid-root": {
      fontFamily: "Kanit",
      borderRadius: "10px !important",
      display: "flex !important",
      flexDirection: "column-reverse",
      "& .MuiDataGrid-row": {
        maxHeight: "none !important",
        "& .MuiDataGrid-cell": {
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          lineHeight: "120% !important",
          maxHeight: "none !important",
          whiteSpace: "unset !important",
          overflow: "unset !important",
        },
        "& .MuiDataGrid-cell--textRight": {
          justifyContent: "flex-end",
        },
        "& .MuiDataGrid-cell--textLeft": {
          justifyContent: "flex-start",
        },
      },
      "& .MuiDataGrid-cell:focus-within,& .MuiDataGrid-cell:focus,& .MuiDataGrid-columnHeader:focus-within,& .MuiDataGrid-columnHeader:focus":
        {
          outline: "none",
        },
    },
    "& .MuiDataGrid-footerContainer": {
      borderBottom: "1px solid #E5E5E5 !important",
      // height: '50px',
    },
    "& .MuiTablePagination-toolbar": {
      color: "#AEAEAE",
    },
  },
  MdataGridChangeColorRow: {
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#36C690",
      fontWeight: "600 !important",
      whiteSpace: "unset !important",
      // overflow: "unset !important",
    },
    "& .MuiDataGrid-root": {
      fontFamily: "Kanit",
      borderRadius: "10px !important",
      display: "flex !important",
      flexDirection: "column-reverse",
      "& .MuiDataGrid-row": {
        maxHeight: "none !important",
        "& .MuiDataGrid-cell": {
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          lineHeight: "120% !important",
          maxHeight: "none !important",
          whiteSpace: "unset !important",
          overflow: "unset !important",
        },
        "& .MuiDataGrid-cell--textRight": {
          justifyContent: "flex-end",
        },
        "& .MuiDataGrid-cell--textLeft": {
          justifyContent: "flex-start",
        },
      },
      "& .MuiDataGrid-row.Mui-selected": {
        backgroundColor: "#E7FFE9 !important",
      },
      "& .MuiDataGrid-cell:focus-within,& .MuiDataGrid-cell:focus,& .MuiDataGrid-columnHeader:focus-within,& .MuiDataGrid-columnHeader:focus":
        {
          outline: "none",
        },
    },
    "& .MuiDataGrid-footerContainer": {
      borderBottom: "1px solid #E5E5E5 !important",
      // height: '50px',
    },
    "& .MuiTablePagination-toolbar": {
      color: "#AEAEAE",
    },
  },
  MdataGridNew: {
    //column wrap text
    "& .MuiDataGrid-columnHeaderTitleContainer": {
      lineHeight: "normal !important",
      whiteSpace: "unset !important",
      overflow: "unset !important",
    },
  },
  MdataGridConfirm: {
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#36C690",
      fontWeight: "600 !important",
    },
    "& .MuiDataGrid-root": {
      color: "#263238",
      fontFamily: "Kanit",
      borderRadius: "20px !important",
      display: "flex !important",
      flexDirection: "column-reverse",
      "& .MuiDataGrid-main": {
        top: -16,
      },
      "& .MuiDataGrid-cell": {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        lineHeight: "120% !important",
        maxHeight: "none !important",
        whiteSpace: "unset !important",
        overflow: "unset !important",
      },
      "& .MuiDataGrid-cell--textRight": {
        justifyContent: "flex-end",
      },
      "& .MuiDataGrid-cell--textLeft": {
        justifyContent: "flex-start",
      },
      "& .MuiDataGrid-cell:focus-within,& .MuiDataGrid-cell:focus,& .MuiDataGrid-columnHeader:focus-within,& .MuiDataGrid-columnHeader:focus":
        {
          outline: "none",
        },
    },
    "& .MuiDataGrid-footerContainer": {
      color: "#AEAEAE",
      "& MuiDataGrid-selectedRowCount": {
        fontFamily: "Kanit !important",
      },
      minHeight: "20px !important",
    },
  },

  Mautocomplete: {
    "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
      padding: "1.5px !important",
      // paddingRight: '65px !important',
      height: "38px",
    },
    "& .MuiAutocomplete-input": {
      // padding: "2px 4px 2px 6px !important",
    },
  },
  MautocompleteError: {
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

  MautocompleteAddProduct: {
    "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
      padding: "1.5px !important",
      height: "38px",
    },
    "& .MuiOutlinedInput-root .MuiAutocomplete-endAdornment": {
      backgroundColor: "#FFFFFF !important",
      marginRight: "12px !important",
      position: "initial !important",
    },
  },
  MbtnClear: {
    borderRadius: "5px !important",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#676767",
    },
  },
  MbtnRefresh: {
    width: "126px",
    height: "40px",
    "&.MuiButton-root": {
      backgroundColor: "#36C690 !important",
      marginLeft: "10px !important",
      borderRadius: "3px !important",
      boxShadow: "none !important",
      textTransform: "none",
    },
  },
  MbtnSearch: {
    borderRadius: "4px !important",
  },
  MbtnSave: {
    "&.MuiButton-root": {
      width: "100px",
      // backgroundColor: "#FBA600 !important",
      borderRadius: "4px !important",
      marginLeft: "10px !important",
      boxShadow: "none !important",
    },
  },
  MbtnApprove: {
    "&.MuiButton-root": {
      width: "100px",
      borderRadius: "4px !important",
      marginLeft: "10px !important",
      boxShadow: "none !important",
    },
  },
  MbtnSendDC: {
    "&.MuiButton-root": {
      width: "150px",
      borderRadius: "4px !important",
      marginLeft: "10px !important",
      boxShadow: "none !important",
    },
  },
  MbtnBrowse: {
    "&.MuiButton-root": {
      width: "125px",
      borderRadius: "8px !important",
      boxShadow: "none !important",
    },
  },
  MbtnBrowseSmall: {
    "&.MuiButton-root": {
      width: "75px",
      borderRadius: "8px !important",
      boxShadow: "none !important",
    },
  },
  MbtnAdd: {
    "&.MuiButton-root": {
      width: "140px",
      borderRadius: "4px !important",
      marginLeft: "10px !important",
      boxShadow: "none !important",
    },
  },
  MtextFieldRemark: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      fontSize: "14px",
      color: "#263238 !important",
    },
    "& .css-2vifws-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      // opacity: 0,
      color: "#263238 !important",
      "background-color": "#f1f1f1 !important",
      "-webkit-text-fill-color": "rgb(0 0 0 / 100%)",
    },
  },
  MStepper: {
    "& .MuiSvgIcon-root.Mui-active": {
      color: "#DDDDDD",
    },
    // '& .MuiSvgIcon-root.Mui-active': {
    //   color: '#DDDDDD',
    // },
  },
  MtextFieldBrowse: {
    "& .MuiOutlinedInput-root": {
      //input
      borderRadius: "5px !important",
      border: "1px dashed #36C690 !important",
      padding: "0px 4px !important",
      minWidth: "235px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      color: "#676767 !important",
      fontSize: "12px",
    },
  },
  MtextFieldUpload: {
    "& .MuiOutlinedInput-root": {
      //input
      borderRadius: "5px !important",
      border: "1px dashed #36C690 !important",
      padding: "0px 4px !important",
      minWidth: "455px",
    },
    "& .MuiOutlinedInput-root input::placeholder": {
      color: "#676767 !important",
      fontSize: "12px",
    },
  },
  MbtnPrint: {
    "&.MuiButton-root": {
      width: "155px",
      borderRadius: "4px !important",
    },
  },
  MbtnClose: {
    "&.MuiButton-root": {
      width: "200px",
      borderRadius: "4px !important",
    },
  },
  MLabelBDStatus: {
    padding: "1px 15px 1px 15px",
    borderRadius: "8px",
    // width: "100px",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  MTextEllipsis: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  MTextFieldNumberPrint: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      fontSize: "14px",
      textAlignLast: "end !important",
      width: "92px",
      height: "26px",
    },
    "& .css-wufqwl-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      color: "#263238 !important",
      "-webkit-text-fill-color": "rgb(0 0 0 / 100%)",
    },
  },
  MFormControlLabel: {
    "& .MuiFormControlLabel-label": {
      fontSize: "small",
      margin: "10px 0px -10px 0px",
    },
  },
  MLabelTooltipWrapper: {
    position: "relative",
    "& .title": {
      position: "absolute",
      top: "110%",
      left: "0",
      color: "red",
      width: "500px",
      display: "none",
    },
    "&:hover .title": {
      display: "block",
    },
  },
  MTextareaBD: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px !important",
    },
  },
  MSelected: {
    "& .MuiSelect-select": {
      textAlign: "right !important",
    },
  },
  MtextFieldNumberNoneArrow: {
    "& .MuiInput-input": {
      "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
        "-webkit-appearance": "none",
      },
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      fontSize: "15px",
      fontWeight: "bold",
      textAlignLast: "end !important",
    },
    "& .css-wufqwl-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      color: "#263238 !important",
    },
  },
  MSearchBranch: {
    "& button": {
      transform: "none !important",
    },
  },
  MSearchBranchInput: {
    "& .MuiOutlinedInput-input": {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      paddingLeft: "12px",
    },
  },
  MWrapperListBranch: {
    border: "1px solid #C1C1C1",
    borderRadius: "10px",
    padding: "15px 13px",
    minHeight: "270px",
    "& .wrapper-item": {
      border: "1px solid #AEAEAE",
      boxSizing: "border-box",
      borderRadius: "5px",
      background: "#EAEBEB",
      color: "#C1C1C1",
      marginRight: "10px",
      marginBottom: "10px",
      padding: "0px 9px",
      fontSize: "14px",
      height: "28px",
      display: "flex",
      alignItems: "center",
      "& svg": {
        cursor: "pointer",
        fontSize: "14px",
        marginLeft: "5px",
      },
    },
  },
  MWrapperListBranchForm: {
    border: "1px solid #C1C1C1",
    borderRadius: "10px",
    padding: "15px 13px",
    minHeight: "100px",
    maxHeight: "165px",
    overflow: "auto",
    "& .wrapper-item": {
      border: "1px solid #AEAEAE",
      boxSizing: "border-box",
      borderRadius: "5px",
      background: "#EAEBEB",
      color: "#C1C1C1",
      marginRight: "10px",
      marginBottom: "10px",
      padding: "0px 9px",
      fontSize: "14px",
      height: "28px",
      display: "flex",
      alignItems: "center",
      "& svg": {
        cursor: "pointer",
        fontSize: "14px",
        marginLeft: "5px",
      },
    },
  },
  MScrollBar: {
    "&::-webkit-scrollbar": {
      width: "4px",
    },

    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 5px rgb(255, 251, 251)",
      borderRadius: "10px",
    },

    "&::-webkit-scrollbar-thumb": {
      background: "#AEAEAE",
      borderRadius: "10px",
    },

    "&::-webkit-scrollbar-thumb:hover": {
      background: "rgb(255, 251, 251)",
    },
  },
  MtextFieldPostCode: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "5px !important",
      minHeight: "20px !important",
      padding: "0px 0px 0px 5px",
    },
    // '& .Mui-disabled': {
    //   '-webkit-text-fill-color': 'rgb(0 0 0) !important',
    //   color: '#263238 !important',
    // },
  },
});

export { useStyles };
