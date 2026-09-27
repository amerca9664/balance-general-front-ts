import axios from "axios";
import type { LoginResponse } from "../../auth/types/authTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

export const logOutApi = async (): Promise<LoginResponse> => {
	const response = await axios.post<LoginResponse>(
		`${API_BACK}/auth/logout`,
		{},
		{ withCredentials: true },
	);
	return response.data;
};
