import { SnackbarProvider } from "notistack";
import "./App.css";
import { AuthProvider } from "./auth/AuthProvider";
import AppBar from "./components/AppBar";
import Router from "./router/Router";

function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <AuthProvider>
        <AppBar />
        <Router />
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;
