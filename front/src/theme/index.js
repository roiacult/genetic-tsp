import { createTheme as createMuiTheme } from "@mui/material/styles";
import _ from "lodash";
import { strongShadows } from "./shadows";
import typography from "./typography";

const baseOptions = {
  direction: "ltr",
  typography,
  components: {
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          overflow: "hidden",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 32,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0.075)",
        },
      },
    },
  },
};

const themesOptions = {
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "rgba(255,255,255,0.23)",
        },
      },
    },
  },
  palette: {
    type: "dark",
    action: {
      active: "rgba(255, 255, 255, 0.54)",
      hover: "rgba(255, 255, 255, 0.04)",
      selected: "rgba(255, 255, 255, 0.08)",
      disabled: "rgba(255, 255, 255, 0.26)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      focus: "rgba(255, 255, 255, 0.12)",
    },
    background: {
      default: "#2F2F39",
      dark: "#1c2025",
      paper: "#282C34",
      tableCell: "rgba(0,0,0, .35)",
    },
    primary: {
      main: "#e29587",
    },
    secondary: {
      main: "#e29587",
    },
    text: {
      primary: "#e6e5e8",
      secondary: "#adb0bb",
    },
  },
  shadows: strongShadows,
};

export const createTheme = (config = {}) => {
  let themeOptions = themesOptions;

  if (!themeOptions) {
    [themeOptions] = themesOptions;
  }

  const newTheme = _.merge({}, baseOptions, themeOptions, {
    direction: config.direction,
  });

  let theme = createMuiTheme({ ...newTheme });

  return theme;
};
