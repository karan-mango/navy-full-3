import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter as Router } from "react-router-dom";
import ContextApi from "./contextapi/ContextApi";
export default function App() {
  return (
    <ContextApi>
      <Router>
        <AppRoutes />
      </Router>
    </ContextApi>
  );
}
