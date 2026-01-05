import { SnackbarProvider } from "notistack";
import Router from "@router/Router";
import "./App.css";

function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <Router />
    </SnackbarProvider>
  );
}

export default App;
