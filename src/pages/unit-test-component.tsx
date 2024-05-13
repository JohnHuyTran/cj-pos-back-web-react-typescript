// components/Greetings.tsx

import { TextField } from "@mui/material";
import React from "react";

type GreetingsProps = {
  name: string;
  // onSendWaves?: (waves: string) => void;
};

export const UnitTestComponent = ({
  name,
}: // onSendWaves
GreetingsProps) => {
  const [text, setText] = React.useState("");
  function testXX() {
    setText("success");
  }

  return (
    <div>
      <p>Hello {name}!</p>
      <p>{text}</p>
      <TextField id="idTextField" value=""></TextField>
      {/* {!!onSendWaves && ( */}
      <button type="button" onClick={() => testXX()}>
        Send 👋
      </button>
      {/* )} */}
    </div>
  );
};
