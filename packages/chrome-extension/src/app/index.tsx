import "./styles.css";

import { createRoot } from "react-dom/client";

import { PopupPage } from "@/pages/popup";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<PopupPage />);
}
