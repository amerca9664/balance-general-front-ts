// Igual que USER_TYPES en el back (models/roles.ts).
export const USER_TYPES = ["user", "superuser", "supervisor", "admin"] as const;
export type UserType = (typeof USER_TYPES)[number];

export type RoleForm = {
	name: string;
	userType: UserType;
	permissions: { read: boolean; write: boolean };
};

export type Role = RoleForm & { _id: string };
