import axios from "axios";
import { useEffect, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { useTranslation } from "../../core/components/LanguageProvider";
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
		setEditingId(null);
		setUsername("");
		setEmail("");
		setPassword("");
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
				<h1 className="text-2xl font-bold">{t.users.title}</h1>

				<form
					className="flex flex-col gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						void handleSave();
					}}
				>
					<h2 className="text-lg font-semibold">
						{editingId ? t.users.editTitle : t.users.createTitle}
					</h2>
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
						{editingId && (
							<button
								type="button"
								onClick={resetForm}
								className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 hover:cursor-pointer"
							>
								{t.users.cancel}
							</button>
						)}
					</div>
				</form>

				{users.length === 0 ? (
					<p className="text-gray-600 dark:text-gray-400">{t.users.empty}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead className="border-b border-gray-300 dark:border-gray-600">
								<tr>
									<th className="py-2 pr-4 font-semibold">
										{t.users.username}
									</th>
									<th className="py-2 pr-4 font-semibold">{t.users.email}</th>
									<th className="py-2">
										<span className="sr-only">{t.users.actions}</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr
										key={user._id}
										className="border-b border-gray-200 dark:border-gray-700"
									>
										<td className="py-2 pr-4">{user.username}</td>
										<td className="py-2 pr-4">{user.email}</td>
										<td className="py-2 flex gap-3 justify-end">
											<button
												type="button"
												onClick={() => handleEdit(user)}
												className="text-blue-600 dark:text-blue-400 hover:underline hover:cursor-pointer"
											>
												{t.users.edit}
											</button>
											<button
												type="button"
												onClick={() => void handleDelete(user)}
												className="text-red-700 dark:text-red-300 hover:underline hover:cursor-pointer"
											>
												{t.users.delete}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};
