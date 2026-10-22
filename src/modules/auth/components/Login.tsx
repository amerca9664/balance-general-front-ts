import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import axios from "axios";
import { useRef, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { Floating3DParticles } from "../../core/components/Floating-3d-particles";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { useTranslation } from "../../core/components/LanguageProvider";
import { apiLogin } from "../apis/loginApi";
import { useIdempotecyKeyGenonName } from "../hooks/useIdempotecyKeyGen";

const turnstileEnabled = process.env.NODE_ENV === "production";

export const Login = () => {
	const [isPending, setIsPending] = useState(false);
	const [inputUserState, setInputUserState] = useState("");
	const [passwordState, setPasswordState] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const turnstileRef = useRef<TurnstileInstance | null>(null);
	const { updAuth } = useAuth();
	const { t } = useTranslation();
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
						title: t.login.loadingTitle,
						description: t.login.loadingDescription,
					},
					success: (response) => {
						updAuth({ token: response.token });

						return {
							title: t.login.successTitle,
							description: t.login.welcome.replace(
								"{username}",
								response.username,
							),
						};
					},
					error: (error: unknown) => {
						if (axios.isAxiosError(error) && error.response?.status === 401) {
							resetIdempotencyKey();
						}

						return {
							title: t.login.errorTitle,
							description: axios.isAxiosError(error)
								? (error.response?.data?.message ?? t.errors.noConnection)
								: t.errors.unexpected,
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
				placeholderText={t.login.usernamePlaceholder}
			/>
			<GeneralInputText
				typeInput="password"
				valueText={passwordState}
				onChangeText={setPasswordState}
				placeholderText={t.login.passwordPlaceholder}
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
				textName={t.login.submit}
				disabled={(turnstileEnabled && !turnstileToken) || isPending}
				onClickButton={() => {
					loginHandler({ email: inputUserState, password: passwordState });
				}}
			/>
		</div>
	);
};
