import React, { ReactElement, useEffect } from "react";
import { useStyles } from "../../../styles/makeTheme";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

interface Props {
  fieldName?: any;
  defaultValue: string;
  maxLength: number;
  maxWidth?: string | number;
  onChangeComment: (value: string) => void;
  isDisable?: boolean;
  rowDisplay?: number;
  hypterText?: string;
  isError?: boolean;
}
function TextBoxComment({
  fieldName,
  defaultValue,
  maxLength,
  maxWidth = 350,
  isDisable,
  onChangeComment,
  rowDisplay,
  hypterText,
  isError,
}: Props): ReactElement {
  const classes = useStyles();
  const [characterCount, setCharacterCount] = React.useState(0);
  // const [comment, setComment] = React.useState(defaultValue);

  useEffect(() => {
    if (defaultValue !== "" && defaultValue !== undefined)
      setCharacterCount(defaultValue.length);
  }, []);

  const handleChangeComment = (event: any) => {
    const value = event.target.value;
    const length = event.target.value.length;
    if (length <= maxLength) {
      setCharacterCount(event.target.value.length);
      // setComment(value);
    }
    return onChangeComment(value);
  };

  return (
    <>
      <Typography variant="body2" sx={{ mb: "5px" }}>
        {fieldName}
      </Typography>
      <TextField
        data-testid="form-field-tbxComment"
        id="tbxComment"
        // label='tbxComment'
        multiline
        fullWidth
        rows={rowDisplay ? rowDisplay : 2}
        onChange={handleChangeComment}
        defaultValue={defaultValue}
        placeholder={`ความยาวไม่เกิน ${maxLength} ตัวอักษร`}
        className={classes.MtextFieldRemark}
        inputProps={{ maxLength: maxLength }}
        sx={{ maxWidth: maxWidth }}
        disabled={isDisable}
        helperText={isError === true ? hypterText : " "}
        error={isError}
      />

      <div
        data-testid="div-warning-msg"
        style={{
          fontSize: "11px",
          color: "#AEAEAE",
          width: "100%",
          maxWidth: maxWidth,
          textAlign: "right",
          marginTop: "-1.6em",
          paddingRight: "5px",
        }}
      >
        {characterCount}/{maxLength}
      </div>
    </>
  );
}

export default TextBoxComment;
