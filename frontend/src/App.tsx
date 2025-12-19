import "./App.css";
import { AuthProvider } from "./auth/AuthProvider";
import Router from "./router/Router";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
