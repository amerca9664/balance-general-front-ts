import axios from "axios";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { refreshTokenApi } from "../apis/refreshTokenApi";
import {
	clearPendingLogout,
	flushPendingLogout,
	hasPendingLogout,
} from "../helpers/pendingLogout";
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
			clearPendingLogout();
			setValue({ auth: true });
			setToken(token);
			// Solo desde login: el refresh periodico tambien pasa por aca y no debe
			// sacar al usuario del modulo en el que esta.
			if (window.location.pathname === "/login") navigate("/balancegeneral");
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

	const refreshToken = async (): Promise<string | null> => {
		if (!auth?.auth) {
			navigate("/login");
			return null;
		}
		// Hay un logout que no llego al back: un refresh reviviria esa sesion.
		if (hasPendingLogout()) {
			await flushPendingLogout();
			removeAuth();
			return null;
		}
		try {
			const tokenResponse = await refreshTokenApi();
			updAuth({ token: tokenResponse.token });
			return tokenResponse.token;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				// 429 Cloudflare / CORS
				if (!error.response) {
					return null;
				}

				// Error temporal
				if (error.response.status === 429) {
					return null;
				}

				// Token inválido
				if (error.response.status === 401 || error.response.status === 403) {
					removeAuth();
					return null;
				}
			}

			return null;
		}
	};

	useRefreshTokenInterval({ refreshToken });

	// Logout pendiente: se reintenta al abrir la app y cada vez que vuelve la red.
	useEffect(() => {
		const flush = () => {
			void flushPendingLogout();
		};
		flush();
		window.addEventListener("online", flush);
		return () => window.removeEventListener("online", flush);
	}, []);

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
