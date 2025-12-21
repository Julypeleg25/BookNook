import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#5B6F6A",
      light: "#7F9590",
      dark: "#3F524E",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#619d80ff",
      light: "#b2daacff",
      dark: "#097a16ff",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#F6F2E9",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#000000ff",
      secondary: "#425f80ff",
      disabled: "#918c9eff",
    },

    divider: "#E2DDD3",

    success: {
      main: "#7A9A7E",
    },

    warning: {
      main: "#D4A05A",
    },

    error: {
      main: "#B94A48",
    },

    info: {
      main: "#6B8CA3",
    },
  },

  typography: {
    fontFamily: `"Inter", sans-serif`,

    h1: { fontWeight: 700, color: "#2E2A36" },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },

    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },

    body1: { lineHeight: 1.6 },
    body2: { color: "#6B6478" },

    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "red",
          textDecoration: "none",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          "& a": {
            color: "inherit",
            textDecoration: "none",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 12,
        },
        containedPrimary: {
          backgroundColor: "#5ca9e4ff",
          "&:hover": {
            backgroundColor: "#5d8fbdff",
          },
          "&:focus": {
            outline: "none",
          },
          "&:focus-visible": {
            outline: "none",
            boxShadow: "none",
          },
        },
        containedSecondary: {
          backgroundColor: "#5ed149ff",
          "&:hover": {
            backgroundColor: "#7ad74eff",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          backgroundImage: "none",
        },
      },
    },

    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontWeight: 600,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#F6F2E9",
          color: "#2E2A36",
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: "none",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: 8,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#ffffffff",
        },
        notchedOutline: {
          borderColor: "#c1b49fff",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#6B6478",
          "&.Mui-focused": {
            color: "#5B6F6A",
          },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#5B6F6A",
          "&.Mui-checked": {
            color: "#5B6F6A",
          },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#5B6F6A",
          "&.Mui-checked": {
            color: "#5B6F6A",
          },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#5B6F6A",
            "& + .MuiSwitch-track": {
              backgroundColor: "#5B6F6A",
            },
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          backgroundColor: "#C65A5A",
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-selected": {
            backgroundColor: "rgba(91,111,106,0.12)",
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2E2A36",
          borderRadius: 8,
          fontSize: "0.85rem",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#151514ff",
        },
      },
    },
  },
});

export default theme;
