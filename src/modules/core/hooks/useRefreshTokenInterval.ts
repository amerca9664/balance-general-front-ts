import { useEffect, useRef } from "react";
import type { useIntervalRt } from "../types/authContextTypes";

// El proximo tick se agenda sobre el `exp` REAL del JWT que acaba de llegar,
// no sobre una constante: asi el front se ajusta solo si cambia
// ACCESS_TOKEN_TTL_MINUTES en el back, y la desincronizacion entre back y
// front queda imposible por construccion.
//
// El margen va por debajo de la expiracion porque un tick puede caer tarde
// (tab en background, que el navegador throttlea); con margen 0 esa request
// saldria con el token ya vencido y no hay interceptor que reintente.
const REFRESH_SAFETY_MARGIN_MS = 60 * 1000;

// Cuando no hay `exp` legible (refresh fallo y devolvio null, o el token esta
// corrupto). Mitad del TTL default del back: ni pegarle de mas al back ni
// quedarnos sin refrescar.
const FALLBACK_REFRESH_MS = 7 * 60 * 1000;

// Piso de 1s: un setTimeout(<= 0) re-dispara en el mismo tick y armaria un
// loop apretado contra el back.
const MIN_REFRESH_DELAY_MS = 1000;

const readExpMs = (token: string | null): number | null => {
	if (!token) return null;

	try {
		const [, payload] = token.split(".");
		if (!payload) return null;

		// El payload de un JWT va en base64url (- y _ en vez de + y /, sin
		// padding); atob solo entiende base64 normal.
		const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
		const decoded = JSON.parse(atob(padded)) as { exp?: unknown };
		console.log("decoded", decoded);

		return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
	} catch {
		return null;
	}
};

/** Cuanto esperar antes del proximo refresh, en ms. */
export const nextRefreshDelay = (token: string | null): number => {
	const expMs = readExpMs(token);
	if (expMs === null) return FALLBACK_REFRESH_MS;

	return Math.max(
		expMs - Date.now() - REFRESH_SAFETY_MARGIN_MS,
		MIN_REFRESH_DELAY_MS,
	);
};

export const useRefreshTokenInterval = ({ refreshToken }: useIntervalRt) => {
	const refreshTokenRef = useRef(refreshToken);

	useEffect(() => {
		refreshTokenRef.current = refreshToken;
	}, [refreshToken]);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;
		let cancelled = false;

		const refresh = async () => {
			let freshToken: string | null = null;
			try {
				freshToken = await refreshTokenRef.current();
			} finally {
				if (!cancelled) {
					timeout = setTimeout(refresh, nextRefreshDelay(freshToken));
				}
			}
		};

		refresh();

		return () => {
			cancelled = true;
			clearTimeout(timeout);
		};
	}, []);
};
