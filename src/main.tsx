import { createRoot } from "react-dom/client";
import "./styles/normalize.css";
import "./styles/index.css";
import App from "./App.tsx";

const domNode = document.getElementById("root") as HTMLElement;
const root = createRoot(domNode);

root.render(<App />);
