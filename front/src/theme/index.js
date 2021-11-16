import { colors, responsiveFontSizes } from "@mui/material";
import { createTheme as createMuiTheme } from "@mui/material/styles";
import _ from "lodash";
// import { LANGUAGES, THEMES } from "src/constants";
// import getLanguage from "src/hooks/useLanguage";
import { softShadows, strongShadows } from "./shadows";
import typography from "./typography";
// import { arEG, frFR, enUS } from "@mui/material/locale";

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

const themesOptions = [
  {
    // name: THEMES.LIGHT,
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            "&::placeholder": {
              opacity: 1,
              color: colors.blueGrey[600],
            },
          },
        },
      },
    },
    palette: {
      type: "light",
      action: {
        active: colors.blueGrey[600],
      },
      background: {
        default: colors.common.white,
        dark: "#f4f6f8",
        paper: colors.common.white,
        tableCell: colors.common.white,
      },
      primary: {
        main: "#FFB000",
      },
      secondary: {
        main: "#FFB000",
      },
      text: {
        primary: colors.blueGrey[900],
        secondary: colors.blueGrey[600],
      },
    },
    shadows: softShadows,
  },
  {
    // name: THEMES.DARK,
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
        main: "#FFB000",
      },
      secondary: {
        main: "#FFB000",
      },
      text: {
        primary: "#e6e5e8",
        secondary: "#adb0bb",
      },
    },
    shadows: strongShadows,
  },
];

export const createTheme = (config = {}) => {
  let themeOptions = themesOptions[1];

  if (!themeOptions) {
    [themeOptions] = themesOptions;
  }
  // const language = getLanguage();
  // let locales = enUS;

  // switch (language) {
  //   case LANGUAGES.ARABIC:
  //     locales = arEG;
  //     break;
  //   case LANGUAGES.FRENCH:
  //     locales = frFR;
  //     break;
  //   case LANGUAGES.ENGLISH:
  //     break;
  // }

  // if (language === LANGUAGES.ARABIC) {
  //   baseOptions.typography['fontFamily'] = 'Cairo';
  // } else delete baseOptions.typography.fontFamily;

  const newTheme = _.merge({}, baseOptions, themeOptions, {
    direction: config.direction,
  });

  // let theme = createMuiTheme({ ...newTheme }, locales);
  let theme = createMuiTheme({ ...newTheme });

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};
