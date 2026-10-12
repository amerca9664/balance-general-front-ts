import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";

import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { apiLogin } from "../apis/loginApi";
import type { LoginParams } from "../types/authTypes";

const turnstileEnabled = process.env.NODE_ENV === "production";

export const Login = () => {
	const [inputUserState, setInputUserState] = useState("");
	const [passwordState, setPasswordState] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const turnstileRef = useRef<TurnstileInstance | null>(null);
	const { updAuth } = useAuth();

	const loginHandler = async ({
		email,
		password,
	}: Omit<LoginParams, "cf-turnstile-response">) => {
		try {
			const response = await apiLogin({
				email,
				password,
				"cf-turnstile-response": turnstileEnabled ? turnstileToken : undefined,
			});

			if (response.success) {
				updAuth({ token: response.token });
				console.log("Login successful:", response);
			}
		} catch (error) {
			console.error("Error during login:", error);
		} finally {
			// El token de Turnstile es de un solo uso: siempre se resetea.
			turnstileRef.current?.reset();
			setTurnstileToken("");
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
			{turnstileEnabled && (
				<Turnstile
					ref={turnstileRef}
					siteKey={import.meta.env.VITE_TURNSTILE_SITEKEY}
					options={{ action: "login" }}
					onSuccess={(token) => setTurnstileToken(token)}
					onExpire={() => setTurnstileToken("")}
					onError={() => setTurnstileToken("")}
				/>
			)}
			<GeneralButton
				typeButton="button"
				textName="Iniciar sesión"
				disabled={turnstileEnabled && !turnstileToken}
				onClickButton={() => {
					loginHandler({ email: inputUserState, password: passwordState });
				}}
			/>
		</div>
	);
};
