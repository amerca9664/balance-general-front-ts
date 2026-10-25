import { useEffect, useState } from "react";
import { useTranslation } from "../../core/components/LanguageProvider";

const formatTime = (seconds: number) =>
	`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * Mensaje con cuenta regresiva del rate limit de /login. Avisa con `onExpire`
 * al llegar a 0, tambien si se monta con el bloqueo ya vencido.
 */
export const LoginBlockMessage = ({
	until,
	byIp,
	onExpire,
}: {
	until: number;
	byIp: boolean;
	onExpire: () => void;
}) => {
	const { t } = useTranslation();
	const [now, setNow] = useState(Date.now);
	const remaining = Math.max(0, Math.ceil((until - now) / 1000));

	useEffect(() => {
		if (remaining === 0) {
			onExpire();
			return;
		}
		const id = setTimeout(() => setNow(Date.now()), 1000);
		return () => clearTimeout(id);
	}, [remaining, onExpire]);

	if (remaining === 0) return null;

	return (
		<p role="status" className="text-sm text-red-300">
			{(byIp ? t.login.blockedIp : t.login.blockedUser).replace(
				"{time}",
				formatTime(remaining),
			)}
		</p>
	);
};
