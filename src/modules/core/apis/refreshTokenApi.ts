import axios from "axios";
import type { LoginResponse } from "../../auth/types/authTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

export const refreshTokenApi = async (): Promise<LoginResponse> => {
	const response = await axios.post<LoginResponse>(
		`${API_BACK}/auth/refresh`,
		{},
		{ withCredentials: true },
	);
	return response.data;
};
