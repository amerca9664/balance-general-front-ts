import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { apiLogin } from "../apis/loginApi";
import type { LoginParams } from "../types/authTypes";

export const Login = () => {
	const [inputUserState, setInputUserState] = useState("");
	const [passwordState, setPasswordState] = useState("");
	const { updAuth } = useAuth();

	const navigate = useNavigate();
	const loginHandler = async ({ email, password }: LoginParams) => {
		try {
			const response = await apiLogin({ email, password });

			if (response.success) {
				updAuth({ token: response.token });
				console.log("Login successful:", response);
				// Redirigir a la página de balance general
				navigate("/balancegeneral");
			}
		} catch (error) {
			console.error("Error during login:", error);
		}
	};

	return (
		<div className="flex flex-col gap-4 items-center bg-gray-800 justify-center h-screen">
			<GeneralInputText
				typeInput="text"
				valueText={inputUserState}
				onChangeText={setInputUserState}
				placeholderText="Enter your username"
			/>
			<GeneralInputText
				typeInput="password"
				valueText={passwordState}
				onChangeText={setPasswordState}
				placeholderText="Enter your password"
			/>
			<GeneralButton
				typeButton="button"
				textName="Iniciar sesión"
				onClickButton={() => {
					loginHandler({ email: inputUserState, password: passwordState });
				}}
			/>
		</div>
	);
};
