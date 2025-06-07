import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";

function renderApp() {
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<App />
			<Toaster richColors />
		</StrictMode>,
	);
}

if (import.meta.env.DEV) {
	import("./mocks/mockGoogleScript").then(({ setupMockGoogleScript }) => {
		setupMockGoogleScript();
		renderApp();
	});
} else {
	renderApp();
}
