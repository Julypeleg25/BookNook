import "./App.css";
import { AuthProvider } from "./auth/AuthProvider";
import AppBar from "./components/AppBar";
import Router from "./router/Router";

function App() {
  return (
    <AuthProvider>
      <AppBar/>
      <Router />
    </AuthProvider>
  );
}

export default App;
