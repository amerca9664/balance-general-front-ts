import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { sileo } from "sileo";
import { useAuth } from "../../core/components/AuthProvider";
import { Floating3DParticles } from "../../core/components/Floating-3d-particles";
import { GeneralButton } from "../../core/components/GeneralButton";
import { GeneralInputText } from "../../core/components/GeneralInputText";
import { useTranslation } from "../../core/components/LanguageProvider";
import { apiLogin } from "../apis/loginApi";
import { useIdempotecyKeyGenonName } from "../hooks/useIdempotecyKeyGen";
import type { RateLimitResponse } from "../types/authTypes";
import { LoginBlockMessage } from "./LoginBlockMessage";

const turnstileEnabled = process.env.NODE_ENV === "production";

// Igual que el back arma la clave email+IP del rate limit.
const normalizeEmail = (email: string) => email.trim().toLowerCase();

// email null = bloqueo por IP: aplica a cualquier usuario.
type LoginBlock = { email: string | null; until: number };

export const Login = () => {
	const [isPending, setIsPending] = useState(false);
	const [block, setBlock] = useState<LoginBlock | null>(null);
	const [inputUserState, setInputUserState] = useState("");
	const [passwordState, setPasswordState] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const turnstileRef = useRef<TurnstileInstance | null>(null);
	const { updAuth } = useAuth();
	const { t } = useTranslation();
	const { generateIdempotencyKey, idempotencyKey, resetIdempotencyKey } =
		useIdempotecyKeyGenonName();

	const isBlocked =
		block !== null &&
		(block.email === null || block.email === normalizeEmail(inputUserState));
	const clearBlock = useCallback(() => setBlock(null), []);

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
						if (axios.isAxiosError(error) && error.response?.status === 429) {
							const data = error.response.data as Partial<RateLimitResponse>;
							const retryAfter = data.retryAfter ?? 60;
							setBlock({
								email: data.scope === "user_ip" ? normalizeEmail(email) : null,
								until: Date.now() + retryAfter * 1000,
							});
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
				disabled={
					(turnstileEnabled && !turnstileToken) || isPending || isBlocked
				}
				onClickButton={() => {
					loginHandler({ email: inputUserState, password: passwordState });
				}}
			/>
			{isBlocked && (
				<LoginBlockMessage
					until={block.until}
					byIp={block.email === null}
					onExpire={clearBlock}
				/>
			)}
		</div>
	);
};
