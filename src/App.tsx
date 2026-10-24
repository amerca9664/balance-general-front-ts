import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sileo";
import { Login } from "./modules/auth/components/Login";
import { BalanceGeneral } from "./modules/balanceGeneral/components/BalanceGeneral";
import { AuthProvider } from "./modules/core/components/AuthProvider";
import { LanguageProvider } from "./modules/core/components/LanguageProvider";
import { LanguageSelector } from "./modules/core/components/LanguageSelector";
import { ThemeProvider } from "./modules/core/components/ThemeProvider";
import { ThemeSelector } from "./modules/core/components/ThemeSelector";

function App() {
	return (
		<LanguageProvider>
			<ThemeProvider>
				<Toaster position="top-center" />
				<LanguageSelector />
				<ThemeSelector />
				<BrowserRouter>
					<AuthProvider>
						<Routes>
							{/* Al entrar a la raíz "/" redirige automáticamente a "/login" */}
							<Route path="/" element={<Navigate to="/login" replace />} />
							<Route path="/login" element={<Login />} />
							<Route path="/balancegeneral" element={<BalanceGeneral />} />
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</ThemeProvider>
		</LanguageProvider>
	);
}

export default App;
