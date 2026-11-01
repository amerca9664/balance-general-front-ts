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
	createDepartmentApi,
	deleteDepartmentApi,
	listDepartmentsApi,
	updateDepartmentApi,
} from "../apis/departmentsApi";
import type { Department } from "../types/departmentTypes";

export const Departments = () => {
	const { token } = useAuth();
	const { t } = useTranslation();
	const [departments, setDepartments] = useState<Department[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [name, setName] = useState("");

	const showError = (error: unknown) =>
		sileo.error({
			title: t.departments.errorTitle,
			description: axios.isAxiosError(error)
				? error.response
					? (error.response.data?.message ?? t.departments.invalidData)
					: t.errors.noConnection
				: t.errors.unexpected,
		});

	const loadDepartments = async () => {
		try {
			setDepartments(await listDepartmentsApi(token));
		} catch (error) {
			showError(error);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: solo recargar cuando llega el token (React Compiler ya memoiza loadDepartments)
	useEffect(() => {
		// El token llega con el primer refresh; antes la request daria 401.
		if (token) void loadDepartments();
	}, [token]);

	const resetForm = () => {
		setModalOpen(false);
		setEditingId(null);
		setName("");
	};

	const handleNew = () => {
		resetForm();
		setModalOpen(true);
	};

	const handleSave = async () => {
		try {
			if (editingId) {
				await updateDepartmentApi(token, editingId, { name });
				sileo.success({ title: t.departments.updated });
			} else {
				await createDepartmentApi(token, { name });
				sileo.success({ title: t.departments.created });
			}
			resetForm();
			await loadDepartments();
		} catch (error) {
			showError(error);
		}
	};

	const handleEdit = (department: Department) => {
		setEditingId(department._id);
		setName(department.name);
		setModalOpen(true);
	};

	const handleDelete = async (department: Department) => {
		if (
			!window.confirm(
				t.departments.confirmDelete.replace("{name}", department.name),
			)
		)
			return;
		try {
			await deleteDepartmentApi(token, department._id);
			sileo.success({ title: t.departments.deleted });
			if (editingId === department._id) resetForm();
			await loadDepartments();
		} catch (error) {
			showError(error);
		}
	};

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 pt-20 pb-8">
			<div className="mx-auto max-w-4xl flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<h1 className="text-2xl font-bold">{t.departments.title}</h1>
					<button
						type="button"
						onClick={handleNew}
						className="flex items-center gap-2 bg-blue-500 text-blue-50 p-2 rounded-md hover:bg-blue-600 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
					>
						<Plus className="size-5" />
						{t.departments.createTitle}
					</button>
				</div>

				<SideModal
					open={modalOpen}
					persistent={true}
					onClose={resetForm}
					title={
						editingId ? t.departments.editTitle : t.departments.createTitle
					}
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
							placeholderText={t.departments.name}
							typeInput="text"
						/>
						<div className="flex gap-2">
							<GeneralButton
								typeButton="submit"
								onClickButton={() => {}}
								textName={editingId ? t.departments.save : t.departments.create}
							/>
							<button
								type="button"
								onClick={resetForm}
								className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 hover:cursor-pointer"
							>
								{t.departments.cancel}
							</button>
						</div>
					</form>
				</SideModal>

				<DataTable
					rows={departments}
					columns={[
						{
							header: t.departments.name,
							cell: (department) => department.name,
						},
					]}
					emptyText={t.departments.empty}
					labels={t.departments}
					rowLabel={(department) => department.name}
					onEdit={handleEdit}
					onDelete={(department) => void handleDelete(department)}
				/>
			</div>
		</div>
	);
};
