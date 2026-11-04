import type { Module } from "../../core/helpers/modules";

export type RouteForm = {
	// Clave de requireAccess; las validas las da GET /routes/names.
	name: string;
	module: Module;
	// _id de los roles con acceso.
	roles: string[];
};

// Rutas creadas antes del campo module no lo traen. El back guarda texto
// libre: un modulo que ya no esta en la lista se muestra tal cual.
export type AccessRoute = Omit<RouteForm, "module"> & {
	_id: string;
	module?: Module;
};
