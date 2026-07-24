import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/noto-sans-sc";
import { App } from "./App";
import { I18nProvider } from "./i18n/I18nProvider";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("University2K26 root element is missing.");
}

createRoot(root).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
