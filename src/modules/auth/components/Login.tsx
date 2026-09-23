import { useState } from "react";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { apiLogin } from "../apis/loginApi";
import type { LoginParams } from "../types/authTypes";
import { useLocalStorage } from "../../core/hooks/useLocalStorage";

export const Login = () => {
	const [inputUserState, setInputUserState] = useState("");
	const [passwordState, setPasswordState] = useState("");
	const { storedValue, setValue } = useLocalStorage();
	const loginHandler = async ({ email, password }: LoginParams) => {
		try {
			const response = await apiLogin({ email, password });
			console.log("Login successful:", response);
		} catch (error) {
			console.error("Error during login:", error);
		}
	};

	return (
		<div className="flex flex-col gap-4 items-center justify-center h-screen">
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
