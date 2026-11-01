export type User = {
	_id: string;
	username: string;
	email: string;
	// _id de los roles asignados.
	roles: string[];
};

export type UserForm = {
	username: string;
	email: string;
	password: string;
	roles: string[];
};
