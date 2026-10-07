export type AuthData = { auth: boolean } | null;

export type AuthContextValue = {
	auth: AuthData;
	removeAuth: () => void;
	token: string | null;
	updAuth: ({ token }: { token: string | null }) => void;
};
export type useIntervalRt = {
	// Devuelve el access token recien emitido (o null si el refresh fallo):
	// de ahi sale el `exp` con el que el hook agenda el proximo tick.
	refreshToken: () => Promise<string | null>;
};
