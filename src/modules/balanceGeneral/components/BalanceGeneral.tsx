import axios from "axios";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import { logOutWithRetry } from "../../core/helpers/pendingLogout";

export const BalanceGeneral = () => {
	const { removeAuth } = useAuth();

	const handleLogOut = async () => {
		try {
			await sileo.promise(logOutWithRetry(), {
				loading: {
					title: "Cerrando sesión",
					description: "Cerrando tu sesión...",
				},
				success: (result) =>
					result === "pending"
						? {
								title: "Sesión cerrada en este dispositivo",
								description:
									"Sin conexión: se terminará de cerrar al recuperar internet",
							}
						: {
								title: "Cerraste sesión exitosamente",
								description: "Hasta luego",
							},
				error: (error: unknown) => ({
					title: "Error al cerrar sesión",
					description: axios.isAxiosError(error)
						? (error.response?.data?.message ??
							"No fue posible conectar con el servidor")
						: "Ocurrió un error inesperado",
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
		<div className="flex flex-col gap-4 items-center bg-gray-800 justify-center h-screen">
			<h1 className="text-white text-2xl font-bold">Balance General</h1>
			<p className="text-white">Este es el componente BalanceGeneral.</p>
			<GeneralButton
				onClickButton={handleLogOut}
				typeButton="button"
				textName="Logout"
			></GeneralButton>
		</div>
	);
};
