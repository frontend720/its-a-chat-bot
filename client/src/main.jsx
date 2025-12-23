import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { VeniceProvider } from "./VeniceContext.jsx";
import App from "./App.jsx";
import { ProviderContext } from "./context/Provider.jsx";
import { AvatarContextProvider } from "./context/AvatarContext.jsx";
import { BrowserRouter as Router } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <Router>
    <ProviderContext>
      <AvatarContextProvider>
        <VeniceProvider>
          <App />
        </VeniceProvider>
      </AvatarContextProvider>
    </ProviderContext>
  </Router>
);
