import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AuthContextValue, AuthData } from "../types/authContextTypes";
import { refreshTokenApi } from "../apis/refreshTokenApi";

// 1. createContext necesita valor inicial + tipo explícito.
// Con `| null` obligas a usar el Provider y el tipo de `value` queda fijo.
export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const {
		storedValue: auth,
		setValue,
		removeValue: removeAuth,
	} = useLocalStorage<AuthData>("auth", null);

	const [token, setToken] = useState<string | null>(null);
	const updAuth = ({ token }: { token: string | null }) => {
		if (token) {
			setValue({ auth: true });
			setToken(token);
		} else {
			setValue({ auth: false });
			setToken(null);
		}
	};
	useEffect(() => {
		if (!auth?.auth) {
			return;
		}
		const refreshToken = async () => {
			try {
				const tokenResponse = await refreshTokenApi();
				updAuth({ token: tokenResponse.token });
			} catch (error) {
				console.log("no");
				updAuth({ token: null });
			}
		};

		refreshToken();
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
