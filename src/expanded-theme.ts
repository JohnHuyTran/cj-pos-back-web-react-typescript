import "@mui/material/styles";
declare module "@mui/material/styles" {
  interface Palette {
    cancelColor: Palette["primary"];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    cancelColor?: PaletteOptions["primary"];
  }
}

// Update the Button's color prop options
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    cancelColor: true;
  }
}
