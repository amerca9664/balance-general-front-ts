import axios from "axios";
import type { Department, DepartmentForm } from "../types/departmentTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

const auth = (token: string | null) => ({
	headers: { Authorization: `Bearer ${token}` },
});

export const listDepartmentsApi = async (
	token: string | null,
): Promise<Department[]> => {
	const response = await axios.get<{ data: Department[] }>(
		`${API_BACK}/departments`,
		auth(token),
	);
	return response.data.data;
};

export const createDepartmentApi = (
	token: string | null,
	department: DepartmentForm,
) => axios.post(`${API_BACK}/departments`, department, auth(token));

export const updateDepartmentApi = (
	token: string | null,
	id: string,
	department: DepartmentForm,
) => axios.patch(`${API_BACK}/departments/${id}`, department, auth(token));

export const deleteDepartmentApi = (token: string | null, id: string) =>
	axios.delete(`${API_BACK}/departments/${id}`, auth(token));
