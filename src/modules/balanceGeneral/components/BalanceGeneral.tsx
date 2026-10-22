import axios from "axios";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import { useTranslation } from "../../core/components/LanguageProvider";
import { logOutWithRetry } from "../../core/helpers/pendingLogout";

export const BalanceGeneral = () => {
	const { removeAuth } = useAuth();
	const { t } = useTranslation();

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
		<div className="flex flex-col gap-4 items-center bg-gray-800 justify-center h-screen">
			<h1 className="text-white text-2xl font-bold">{t.balance.title}</h1>
			<p className="text-white">{t.balance.description}</p>
			<GeneralButton
				onClickButton={handleLogOut}
				typeButton="button"
				textName={t.balance.logout}
			></GeneralButton>
		</div>
	);
};
