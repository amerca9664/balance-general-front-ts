import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";

import { useAuth } from "../../core/components/AuthProvider";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { apiLogin } from "../apis/loginApi";

import { Floating3DParticles } from "../../core/components/Floating-3d-particles";
import { sileo } from "sileo";
import axios from "axios";
import { useIdempotecyKeyGenonName } from "../hooks/useIdempotecyKeyGen";

const turnstileEnabled = process.env.NODE_ENV === "production";

export const Login = () => {
	const [isPending, setIsPending] = useState(false);
	const [inputUserState, setInputUserState] = useState("");
	const [passwordState, setPasswordState] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const turnstileRef = useRef<TurnstileInstance | null>(null);
	const { updAuth } = useAuth();
	const { generateIdempotencyKey, idempotencyKey, resetIdempotencyKey } =
		useIdempotecyKeyGenonName();

	const loginHandler = async ({
		email,
		password,
	}: Omit<{ email: string; password: string }, "cf-turnstile-response">) => {
		setIsPending(true);
		generateIdempotencyKey();
		try {
			await sileo.promise(
				apiLogin({
					email,
					password,
					"cf-turnstile-response": turnstileEnabled
						? turnstileToken
						: undefined,
					idempotencyKey: idempotencyKey.current ?? "",
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
					error: (error: unknown) => {
						if (axios.isAxiosError(error) && error.response?.status === 401) {
							resetIdempotencyKey();
						}

						return {
							title: "Error al iniciar sesión",
							description: axios.isAxiosError(error)
								? (error.response?.data?.message ??
									"No fue posible conectar con el servidor")
								: "Ocurrió un error inesperado",
						};
					},
				},
			);
		} catch (error) {
			console.error("Error durante el inicio de sesión:", error);
		} finally {
			turnstileRef.current?.reset();
			setTurnstileToken("");

			setIsPending(false);
		}
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
