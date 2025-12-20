import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { VeniceProvider } from "./VeniceContext.jsx";
import App from "./App.jsx";
import { ProviderContext } from "./context/Provider.jsx";

createRoot(document.getElementById("root")).render(
  <ProviderContext>
    <VeniceProvider>
      <App />
    </VeniceProvider>
  </ProviderContext>
);
