import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./index.tailwind.css";
import { DisplaySizeProvider } from "./Contexts.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<DisplaySizeProvider>
			<App />
		</DisplaySizeProvider>
	</StrictMode>,
);
