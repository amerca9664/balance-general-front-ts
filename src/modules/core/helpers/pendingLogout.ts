import axios from "axios";
import { logOutApi } from "../apis/logOutApi";

// Logout que no llego al back (sin red). La cookie `jwt` es httpOnly: JS no
// puede borrarla, solo el back. Mientras este flag exista la sesion sigue
// viva en Redis, asi que no se hace /refresh (la reviviria) y se reintenta
// el logout apenas vuelve la red o se abre la app.
const PENDING_LOGOUT_KEY = "pendingLogout";

// localStorage puede tirar (modo privado, storage bloqueado): nunca rompe el
// logout, como mucho no queda anotado.
export const hasPendingLogout = (): boolean => {
	try {
		return localStorage.getItem(PENDING_LOGOUT_KEY) !== null;
	} catch {
		return false;
	}
};

export const markPendingLogout = (): void => {
	try {
		localStorage.setItem(PENDING_LOGOUT_KEY, "1");
	} catch {
		console.error("No se pudo marcar el logout pendiente");
	}
};

/**
 * Tambien se llama al loguearse: el login del back ya cierra la sesion de la
 * cookie previa, asi que el pendiente quedo cumplido. Si no se limpiara, el
 * proximo refresh cerraria la sesion NUEVA.
 */
export const clearPendingLogout = (): void => {
	try {
		localStorage.removeItem(PENDING_LOGOUT_KEY);
	} catch {
		console.error("No se pudo limpiar el logout pendiente");
	}
};

/** Sin `response` = la request no llego al back (sin red, DNS, CORS). */
export const isNetworkError = (error: unknown): boolean =>
	axios.isAxiosError(error) && !error.response;

/**
 * Manda el logout pendiente, si hay. Solo un error de red lo deja pendiente:
 * cualquier respuesta del back (incluso un error) significa que lo recibio.
 *
 * Devuelve `true` si habia un logout pendiente.
 */
export const flushPendingLogout = async (): Promise<boolean> => {
	if (!hasPendingLogout()) return false;
	try {
		await logOutApi();
		clearPendingLogout();
	} catch (error) {
		if (!isNetworkError(error)) clearPendingLogout();
	}
	return true;
};

/** Logout contra el back; si no hay red queda pendiente y no lanza. */
export const logOutWithRetry = async (): Promise<"done" | "pending"> => {
	try {
		await logOutApi();
		clearPendingLogout();
		return "done";
	} catch (error) {
		if (isNetworkError(error)) {
			markPendingLogout();
			return "pending";
		}
		throw error;
	}
};
