import axios from "axios";
import type { AccessRoute, RouteForm } from "../types/routeTypes";

const API_BACK: string = import.meta.env.VITE_API_BACK;

const auth = (token: string | null) => ({
	headers: { Authorization: `Bearer ${token}` },
});

export const listRoutesApi = async (
	token: string | null,
): Promise<AccessRoute[]> => {
	const response = await axios.get<{ data: AccessRoute[] }>(
		`${API_BACK}/routes`,
		auth(token),
	);
	return response.data.data;
};

export const listRouteNamesApi = async (
	token: string | null,
): Promise<string[]> => {
	const response = await axios.get<{ data: string[] }>(
		`${API_BACK}/routes/names`,
		auth(token),
	);
	return response.data.data;
};

export const createRouteApi = (token: string | null, route: RouteForm) =>
	axios.post(`${API_BACK}/routes`, route, auth(token));

export const updateRouteApi = (
	token: string | null,
	id: string,
	route: RouteForm,
) => axios.patch(`${API_BACK}/routes/${id}`, route, auth(token));

export const deleteRouteApi = (token: string | null, id: string) =>
	axios.delete(`${API_BACK}/routes/${id}`, auth(token));
