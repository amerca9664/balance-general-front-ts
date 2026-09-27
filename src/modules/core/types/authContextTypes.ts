export type AuthData = { auth: boolean } | null;

export type AuthContextValue = {
	auth: AuthData;
	removeAuth: () => void;
	token: string | null;
	updAuth: ({ token }: { token: string | null }) => void;
};
