import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#5B6F6A",
      light: "#8FA5A0",
      dark: "#3E514D",
    },

    secondary: {
      main: "#7FAF9B",
    },

    background: {
      default: "#F5F4F1",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#1F2933",
      secondary: "#5B6472",
      disabled: "#9CA3AF",
    },

    divider: "rgba(0,0,0,0.08)",

    success: {
      main: "#6FAE8C",
    },

    warning: {
      main: "#E2B26F",
    },

    error: {
      main: "#D0655C",
    },

    info: {
      main: "#6B8CA3",
    },
  },

  typography: {
    fontFamily: `"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif`,

    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },

    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },

    body1: {
      lineHeight: 1.65,
    },

    body2: {
      color: "#6B7280",
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 16,
          paddingBlock: 8,
        },
        outlined: {
          borderWidth: 1,
          border:"solid",
          borderColor: "rgba(0, 0, 0, 0.5)"
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          backgroundImage: "none",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#1F2933",
          boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
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
          backgroundColor: "#FFFFFF",
        },
        notchedOutline: {
          borderColor: "rgba(0,0,0,0.15)",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#6B7280",
          "&.Mui-focused": {
            color: "#5B6F6A",
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
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
          borderRadius: 12,
          "&.Mui-selected": {
            backgroundColor: "rgba(91,111,106,0.12)",
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#111827",
          borderRadius: 8,
          fontSize: "0.8rem",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(0,0,0,0.08)",
        },
      },
    },
  },
});

export default theme;
