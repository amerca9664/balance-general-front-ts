// Igual que USER_TYPES en el back (models/roles.ts).
export const USER_TYPES = ["user", "superuser", "supervisor", "admin"] as const;
export type UserType = (typeof USER_TYPES)[number];

export type RoleForm = {
	name: string;
	userType: UserType;
	// _id del Department.
	department: string;
	permissions: { read: boolean; write: boolean };
};

// Roles creados antes del campo department no lo traen.
export type Role = Omit<RoleForm, "department"> & {
	_id: string;
	department?: string;
};
