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
      main: "#C65A5A",
      light: "#E08080",
      dark: "#9E3E3E",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#F6F2E9",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#2E2A36",
      secondary: "#6B6478",
      disabled: "#A5A1AF",
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
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,

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
    /* ================= Buttons ================= */
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 20,
        },
        containedPrimary: {
          backgroundColor: "#5B6F6A",
          "&:hover": {
            backgroundColor: "#3F524E",
          },
        },
        containedSecondary: {
          backgroundColor: "#C65A5A",
          "&:hover": {
            backgroundColor: "#9E3E3E",
          },
        },
        outlined: {
          borderWidth: 2,
        },
      },
    },

    /* ================= Icon Button ================= */
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#5B6F6A",
          "&:hover": {
            backgroundColor: "rgba(91,111,106,0.08)",
          },
        },
      },
    },

    /* ================= Card ================= */
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

    /* ================= AppBar ================= */
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#5B6F6A",
          color: "#FFFFFF",
        },
      },
    },

    /* ================= Toolbar ================= */
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },

    /* ================= Paper ================= */
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: "none",
        },
      },
    },

    /* ================= Dialog ================= */
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

    /* ================= TextField / Inputs ================= */
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
        },
        notchedOutline: {
          borderColor: "#D8D2C8",
        }
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

    /* ================= Checkbox / Radio / Switch ================= */
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

    /* ================= Tabs ================= */
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

    /* ================= List ================= */
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

    /* ================= Snackbar / Alert ================= */
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },

    /* ================= Tooltip ================= */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2E2A36",
          borderRadius: 8,
          fontSize: "0.85rem",
        },
      },
    },

    /* ================= Divider ================= */
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E2DDD3",
        },
      },
    },
  },
});

export default theme;
