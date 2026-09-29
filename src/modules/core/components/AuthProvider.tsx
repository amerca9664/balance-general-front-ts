import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { refreshTokenApi } from "../apis/refreshTokenApi";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useRefreshTokenInterval } from "../hooks/useRefreshTokenInterval";
import type { AuthContextValue, AuthData } from "../types/authContextTypes";

// 1. createContext necesita valor inicial + tipo explícito.
// Con `| null` obligas a usar el Provider y el tipo de `value` queda fijo.
export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const {
		storedValue: auth,
		setValue,
		removeValue,
	} = useLocalStorage<AuthData>("auth", null);

	const navigate = useNavigate();
	const [token, setToken] = useState<string | null>(null);
	const updAuth = ({ token }: { token: string | null }) => {
		if (token) {
			setValue({ auth: true });
			setToken(token);
			// Redirigir a la página de balance general
			navigate("/balancegeneral");
		} else {
			setValue({ auth: false });
			setToken(null);
		}
	};

	const removeAuth = () => {
		removeValue();
		setToken(null);
		navigate("/login");
	};

	const refreshToken = async () => {
		console.log(auth?.auth);
		if (!auth?.auth) {
			navigate("/login");
			return;
		}
		try {
			const tokenResponse = await refreshTokenApi();
			updAuth({ token: tokenResponse.token });
		} catch {
			removeAuth();
		}
	};

	useRefreshTokenInterval({ refreshToken });

	// 2. Este objeto ahora sí coincide con AuthContextValue,
	// por eso el `value` ya no da error de tipos.

	return (
		<AuthContext.Provider value={{ auth, removeAuth, token, updAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextValue => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
	return ctx;
};
