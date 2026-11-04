import axios from "axios";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { DataTable } from "../../core/components/DataTable";
import { GeneralButton } from "../../core/components/GeneralButton";
import { useTranslation } from "../../core/components/LanguageProvider";
import { MultiSelect } from "../../core/components/MultiSelect";
import { SideModal } from "../../core/components/SideModal";
import { type Module, modules } from "../../core/helpers/modules";
import { listRolesApi } from "../../roles/apis/rolesApi";
import type { Role } from "../../roles/types/roleTypes";
import {
	createRouteApi,
	deleteRouteApi,
	listRouteNamesApi,
	listRoutesApi,
	updateRouteApi,
} from "../apis/routesApi";
import type { AccessRoute } from "../types/routeTypes";

const selectClass =
	"p-2 rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 focus-visible:outline-2 focus-visible:outline-blue-400";

// "Route" choca con el de react-router, por eso AccessRoutes.
export const AccessRoutes = () => {
	const { token } = useAuth();
	const { t } = useTranslation();
	// Lo guardado en Mongo: es lo que muestra la tabla.
	const [routes, setRoutes] = useState<AccessRoute[]>([]);
	// Las claves que usan los endpoints del back: las opciones del formulario.
	const [routeNames, setRouteNames] = useState<string[]>([]);
	const [allRoles, setAllRoles] = useState<Role[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [module, setModule] = useState<Module | "">("");
	const [roleIds, setRoleIds] = useState<string[]>([]);

	const showError = (error: unknown) =>
		sileo.error({
			title: t.routes.errorTitle,
			description: axios.isAxiosError(error)
				? error.response
					? (error.response.data?.message ?? t.routes.invalidData)
					: t.errors.noConnection
				: t.errors.unexpected,
		});

	const loadRoutes = async () => {
		try {
			const [list, names] = await Promise.all([
				listRoutesApi(token),
				listRouteNamesApi(token),
			]);
			setRoutes(list);
			setRouteNames(names);
		} catch (error) {
			showError(error);
		}
	};

	// Sin permiso "roles.read" el back responde 403: no se pueden asignar roles.
	const loadRoles = async () => {
		try {
			setAllRoles(await listRolesApi(token));
		} catch {
			setAllRoles([]);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: solo recargar cuando llega el token (React Compiler ya memoiza loadRoutes)
	useEffect(() => {
		// El token llega con el primer refresh; antes la request daria 401.
		if (token) {
			void loadRoutes();
			void loadRoles();
		}
	}, [token]);

	const roleNames = (route: AccessRoute) =>
		allRoles
			.filter((role) => route.roles.includes(role._id))
			.map((role) => role.name)
			.join(", ") || "—";

	// Una clave ya guardada se ve pero no se puede elegir (el back la rechaza
	// con 409), salvo la de la ruta que se esta editando.
	const isTaken = (routeName: string) =>
		routeName !== name && routes.some((route) => route.name === routeName);

	const resetForm = () => {
		setModalOpen(false);
		setEditingId(null);
		setName("");
		setModule("");
		setRoleIds([]);
	};

	const handleNew = () => {
		resetForm();
		setModalOpen(true);
	};

	const handleSave = async () => {
		// Los select son required: el form no se envia con valores vacios.
		if (!name || !module) return;
		const form = { name, module, roles: roleIds };
		try {
			if (editingId) {
				await updateRouteApi(token, editingId, form);
				sileo.success({ title: t.routes.updated });
			} else {
				await createRouteApi(token, form);
				sileo.success({ title: t.routes.created });
			}
			resetForm();
			await loadRoutes();
		} catch (error) {
			showError(error);
		}
	};

	const handleEdit = (route: AccessRoute) => {
		setEditingId(route._id);
		// Una ruta cuyo endpoint ya no existe deja el select vacio: hay que elegir otra.
		setName(routeNames.includes(route.name) ? route.name : "");
		setModule(route.module ?? "");
		setRoleIds(route.roles);
		setModalOpen(true);
	};

	const handleDelete = async (route: AccessRoute) => {
		if (!window.confirm(t.routes.confirmDelete.replace("{name}", route.name)))
			return;
		try {
			await deleteRouteApi(token, route._id);
			sileo.success({ title: t.routes.deleted });
			if (editingId === route._id) resetForm();
			await loadRoutes();
		} catch (error) {
			showError(error);
		}
	};

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 pt-20 pb-8">
			<div className="mx-auto max-w-4xl flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<h1 className="text-2xl font-bold">{t.routes.title}</h1>
					<button
						type="button"
						onClick={handleNew}
						className="flex items-center gap-2 bg-blue-500 text-blue-50 p-2 rounded-md hover:bg-blue-600 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
					>
						<Plus className="size-5" />
						{t.routes.createTitle}
					</button>
				</div>

				<SideModal
					open={modalOpen}
					persistent={true}
					onClose={resetForm}
					title={editingId ? t.routes.editTitle : t.routes.createTitle}
				>
					<form
						className="flex flex-col gap-3"
						onSubmit={(e) => {
							e.preventDefault();
							void handleSave();
						}}
					>
						<label className="flex flex-col gap-1">
							<span className="text-sm">{t.routes.name}</span>
							<select
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								className={selectClass}
							>
								<option value="" disabled>
									{t.routes.selectName}
								</option>
								{routeNames.map((routeName) => (
									<option
										key={routeName}
										value={routeName}
										disabled={isTaken(routeName)}
									>
										{isTaken(routeName)
											? `${routeName} (${t.routes.taken})`
											: routeName}
									</option>
								))}
							</select>
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm">{t.routes.module}</span>
							<select
								required
								value={module}
								onChange={(e) => setModule(e.target.value as Module)}
								className={selectClass}
							>
								<option value="" disabled>
									{t.routes.selectModule}
								</option>
								{modules.map(({ label }) => (
									<option key={label} value={label}>
										{t.modules[label]}
									</option>
								))}
							</select>
						</label>
						{allRoles.length > 0 && (
							<MultiSelect
								label={t.routes.roles}
								addLabel={t.routes.addRole}
								removeLabel={t.routes.removeRole}
								options={allRoles}
								value={roleIds}
								onChange={setRoleIds}
							/>
						)}
						<div className="flex gap-2">
							<GeneralButton
								typeButton="submit"
								onClickButton={() => {}}
								textName={editingId ? t.routes.save : t.routes.create}
							/>
							<button
								type="button"
								onClick={resetForm}
								className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 hover:cursor-pointer"
							>
								{t.routes.cancel}
							</button>
						</div>
					</form>
				</SideModal>

				<DataTable
					rows={routes}
					columns={[
						{ header: t.routes.name, cell: (route) => route.name },
						{
							header: t.routes.module,
							cell: (route) =>
								route.module ? (t.modules[route.module] ?? route.module) : "—",
						},
						{ header: t.routes.roles, cell: roleNames },
					]}
					emptyText={t.routes.empty}
					labels={t.routes}
					rowLabel={(route) => route.name}
					onEdit={handleEdit}
					onDelete={(route) => void handleDelete(route)}
				/>
			</div>
		</div>
	);
};
