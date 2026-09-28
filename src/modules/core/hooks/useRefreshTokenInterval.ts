import { useEffect } from "react";
import type { useIntervalRt } from "../types/authContextTypes";

export const useRefreshTokenInterval = ({ refreshToken }: useIntervalRt) => {
	useEffect(() => {
		refreshToken();
		// Ejecutar cada 5 minutos
		const interval = setInterval(() => {
			refreshToken();
		}, 10000);

		// Limpiar el intervalo al desmontar
		return () => {
			clearInterval(interval);
		};
	}, []);
};
