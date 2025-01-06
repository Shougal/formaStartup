import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Optional, for global styles
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";




// Render the App component into the root div in index.html
const root = ReactDOM.createRoot(document.getElementById("root"));

// Wrapping the App with the Context and Browser Router
root.render(
    <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
