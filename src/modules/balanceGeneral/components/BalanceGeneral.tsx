import { sileo } from "sileo";
import { logOutApi } from "../../core/apis/logOutApi";
import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import axios from "axios";

export const BalanceGeneral = () => {
	const { removeAuth } = useAuth();

	const handleLogOut = async () => {
		await sileo.promise(logOutApi(), {
			loading: {
				title: "Cerrando sesión",
				description: "Cerrando tu sesión...",
			},
			success: () => {
				removeAuth();
				return {
					title: "Cerraste sesión exitosamente",
					description: "Hasta luego",
				};
			},
			error: (error: unknown) => ({
				title: "Error al cerrar sesión",
				description: axios.isAxiosError(error)
					? (error.response?.data?.message ??
						"No fue posible conectar con el servidor")
					: "Ocurrió un error inesperado",
			}),
		});
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
