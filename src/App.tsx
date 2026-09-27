import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Login } from "./modules/auth/components/Login";
import { BalanceGeneral } from "./modules/balanceGeneral/components/BalanceGeneral";
import { AuthProvider } from "./modules/core/components/AuthProvider";
import { AppAct } from "./modules/core/components/AppAct";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<AppAct>
					<Routes>
						{/* Al entrar a la raíz "/" redirige automáticamente a "/login" */}
						<Route path="/" element={<Navigate to="/login" replace />} />
						<Route path="/login" element={<Login />} />
						<Route path="/balancegeneral" element={<BalanceGeneral />} />
					</Routes>
				</AppAct>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
