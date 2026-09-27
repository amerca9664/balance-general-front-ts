import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { refreshTokenApi } from "../apis/refreshTokenApi";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AuthContextValue, AuthData } from "../types/authContextTypes";

// 1. createContext necesita valor inicial + tipo explícito.
// Con `| null` obligas a usar el Provider y el tipo de `value` queda fijo.
export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const {
		storedValue: auth,
		setValue,
		removeValue: removeAuth,
	} = useLocalStorage<AuthData>("auth", null);
	const navigate = useNavigate();
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: este refresh corre UNA vez por montaje. Si agrego auth?.auth a las deps, updAuth() escribe en localStorage -> cambia auth -> el efecto vuelve a correr -> loop infinito de refreshes.
	useEffect(() => {
		// Sin sesion en localStorage no intentamos refrescar: cada visita
		// de un visitante nuevo disparaba un 401 contra la base.
		if (!auth?.auth) {
			navigate("/login");
			return;
		}

		const refreshToken = async () => {
			try {
				const tokenResponse = await refreshTokenApi();
				updAuth({ token: tokenResponse.token });
				navigate("/balancegeneral");
			} catch {
				updAuth({ token: null });
				navigate("/login");
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
