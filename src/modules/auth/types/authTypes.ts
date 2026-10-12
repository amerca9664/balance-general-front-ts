export type LoginParams = {
	email: string;
	password: string;
	"cf-turnstile-response"?: string;
};

export type LoginResponse = {
	success: boolean;
	message: string;
	token: string;
};

// El back en refresh devuelve { roles, accessToken }.
// Aceptamos ambas formas para no romper si unifica a { token }.
export type RefreshResponse = {
	accessToken?: string;
	token?: string;
	roles?: string[];
};
