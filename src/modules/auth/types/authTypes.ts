export type LoginParams = {
	email: string;
	password: string;
	"cf-turnstile-response"?: string;
	idempotencyKey: string;
};

export type LoginResponse = {
	success: boolean;
	message: string;
	token: string;
	username: string;
};

// El back en refresh devuelve { roles, accessToken }.
// Aceptamos ambas formas para no romper si unifica a { token }.
export type RefreshResponse = {
	accessToken?: string;
	token?: string;
	roles?: string[];
};

// 429 del rate limit de /login. scope "user_ip" = solo ese email en esta IP.
export type RateLimitResponse = {
	success: false;
	message: string;
	scope: "ip" | "user_ip";
	retryAfter: number;
};
