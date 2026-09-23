import axios from "axios";
import type { LoginParams } from "../types/authTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

export const apiLogin = async ({ email, password }: LoginParams) => {
	const response = await axios.post(
		`${API_BACK}/auth/login`,
		{
			email,
			password,
		},
		{ withCredentials: true },
	);
	return response.data;
};
