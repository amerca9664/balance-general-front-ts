import axios from "axios";
import type { LoginParams, LoginResponse } from "../types/authTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

export const apiLogin = async ({
	email,
	password,
}: LoginParams): Promise<LoginResponse> => {
	const response = await axios.post<LoginResponse>(
		`${API_BACK}/auth/login`,
		{
			email,
			password,
		},
		{ withCredentials: true },
	);
	return response.data;
};
