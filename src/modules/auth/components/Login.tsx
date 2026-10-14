import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import { useRef, useState, useTransition } from "react";

import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { apiLogin } from "../apis/loginApi";
import type { LoginParams } from "../types/authTypes";
import { Floating3DParticles } from "../../core/components/Floating-3d-particles";
import { sileo, Toaster } from "sileo";
import axios from "axios";

const turnstileEnabled = process.env.NODE_ENV === "production";

export const Login = () => {
	const [isPending, startTransition] = useTransition();
	const [inputUserState, setInputUserState] = useState("");
	const [passwordState, setPasswordState] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const turnstileRef = useRef<TurnstileInstance | null>(null);
	const { updAuth } = useAuth();

	const loginHandler = async ({
		email,
		password,
	}: Omit<LoginParams, "cf-turnstile-response">) => {
		startTransition(async () => {
			try {
				await sileo.promise(
					apiLogin({
						email,
						password,
						"cf-turnstile-response": turnstileEnabled
							? turnstileToken
							: undefined,
					}),
					{
						loading: {
							title: "Iniciando sesión",
							description: "Verificando tus credenciales...",
						},
						success: (response) => {
							updAuth({ token: response.token });

							return {
								title: "Inicio de sesión exitoso",
								description: `Bienvenido, ${response.username}`,
							};
						},
						error: (error: unknown) => ({
							title: "Error al iniciar sesión",
							description: axios.isAxiosError(error)
								? (error.response?.data?.message ??
									"No fue posible conectar con el servidor")
								: "Ocurrió un error inesperado",
						}),
					},
				);
			} catch (error) {
				console.error("Error durante el inicio de sesión:", error);
			} finally {
				turnstileRef.current?.reset();
				setTurnstileToken("");
			}
		});
	};

	return (
		<div className="flex flex-col gap-4 items-center bg-gray-800 justify-center h-screen">
			<Floating3DParticles />
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
				disabled={(turnstileEnabled && !turnstileToken) || isPending}
				onClickButton={() => {
					loginHandler({ email: inputUserState, password: passwordState });
				}}
			/>
		</div>
	);
};
