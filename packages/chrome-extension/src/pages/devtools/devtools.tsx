import "../../app/styles.css";

import React from "react";
import { createRoot } from "react-dom/client";

import { devtools } from "@/shared/chrome-api";

import { DevToolsPage } from "./index";

devtools.createPanel("Jobz", "icons/icon-16.png", "src/pages/devtools/devtools.html", (_panel) => {
  console.log("Jobz DevTools panel created");
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(React.createElement(DevToolsPage));
}
