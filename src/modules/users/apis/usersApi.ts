import axios from "axios";
import type { User, UserForm } from "../types/userTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

const auth = (token: string | null) => ({
	headers: { Authorization: `Bearer ${token}` },
});

export const listUsersApi = async (token: string | null): Promise<User[]> => {
	const response = await axios.get<{ data: User[] }>(
		`${API_BACK}/users`,
		auth(token),
	);
	return response.data.data;
};

export const createUserApi = (token: string | null, user: UserForm) =>
	axios.post(`${API_BACK}/users`, user, auth(token));

// Password vacio = no cambiarla.
export const updateUserApi = (
	token: string | null,
	id: string,
	{ password, ...user }: UserForm,
) =>
	axios.patch(
		`${API_BACK}/users/${id}`,
		password ? { ...user, password } : user,
		auth(token),
	);

export const deleteUserApi = (token: string | null, id: string) =>
	axios.delete(`${API_BACK}/users/${id}`, auth(token));
