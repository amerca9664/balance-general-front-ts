// Para agregar un modulo: una entrada aqui, su <Route> en App.tsx y su texto en i18n "modules".
// Es la unica lista de modulos: el Sidebar y el CRUD de rutas salen de aca.
export const modules = [
	{ path: "/balancegeneral", label: "balanceGeneral" },
	{ path: "/usuarios", label: "users" },
	{ path: "/roles", label: "roles" },
	{ path: "/departamentos", label: "departments" },
	{ path: "/rutas", label: "routes" },
] as const;

export type Module = (typeof modules)[number]["label"];
