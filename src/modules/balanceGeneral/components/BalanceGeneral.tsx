import { useNavigate } from "react-router";
import { logOutApi } from "../../core/apis/logOutApi";
import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";

export const BalanceGeneral = () => {
	const { removeAuth } = useAuth();
	const navigate = useNavigate();
	const handleLogOut = async () => {
		try {
			const responseLoggut = await logOutApi();
			removeAuth();
			navigate("/login");
		} catch (error) {
			console.log("aaaaaaaaa");
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
