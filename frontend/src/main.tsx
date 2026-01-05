import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ScrollToTop from "./router/ScrollToTop";
import theme from "./theme/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
