import { SnackbarProvider } from "notistack";
import Router from "@router/Router";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import env from "./config/env";

function App() {
  return (
    <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <Router />
        </SnackbarProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
