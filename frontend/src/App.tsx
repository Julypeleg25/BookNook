import { SnackbarProvider } from "notistack";
import Router from "@router/Router";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import env from "./config/env";
import { AuthInitializer } from "./components/auth/AuthInitializer";
import { Box } from "@mui/material";

const App = () => {
  if (!env.GOOGLE_CLIENT_ID) {
    return <Box>Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID.</Box>;
  }

  return (
    <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <AuthInitializer>
          <Router />
        </AuthInitializer>
      </SnackbarProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
