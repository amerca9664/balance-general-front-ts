import axios from "axios";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { DataTable } from "../../core/components/DataTable";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { useTranslation } from "../../core/components/LanguageProvider";
import { SideModal } from "../../core/components/SideModal";
import { listRolesApi } from "../../roles/apis/rolesApi";
import type { Role } from "../../roles/types/roleTypes";
import {
	createUserApi,
	deleteUserApi,
	listUsersApi,
	updateUserApi,
} from "../apis/usersApi";
import type { User } from "../types/userTypes";

export const Users = () => {
	const { token } = useAuth();
	const { t } = useTranslation();
	const [users, setUsers] = useState<User[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [allRoles, setAllRoles] = useState<Role[]>([]);
	const [roleIds, setRoleIds] = useState<string[]>([]);

	const showError = (error: unknown) =>
		sileo.error({
			title: t.users.errorTitle,
			description: axios.isAxiosError(error)
				? error.response
					? (error.response.data?.message ?? t.users.invalidData)
					: t.errors.noConnection
				: t.errors.unexpected,
		});

	const loadUsers = async () => {
		try {
			setUsers(await listUsersApi(token));
		} catch (error) {
			showError(error);
		}
	};

	// Sin permiso "roles.read" el back responde 403: la lista queda vacia y no se pueden asignar.
	const loadRoles = async () => {
		try {
			setAllRoles(await listRolesApi(token));
		} catch {
			setAllRoles([]);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: solo recargar cuando llega el token (React Compiler ya memoiza loadUsers)
	useEffect(() => {
		// El token llega con el primer refresh; antes la request daria 401.
		if (token) {
			void loadUsers();
			void loadRoles();
		}
	}, [token]);

	const roleNames = (user: User) =>
		allRoles
			.filter((role) => user.roles.includes(role._id))
			.map((role) => role.name)
			.join(", ") || "—";

	const assignedRoles = allRoles.filter((role) => roleIds.includes(role._id));
	const availableRoles = allRoles.filter((role) => !roleIds.includes(role._id));

	const resetForm = () => {
		setModalOpen(false);
		setEditingId(null);
		setUsername("");
		setEmail("");
		setPassword("");
		setRoleIds([]);
	};

	const handleNew = () => {
		resetForm();
		setModalOpen(true);
	};

	const handleSave = async () => {
		const form = { username, email, password, roles: roleIds };
		try {
			if (editingId) {
				await updateUserApi(token, editingId, form);
				sileo.success({ title: t.users.updated });
			} else {
				await createUserApi(token, form);
				sileo.success({ title: t.users.created });
			}
			resetForm();
			await loadUsers();
		} catch (error) {
			showError(error);
		}
	};

	const handleEdit = (user: User) => {
		setEditingId(user._id);
		setUsername(user.username);
		setEmail(user.email);
		setPassword("");
		setRoleIds(user.roles);
		setModalOpen(true);
	};

	const handleDelete = async (user: User) => {
		if (
			!window.confirm(
				t.users.confirmDelete.replace("{username}", user.username),
			)
		)
			return;
		try {
			await deleteUserApi(token, user._id);
			sileo.success({ title: t.users.deleted });
			if (editingId === user._id) resetForm();
			await loadUsers();
		} catch (error) {
			showError(error);
		}
	};

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 pt-20 pb-8">
			<div className="mx-auto max-w-4xl flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<h1 className="text-2xl font-bold">{t.users.title}</h1>
					<button
						type="button"
						onClick={handleNew}
						className="flex items-center gap-2 bg-blue-500 text-blue-50 p-2 rounded-md hover:bg-blue-600 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
					>
						<Plus className="size-5" />
						{t.users.createTitle}
					</button>
				</div>

				<SideModal
					open={modalOpen}
					persistent={true}
					onClose={resetForm}
					title={editingId ? t.users.editTitle : t.users.createTitle}
				>
					<form
						className="flex flex-col gap-3"
						onSubmit={(e) => {
							e.preventDefault();
							void handleSave();
						}}
					>
						<GeneralInputText
							valueText={username}
							onChangeText={setUsername}
							placeholderText={t.users.username}
							typeInput="text"
						/>
						<GeneralInputText
							valueText={email}
							onChangeText={setEmail}
							placeholderText={t.users.email}
							typeInput="email"
						/>
						<GeneralInputText
							valueText={password}
							onChangeText={setPassword}
							placeholderText={
								editingId ? t.users.passwordKeep : t.users.password
							}
							typeInput="password"
						/>
						{allRoles.length > 0 && (
							<div className="flex flex-col gap-2">
								<label className="flex flex-col gap-1">
									<span className="text-sm">{t.users.roles}</span>
									{/* Elegir una opcion la agrega y el select vuelve al placeholder. */}
									<select
										value=""
										disabled={availableRoles.length === 0}
										onChange={(e) => setRoleIds([...roleIds, e.target.value])}
										className="p-2 rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 focus-visible:outline-2 focus-visible:outline-blue-400"
									>
										<option value="" disabled>
											{t.users.addRole}
										</option>
										{availableRoles.map((role) => (
											<option key={role._id} value={role._id}>
												{role.name}
											</option>
										))}
									</select>
								</label>
								{assignedRoles.length > 0 && (
									<ul className="flex flex-wrap gap-2">
										{assignedRoles.map((role) => (
											<li
												key={role._id}
												className="flex items-center gap-1 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 pl-3 pr-1 py-0.5 text-sm"
											>
												{role.name}
												<button
													type="button"
													onClick={() =>
														setRoleIds(roleIds.filter((id) => id !== role._id))
													}
													aria-label={`${t.users.removeRole} ${role.name}`}
													title={t.users.removeRole}
													className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
												>
													<X className="size-4" />
												</button>
											</li>
										))}
									</ul>
								)}
							</div>
						)}
						<div className="flex gap-2">
							<GeneralButton
								typeButton="submit"
								onClickButton={() => {}}
								textName={editingId ? t.users.save : t.users.create}
							/>
							<button
								type="button"
								onClick={resetForm}
								className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 hover:cursor-pointer"
							>
								{t.users.cancel}
							</button>
						</div>
					</form>
				</SideModal>

				<DataTable
					rows={users}
					columns={[
						{ header: t.users.username, cell: (user) => user.username },
						{ header: t.users.email, cell: (user) => user.email },
						{ header: t.users.roles, cell: roleNames },
					]}
					emptyText={t.users.empty}
					labels={t.users}
					rowLabel={(user) => user.username}
					onEdit={handleEdit}
					onDelete={(user) => void handleDelete(user)}
				/>
			</div>
		</div>
	);
};
