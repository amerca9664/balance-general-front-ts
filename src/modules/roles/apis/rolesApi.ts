import axios from "axios";
import type { Role, RoleForm } from "../types/roleTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

const auth = (token: string | null) => ({
	headers: { Authorization: `Bearer ${token}` },
});

export const listRolesApi = async (token: string | null): Promise<Role[]> => {
	const response = await axios.get<{ data: Role[] }>(
		`${API_BACK}/roles`,
		auth(token),
	);
	return response.data.data;
};

export const createRoleApi = (token: string | null, role: RoleForm) =>
	axios.post(`${API_BACK}/roles`, role, auth(token));

export const updateRoleApi = (
	token: string | null,
	id: string,
	role: RoleForm,
) => axios.patch(`${API_BACK}/roles/${id}`, role, auth(token));

export const deleteRoleApi = (token: string | null, id: string) =>
	axios.delete(`${API_BACK}/roles/${id}`, auth(token));
