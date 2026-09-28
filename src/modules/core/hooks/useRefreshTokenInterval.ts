import { useEffect, useRef } from "react";
import type { useIntervalRt } from "../types/authContextTypes";

const REFRESH_INTERVAL = 5 * 60 * 1000;

export const useRefreshTokenInterval = ({ refreshToken }: useIntervalRt) => {
	const refreshTokenRef = useRef(refreshToken);

	useEffect(() => {
		refreshTokenRef.current = refreshToken;
	}, [refreshToken]);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;
		let cancelled = false;

		const refresh = async () => {
			try {
				await refreshTokenRef.current();
			} finally {
				if (!cancelled) {
					timeout = setTimeout(refresh, REFRESH_INTERVAL);
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
