import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";
import { AuthProvider } from "./auth/AuthContext";
import { EmpresaProvider } from "./context/EmpresaContext";
import { NCMProvider } from "./context/NCMContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EmpresaProvider>
          <NCMProvider>
            <App />
          </NCMProvider>
        </EmpresaProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
