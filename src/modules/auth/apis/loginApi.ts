import axios from "axios";
import type { LoginParams, LoginResponse } from "../types/authTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

export const apiLogin = async ({
	email,
	password,
	"cf-turnstile-response": turnstileResponse,
}: LoginParams): Promise<LoginResponse> => {
	const response = await axios.post<LoginResponse>(
		`${API_BACK}/auth/login`,
		{
			email,
			password,
			...(turnstileResponse
				? { "cf-turnstile-response": turnstileResponse }
				: {}),
		},
		{ withCredentials: true },
	);
	return response.data;
};
