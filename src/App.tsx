import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sileo";
import { Login } from "./modules/auth/components/Login";
import { BalanceGeneral } from "./modules/balanceGeneral/components/BalanceGeneral";
import { AuthProvider } from "./modules/core/components/AuthProvider";
import { LanguageProvider } from "./modules/core/components/LanguageProvider";
import { LanguageSelector } from "./modules/core/components/LanguageSelector";
import { SidebarLayout } from "./modules/core/components/Sidebar";
import { ThemeProvider } from "./modules/core/components/ThemeProvider";
import { ThemeSelector } from "./modules/core/components/ThemeSelector";
import { Users } from "./modules/users/components/Users";

function App() {
	return (
		<LanguageProvider>
			<ThemeProvider>
				<Toaster position="top-center" />
				<div className="fixed top-4 right-4 z-50 flex gap-2">
					<ThemeSelector />
					<LanguageSelector />
				</div>
				<BrowserRouter>
					<AuthProvider>
						<Routes>
							{/* Al entrar a la raíz "/" redirige automáticamente a "/login" */}
							<Route path="/" element={<Navigate to="/login" replace />} />
							<Route path="/login" element={<Login />} />
							<Route element={<SidebarLayout />}>
								<Route path="/balancegeneral" element={<BalanceGeneral />} />
								<Route path="/usuarios" element={<Users />} />
							</Route>
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</ThemeProvider>
		</LanguageProvider>
	);
}

export default App;
