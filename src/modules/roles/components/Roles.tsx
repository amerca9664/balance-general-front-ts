import axios from "axios";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { DataTable } from "../../core/components/DataTable";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { useTranslation } from "../../core/components/LanguageProvider";
import { SideModal } from "../../core/components/SideModal";
import {
	createRoleApi,
	deleteRoleApi,
	listRolesApi,
	updateRoleApi,
} from "../apis/rolesApi";
import { type Role, USER_TYPES, type UserType } from "../types/roleTypes";

export const Roles = () => {
	const { token } = useAuth();
	const { t } = useTranslation();
	const [roles, setRoles] = useState<Role[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [userType, setUserType] = useState<UserType>("user");
	const [read, setRead] = useState(false);
	const [write, setWrite] = useState(false);

	const showError = (error: unknown) =>
		sileo.error({
			title: t.roles.errorTitle,
			description: axios.isAxiosError(error)
				? error.response
					? (error.response.data?.message ?? t.roles.invalidData)
					: t.errors.noConnection
				: t.errors.unexpected,
		});

	const loadRoles = async () => {
		try {
			setRoles(await listRolesApi(token));
		} catch (error) {
			showError(error);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: solo recargar cuando llega el token (React Compiler ya memoiza loadRoles)
	useEffect(() => {
		// El token llega con el primer refresh; antes la request daria 401.
		if (token) void loadRoles();
	}, [token]);

	const resetForm = () => {
		setModalOpen(false);
		setEditingId(null);
		setName("");
		setUserType("user");
		setRead(false);
		setWrite(false);
	};

	const handleNew = () => {
		resetForm();
		setModalOpen(true);
	};

	const handleSave = async () => {
		const form = { name, userType, permissions: { read, write } };
		try {
			if (editingId) {
				await updateRoleApi(token, editingId, form);
				sileo.success({ title: t.roles.updated });
			} else {
				await createRoleApi(token, form);
				sileo.success({ title: t.roles.created });
			}
			resetForm();
			await loadRoles();
		} catch (error) {
			showError(error);
		}
	};

	const handleEdit = (role: Role) => {
		setEditingId(role._id);
		setName(role.name);
		setUserType(role.userType);
		setRead(role.permissions.read);
		setWrite(role.permissions.write);
		setModalOpen(true);
	};

	const handleDelete = async (role: Role) => {
		if (!window.confirm(t.roles.confirmDelete.replace("{name}", role.name)))
			return;
		try {
			await deleteRoleApi(token, role._id);
			sileo.success({ title: t.roles.deleted });
			if (editingId === role._id) resetForm();
			await loadRoles();
		} catch (error) {
			showError(error);
		}
	};

	const permissionsText = (role: Role) =>
		[
			role.permissions.read && t.roles.read,
			role.permissions.write && t.roles.write,
		]
			.filter(Boolean)
			.join(", ") || "—";

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 pt-20 pb-8">
			<div className="mx-auto max-w-4xl flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<h1 className="text-2xl font-bold">{t.roles.title}</h1>
					<button
						type="button"
						onClick={handleNew}
						className="flex items-center gap-2 bg-blue-500 text-blue-50 p-2 rounded-md hover:bg-blue-600 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
					>
						<Plus className="size-5" />
						{t.roles.createTitle}
					</button>
				</div>

				<SideModal
					open={modalOpen}
					persistent={true}
					onClose={resetForm}
					title={editingId ? t.roles.editTitle : t.roles.createTitle}
				>
					<form
						className="flex flex-col gap-3"
						onSubmit={(e) => {
							e.preventDefault();
							void handleSave();
						}}
					>
						<GeneralInputText
							valueText={name}
							onChangeText={setName}
							placeholderText={t.roles.name}
							typeInput="text"
						/>
						<label className="flex flex-col gap-1">
							<span className="text-sm">{t.roles.userType}</span>
							<select
								value={userType}
								onChange={(e) => setUserType(e.target.value as UserType)}
								className="p-2 rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 focus-visible:outline-2 focus-visible:outline-blue-400"
							>
								{USER_TYPES.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</label>
						<fieldset className="flex gap-4">
							<legend className="text-sm mb-1">{t.roles.permissions}</legend>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={read}
									onChange={(e) => setRead(e.target.checked)}
								/>
								{t.roles.read}
							</label>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={write}
									onChange={(e) => setWrite(e.target.checked)}
								/>
								{t.roles.write}
							</label>
						</fieldset>
						<div className="flex gap-2">
							<GeneralButton
								typeButton="submit"
								onClickButton={() => {}}
								textName={editingId ? t.roles.save : t.roles.create}
							/>
							<button
								type="button"
								onClick={resetForm}
								className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 hover:cursor-pointer"
							>
								{t.roles.cancel}
							</button>
						</div>
					</form>
				</SideModal>

				<DataTable
					rows={roles}
					columns={[
						{ header: t.roles.name, cell: (role) => role.name },
						{ header: t.roles.userType, cell: (role) => role.userType },
						{ header: t.roles.permissions, cell: permissionsText },
					]}
					emptyText={t.roles.empty}
					labels={t.roles}
					rowLabel={(role) => role.name}
					onEdit={handleEdit}
					onDelete={(role) => void handleDelete(role)}
				/>
			</div>
		</div>
	);
};
