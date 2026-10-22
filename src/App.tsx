import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sileo";
import { Login } from "./modules/auth/components/Login";
import { BalanceGeneral } from "./modules/balanceGeneral/components/BalanceGeneral";
import { AuthProvider } from "./modules/core/components/AuthProvider";
import { LanguageProvider } from "./modules/core/components/LanguageProvider";
import { LanguageSelector } from "./modules/core/components/LanguageSelector";

function App() {
	return (
		<LanguageProvider>
			<Toaster offset={20} />
			<LanguageSelector />
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
		</LanguageProvider>
	);
}

export default App;
