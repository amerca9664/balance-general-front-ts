import axios from "axios";
import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { sileo } from "sileo";
import { logOutWithRetry } from "../helpers/pendingLogout";
import { useAuth } from "./AuthProvider";
import { GeneralButton } from "./GeneralButton";
import { useTranslation } from "./LanguageProvider";

// Para agregar un modulo: una entrada aqui, su <Route> en App.tsx y su texto en i18n "modules".
const modules = [{ path: "/balancegeneral", label: "balanceGeneral" }] as const;

export const Sidebar = () => {
	const { t } = useTranslation();
	// Flota encima del contenido sin achicarlo; click fuera la cierra.
	const [open, setOpen] = useState(false);
	const { removeAuth } = useAuth();

	const handleLogOut = async () => {
		try {
			await sileo.promise(logOutWithRetry(), {
				loading: {
					title: t.balance.loadingTitle,
					description: t.balance.loadingDescription,
				},
				success: (result) =>
					result === "pending"
						? {
								title: t.balance.pendingTitle,
								description: t.balance.pendingDescription,
							}
						: {
								title: t.balance.successTitle,
								description: t.balance.successDescription,
							},
				error: (error: unknown) => ({
					title: t.balance.errorTitle,
					description: axios.isAxiosError(error)
						? (error.response?.data?.message ?? t.errors.noConnection)
						: t.errors.unexpected,
				}),
			});
		} catch (error) {
			console.error("Error durante el cierre de sesión:", error);
		} finally {
			// La UI cierra sesion siempre, haya o no respuesta del back.
			removeAuth();
		}
	};

	return (
		<>
			<button
				type="button"
				aria-expanded={open}
				aria-controls="sidebar"
				onClick={() => setOpen(!open)}
				aria-label={open ? t.modules.close : t.modules.open}
				className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 hover:cursor-pointer dark:text-blue-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-blue-400"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="size-6"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				>
					{open ? (
						<path d="M6 6l12 12M18 6L6 18" />
					) : (
						<path d="M4 6h16M4 12h16M4 18h16" />
					)}
				</svg>
			</button>
			{open && (
				<button
					type="button"
					tabIndex={-1}
					aria-label={t.modules.close}
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-30 bg-black/50"
				/>
			)}
			<nav
				id="sidebar"
				aria-label={t.modules.label}
				className={`${open ? "flex" : "hidden"} fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col gap-1 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 px-3 pt-20 pb-4`}
			>
				{/* pt-20 deja libre el boton hamburguesa fijo en top-left */}
				{modules.map((module) => (
					<NavLink
						key={module.path}
						to={module.path}
						onClick={() => setOpen(false)}
						className={({ isActive }) =>
							`rounded-md border-l-4 px-3 py-2 focus-visible:outline-2 focus-visible:outline-blue-400 ${
								isActive
									? "border-blue-500 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
									: "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
							}`
						}
					>
						{t.modules[module.label]}
					</NavLink>
				))}
				<div className="mt-auto grid">
					<GeneralButton
						onClickButton={handleLogOut}
						typeButton="button"
						textName={t.balance.logout}
					/>
				</div>
			</nav>
		</>
	);
};

export const SidebarLayout = () => (
	<div className="flex h-screen">
		<Sidebar />
		<main className="flex-1 overflow-auto">
			<Outlet />
		</main>
	</div>
);
