import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Carga las variables del archivo .env correspondiente según el modo (development/production)
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [tailwindcss(), react({ compiler: true })],
		server: {
			port: 5173,
			proxy: {
				"/api": {
					// Lee VITE_API_BACK de tu .env.local / .env.development (ej. http://localhost:5000)
					// Si no existe la variable, usa un valor fallback por defecto
					target: env.VITE_API_BACK || "http://localhost:5000",
					changeOrigin: true,
					secure: false,
				},
			},
		},
	};
});
