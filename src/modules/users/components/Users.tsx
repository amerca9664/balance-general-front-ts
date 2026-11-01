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

	// biome-ignore lint/correctness/useExhaustiveDependencies: solo recargar cuando llega el token (React Compiler ya memoiza loadUsers)
	useEffect(() => {
		// El token llega con el primer refresh; antes la request daria 401.
		if (token) void loadUsers();
	}, [token]);

	const resetForm = () => {
		setModalOpen(false);
		setEditingId(null);
		setUsername("");
		setEmail("");
		setPassword("");
	};

	const handleNew = () => {
		resetForm();
		setModalOpen(true);
	};

	const handleSave = async () => {
		const form = { username, email, password };
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
